import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { useState, useEffect, CSSProperties } from 'react';
import { getToken, clearToken, api } from './utils/api';

// Main app screens
import Discover from './screens/Discover';
import Inventory from './screens/Inventory';
import AddToInventory from './screens/AddToInventory';
import TradeBuilder from './screens/TradeBuilder';
import Messages from './screens/Messages';
import Profile from './screens/Profile';
import Settings from './screens/Settings';
import GuardianDashboard from './screens/GuardianDashboard';
import LostAndFound from './screens/LostAndFound';
import CreateBounty from './screens/CreateBounty';
import BountyDetail from './screens/BountyDetail';
import MyBounties from './screens/MyBounties';

// Auth screens
import SignIn from './screens/SignIn';
import SignUp from './screens/SignUp';
import ForgotPassword from './screens/ForgotPassword';
import ResetPassword from './screens/ResetPassword';

function App() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  // Initialize with the actual token state immediately to avoid race condition
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!getToken());

  // Check auth status on mount (in case token was set after initial render)
  useEffect(() => {
    const token = getToken();
    setIsAuthenticated(!!token);
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public auth routes */}
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        
        {/* Protected app routes */}
        <Route path="/*" element={
          <ProtectedApp 
            drawerOpen={drawerOpen} 
            setDrawerOpen={setDrawerOpen}
            isAuthenticated={isAuthenticated}
            setIsAuthenticated={setIsAuthenticated}
          />
        } />
      </Routes>
    </BrowserRouter>
  );
}

// Protected app wrapper
function ProtectedApp({ 
  drawerOpen, 
  setDrawerOpen,
  isAuthenticated,
  setIsAuthenticated
}: { 
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
  isAuthenticated: boolean;
  setIsAuthenticated: (auth: boolean) => void;
}) {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await api.auth.me();
        if (res.ok && res.user) {
          setCurrentUser(res.user);
        }
      } catch (error) {
        console.error('Failed to load user:', error);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  // If not authenticated, redirect to signin
  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>Loading...</div>;
  }

  const isGuardian = currentUser?.isGuardian === true;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      <AppHeader
        onMenuClick={() => setDrawerOpen(!drawerOpen)}
        onSignOut={() => {
          clearToken();
          setIsAuthenticated(false);
          window.location.href = '/signin';
        }}
      />
      
      {drawerOpen && (
        <AppDrawer 
          isOpen={drawerOpen} 
          onClose={() => setDrawerOpen(false)}
          isGuardian={isGuardian}
        />
      )}

      <main>
        <Routes>
          <Route path="/" element={<Navigate to={isGuardian ? "/guardian" : "/discover"} replace />} />
          <Route path="/discover" element={<Discover />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/add" element={<AddToInventory />} />
          <Route path="/trades/:tradeId?" element={<TradeBuilder />} />
          <Route path="/messages/:conversationId?" element={<Messages />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/guardian" element={<GuardianDashboard />} />
          <Route path="/lost-and-found" element={<LostAndFound />} />
          <Route path="/my-bounties" element={<MyBounties />} />
          <Route path="/bounty/:id" element={<BountyDetail />} />
          <Route path="/create-bounty" element={<CreateBounty />} />
        </Routes>
      </main>
    </div>
  );
}

// Header Component - Kid-friendly & playful
function AppHeader({ onMenuClick, onSignOut }: { onMenuClick: () => void; onSignOut: () => void }) {
  const [isHovered, setIsHovered] = useState(false);

  const headerStyles: CSSProperties = {
    height: 'var(--header-height)',
    background: 'var(--color-surface)',
    borderBottom: '2px solid var(--color-border)',
    display: 'flex',
    alignItems: 'center',
    padding: '0 var(--container-gutter)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    boxShadow: 'var(--shadow-s1)',
  };

  const menuButtonStyles: CSSProperties = {
    width: '44px',
    height: '44px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 'var(--space-4)',
    fontSize: '24px',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--color-text-2)',
    transition: 'all var(--transition-fast)',
  };

  const brandStyles: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-2)',
    fontSize: 'var(--text-h2)',
    fontFamily: 'var(--font-display)',
    fontWeight: 'var(--font-bold)',
    color: 'var(--color-brand-ink)',
    textDecoration: 'none',
    flex: 1,
    transition: 'transform var(--transition-fast)',
  };

  const iconStyles: CSSProperties = {
    fontSize: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const signOutButtonStyles: CSSProperties = {
    padding: '8px 16px',
    borderRadius: 'var(--radius-pill)',
    border: '2px solid var(--color-brand)',
    boxShadow: 'var(--shadow-s1)',
    background: 'var(--color-surface)',
    color: 'var(--color-brand-ink)',
    cursor: 'pointer',
    fontFamily: 'var(--font-body)',
    fontWeight: 'var(--font-semibold)',
    fontSize: 'var(--text-small)',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 'var(--space-2)',
    transition: 'all var(--transition-base)',
    transform: isHovered ? 'translateY(-2px) scale(1.05)' : 'none',
  };

  const avatarStyles: CSSProperties = {
    width: '48px',
    height: '48px',
    borderRadius: 'var(--radius-pill)',
    background: 'var(--color-brand-tint)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    border: '3px solid var(--color-brand)',
    transition: 'all var(--transition-base)',
    cursor: 'pointer',
    marginRight: 'var(--space-3)',
  };

  return (
    <header style={headerStyles}>
      <button
        style={menuButtonStyles}
        onClick={onMenuClick}
        aria-label="Open menu"
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'var(--color-brand-tint)';
          e.currentTarget.style.transform = 'scale(1.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        ☰
      </button>
      <Link 
        to="/" 
        style={brandStyles}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        <span style={iconStyles}>🔄</span>
        <span>Swappy</span>
      </Link>
      <Link 
        to="/profile"
        style={{...avatarStyles}}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1) rotate(5deg)';
          e.currentTarget.style.boxShadow = 'var(--shadow-s2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'none';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        😊
      </Link>
      <button
        style={signOutButtonStyles}
        onClick={onSignOut}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        👋 Sign out
      </button>
    </header>
  );
}

// Drawer Component - Grouped & colorful
function AppDrawer({ isOpen, onClose, isGuardian }: { isOpen: boolean; onClose: () => void; isGuardian?: boolean }) {
  const location = useLocation();

  const backdropStyles: CSSProperties = {
    position: 'fixed',
    inset: 0,
    background: 'rgba(15, 23, 42, 0.5)',
    zIndex: 200,
    backdropFilter: 'blur(3px)',
    animation: 'fadeIn 0.2s ease-out',
  };

  const drawerStyles: CSSProperties = {
    position: 'fixed',
    left: 0,
    top: 0,
    bottom: 0,
    width: 'var(--drawer-width)',
    background: 'var(--color-surface)',
    boxShadow: 'var(--shadow-s2)',
    zIndex: 300,
    padding: 'var(--space-6)',
    overflowY: 'auto',
    animation: 'slideDown 0.3s ease-out',
  };

  const headerStyles: CSSProperties = {
    marginBottom: 'var(--space-8)',
    paddingBottom: 'var(--space-4)',
    borderBottom: '2px solid var(--color-border)',
  };

  const titleStyles: CSSProperties = {
    fontSize: 'var(--text-h2)',
    fontFamily: 'var(--font-display)',
    fontWeight: 'var(--font-bold)',
    color: 'var(--color-brand-ink)',
    marginBottom: 'var(--space-1)',
  };

  const subtitleStyles: CSSProperties = {
    fontSize: 'var(--text-small)',
    color: 'var(--color-text-2)',
    fontWeight: 'var(--font-medium)',
  };

  // Guardian accounts only see guardian-specific pages
  const guardianMenuItems = [
    { to: '/guardian', icon: '👨‍👩‍👧', label: 'Guardian Dashboard', color: '#8b5cf6' },
    { to: '/lost-and-found', icon: '🔍', label: 'Lost & Found Bounty', color: '#f59e0b' },
  ];

  // Regular user menu items
  const regularMenuItems = [
    { to: '/discover', icon: '🔍', label: 'Discover', color: 'var(--color-accent-blue)' },
    { to: '/inventory', icon: '📦', label: 'My Toy Box', color: 'var(--color-accent-purple)' },
    { to: '/add', icon: '➕', label: 'Add Item', color: 'var(--color-accent-yellow)' },
    { to: '/trades', icon: '🔄', label: 'Trade Room', color: 'var(--color-brand)' },
    { to: '/messages', icon: '💬', label: 'Messages', color: 'var(--color-accent-coral)' },
    { to: '/lost-and-found', icon: '🔍', label: 'Lost & Found Bounty', color: 'var(--color-accent-yellow)' },
    { to: '/profile', icon: '👤', label: 'Profile & XP', color: 'var(--color-accent-purple)' },
    { to: '/settings', icon: '⚙️', label: 'Settings', color: 'var(--color-gray-500)' },
  ];

  const menuItems = isGuardian ? guardianMenuItems : regularMenuItems;

  return (
    <>
      <div style={backdropStyles} onClick={onClose} />
      <aside style={drawerStyles}>
        <div style={headerStyles}>
          <h2 style={titleStyles}>{isGuardian ? 'Guardian Menu' : 'Menu'}</h2>
          <p style={subtitleStyles}>
            {isGuardian ? 'Monitor your child\'s safety' : 'What do you want to do today?'}
          </p>
        </div>
        <nav>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {menuItems.map(item => {
              const isActive = location.pathname.startsWith(item.to);
              return (
                <NavItem
                  key={item.to}
                  to={item.to}
                  icon={item.icon}
                  label={item.label}
                  color={item.color}
                  isActive={isActive}
                  onClick={onClose}
                />
              );
            })}
          </ul>
        </nav>
      </aside>
    </>
  );
}

// Nav Item Component - Colorful & interactive
function NavItem({ 
  to, 
  icon, 
  label, 
  color,
  isActive, 
  onClick 
}: { 
  to: string; 
  icon: string; 
  label: string; 
  color: string;
  isActive: boolean; 
  onClick: () => void;
}) {
  const linkStyles: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-3)',
    padding: 'var(--space-3) var(--space-4)',
    marginBottom: 'var(--space-2)',
    borderRadius: 'var(--radius-md)',
    fontSize: 'var(--text-body)',
    fontWeight: isActive ? 'var(--font-bold)' : 'var(--font-semibold)',
    fontFamily: 'var(--font-body)',
    textDecoration: 'none',
    color: isActive ? 'var(--color-brand-ink)' : 'var(--color-text-2)',
    background: isActive ? 'var(--color-brand-tint)' : 'transparent',
    border: isActive ? '2px solid var(--color-brand)' : '2px solid transparent',
    transition: 'all var(--transition-fast)',
    boxShadow: isActive ? 'var(--shadow-s1)' : 'none',
  };

  const iconStyles: CSSProperties = {
    fontSize: '24px',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 'var(--radius-sm)',
    background: isActive ? color + '20' : 'transparent',
  };

  return (
    <li>
      <Link
        to={to}
        onClick={onClick}
        style={linkStyles}
        onMouseEnter={(e) => {
          if (!isActive) {
            e.currentTarget.style.background = 'var(--color-chip-bg)';
            e.currentTarget.style.transform = 'translateX(6px) scale(1.02)';
            e.currentTarget.style.borderColor = color;
          }
        }}
        onMouseLeave={(e) => {
          if (!isActive) {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.borderColor = 'transparent';
          }
        }}
      >
        <span style={iconStyles}>{icon}</span>
        {label}
      </Link>
    </li>
  );
}

export default App;
