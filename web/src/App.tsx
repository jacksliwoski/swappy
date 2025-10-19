import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { useState } from 'react';

// Temporary placeholder screens
function Discover() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ color: 'var(--color-primary)', marginBottom: '1rem' }}>🔍 Discover</h1>
      <p style={{ fontSize: '1.125rem', color: 'var(--color-gray-600)' }}>
        Browse and discover items from other users. Coming soon!
      </p>
      <div className="card" style={{ marginTop: '2rem', maxWidth: '400px' }}>
        <h3 style={{ marginBottom: '1rem' }}>Featured Item</h3>
        <div style={{
          width: '100%',
          height: '200px',
          background: 'var(--color-teal-light)',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '3rem',
          marginBottom: '1rem',
        }}>
          🎮
        </div>
        <h4>Cool Game Console</h4>
        <div style={{ display: 'flex', gap: '0.5rem', margin: '0.5rem 0' }}>
          <span className="chip">games</span>
          <span className="chip">good</span>
        </div>
        <button className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
          Add to Trade
        </button>
      </div>
    </div>
  );
}

function Inventory() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ color: 'var(--color-primary)', marginBottom: '1rem' }}>📦 Your Toy Box</h1>
      <p style={{ fontSize: '1.125rem', color: 'var(--color-gray-600)', marginBottom: '2rem' }}>
        Your inventory is empty—let's fill it up! 📦
      </p>
      <Link to="/add">
        <button className="btn btn-primary">
          ➕ Add to Inventory
        </button>
      </Link>
    </div>
  );
}

function Profile() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ color: 'var(--color-primary)', marginBottom: '1rem' }}>👤 Profile & XP</h1>

      <div className="card" style={{ maxWidth: '500px', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: 'var(--radius-full)',
            background: 'var(--color-lilac-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
          }}>
            😊
          </div>
          <div>
            <h2 style={{ marginBottom: '0.25rem' }}>You</h2>
            <span className="chip" style={{ background: 'var(--color-primary)', color: 'white' }}>
              Lv1 Beginner
            </span>
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontWeight: 'var(--font-semibold)' }}>XP Progress</span>
            <span style={{ color: 'var(--color-gray-600)' }}>0 / 50 XP</span>
          </div>
          <div style={{
            width: '100%',
            height: '12px',
            background: 'var(--color-gray-200)',
            borderRadius: 'var(--radius-full)',
          }}>
            <div style={{
              width: '0%',
              height: '100%',
              background: 'var(--color-primary)',
              borderRadius: 'var(--radius-full)',
            }}></div>
          </div>
        </div>

        <h3 style={{ marginBottom: '1rem' }}>📛 Badges</h3>
        <p style={{ color: 'var(--color-gray-600)' }}>Complete trades to earn badges!</p>
      </div>

      <div className="card" style={{ maxWidth: '500px' }}>
        <h3 style={{ marginBottom: '1rem' }}>🎯 Weekly Quests</h3>
        <p style={{ color: 'var(--color-gray-600)' }}>Complete quests to earn bonus XP!</p>
      </div>
    </div>
  );
}

function ComingSoon({ title }: { title: string }) {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1 style={{ color: 'var(--color-primary)', marginBottom: '1rem' }}>{title}</h1>
      <p style={{ fontSize: '1.125rem', color: 'var(--color-gray-600)' }}>
        Coming soon! 🚀
      </p>
    </div>
  );
}

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
            <Route path="/add" element={<ComingSoon title="➕ Add to Inventory" />} />
            <Route path="/trades/:tradeId?" element={<ComingSoon title="🔄 Trade Builder" />} />
            <Route path="/messages/:conversationId?" element={<ComingSoon title="💬 Messages" />} />
            <Route path="/meetup" element={<ComingSoon title="📍 Safe Meetup" />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<ComingSoon title="⚙️ Settings" />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
