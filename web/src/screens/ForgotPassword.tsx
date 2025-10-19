import { useState, CSSProperties } from 'react';
import { api } from '../utils/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg('');
    setSuccess(false);
    setLoading(true);
    try {
      await api.auth.forgot(email);
      setSuccess(true);
      setMsg('Check your email for a reset link! (In demo mode, check the /data/outbox folder)');
    } catch (e: any) {
      setMsg(e?.error || 'Oops! Something went wrong. Try again!');
    } finally {
      setLoading(false);
    }
  }

  const containerStyles: CSSProperties = {
    maxWidth: '480px',
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

  const iconStyles: CSSProperties = {
    fontSize: '64px',
    textAlign: 'center',
    marginBottom: 'var(--space-4)',
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
    marginTop: 'var(--space-2)',
  };

  const messageStyles: CSSProperties = {
    marginTop: 'var(--space-4)',
    padding: 'var(--space-3)',
    background: success ? 'var(--color-rating-great-bg)' : 'var(--color-rating-bad-bg)',
    color: success ? 'var(--color-rating-great-text)' : 'var(--color-rating-bad-text)',
    borderRadius: 'var(--radius-sm)',
    fontSize: 'var(--text-small)',
    fontWeight: 'var(--font-semibold)',
    textAlign: 'center',
    lineHeight: 'var(--text-small-lh)',
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

  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = 'var(--color-brand)';
    e.currentTarget.style.boxShadow = 'var(--shadow-s1)';
  };

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = 'var(--color-border)';
    e.currentTarget.style.boxShadow = 'none';
  };

  return (
    <div style={containerStyles}>
      <div style={cardStyles}>
        <div style={iconStyles}>🔑</div>
        <h1 style={titleStyles}>Forgot Password?</h1>
        <p style={subtitleStyles}>
          No worries! We'll send you a reset link
        </p>
        
        <form onSubmit={onSubmit}>
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
            {loading ? 'Sending...' : 'Send Reset Link ✉️'}
          </button>
        </form>
        
        {msg && <div style={messageStyles}>{msg}</div>}
        
        <div style={linksStyles}>
          <a href="/signin" style={linkStyles}>Back to Sign In</a>
        </div>
      </div>
    </div>
  );
}

