// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { useState } from 'react';
import AuthButton from './components/AuthButton';

import SignIn from './screens/SignIn';
import SignUp from './screens/SignUp';
import ForgotPassword from './screens/ForgotPassword';
import ResetPassword from './screens/ResetPassword';

// If you have existing screens, import them and wire routes here.

export default function App() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <BrowserRouter>
      <div style={{ display: 'flex', minHeight: '100vh', background: '#f9fafb' }}>
        {/* Sidebar (optional placeholder) */}
        <aside style={{ width: 280, padding: '1rem', borderRight: '1px solid #e5e7eb' }}>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>
            <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>Swappy</Link>
          </div>
          <nav>
            <div style={{ marginBottom: '0.5rem' }}>
              <Link to="/" style={{ display: 'block', padding: '0.75rem', borderRadius: 8, textDecoration: 'none', color: '#111827' }}>
                Home
              </Link>
            </div>
            <div style={{ marginBottom: '0.5rem' }}>
              <Link to="/signin" style={{ display: 'block', padding: '0.75rem', borderRadius: 8, textDecoration: 'none', color: '#111827' }}>
                Sign in
              </Link>
            </div>
            <div style={{ marginBottom: '0.5rem' }}>
              <Link to="/signup" style={{ display: 'block', padding: '0.75rem', borderRadius: 8, textDecoration: 'none', color: '#111827' }}>
                Sign up
              </Link>
            </div>
          </nav>
        </aside>

        {/* Main */}
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <header style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '0.75rem 1rem', borderBottom: '1px solid #e5e7eb', background: 'white'
          }}>
            <button onClick={() => setDrawerOpen(!drawerOpen)} style={{
              padding: '0.5rem 0.75rem', borderRadius: 8, border: '1px solid #e5e7eb', background: 'white'
            }}>
              ☰
            </button>
            <AuthButton />
          </header>

          <div style={{ padding: '1rem' }}>
            <Routes>
              <Route path="/" element={<div>Welcome to Swappy</div>} />
              <Route path="/signin" element={<SignIn />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </BrowserRouter>
  );
}

