import { useEffect, useState } from 'react';

export default function Confetti({ active, onComplete }: { active: boolean; onComplete?: () => void }) {
  const [particles, setParticles] = useState<Array<{ id: number; left: number; delay: number; color: string }>>([]);

  useEffect(() => {
    if (active) {
      const colors = ['var(--color-teal)', 'var(--color-lilac)', 'var(--color-sunshine)', 'var(--color-coral)'];
      const newParticles = Array.from({ length: 30 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.5,
        color: colors[Math.floor(Math.random() * colors.length)],
      }));
      setParticles(newParticles);

      const timer = setTimeout(() => {
        setParticles([]);
        onComplete?.();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [active, onComplete]);

  if (!active || particles.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      pointerEvents: 'none',
      zIndex: 9999,
    }}>
      {particles.map(p => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.left}%`,
            top: '-10px',
            width: '10px',
            height: '10px',
            background: p.color,
            borderRadius: '50%',
            animation: `confetti-fall 3s ease-out forwards`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
      <style>{`
        @keyframes confetti-fall {
          to {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
