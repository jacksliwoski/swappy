import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { useState } from 'react';
import Discover from './screens/Discover';
import Inventory from './screens/Inventory';
import AddToInventory from './screens/AddToInventory';
import TradeBuilder from './screens/TradeBuilder';
import Messages from './screens/Messages';
import Profile from './screens/Profile';
import Settings from './screens/Settings';
import MeetupSuggestions from './components/MeetupSuggestions';

function App() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <BrowserRouter>
      <div style={{ minHeight: '100vh', background: 'var(--color-gray-50)' }}>
        {/* Header */}
        <header style={{
          height: 'var(--header-height)',
          background: 'var(--color-white)',
          borderBottom: '2px solid var(--color-gray-200)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 1rem',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}>
          <button
            onClick={() => setDrawerOpen(!drawerOpen)}
            className="btn"
            style={{ marginRight: '1rem', fontSize: '1.5rem' }}
          >
            ☰
          </button>
          <Link
            to="/"
            style={{
              fontSize: 'var(--text-2xl)',
              fontWeight: 'var(--font-bold)',
              color: 'var(--color-primary)',
              flex: 1,
              textDecoration: 'none',
            }}
          >
            Swappy 🔄
          </Link>
          <Link to="/profile">
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--color-lilac-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
            }}>
              😊
            </div>
          </Link>
        </header>

        {/* Drawer */}
        {drawerOpen && (
          <>
            <div
              onClick={() => setDrawerOpen(false)}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0, 0, 0, 0.5)',
                zIndex: 200,
              }}
            />
            <aside style={{
              position: 'fixed',
              left: 0,
              top: 0,
              bottom: 0,
              width: 'var(--drawer-width)',
              background: 'var(--color-white)',
              boxShadow: 'var(--shadow-xl)',
              zIndex: 300,
              padding: '1.5rem',
            }}>
              <h2 style={{ marginBottom: '2rem', color: 'var(--color-primary)' }}>Menu</h2>
              <nav>
                <ul style={{ listStyle: 'none' }}>
                  {[
                    { to: '/discover', icon: '🔍', label: 'Discover' },
                    { to: '/inventory', icon: '📦', label: 'My Inventory' },
                    { to: '/add', icon: '➕', label: 'Add Item' },
                    { to: '/trades', icon: '🔄', label: 'Trade Builder' },
                    { to: '/messages', icon: '💬', label: 'Messages' },
                    { to: '/meetup', icon: '📍', label: 'Safe Meetup' },
                    { to: '/profile', icon: '👤', label: 'Profile & XP' },
                    { to: '/settings', icon: '⚙️', label: 'Settings' },
                  ].map(item => (
                    <li key={item.to} style={{ marginBottom: '0.5rem' }}>
                      <Link
                        to={item.to}
                        onClick={() => setDrawerOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '1rem',
                          padding: '0.75rem',
                          borderRadius: 'var(--radius-md)',
                          fontSize: '1.125rem',
                          textDecoration: 'none',
                          color: 'var(--color-gray-800)',
                          transition: 'background var(--transition-fast)',
                        }}
                        onMouseOver={(e) => e.currentTarget.style.background = 'var(--color-gray-100)'}
                        onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <span style={{ fontSize: '1.5rem' }}>{item.icon}</span>
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </aside>
          </>
        )}

        {/* Main Content */}
        <main>
          <Routes>
            <Route path="/" element={<Navigate to="/discover" replace />} />
            <Route path="/discover" element={<Discover />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/add" element={<AddToInventory />} />
            <Route path="/trades/:tradeId?" element={<TradeBuilder />} />
            <Route path="/messages/:conversationId?" element={<Messages />} />
            <Route path="/meetup" element={<MeetupSuggestions />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
