export type Facts = {
  category: string;
  brand: string;
  model: string;
  year_or_edition: string;
  condition: 'new' | 'ln' | 'good' | 'fair' | 'poor';
  attributes: string[];
  notes: string;
};

export type ValuationResponse = {
  estimate: { low: number; mid: number; high: number };
  explanation: string;
};

export type FairnessResponse = {
  A: number;
  B: number;
  diff: number;
  fairness: number;
  warn: boolean;
};

export type ModerationResult = {
  tags: string[];
  action: 'allow' | 'warn' | 'block';
  tip: string;
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
