// src/screens/ResetPassword.tsx
import { useState } from 'react';
import { api } from '../utils/api';

export default function ResetPassword() {
  const params = new URLSearchParams(location.search);
  const token = params.get('token') || '';
  const [pwd, setPwd] = useState('');
  const [msg, setMsg] = useState('');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault(); setMsg('');
    try { await api.auth.reset(token, pwd); setMsg('Password reset! You can now sign in.'); }
    catch (e:any) { setMsg(e?.error || 'Failed to reset'); }
  }

  const input = { width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #e5e7eb' };

  return (
    <div style={{ maxWidth: 420, margin: '2rem auto', padding: '1rem' }}>
      <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Reset password</h1>
      <form onSubmit={onSubmit} style={{ display: 'grid', gap: '0.75rem' }}>
        <input style={input} type="password" placeholder="New password" value={pwd} onChange={e=>setPwd(e.target.value)} />
        <button style={{ padding: '0.6rem', borderRadius: 8, border: '1px solid #e5e7eb' }}>Reset</button>
      </form>
      {msg && <div style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>{msg}</div>}
    </div>
  );
}
