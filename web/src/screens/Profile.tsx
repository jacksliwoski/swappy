import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { calculateLevel } from '../utils/xp';
import UserAvatar from '../components/cards/UserAvatar';
import XPProgressBar from '../components/gamification/XPProgressBar';
import BadgeGrid from '../components/gamification/BadgeGrid';
import QuestCard from '../components/gamification/QuestCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Button from '../components/ui/Button';
import type { User, Badge, Quest } from '../types';

export default function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasGuardian, setHasGuardian] = useState(true);
  const [preferencesExpanded, setPreferencesExpanded] = useState(false);
  const [editingPreferences, setEditingPreferences] = useState(false);
  const [preferences, setPreferences] = useState({
    location: '',
    timeWindow: '',
    travelMode: 'driving',
    maxMinutes: 20,
    indoorPreferred: false,
    wheelchairAccess: false,
    parkingNeeded: false,
    categoryInterests: [] as string[],
    guardianName: '',
    guardianEmail: '',
  });

  useEffect(() => {
    // Get current user first, then load profile
    api.auth.me().then(res => {
      if (res.ok && res.user) {
        loadProfile(res.user.id);
      }
    }).catch(err => {
      console.error('Failed to get current user:', err);
      setLoading(false);
    });
  }, []);

  async function loadProfile(userId: string) {
    setLoading(true);
    try {
      const [userData, badgesData, questsData] = await Promise.all([
        api.users.get(userId),
        api.users.getBadges?.(userId) || Promise.resolve({ badges: [] }),
        api.users.getQuests?.(userId) || Promise.resolve({ quests: [] }),
      ]);
      
      // API returns user directly, not wrapped
      const userObj = userData.user || userData;
      setUser(userObj);
      setBadges(badgesData.badges || []);
      setQuests(questsData.quests || []);
      setHasGuardian(userObj?.hasGuardian || false);
      
      // Load preferences from user data
      setPreferences({
        location: userObj?.location || '',
        timeWindow: userObj?.timeWindow || '',
        travelMode: userObj?.travelMode || 'driving',
        maxMinutes: userObj?.maxMinutes || 20,
        indoorPreferred: userObj?.indoorPreferred || false,
        wheelchairAccess: userObj?.wheelchairAccess || false,
        parkingNeeded: userObj?.parkingNeeded || false,
        categoryInterests: userObj?.categoryInterests || [],
        guardianName: userObj?.guardianName || '',
        guardianEmail: userObj?.guardianEmail || '',
      });
    } catch (error) {
      console.error('Failed to load profile:', error);
      // Set mock data for demo
      setUser({
        id: 'user-1',
        username: 'You',
        avatar: '😊',
        level: 1,
        xp: 0,
        xpToNextLevel: 50,
        hasGuardian: true,
        createdAt: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleSavePreferences() {
    if (!user) return;
    
    setLoading(true);
    try {
      await api.users.updateProfile(user.id, preferences);
      setEditingPreferences(false);
      // Reload profile to get updated data
      await loadProfile(user.id);
    } catch (error) {
      console.error('Failed to update preferences:', error);
      alert('Failed to save preferences. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (loading || !user) {
    return (
      <div style={{ padding: '2rem', display: 'flex', justifyContent: 'center' }}>
        <LoadingSpinner />
      </div>
    );
  }

  const levelInfo = calculateLevel(user.xp);

  return (
    <div style={{ padding: 'var(--space-4)', maxWidth: '1000px', margin: '0 auto' }}>
      <h1 style={{ fontSize: 'var(--text-3xl)', marginBottom: 'var(--space-6)', textAlign: 'center' }}>
        👤 Profile & XP
      </h1>

      {/* User Header Card */}
      <div className="card" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: 'var(--radius-full)',
            background: 'var(--color-lilac-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '3rem',
          }}>
            {user.avatar}
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-2)' }}>
              {user.username}
            </h2>
            <div style={{
              display: 'inline-block',
              padding: 'var(--space-2) var(--space-3)',
              background: 'var(--color-primary)',
              color: 'white',
              borderRadius: 'var(--radius-md)',
              fontWeight: 'var(--font-bold)',
              fontSize: 'var(--text-base)',
            }}>
              Lv{levelInfo.level} {levelInfo.levelName}
            </div>
          </div>
        </div>

        {/* XP Progress */}
        <XPProgressBar xp={user.xp} />
      </div>

      {/* Badges Section */}
      <div className="card" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
        <h3 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-4)' }}>
          📛 Badges
        </h3>
        <p style={{ color: 'var(--color-gray-600)', marginBottom: 'var(--space-4)' }}>
          Complete trades and challenges to earn badges!
        </p>
        <BadgeGrid badges={badges} />
      </div>

      {/* Weekly Quests Section */}
      <div className="card" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
        <h3 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-4)' }}>
          🎯 Weekly Quests
        </h3>
        <p style={{ color: 'var(--color-gray-600)', marginBottom: 'var(--space-4)' }}>
          Complete these quests before they expire to earn bonus XP!
        </p>
        {quests.length > 0 ? (
          quests.map(quest => <QuestCard key={quest.id} quest={quest} />)
        ) : (
          <div style={{
            textAlign: 'center',
            padding: 'var(--space-8)',
            color: 'var(--color-gray-600)',
          }}>
            No active quests right now. Check back soon! 🎯
          </div>
        )}
      </div>

      {/* User Preferences Section */}
      <div className="card" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
        <div 
          style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            cursor: 'pointer',
            marginBottom: preferencesExpanded ? 'var(--space-6)' : 0
          }}
          onClick={() => setPreferencesExpanded(!preferencesExpanded)}
        >
          <h3 style={{ fontSize: 'var(--text-xl)', margin: 0 }}>
            ⚙️ User Preferences
          </h3>
          <span style={{ fontSize: '24px', transition: 'transform var(--transition-base)', transform: preferencesExpanded ? 'rotate(180deg)' : 'none' }}>
            ▼
          </span>
        </div>

        {preferencesExpanded && (
          <div style={{ marginTop: 'var(--space-4)' }}>
            {/* Edit/Save Buttons */}
            <div style={{ marginBottom: 'var(--space-4)', display: 'flex', gap: 'var(--space-2)' }}>
              {!editingPreferences ? (
                <Button variant="primary" size="sm" onClick={() => setEditingPreferences(true)}>
                  ✏️ Edit Preferences
                </Button>
              ) : (
                <>
                  <Button variant="primary" size="sm" onClick={handleSavePreferences}>
                    💾 Save Changes
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => {
                    setEditingPreferences(false);
                    // Reset to user data
                    if (user) loadProfile(user.id);
                  }}>
                    ✖️ Cancel
                  </Button>
                </>
              )}
            </div>

            {/* Location */}
            <div style={{ marginBottom: 'var(--space-4)' }}>
              <label style={{ display: 'block', fontWeight: 'var(--font-semibold)', marginBottom: 'var(--space-2)' }}>
                📍 Location
              </label>
              {editingPreferences ? (
                <input
                  type="text"
                  value={preferences.location}
                  onChange={(e) => setPreferences({ ...preferences, location: e.target.value })}
                  placeholder="e.g., Seattle, WA"
                  style={{
                    width: '100%',
                    padding: 'var(--space-3)',
                    borderRadius: 'var(--radius-sm)',
                    border: '2px solid var(--color-border)',
                    fontSize: 'var(--text-body)',
                  }}
                />
              ) : (
                <div style={{ padding: 'var(--space-3)', background: 'var(--color-gray-100)', borderRadius: 'var(--radius-sm)' }}>
                  {preferences.location || 'Not set'}
                </div>
              )}
            </div>

            {/* Time Window */}
            <div style={{ marginBottom: 'var(--space-4)' }}>
              <label style={{ display: 'block', fontWeight: 'var(--font-semibold)', marginBottom: 'var(--space-2)' }}>
                🕐 Preferred Meeting Times
              </label>
              {editingPreferences ? (
                <input
                  type="text"
                  value={preferences.timeWindow}
                  onChange={(e) => setPreferences({ ...preferences, timeWindow: e.target.value })}
                  placeholder="e.g., Weekends 10am-4pm"
                  style={{
                    width: '100%',
                    padding: 'var(--space-3)',
                    borderRadius: 'var(--radius-sm)',
                    border: '2px solid var(--color-border)',
                    fontSize: 'var(--text-body)',
                  }}
                />
              ) : (
                <div style={{ padding: 'var(--space-3)', background: 'var(--color-gray-100)', borderRadius: 'var(--radius-sm)' }}>
                  {preferences.timeWindow || 'Not set'}
                </div>
              )}
            </div>

            {/* Travel Mode & Max Minutes */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 'var(--font-semibold)', marginBottom: 'var(--space-2)' }}>
                  🚗 Travel Mode
                </label>
                {editingPreferences ? (
                  <select
                    value={preferences.travelMode}
                    onChange={(e) => setPreferences({ ...preferences, travelMode: e.target.value })}
                    style={{
                      width: '100%',
                      padding: 'var(--space-3)',
                      borderRadius: 'var(--radius-sm)',
                      border: '2px solid var(--color-border)',
                      fontSize: 'var(--text-body)',
                    }}
                  >
                    <option value="driving">Driving</option>
                    <option value="walking">Walking</option>
                    <option value="bike">Bike</option>
                  </select>
                ) : (
                  <div style={{ padding: 'var(--space-3)', background: 'var(--color-gray-100)', borderRadius: 'var(--radius-sm)', textTransform: 'capitalize' }}>
                    {preferences.travelMode}
                  </div>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 'var(--font-semibold)', marginBottom: 'var(--space-2)' }}>
                  ⏱️ Max Travel Time (minutes)
                </label>
                {editingPreferences ? (
                  <input
                    type="number"
                    value={preferences.maxMinutes}
                    onChange={(e) => setPreferences({ ...preferences, maxMinutes: parseInt(e.target.value) || 20 })}
                    min="5"
                    max="60"
                    style={{
                      width: '100%',
                      padding: 'var(--space-3)',
                      borderRadius: 'var(--radius-sm)',
                      border: '2px solid var(--color-border)',
                      fontSize: 'var(--text-body)',
                    }}
                  />
                ) : (
                  <div style={{ padding: 'var(--space-3)', background: 'var(--color-gray-100)', borderRadius: 'var(--radius-sm)' }}>
                    {preferences.maxMinutes} minutes
                  </div>
                )}
              </div>
            </div>

            {/* Checkboxes */}
            <div style={{ marginBottom: 'var(--space-4)' }}>
              <label style={{ display: 'block', fontWeight: 'var(--font-semibold)', marginBottom: 'var(--space-3)' }}>
                Accessibility & Preferences
              </label>
              
              <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)', cursor: editingPreferences ? 'pointer' : 'default' }}>
                <input
                  type="checkbox"
                  checked={preferences.indoorPreferred}
                  onChange={(e) => editingPreferences && setPreferences({ ...preferences, indoorPreferred: e.target.checked })}
                  disabled={!editingPreferences}
                  style={{ width: '20px', height: '20px' }}
                />
                <span>🏢 Indoor Preferred</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)', cursor: editingPreferences ? 'pointer' : 'default' }}>
                <input
                  type="checkbox"
                  checked={preferences.wheelchairAccess}
                  onChange={(e) => editingPreferences && setPreferences({ ...preferences, wheelchairAccess: e.target.checked })}
                  disabled={!editingPreferences}
                  style={{ width: '20px', height: '20px' }}
                />
                <span>♿ Wheelchair Access Needed</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', cursor: editingPreferences ? 'pointer' : 'default' }}>
                <input
                  type="checkbox"
                  checked={preferences.parkingNeeded}
                  onChange={(e) => editingPreferences && setPreferences({ ...preferences, parkingNeeded: e.target.checked })}
                  disabled={!editingPreferences}
                  style={{ width: '20px', height: '20px' }}
                />
                <span>🅿️ Parking Needed</span>
              </label>
            </div>

            {/* Categories of Interest */}
            <div style={{ marginBottom: 'var(--space-4)' }}>
              <label style={{ display: 'block', fontWeight: 'var(--font-semibold)', marginBottom: 'var(--space-2)' }}>
                🎮 Categories of Interest
              </label>
              {editingPreferences ? (
                <input
                  type="text"
                  value={preferences.categoryInterests.join(', ')}
                  onChange={(e) => setPreferences({ ...preferences, categoryInterests: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                  placeholder="e.g., LEGO, Pokemon cards, board games"
                  style={{
                    width: '100%',
                    padding: 'var(--space-3)',
                    borderRadius: 'var(--radius-sm)',
                    border: '2px solid var(--color-border)',
                    fontSize: 'var(--text-body)',
                  }}
                />
              ) : (
                <div style={{ padding: 'var(--space-3)', background: 'var(--color-gray-100)', borderRadius: 'var(--radius-sm)' }}>
                  {preferences.categoryInterests.length > 0 ? preferences.categoryInterests.join(', ') : 'Not set'}
                </div>
              )}
            </div>

            {/* Guardian Info */}
            {user && (user as any).age && (user as any).age < 18 && (
              <>
                <div style={{ marginBottom: 'var(--space-4)' }}>
                  <label style={{ display: 'block', fontWeight: 'var(--font-semibold)', marginBottom: 'var(--space-2)' }}>
                    👨‍👩‍👧 Guardian Name
                  </label>
                  {editingPreferences ? (
                    <input
                      type="text"
                      value={preferences.guardianName}
                      onChange={(e) => setPreferences({ ...preferences, guardianName: e.target.value })}
                      placeholder="Guardian's name"
                      style={{
                        width: '100%',
                        padding: 'var(--space-3)',
                        borderRadius: 'var(--radius-sm)',
                        border: '2px solid var(--color-border)',
                        fontSize: 'var(--text-body)',
                      }}
                    />
                  ) : (
                    <div style={{ padding: 'var(--space-3)', background: 'var(--color-gray-100)', borderRadius: 'var(--radius-sm)' }}>
                      {preferences.guardianName || 'Not set'}
                    </div>
                  )}
                </div>

                <div style={{ marginBottom: 'var(--space-4)' }}>
                  <label style={{ display: 'block', fontWeight: 'var(--font-semibold)', marginBottom: 'var(--space-2)' }}>
                    📧 Guardian Email
                  </label>
                  {editingPreferences ? (
                    <input
                      type="email"
                      value={preferences.guardianEmail}
                      onChange={(e) => setPreferences({ ...preferences, guardianEmail: e.target.value })}
                      placeholder="guardian@example.com"
                      style={{
                        width: '100%',
                        padding: 'var(--space-3)',
                        borderRadius: 'var(--radius-sm)',
                        border: '2px solid var(--color-border)',
                        fontSize: 'var(--text-body)',
                      }}
                    />
                  ) : (
                    <div style={{ padding: 'var(--space-3)', background: 'var(--color-gray-100)', borderRadius: 'var(--radius-sm)' }}>
                      {preferences.guardianEmail || 'Not set'}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Safety Card */}
      <div className="card" style={{ padding: 'var(--space-6)' }}>
        <h3 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-4)' }}>
          🛡️ Safety & Rules
        </h3>

        <div style={{ marginBottom: 'var(--space-4)' }}>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            cursor: 'pointer',
            fontSize: 'var(--text-base)',
          }}>
            <input
              type="checkbox"
              checked={hasGuardian}
              onChange={(e) => setHasGuardian(e.target.checked)}
              style={{ width: '20px', height: '20px' }}
            />
            <span style={{ fontWeight: 'var(--font-semibold)' }}>
              I have a grown-up helping me
            </span>
          </label>
        </div>

        <div style={{
          background: 'var(--color-blue-light)',
          padding: 'var(--space-4)',
          borderRadius: 'var(--radius-md)',
        }}>
          <h4 style={{
            fontSize: 'var(--text-base)',
            fontWeight: 'var(--font-semibold)',
            marginBottom: 'var(--space-3)',
            color: 'var(--color-blue-dark)',
          }}>
            Trading Rules:
          </h4>
          <ul style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            color: 'var(--color-blue-dark)',
          }}>
            <li style={{ marginBottom: 'var(--space-2)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <span style={{ fontSize: '1.2rem' }}>✓</span>
              <span>Ages 8+ only</span>
            </li>
            <li style={{ marginBottom: 'var(--space-2)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <span style={{ fontSize: '1.2rem' }}>✓</span>
              <span>Always meet in public places</span>
            </li>
            <li style={{ marginBottom: 'var(--space-2)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <span style={{ fontSize: '1.2rem' }}>✓</span>
              <span>Never pay deposits or send money</span>
            </li>
            <li style={{ marginBottom: 'var(--space-2)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <span style={{ fontSize: '1.2rem' }}>✓</span>
              <span>Max $250 value per trade</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <span style={{ fontSize: '1.2rem' }}>✓</span>
              <span>Be kind and respectful</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

