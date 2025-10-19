// src/screens/SignIn.tsx
import { useState } from 'react';
import { api, setToken } from '../utils/api';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault(); setMsg('');
    try {
      const res = await api.auth.login({ email, password });
      setToken(res.token);
      location.href = '/';
    } catch (e: any) {
      setMsg(e?.error || 'Failed to sign in');
    }
  }

  const input = { width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #e5e7eb' };

  return (
    <div style={{ maxWidth: 420, margin: '2rem auto', padding: '1rem' }}>
      <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Sign in</h1>
      <form onSubmit={onSubmit} style={{ display: 'grid', gap: '0.75rem' }}>
        <input style={input} type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input style={input} type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
        <button style={{ padding: '0.6rem', borderRadius: 8, border: '1px solid #e5e7eb' }}>Sign in</button>
      </form>
      {msg && <div style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>{msg}</div>}
      <div style={{ marginTop: '0.75rem', fontSize: '0.9rem' }}>
        <a href="/forgot-password">Forgot password?</a> &nbsp;•&nbsp; No account? <a href="/signup">Create one</a>
      </div>
    </div>
  );
}
