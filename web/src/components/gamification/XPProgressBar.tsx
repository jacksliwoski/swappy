import { calculateLevel } from '../../utils/xp';

export default function XPProgressBar({ xp }: { xp: number }) {
  const { level, levelName, xpInCurrentLevel, xpForNextLevel, progressPercent } = calculateLevel(xp);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
        <span style={{ fontWeight: 'var(--font-bold)', fontSize: 'var(--text-base)' }}>
          Lv{level} {levelName}
        </span>
        <span style={{ color: 'var(--color-gray-600)', fontSize: 'var(--text-sm)' }}>
          {xpInCurrentLevel} / {xpForNextLevel} XP
        </span>
      </div>
      <div style={{
        width: '100%',
        height: '16px',
        background: 'var(--color-gray-200)',
        borderRadius: 'var(--radius-full)',
        overflow: 'hidden',
      }}>
        <div style={{
          width: `${progressPercent}%`,
          height: '100%',
          background: 'linear-gradient(90deg, var(--color-teal), var(--color-lilac))',
          transition: 'width var(--transition-slow)',
        }} />
      </div>
    </div>
  );
}

