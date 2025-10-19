import type { Badge } from '../../types';

export default function BadgeGrid({ badges }: { badges: Badge[] }) {
  // Sample badge data - in real app, fetch from API
  const allBadges: Badge[] = [
    { id: 'first_swap', name: 'First Swap!', description: 'Complete your first trade', icon: '🎉', earnedAt: badges.find(b => b.id === 'first_swap')?.earnedAt },
    { id: 'safety_star', name: 'Safety Star', description: 'Meet at 5 public places', icon: '⭐', earnedAt: badges.find(b => b.id === 'safety_star')?.earnedAt },
    { id: 'fair_trader', name: 'Fair Trader', description: 'Complete 10 fair trades', icon: '⚖️', earnedAt: badges.find(b => b.id === 'fair_trader')?.earnedAt },
    { id: 'picture_pro', name: 'Picture Pro', description: 'Upload items with 4 photos', icon: '📸', earnedAt: badges.find(b => b.id === 'picture_pro')?.earnedAt },
    { id: 'friendly', name: 'Friendly', description: 'Exchange 50 messages', icon: '💬', earnedAt: badges.find(b => b.id === 'friendly')?.earnedAt },
    { id: 'collector', name: 'Collector', description: 'Have 20 items in inventory', icon: '📦', earnedAt: badges.find(b => b.id === 'collector')?.earnedAt },
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
      gap: 'var(--space-3)',
    }}>
      {allBadges.map(badge => {
        const earned = !!badge.earnedAt;
        return (
          <div
            key={badge.id}
            style={{
              padding: 'var(--space-4)',
              borderRadius: 'var(--radius-lg)',
              textAlign: 'center',
              background: earned ? 'var(--color-yellow-light)' : 'var(--color-gray-100)',
              opacity: earned ? 1 : 0.5,
              transition: 'all var(--transition-fast)',
              border: earned ? '2px solid var(--color-yellow)' : '2px solid transparent',
            }}
            title={badge.description}
          >
            <div style={{
              fontSize: '2.5rem',
              marginBottom: 'var(--space-2)',
              filter: earned ? 'none' : 'grayscale(100%)',
            }}>
              {badge.icon}
            </div>
            <div style={{
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-semibold)',
              color: earned ? 'var(--color-gray-800)' : 'var(--color-gray-500)',
              marginBottom: 'var(--space-1)',
            }}>
              {badge.name}
            </div>
            <div style={{
              fontSize: 'var(--text-xs)',
              color: earned ? 'var(--color-gray-600)' : 'var(--color-gray-400)',
            }}>
              {badge.description}
            </div>
            {earned && badge.earnedAt && (
              <div style={{
                fontSize: 'var(--text-xs)',
                color: 'var(--color-yellow-dark)',
                marginTop: 'var(--space-2)',
              }}>
                ✓ Earned {new Date(badge.earnedAt).toLocaleDateString()}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

