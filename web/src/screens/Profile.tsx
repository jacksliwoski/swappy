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

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    setLoading(true);
    try {
      const [userData, badgesData, questsData] = await Promise.all([
        api.users.get('user-1'),
        api.users.getBadges('user-1'),
        api.users.getQuests('user-1'),
      ]);
      setUser(userData.user);
      setBadges(badgesData.badges || []);
      setQuests(questsData.quests || []);
      setHasGuardian(userData.user?.hasGuardian || false);
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

