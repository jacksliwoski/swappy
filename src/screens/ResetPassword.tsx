import { useState, CSSProperties } from 'react';
import { api } from '../utils/api';

export default function ResetPassword() {
  const params = new URLSearchParams(location.search);
  const token = params.get('token') || '';
  const [pwd, setPwd] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg('');
    setLoading(true);
    
    try {
      await api.auth.reset(token, pwd);
      setSuccess(true);
      setMsg('Password reset! You can now sign in.');
      setTimeout(() => {
        location.href = '/signin';
      }, 2000);
    } catch (e: any) {
      setMsg(e?.error || 'Failed to reset. The link may have expired.');
    } finally {
      setLoading(false);
    }
  }

  const containerStyles: CSSProperties = {
    maxWidth: '420px',
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

  const inputStyles: CSSProperties = {
    width: '100%',
    padding: 'var(--space-4)',
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
  };

  const messageStyles: CSSProperties = {
    marginTop: 'var(--space-4)',
    padding: 'var(--space-3)',
    background: success ? 'var(--color-success-light)' : 'var(--color-error-light)',
    color: success ? 'var(--color-success)' : 'var(--color-error)',
    borderRadius: 'var(--radius-sm)',
    fontSize: 'var(--text-small)',
    fontWeight: 'var(--font-semibold)',
    textAlign: 'center',
  };

  return (
    <div style={containerStyles}>
      <div style={cardStyles}>
        <div style={iconStyles}>🔒</div>
        <h1 style={titleStyles}>Reset Your Password</h1>
        <p style={subtitleStyles}>
          Create a new strong password
        </p>
        
        <form onSubmit={onSubmit}>
          <input
            style={inputStyles}
            type="password"
            placeholder="New password"
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
            required
            disabled={success}
            minLength={6}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-brand)';
              e.currentTarget.style.boxShadow = 'var(--shadow-s1)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-border)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
          
          <button
            style={buttonStyles}
            type="submit"
            disabled={loading || success}
            onMouseEnter={(e) => {
              if (!loading && !success) {
                e.currentTarget.style.background = 'var(--color-brand-ink)';
                e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                e.currentTarget.style.boxShadow = 'var(--shadow-s2)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading && !success) {
                e.currentTarget.style.background = 'var(--color-brand)';
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = 'var(--shadow-s1)';
              }
            }}
          >
            {loading ? 'Resetting...' : success ? 'Done! ✓' : 'Reset Password 🔐'}
          </button>
        </form>
        
        {msg && <div style={messageStyles}>{msg}</div>}
      </div>
    </div>
  );
}
