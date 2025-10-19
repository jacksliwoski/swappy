import { useState } from 'react';
import { MeetupResponse } from '../types';

const API_BASE = 'http://localhost:3000';

export default function MeetupSuggestions() {
  const [locationA, setLocationA] = useState('');
  const [locationB, setLocationB] = useState('');
  const [timeWindow, setTimeWindow] = useState('');
  const [travelMode, setTravelMode] = useState<'driving' | 'walking'>('driving');
  const [maxMinutesA, setMaxMinutesA] = useState(30);
  const [maxMinutesB, setMaxMinutesB] = useState(30);
  const [indoorPreferred, setIndoorPreferred] = useState(false);
  const [wheelchairAccess, setWheelchairAccess] = useState(false);
  const [parkingNeeded, setParkingNeeded] = useState(false);
  const [ageContextUnder18, setAgeContextUnder18] = useState(false);

  const [result, setResult] = useState<MeetupResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!locationA.trim() || !locationB.trim() || !timeWindow.trim()) {
      setError('Please fill in both locations and time window');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`${API_BASE}/ai/meetup-suggestions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locationA,
          locationB,
          timeWindow,
          travelMode,
          maxMinutesA,
          maxMinutesB,
          indoorPreferred,
          wheelchairAccess,
          parkingNeeded,
          ageContextUnder18
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get suggestions');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="card">
      <h2>Safe Meetup Suggestions (Feature E)</h2>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div className="form-group">
            <label>User A Location</label>
            <input
              type="text"
              value={locationA}
              onChange={(e) => setLocationA(e.target.value)}
              placeholder="e.g., Seattle, WA or Bellevue Downtown"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>User B Location</label>
            <input
              type="text"
              value={locationB}
              onChange={(e) => setLocationB(e.target.value)}
              placeholder="e.g., Redmond, WA or Capitol Hill"
              disabled={loading}
            />
          </div>
        </div>

        <div className="form-group">
          <label>Time Window</label>
          <input
            type="text"
            value={timeWindow}
            onChange={(e) => setTimeWindow(e.target.value)}
            placeholder="e.g., today 3-7pm, Saturday 10am-2pm"
            disabled={loading}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
          <div className="form-group">
            <label>Travel Mode</label>
            <select value={travelMode} onChange={(e) => setTravelMode(e.target.value as 'driving' | 'walking')} disabled={loading}>
              <option value="driving">Driving</option>
              <option value="walking">Walking</option>
            </select>
          </div>

          <div className="form-group">
            <label>Max Minutes (User A)</label>
            <input
              type="number"
              value={maxMinutesA}
              onChange={(e) => setMaxMinutesA(Number(e.target.value))}
              min="5"
              max="120"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Max Minutes (User B)</label>
            <input
              type="number"
              value={maxMinutesB}
              onChange={(e) => setMaxMinutesB(Number(e.target.value))}
              min="5"
              max="120"
              disabled={loading}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '16px', marginBottom: '12px', flexWrap: 'wrap' }}>
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={indoorPreferred}
              onChange={(e) => setIndoorPreferred(e.target.checked)}
              disabled={loading}
              style={{ marginRight: '6px', width: 'auto' }}
            />
            Indoor Preferred
          </label>

          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={wheelchairAccess}
              onChange={(e) => setWheelchairAccess(e.target.checked)}
              disabled={loading}
              style={{ marginRight: '6px', width: 'auto' }}
            />
            Wheelchair Access
          </label>

          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={parkingNeeded}
              onChange={(e) => setParkingNeeded(e.target.checked)}
              disabled={loading}
              style={{ marginRight: '6px', width: 'auto' }}
            />
            Parking Needed
          </label>

          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={ageContextUnder18}
              onChange={(e) => setAgeContextUnder18(e.target.checked)}
              disabled={loading}
              style={{ marginRight: '6px', width: 'auto' }}
            />
            User Under 18
          </label>
        </div>

        {error && <div className="error-toast">{error}</div>}

        <button type="submit" disabled={loading}>
          {loading && <span className="loading" />}
          {loading ? 'Finding Safe Locations...' : 'Get Meetup Suggestions'}
        </button>
      </form>

      {result && (
        <div style={{ marginTop: '24px' }}>
          <div className="warning-banner" style={{ background: '#e3f2fd', borderColor: '#90caf9', color: '#1565c0' }}>
            <strong>⚠️ Safety Disclaimer</strong>
            <p style={{ marginTop: '8px', marginBottom: 0, fontSize: '13px' }}>{result.disclaimer}</p>
          </div>

          <h3 style={{ marginTop: '20px' }}>
            {result.suggestions.length} Safe Meetup Suggestion{result.suggestions.length !== 1 ? 's' : ''}
          </h3>

          {result.suggestions.length === 0 ? (
            <p style={{ color: '#666', marginTop: '12px' }}>
              No suitable venues found. Try broadening your time window or increasing max travel time.
            </p>
          ) : (
            result.suggestions.map((suggestion, index) => (
              <div
                key={index}
                style={{
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  padding: '16px',
                  marginTop: '16px',
                  background: index === 0 ? '#f0f9ff' : 'white'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                  <div>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '16px' }}>
                      {index + 1}. {suggestion.name}
                    </h4>
                    <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>{suggestion.address}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#1976d2' }}>
                      Score: {Math.round(suggestion.overall_score * 100)}%
                    </div>
                    <div style={{ fontSize: '11px', color: '#666' }}>
                      Safety: {Math.round(suggestion.safety_score * 100)}% | Fairness: {Math.round(suggestion.fairness_score * 100)}%
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: '13px', marginBottom: '12px', color: '#444' }}>
                  <strong>Open:</strong> {suggestion.open_hours}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div style={{ background: '#f5f5f5', padding: '8px', borderRadius: '4px' }}>
                    <strong style={{ fontSize: '12px' }}>User A:</strong>
                    <div style={{ fontSize: '13px', marginTop: '4px' }}>
                      {suggestion.distance_userA} ({suggestion.eta_userA} min)
                    </div>
                  </div>
                  <div style={{ background: '#f5f5f5', padding: '8px', borderRadius: '4px' }}>
                    <strong style={{ fontSize: '12px' }}>User B:</strong>
                    <div style={{ fontSize: '13px', marginTop: '4px' }}>
                      {suggestion.distance_userB} ({suggestion.eta_userB} min)
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <strong style={{ fontSize: '13px' }}>Why Safe:</strong>
                  <ul style={{ margin: '6px 0', paddingLeft: '20px', fontSize: '13px' }}>
                    {suggestion.why_safe.map((reason, i) => (
                      <li key={i}>{reason}</li>
                    ))}
                  </ul>
                </div>

                <div style={{ marginBottom: '12px', fontSize: '13px' }}>
                  <strong>Meeting Notes:</strong> {suggestion.notes_for_meet}
                </div>

                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
                  {suggestion.indoor && <span className="item-chip" style={{ background: '#e3f2fd', fontSize: '11px' }}>Indoor</span>}
                  {suggestion.staff_present && <span className="item-chip" style={{ background: '#e8f5e9', fontSize: '11px' }}>Staffed</span>}
                  {suggestion.cctv_likely && <span className="item-chip" style={{ background: '#fff3e0', fontSize: '11px' }}>CCTV</span>}
                  {suggestion.well_lit && <span className="item-chip" style={{ background: '#fce4ec', fontSize: '11px' }}>Well Lit</span>}
                  {suggestion.parking_available && <span className="item-chip" style={{ background: '#f3e5f5', fontSize: '11px' }}>Parking</span>}
                  {suggestion.wheelchair_access && <span className="item-chip" style={{ background: '#e0f2f1', fontSize: '11px' }}>♿ Accessible</span>}
                </div>

                <div style={{ background: '#f9fbe7', border: '1px solid #f0f4c3', borderRadius: '4px', padding: '10px', fontSize: '13px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong>Quick Share:</strong> {suggestion.quick_share_text}
                    </div>
                    <button
                      onClick={() => copyToClipboard(suggestion.quick_share_text)}
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                      className="secondary"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
