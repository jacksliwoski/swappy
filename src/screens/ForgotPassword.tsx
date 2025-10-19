// src/screens/ForgotPassword.tsx
import { useState } from 'react';
import { api } from '../utils/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault(); setMsg('');
    await api.auth.forgot(email);
    setMsg('If an account exists, a reset link has been written to the server outbox.');
  }

  const input = { width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #e5e7eb' };

  return (
    <div style={{ maxWidth: 420, margin: '2rem auto', padding: '1rem' }}>
      <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Forgot password</h1>
      <form onSubmit={onSubmit} style={{ display: 'grid', gap: '0.75rem' }}>
        <input style={input} type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <button style={{ padding: '0.6rem', borderRadius: 8, border: '1px solid #e5e7eb' }}>Send reset link</button>
      </form>
      {msg && <div style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>{msg}</div>}
    </div>
  );
}
