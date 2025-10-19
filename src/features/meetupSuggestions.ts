import { getGeminiModel } from '../gemini';
import { Client, TravelMode } from '@googlemaps/google-maps-services-js';

const mapsClient = new Client({});

export type MeetupPreferences = {
  locationA: string;
  locationB: string;
  timeWindow: string;
  travelMode: 'driving' | 'walking';
  maxMinutesA: number;
  maxMinutesB: number;
  indoorPreferred?: boolean;
  wheelchairAccess?: boolean;
  parkingNeeded?: boolean;
  ageContextUnder18?: boolean;
};

export type MeetupSuggestion = {
  name: string;
  address: string;
  coordinates: { lat: number; lng: number };
  open_hours: string;
  distance_userA: string;
  eta_userA: number;
  distance_userB: string;
  eta_userB: number;
  fairness_score: number;
  safety_score: number;
  overall_score: number;
  why_safe: string[];
  notes_for_meet: string;
  indoor: boolean;
  staff_present: boolean;
  cctv_likely: boolean;
  well_lit: boolean;
  parking_available: boolean;
  wheelchair_access: boolean;
  quick_share_text: string;
};

export type MeetupResponse = {
  suggestions: MeetupSuggestion[];
  disclaimer: string;
};

export const getSafeMeetupSuggestions = async (
  preferences: MeetupPreferences
): Promise<MeetupResponse> => {
  // Step 1: Use Gemini with Google Search to find safe venues
  const model = getGeminiModel();

  const searchPrompt = `Find 5 safe, public meetup locations in the Seattle/Bellevue area for two people doing a local trade/barter exchange.

PRIORITIZE:
- Locations with FREE PARKING available
- Less crowded, quieter public spaces
- Wheelchair accessible venues
- Good lighting and visibility

Requirements:
- Time window: ${preferences.timeWindow}
- Location A: ${preferences.locationA}
- Location B: ${preferences.locationB}
- Age context: ${preferences.ageContextUnder18 ? 'One user is under 18 (requires extra safety)' : 'Both adults'}
${preferences.indoorPreferred ? '- Indoor preferred' : ''}
${preferences.wheelchairAccess ? '- Wheelchair accessible required' : ''}
${preferences.parkingNeeded ? '- Parking available required' : ''}

Search for (in priority order):
1. Police station safe exchange zones with parking
2. Library lobbies (during staffed hours) with parking lots
3. Community centers with free parking
4. Shopping center security desks (prefer less crowded malls)
5. Quiet café chains with parking and staff presence

AVOID: Overtly crowded locations, paid parking only venues, busy downtown areas without parking.

Return EXACTLY 5 specific venue suggestions as JSON array:
[{
  "name": "venue name",
  "address": "full address",
  "lat": number,
  "lng": number,
  "open_hours": "hours for requested time window",
  "indoor": boolean,
  "staff_present": boolean,
  "cctv_likely": boolean,
  "well_lit": boolean,
  "parking_available": boolean,
  "wheelchair_access": boolean,
  "why_safe": ["reason 1", "reason 2", "reason 3"],
  "notes_for_meet": "specific meeting instructions"
}]

EXCLUDE: Private residences, unstaffed parking lots, late-night unstaffed venues.`;

  const result = await model.generateContent(searchPrompt, {
    generationConfig: {
      responseMimeType: 'application/json'
    },
    tools: [{
      googleSearch: {}
    }]
  });

  const response = await result.response;
  let text = response.text();

  // Strip markdown code blocks if present
  text = text.replace(/^```json?\s*/i, '').replace(/\s*```$/i, '').trim();

  // Also strip any leading text before the JSON array
  const arrayStart = text.indexOf('[');
  const arrayEnd = text.lastIndexOf(']');

  if (arrayStart !== -1 && arrayEnd !== -1) {
    text = text.substring(arrayStart, arrayEnd + 1);
  }

  let venues;
  try {
    venues = JSON.parse(text);
  } catch (error) {
    console.error('Failed to parse venue JSON. Raw response:', text);
    throw new Error('Failed to parse venue suggestions from Gemini');
  }

  if (!Array.isArray(venues) || venues.length === 0) {
    return {
      suggestions: [],
      disclaimer: 'No suitable venues found. Try broadening your time window or increasing max travel time.'
    };
  }

  // Step 2: Calculate distances and ETAs using Google Maps
  const suggestions: MeetupSuggestion[] = [];

  for (const venue of venues) {
    try {
      const destination = venue.address;

      // Get distance/duration for both users
      const [responseA, responseB] = await Promise.all([
        mapsClient.distancematrix({
          params: {
            origins: [preferences.locationA],
            destinations: [destination],
            mode: preferences.travelMode === 'driving' ? TravelMode.driving : TravelMode.walking,
            key: process.env.GOOGLE_MAPS_API_KEY!
          }
        }),
        mapsClient.distancematrix({
          params: {
            origins: [preferences.locationB],
            destinations: [destination],
            mode: preferences.travelMode === 'driving' ? TravelMode.driving : TravelMode.walking,
            key: process.env.GOOGLE_MAPS_API_KEY!
          }
        })
      ]);

      const elementA = responseA.data.rows[0]?.elements[0];
      const elementB = responseB.data.rows[0]?.elements[0];

      if (elementA?.status !== 'OK' || elementB?.status !== 'OK') {
        continue;
      }

      const etaA = Math.round(elementA.duration.value / 60); // minutes
      const etaB = Math.round(elementB.duration.value / 60); // minutes

      // Skip if exceeds max travel time
      if (etaA > preferences.maxMinutesA || etaB > preferences.maxMinutesB) {
        continue;
      }

      // Calculate scores
      const safety_score = calculateSafetyScore(venue, preferences);
      const fairness_score = calculateFairnessScore(etaA, etaB);
      const overall_score = 0.7 * safety_score + 0.3 * fairness_score;

      // Generate quick share text using Gemini
      const quickSharePrompt = `Create a one-line meetup suggestion for chat: "${venue.name}" at ${preferences.timeWindow}. Include specific meeting spot from these notes: ${venue.notes_for_meet}. Keep it under 100 characters.`;
      const shareResult = await model.generateContent(quickSharePrompt);
      const quick_share_text = shareResult.response.text().trim().replace(/['"]/g, '');

      suggestions.push({
        name: venue.name,
        address: venue.address,
        coordinates: { lat: venue.lat, lng: venue.lng },
        open_hours: venue.open_hours,
        distance_userA: elementA.distance.text,
        eta_userA: etaA,
        distance_userB: elementB.distance.text,
        eta_userB: etaB,
        fairness_score,
        safety_score,
        overall_score,
        why_safe: venue.why_safe,
        notes_for_meet: venue.notes_for_meet,
        indoor: venue.indoor,
        staff_present: venue.staff_present,
        cctv_likely: venue.cctv_likely,
        well_lit: venue.well_lit,
        parking_available: venue.parking_available,
        wheelchair_access: venue.wheelchair_access,
        quick_share_text
      });
    } catch (error) {
      console.error(`Error processing venue ${venue.name}:`, error);
      continue;
    }
  }

  // Sort by overall score (desc), then by max ETA (asc) for ties
  suggestions.sort((a, b) => {
    if (Math.abs(a.overall_score - b.overall_score) < 0.01) {
      return Math.max(a.eta_userA, a.eta_userB) - Math.max(b.eta_userA, b.eta_userB);
    }
    return b.overall_score - a.overall_score;
  });

  // Take top 5
  const topSuggestions = suggestions.slice(0, 5);

  const disclaimer = preferences.ageContextUnder18
    ? 'Safety reminder: One user is under 18. A guardian must accompany them. Keep all communication on-platform, meet during staffed hours only, avoid carrying large amounts of cash, and consider bringing a friend.'
    : 'Safety reminder: Keep all communication on-platform, meet during staffed hours, avoid carrying large amounts of cash, and consider bringing a friend. These are public venues but remain alert.';

  return {
    suggestions: topSuggestions,
    disclaimer
  };
};

function calculateSafetyScore(venue: any, preferences: MeetupPreferences): number {
  let score = 0;

  // Staffed/attended venue (0.30)
  if (venue.staff_present) score += 0.30;

  // Indoors + visible CCTV/foot traffic (0.25)
  if (venue.indoor && venue.cctv_likely) score += 0.25;
  else if (venue.indoor || venue.cctv_likely) score += 0.15;

  // Open during requested time (0.20) - assume Gemini filtered this
  score += 0.20;

  // Lighting/daylight suitability (0.10)
  if (venue.well_lit) score += 0.10;

  // Parking or transit access (0.10)
  if (venue.parking_available) score += 0.10;

  // Accessibility fit (0.05)
  if (!preferences.wheelchairAccess || venue.wheelchair_access) score += 0.05;

  return Math.min(1, score);
}

function calculateFairnessScore(etaA: number, etaB: number): number {
  const diff = Math.abs(etaA - etaB);
  const maxEta = Math.max(etaA, etaB);
  const denominator = Math.max(5, maxEta);

  return Math.max(0, Math.min(1, 1 - diff / denominator));
}
