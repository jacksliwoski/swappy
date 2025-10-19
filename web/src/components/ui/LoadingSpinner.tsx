export default function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 24, md: 40, lg: 64 };
  const spinnerSize = sizes[size];

  return (
    <div style={{
      width: spinnerSize,
      height: spinnerSize,
      border: '3px solid var(--color-gray-200)',
      borderTop: '3px solid var(--color-primary)',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
    }}>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
