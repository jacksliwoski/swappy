import { useState, useEffect } from 'react';
import { ai } from '../../utils/api';
import Button from '../ui/Button';
import SafetyBanner from '../ui/SafetyBanner';
import LoadingSpinner from '../ui/LoadingSpinner';

export type MeetupVenue = {
  name: string;
  address: string;
  open_hours: string;
  isOpen?: boolean;
  closesAt?: string;
  specificSpot?: string;
  indoor: boolean;
  staff_present: boolean;
  cctv_likely: boolean;
  well_lit: boolean;
  parking_available: boolean;
  wheelchair_access: boolean;
  why_safe: string[];
  notes_for_meet: string;
  quick_share_text?: string;
};

export type MeetupDetails = {
  venue: MeetupVenue;
  time: string;
};

interface MeetupAssistantProps {
  isUnder18?: boolean;
  locationA?: string;
  locationB?: string;
  onInsertToChat?: (message: string) => void;
  onSetMeetup?: (details: MeetupDetails) => void;
  onDismiss?: () => void;
}

// Fallback curated venues (used if API fails)
const FALLBACK_VENUES: MeetupVenue[] = [
  {
    name: 'City Public Library',
    address: '123 Main St',
    open_hours: 'Mon-Sat 9AM-7PM',
    isOpen: true,
    closesAt: '7:00 PM',
    specificSpot: 'the front lobby',
    indoor: true,
    staff_present: true,
    cctv_likely: true,
    well_lit: true,
    parking_available: true,
    wheelchair_access: true,
    why_safe: ['Staffed during business hours', 'Security cameras', 'Public space'],
    notes_for_meet: 'Meet inside the front lobby near the circulation desk',
  },
  {
    name: 'Community Center',
    address: '456 Oak Ave',
    open_hours: 'Daily 8AM-9PM',
    isOpen: true,
    closesAt: '9:00 PM',
    specificSpot: 'the main entrance',
    indoor: true,
    staff_present: true,
    cctv_likely: true,
    well_lit: true,
    parking_available: true,
    wheelchair_access: true,
    why_safe: ['Staffed facility', 'Well-lit parking', 'Public building'],
    notes_for_meet: 'Meet at the main entrance inside the building',
  },
  {
    name: 'Police Safe Exchange Zone',
    address: '789 Elm St',
    open_hours: '24/7',
    isOpen: true,
    specificSpot: 'the designated exchange area',
    indoor: false,
    staff_present: true,
    cctv_likely: true,
    well_lit: true,
    parking_available: true,
    wheelchair_access: true,
    why_safe: ['Police presence', 'Video surveillance', 'Designated for exchanges'],
    notes_for_meet: 'Meet in the designated safe exchange zone in the parking lot',
  },
];

// Quick time options
const QUICK_TIMES = [
  { label: 'Today 5:00 PM', value: 'today at 5:00 PM' },
  { label: 'Today 6:30 PM', value: 'today at 6:30 PM' },
  { label: 'Tomorrow 4:00 PM', value: 'tomorrow at 4:00 PM' },
];

export default function MeetupAssistant({
  isUnder18 = false,
  locationA = 'Seattle, WA',
  locationB = 'Bellevue, WA',
  onInsertToChat,
  onSetMeetup,
  onDismiss,
}: MeetupAssistantProps) {
  const [venues, setVenues] = useState<MeetupVenue[]>([]);
  const [selectedVenue, setSelectedVenue] = useState<MeetupVenue | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [customTime, setCustomTime] = useState('');
  const [showCustomTime, setShowCustomTime] = useState(false);
  const [timeWarning, setTimeWarning] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    loadMeetupSuggestions();
  }, []);

  async function loadMeetupSuggestions() {
    setLoading(true);
    setLoadError(false);

    try {
      const response = await ai.meetupSuggestions({
        locationA,
        locationB,
        timeWindow: 'today 3-7pm',
        travelMode: 'driving',
        maxMinutesA: 30,
        maxMinutesB: 30,
        indoorPreferred: true,
        ageContextUnder18: isUnder18,
      });

      if (response.suggestions && response.suggestions.length > 0) {
        setVenues(response.suggestions.slice(0, 3));
      } else {
        // Use fallback venues
        setVenues(FALLBACK_VENUES);
        setLoadError(true);
      }
    } catch (error) {
      console.error('Failed to load meetup suggestions:', error);
      // Use fallback venues
      setVenues(FALLBACK_VENUES);
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }

  const handleVenuePick = (venue: MeetupVenue) => {
    setSelectedVenue(venue);
    setTimeWarning(null);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setShowCustomTime(false);
    setCustomTime('');
    validateTime(time);
  };

  const handleCustomTimeChange = (time: string) => {
    setCustomTime(time);
    setSelectedTime(time);
    validateTime(time);
  };

  const validateTime = (time: string) => {
    if (!selectedVenue) return;

    // Simple validation: check if time mentions a time that might be outside hours
    // In a real app, you'd parse the time and compare with venue hours
    if (!selectedVenue.isOpen && !time.includes('tomorrow')) {
      setTimeWarning('This venue may be closed at that time. Consider tomorrow.');
    } else {
      setTimeWarning(null);
    }
  };

  const generateMessage = (): string => {
    if (!selectedVenue || !selectedTime) return '';

    // Use quick_share_text if available, otherwise construct message
    if (selectedVenue.quick_share_text) {
      return selectedVenue.quick_share_text;
    }

    const spot = selectedVenue.specificSpot || selectedVenue.notes_for_meet || 'the main entrance';
    return `Let's meet at ${selectedVenue.name} at ${selectedTime} — inside ${spot}. Does that work?`;
  };

  const handleInsertToChat = () => {
    const message = generateMessage();
    if (message && onInsertToChat) {
      onInsertToChat(message);
    }
  };

  const handleSetMeetup = () => {
    if (!selectedVenue || !selectedTime) return;

    if (onSetMeetup) {
      onSetMeetup({
        venue: selectedVenue,
        time: selectedTime,
      });
    }
  };

  const canProceed = selectedVenue && selectedTime;

  return (
    <div style={{
      background: 'var(--color-blue-light)',
      border: '2px solid var(--color-primary)',
      borderRadius: 'var(--radius-lg)',
      padding: 'var(--space-4)',
      marginBottom: 'var(--space-3)',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
        <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-bold)', color: 'var(--color-primary)' }}>
          📍 Plan a safe meet-up?
        </h3>
        {onDismiss && (
          <button
            onClick={onDismiss}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: 'var(--text-xl)',
              cursor: 'pointer',
              padding: 'var(--space-1)',
              opacity: 0.6,
            }}
          >
            ✕
          </button>
        )}
      </div>

      {/* Under-18 Guardian Notice */}
      {isUnder18 && (
        <SafetyBanner
          type="info"
          message="Meet with a grown-up."
          style={{ marginBottom: 'var(--space-3)' }}
        />
      )}

      {/* Fallback Warning */}
      {loadError && (
        <SafetyBanner
          type="warning"
          message="Using curated fallback locations. Live venue search unavailable."
          style={{ marginBottom: 'var(--space-3)' }}
        />
      )}

      {/* Venue Suggestions */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-6)' }}>
          <LoadingSpinner />
          <div style={{ marginTop: 'var(--space-2)', color: 'var(--color-gray-600)' }}>
            Finding safe locations...
          </div>
        </div>
      ) : (
        <div style={{ marginBottom: 'var(--space-3)' }}>
          <label style={{ display: 'block', fontWeight: 'var(--font-semibold)', marginBottom: 'var(--space-2)' }}>
            Where?
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-2)' }}>
            {venues.map((venue, idx) => (
              <div
                key={idx}
                onClick={() => handleVenuePick(venue)}
                style={{
                  padding: 'var(--space-3)',
                  background: selectedVenue === venue ? 'var(--color-primary)' : 'var(--color-white)',
                  color: selectedVenue === venue ? 'white' : 'var(--color-gray-800)',
                  border: `2px solid ${selectedVenue === venue ? 'var(--color-primary)' : 'var(--color-gray-300)'}`,
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                }}
              >
                <div style={{ fontWeight: 'var(--font-bold)', marginBottom: 'var(--space-1)' }}>
                  {venue.name}
                </div>
                <div style={{ fontSize: 'var(--text-sm)', opacity: 0.9, marginBottom: 'var(--space-1)' }}>
                  {venue.indoor ? 'Indoor' : 'Outdoor'} · {venue.staff_present ? 'staffed' : 'public'} · {venue.wheelchair_access ? '♿' : ''}
                </div>
                <div style={{ fontSize: 'var(--text-sm)', opacity: 0.8 }}>
                  {venue.open_hours}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Time Picker */}
      {selectedVenue && (
        <div style={{ marginBottom: 'var(--space-3)' }}>
          <label style={{ display: 'block', fontWeight: 'var(--font-semibold)', marginBottom: 'var(--space-2)' }}>
            When?
          </label>
          <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', marginBottom: 'var(--space-2)' }}>
            {QUICK_TIMES.map((time) => (
              <button
                key={time.value}
                onClick={() => handleTimeSelect(time.value)}
                className="btn"
                style={{
                  padding: 'var(--space-2) var(--space-3)',
                  background: selectedTime === time.value ? 'var(--color-primary)' : 'var(--color-white)',
                  color: selectedTime === time.value ? 'white' : 'var(--color-gray-800)',
                  border: `2px solid ${selectedTime === time.value ? 'var(--color-primary)' : 'var(--color-gray-300)'}`,
                  borderRadius: 'var(--radius-md)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-semibold)',
                }}
              >
                {time.label}
              </button>
            ))}
            <button
              onClick={() => setShowCustomTime(!showCustomTime)}
              className="btn"
              style={{
                padding: 'var(--space-2) var(--space-3)',
                background: showCustomTime ? 'var(--color-primary)' : 'var(--color-white)',
                color: showCustomTime ? 'white' : 'var(--color-gray-800)',
                border: `2px solid ${showCustomTime ? 'var(--color-primary)' : 'var(--color-gray-300)'}`,
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-semibold)',
              }}
            >
              Custom time...
            </button>
          </div>

          {showCustomTime && (
            <input
              type="text"
              value={customTime}
              onChange={(e) => handleCustomTimeChange(e.target.value)}
              placeholder="e.g., tomorrow at 3:00 PM"
              style={{
                width: '100%',
                padding: 'var(--space-2)',
                border: '2px solid var(--color-gray-300)',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--text-base)',
              }}
            />
          )}

          {timeWarning && (
            <SafetyBanner
              type="warning"
              message={timeWarning}
              style={{ marginTop: 'var(--space-2)' }}
            />
          )}
        </div>
      )}

      {/* Safety Tip */}
      <div style={{
        background: 'var(--color-green-light)',
        padding: 'var(--space-3)',
        borderRadius: 'var(--radius-md)',
        marginBottom: 'var(--space-3)',
        fontSize: 'var(--text-sm)',
        color: 'var(--color-green-dark)',
      }}>
        ✓ Meet in a public, staffed place. Bring a grown-up.
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
        {onInsertToChat && (
          <Button
            variant="secondary"
            onClick={handleInsertToChat}
            disabled={!canProceed}
            style={{ flex: 1 }}
          >
            Insert to chat
          </Button>
        )}
        {onSetMeetup && (
          <Button
            variant="primary"
            onClick={handleSetMeetup}
            disabled={!canProceed}
            style={{ flex: 1 }}
          >
            Set meet-up
          </Button>
        )}
      </div>

      {/* Preview Message */}
      {canProceed && (
        <div style={{
          marginTop: 'var(--space-3)',
          padding: 'var(--space-2)',
          background: 'var(--color-gray-100)',
          borderRadius: 'var(--radius-md)',
          fontSize: 'var(--text-sm)',
          color: 'var(--color-gray-700)',
          fontStyle: 'italic',
        }}>
          Preview: "{generateMessage()}"
        </div>
      )}
    </div>
  );
}
