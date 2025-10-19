import { useState, CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, setToken } from '../utils/api';

export default function SignIn() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg('');
    setLoading(true);
    try {
      const res = await api.auth.login({ email, password });
      setToken(res.token);
      // Simple redirect - App.tsx will check token on load
      window.location.href = '/';
    } catch (e: any) {
      setMsg(e?.error || 'Oops! Check your email and password.');
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

  const demoBoxStyles: CSSProperties = {
    marginTop: 'var(--space-6)',
    padding: 'var(--space-4)',
    background: 'var(--color-rating-great-bg)',
    borderRadius: 'var(--radius-md)',
    fontSize: 'var(--text-small)',
    lineHeight: 'var(--text-small-lh)',
    color: 'var(--color-text-2)',
  };

  const demoTitleStyles: CSSProperties = {
    fontWeight: 'var(--font-bold)',
    color: 'var(--color-rating-great-text)',
    marginBottom: 'var(--space-2)',
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
    display: 'block',
    marginBottom: 'var(--space-2)',
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
        <div style={iconStyles}>👋</div>
        <h1 style={titleStyles}>Welcome back!</h1>
        <p style={subtitleStyles}>
          Sign in to continue trading awesome toys
        </p>
        
        <form onSubmit={onSubmit}>
          <div>
            <label style={labelStyles}>Email</label>
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
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
            {loading ? 'Signing in...' : 'Sign in 🚀'}
          </button>
        </form>
        
        {msg && <div style={errorStyles}>{msg}</div>}
        
        <div style={demoBoxStyles}>
          <div style={demoTitleStyles}>🎮 Try the demo!</div>
          <div style={{marginBottom: 'var(--space-2)'}}>
            <strong>Jack:</strong> jack@swappy.demo / password123
          </div>
          <div style={{marginBottom: 'var(--space-2)'}}>
            <strong>Anderson:</strong> anderson@swappy.demo / password123
          </div>
          <div style={{borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-2)', marginTop: 'var(--space-2)'}}>
            <strong>👨‍👩‍👧 Guardian (Parent):</strong> mike.anderson@example.com / guardian123
          </div>
        </div>
        
        <div style={linksStyles}>
          <a href="/forgot-password" style={linkStyles}>Forgot your password?</a>
          <div style={{marginTop: 'var(--space-4)'}}>
            Don't have an account? <a href="/signup" style={{...linkStyles, display: 'inline'}}>Sign up!</a>
          </div>
        </div>
      </div>
    </div>
  );
}

