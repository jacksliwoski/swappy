// src/components/AuthButton.tsx
import { useEffect, useState } from 'react';
import { getToken, clearToken } from '../utils/api';

export default function AuthButton() {
  const [authed, setAuthed] = useState<boolean>(() => !!getToken());

  useEffect(() => {
    const onStorage = () => setAuthed(!!getToken());
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const baseStyle: React.CSSProperties = {
    padding: '0.5rem 1rem',
    borderRadius: '9999px',
    border: '1px solid #e5e7eb',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
    background: 'white',
    cursor: 'pointer',
    textDecoration: 'none',
    color: 'inherit'
  };

  if (!authed) {
    return <a href="/signin" style={baseStyle}>Sign in</a>;
  }
  return (
    <button
      style={baseStyle}
      onClick={() => { clearToken(); setAuthed(false); }}
    >
      Sign out
    </button>
  );
}
