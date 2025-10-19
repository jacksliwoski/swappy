import { useState, useEffect } from 'react';

interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
}

export default function SearchBar({ value, onChange, placeholder }: SearchBarProps) {
  const [input, setInput] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => onChange(input), 300);
    return () => clearTimeout(timer);
  }, [input, onChange]);

  return (
    <input
      type="text"
      value={input}
      onChange={(e) => setInput(e.target.value)}
      placeholder={placeholder}
      style={{
        width: '100%',
        padding: 'var(--space-4)',
        fontSize: 'var(--text-lg)',
        border: '2px solid var(--color-gray-300)',
        borderRadius: 'var(--radius-lg)',
        marginBottom: 'var(--space-4)',
      }}
    />
  );
}
