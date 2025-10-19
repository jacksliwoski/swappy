import { useEffect, useState, CSSProperties } from 'react';
import { getToken, clearToken } from '../utils/api';

export default function AuthButton() {
  const [authed, setAuthed] = useState<boolean>(() => !!getToken());
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const onStorage = () => setAuthed(!!getToken());
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const buttonStyles: CSSProperties = {
    padding: '8px 16px',
    borderRadius: 'var(--radius-pill)',
    border: '2px solid var(--color-brand)',
    boxShadow: 'var(--shadow-s1)',
    background: authed ? 'var(--color-surface)' : 'var(--color-brand)',
    color: authed ? 'var(--color-brand-ink)' : 'white',
    cursor: 'pointer',
    textDecoration: 'none',
    fontFamily: 'var(--font-body)',
    fontWeight: 'var(--font-semibold)',
    fontSize: 'var(--text-small)',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 'var(--space-2)',
    transition: 'all var(--transition-base)',
    transform: isHovered ? 'translateY(-2px) scale(1.05)' : 'none',
  };

  if (!authed) {
    return (
      <a
        href="/signin"
        style={buttonStyles}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        👋 Sign in
      </a>
    );
  }

  return (
    <button
      style={buttonStyles}
      onClick={() => {
        clearToken();
        setAuthed(false);
        location.href = '/signin';
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      👋 Sign out
    </button>
  );
}
