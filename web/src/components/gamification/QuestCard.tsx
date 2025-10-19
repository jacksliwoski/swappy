import type { Quest } from '../../types';

export default function QuestCard({ quest }: { quest: Quest }) {
  const progressPercent = (quest.progress / quest.target) * 100;

  return (
    <div
      className="card"
      style={{
        padding: 'var(--space-4)',
        marginBottom: 'var(--space-3)',
        opacity: quest.completed ? 0.7 : 1,
        border: quest.completed ? '2px solid var(--color-green)' : '2px solid var(--color-gray-200)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-2)' }}>
        <div style={{ flex: 1 }}>
          <h4 style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-semibold)', marginBottom: 'var(--space-1)' }}>
            {quest.title}
            {quest.completed && ' ✓'}
          </h4>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-gray-600)', marginBottom: 'var(--space-3)' }}>
            {quest.description}
          </p>
        </div>
        <div style={{
          background: quest.completed ? 'var(--color-green-light)' : 'var(--color-teal-light)',
          color: quest.completed ? 'var(--color-green-dark)' : 'var(--color-teal-dark)',
          padding: 'var(--space-1) var(--space-2)',
          borderRadius: 'var(--radius-md)',
          fontSize: 'var(--text-sm)',
          fontWeight: 'var(--font-bold)',
          whiteSpace: 'nowrap',
          marginLeft: 'var(--space-2)',
        }}>
          +{quest.xpReward} XP
        </div>
      </div>

      <div style={{ marginBottom: 'var(--space-2)' }}>
        <div style={{
          width: '100%',
          height: '8px',
          background: 'var(--color-gray-200)',
          borderRadius: 'var(--radius-full)',
          overflow: 'hidden',
        }}>
          <div style={{
            width: `${progressPercent}%`,
            height: '100%',
            background: quest.completed ? 'var(--color-green)' : 'var(--color-primary)',
            transition: 'width var(--transition-slow)',
          }} />
        </div>
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: 'var(--text-xs)',
        color: 'var(--color-gray-600)',
      }}>
        <span>Progress: {quest.progress} / {quest.target}</span>
        {quest.expiresAt && (
          <span>Expires: {new Date(quest.expiresAt).toLocaleDateString()}</span>
        )}
      </div>
    </div>
  );
}

