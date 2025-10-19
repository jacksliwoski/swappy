import { useState, CSSProperties } from 'react';
import { api, setToken } from '../utils/api';

export default function SignUp() {
  // Basic info
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [age, setAge] = useState('');
  const [guardianName, setGuardianName] = useState('');
  const [guardianEmail, setGuardianEmail] = useState('');
  
  // Profile data
  const [location, setLocation] = useState('');
  const [timeWindow, setTimeWindow] = useState('');
  const [travelMode, setTravelMode] = useState('driving');
  const [maxMinutes, setMaxMinutes] = useState('20');
  const [indoorPreferred, setIndoorPreferred] = useState(false);
  const [wheelchairAccess, setWheelchairAccess] = useState(false);
  const [parkingNeeded, setParkingNeeded] = useState(false);
  const [interests, setInterests] = useState('');
  
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg('');
    setLoading(true);
    
    try {
      // Parse interests as comma-separated
      const categoryInterests = interests
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
      
      const res = await api.auth.register({
        email,
        password,
        age: Number(age),
        guardianName,
        guardianEmail,
        location,
        timeWindow,
        travelMode,
        maxMinutes: Number(maxMinutes),
        indoorPreferred,
        wheelchairAccess,
        parkingNeeded,
        categoryInterests,
      });
      setToken(res.token);
      window.location.href = '/';
    } catch (e: any) {
      setMsg(e?.error || 'Oops! Something went wrong. Try again!');
    } finally {
      setLoading(false);
    }
  }

  const containerStyles: CSSProperties = {
    maxWidth: '580px',
    margin: '0 auto',
    padding: 'var(--space-8)',
  };

  const cardStyles: CSSProperties = {
    background: 'var(--color-surface)',
    borderRadius: 'var(--radius-lg)',
    border: '2px solid var(--color-border)',
    padding: 'var(--space-8)',
    boxShadow: 'var(--shadow-s2)',
  };

  const titleStyles: CSSProperties = {
    fontSize: 'var(--text-h2)',
    lineHeight: 'var(--text-h2-lh)',
    fontFamily: 'var(--font-display)',
    fontWeight: 'var(--font-bold)',
    color: 'var(--color-text-1)',
    marginBottom: 'var(--space-2)',
    textAlign: 'center',
  };

  const subtitleStyles: CSSProperties = {
    fontSize: 'var(--text-small)',
    color: 'var(--color-text-2)',
    textAlign: 'center',
    marginBottom: 'var(--space-6)',
    lineHeight: 'var(--text-small-lh)',
  };

  const iconStyles: CSSProperties = {
    fontSize: '48px',
    textAlign: 'center',
    marginBottom: 'var(--space-4)',
  };

  const sectionTitleStyles: CSSProperties = {
    fontSize: 'var(--text-h4)',
    fontFamily: 'var(--font-display)',
    fontWeight: 'var(--font-semibold)',
    color: 'var(--color-text-1)',
    marginTop: 'var(--space-6)',
    marginBottom: 'var(--space-4)',
    paddingBottom: 'var(--space-2)',
    borderBottom: '2px solid var(--color-border)',
  };

  const labelStyles: CSSProperties = {
    display: 'block',
    fontSize: 'var(--text-small)',
    fontFamily: 'var(--font-body)',
    fontWeight: 'var(--font-semibold)',
    color: 'var(--color-text-1)',
    marginBottom: 'var(--space-2)',
  };

  const inputStyles: CSSProperties = {
    width: '100%',
    padding: 'var(--space-3)',
    fontSize: 'var(--text-body)',
    fontFamily: 'var(--font-body)',
    fontWeight: 'var(--font-medium)',
    borderRadius: 'var(--radius-sm)',
    border: '2px solid var(--color-border)',
    marginBottom: 'var(--space-4)',
    transition: 'all var(--transition-base)',
  };

  const selectStyles: CSSProperties = {
    ...inputStyles,
    cursor: 'pointer',
  };

  const checkboxContainerStyles: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-2)',
    marginBottom: 'var(--space-4)',
  };

  const checkboxStyles: CSSProperties = {
    width: '20px',
    height: '20px',
    cursor: 'pointer',
  };

  const buttonStyles: CSSProperties = {
    width: '100%',
    padding: 'var(--space-4)',
    fontSize: 'var(--text-body)',
    fontFamily: 'var(--font-body)',
    fontWeight: 'var(--font-bold)',
    borderRadius: 'var(--radius-md)',
    border: 'none',
    background: 'var(--color-brand)',
    color: 'white',
    cursor: loading ? 'not-allowed' : 'pointer',
    transition: 'all var(--transition-base)',
    boxShadow: 'var(--shadow-s1)',
    opacity: loading ? 0.6 : 1,
    marginTop: 'var(--space-6)',
  };

  const errorStyles: CSSProperties = {
    marginTop: 'var(--space-4)',
    padding: 'var(--space-3)',
    background: 'var(--color-rating-bad-bg)',
    color: 'var(--color-rating-bad-text)',
    borderRadius: 'var(--radius-sm)',
    fontSize: 'var(--text-small)',
    fontWeight: 'var(--font-semibold)',
    textAlign: 'center',
  };

  const infoBoxStyles: CSSProperties = {
    marginBottom: 'var(--space-4)',
    padding: 'var(--space-3)',
    background: 'var(--color-rating-great-bg)',
    borderRadius: 'var(--radius-sm)',
    fontSize: 'var(--text-small)',
    lineHeight: 'var(--text-small-lh)',
    color: 'var(--color-text-2)',
  };

  const linksStyles: CSSProperties = {
    marginTop: 'var(--space-6)',
    fontSize: 'var(--text-small)',
    textAlign: 'center',
    color: 'var(--color-text-2)',
  };

  const linkStyles: CSSProperties = {
    color: 'var(--color-brand)',
    fontWeight: 'var(--font-semibold)',
    textDecoration: 'none',
  };

  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    e.currentTarget.style.borderColor = 'var(--color-brand)';
    e.currentTarget.style.boxShadow = 'var(--shadow-s1)';
  };

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    e.currentTarget.style.borderColor = 'var(--color-border)';
    e.currentTarget.style.boxShadow = 'none';
  };

  return (
    <div style={containerStyles}>
      <div style={cardStyles}>
        <div style={iconStyles}>🎉</div>
        <h1 style={titleStyles}>Join Swappy!</h1>
        <p style={subtitleStyles}>
          Start trading awesome toys safely
        </p>
        
        <form onSubmit={onSubmit}>
          {/* Account Info */}
          <h2 style={sectionTitleStyles}>👤 Account Info</h2>
          
          <div>
            <label style={labelStyles}>Your Email</label>
            <input
              style={inputStyles}
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
            />
          </div>
          
          <div>
            <label style={labelStyles}>Password</label>
            <input
              style={inputStyles}
              type="password"
              placeholder="Make it strong!"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
            />
          </div>
          
          <div>
            <label style={labelStyles}>Your Age</label>
            <input
              style={inputStyles}
              type="number"
              placeholder="How old are you?"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              required
              min="5"
              max="17"
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
            />
          </div>
          
          {/* Guardian Info */}
          <h2 style={sectionTitleStyles}>👨‍👩‍👧‍👦 Guardian Info</h2>
          <div style={infoBoxStyles}>
            We need a parent or guardian to help keep you safe!
          </div>
          
          <div>
            <label style={labelStyles}>Guardian Name</label>
            <input
              style={inputStyles}
              type="text"
              placeholder="Parent or guardian's name"
              value={guardianName}
              onChange={(e) => setGuardianName(e.target.value)}
              required
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
            />
          </div>
          
          <div>
            <label style={labelStyles}>Guardian Email</label>
            <input
              style={inputStyles}
              type="email"
              placeholder="guardian@example.com"
              value={guardianEmail}
              onChange={(e) => setGuardianEmail(e.target.value)}
              required
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
            />
          </div>
          
          {/* Meetup Preferences */}
          <h2 style={sectionTitleStyles}>📍 Meetup Preferences</h2>
          
          <div>
            <label style={labelStyles}>Your Location</label>
            <input
              style={inputStyles}
              type="text"
              placeholder="e.g., Seattle, WA or Bellevue Downtown"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
            />
          </div>
          
          <div>
            <label style={labelStyles}>When can you trade?</label>
            <input
              style={inputStyles}
              type="text"
              placeholder="e.g., Weekends 10am-4pm or After school 3-7pm"
              value={timeWindow}
              onChange={(e) => setTimeWindow(e.target.value)}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
            />
          </div>
          
          <div>
            <label style={labelStyles}>How do you travel?</label>
            <select
              style={selectStyles}
              value={travelMode}
              onChange={(e) => setTravelMode(e.target.value)}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
            >
              <option value="driving">🚗 Driving</option>
              <option value="walking">🚶 Walking</option>
              <option value="biking">🚴 Biking</option>
              <option value="public_transit">🚌 Public Transit</option>
            </select>
          </div>
          
          <div>
            <label style={labelStyles}>Max minutes you can travel</label>
            <input
              style={inputStyles}
              type="number"
              placeholder="20"
              value={maxMinutes}
              onChange={(e) => setMaxMinutes(e.target.value)}
              min="5"
              max="60"
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
            />
          </div>
          
          <div style={checkboxContainerStyles}>
            <input
              style={checkboxStyles}
              type="checkbox"
              id="indoorPreferred"
              checked={indoorPreferred}
              onChange={(e) => setIndoorPreferred(e.target.checked)}
            />
            <label htmlFor="indoorPreferred" style={{...labelStyles, marginBottom: 0, cursor: 'pointer'}}>
              🏠 I prefer indoor meeting spots
            </label>
          </div>
          
          <div style={checkboxContainerStyles}>
            <input
              style={checkboxStyles}
              type="checkbox"
              id="wheelchairAccess"
              checked={wheelchairAccess}
              onChange={(e) => setWheelchairAccess(e.target.checked)}
            />
            <label htmlFor="wheelchairAccess" style={{...labelStyles, marginBottom: 0, cursor: 'pointer'}}>
              ♿ I need wheelchair access
            </label>
          </div>
          
          <div style={checkboxContainerStyles}>
            <input
              style={checkboxStyles}
              type="checkbox"
              id="parkingNeeded"
              checked={parkingNeeded}
              onChange={(e) => setParkingNeeded(e.target.checked)}
            />
            <label htmlFor="parkingNeeded" style={{...labelStyles, marginBottom: 0, cursor: 'pointer'}}>
              🅿️ We need parking
            </label>
          </div>
          
          {/* Interests */}
          <h2 style={sectionTitleStyles}>🎯 What do you collect?</h2>
          
          <div>
            <label style={labelStyles}>Your interests (separate with commas)</label>
            <textarea
              style={{...inputStyles, minHeight: '80px', resize: 'vertical'}}
              placeholder="e.g., LEGO sets, Pokemon cards, action figures, board games"
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
            />
          </div>
          
          <button
            style={buttonStyles}
            type="submit"
            disabled={loading}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.background = 'var(--color-brand-ink)';
                e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                e.currentTarget.style.boxShadow = 'var(--shadow-s2)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.background = 'var(--color-brand)';
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = 'var(--shadow-s1)';
              }
            }}
          >
            {loading ? 'Creating your account...' : 'Create Account 🚀'}
          </button>
        </form>
        
        {msg && <div style={errorStyles}>{msg}</div>}
        
        <div style={linksStyles}>
          Already have an account? <a href="/signin" style={linkStyles}>Sign in!</a>
        </div>
      </div>
    </div>
  );
}

