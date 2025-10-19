interface EventLogProps {
  events: Array<{
    id: string;
    type: 'item_add' | 'item_remove' | 'ready' | 'not_ready' | 'both_ready' | 'confirmed';
    message: string;
    timestamp: Date;
  }>;
}

export default function EventLog({ events }: EventLogProps) {
  if (events.length === 0) return null;

  return (
    <div
      style={{
        background: 'var(--color-gray-100)',
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-3)',
        maxHeight: '200px',
        overflowY: 'auto',
      }}
    >
      <div
        style={{
          fontSize: 'var(--text-xs)',
          fontWeight: 'var(--font-bold)',
          color: 'var(--color-gray-600)',
          marginBottom: 'var(--space-2)',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}
      >
        Trade Events
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        {events.map((event) => (
          <div
            key={event.id}
            style={{
              fontSize: 'var(--text-sm)',
              padding: 'var(--space-2)',
              background: event.type === 'both_ready' || event.type === 'confirmed' 
                ? 'var(--color-success)' 
                : 'var(--color-white)',
              color: event.type === 'both_ready' || event.type === 'confirmed'
                ? 'var(--color-white)'
                : 'var(--color-gray-700)',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span>{event.message}</span>
            <span style={{ fontSize: 'var(--text-xs)', opacity: 0.7 }}>
              {event.timestamp.toLocaleTimeString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

