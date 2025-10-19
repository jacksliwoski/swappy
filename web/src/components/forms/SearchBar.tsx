import { useState, useEffect, CSSProperties } from 'react';

interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export default function SearchBar({ 
  value, 
  onChange, 
  placeholder = 'Search toys, sets, games…',
  autoFocus = false
}: SearchBarProps) {
  const [input, setInput] = useState(value);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => onChange(input), 300);
    return () => clearTimeout(timer);
  }, [input, onChange]);

  const containerStyles: CSSProperties = {
    position: 'relative',
    width: '100%',
    marginBottom: 'var(--space-4)',
    transition: 'transform var(--transition-base)',
    transform: isFocused ? 'scale(1)' : 'scale(0.98)',
  };

  const inputStyles: CSSProperties = {
    width: '100%',
    height: 'var(--search-height)',
    padding: '0 var(--space-4) 0 52px', // Left padding for icon
    fontSize: 'var(--text-body)',
    lineHeight: 'var(--text-body-lh)',
    fontFamily: 'var(--font-body)',
    fontWeight: 'var(--font-medium)',
    color: 'var(--color-text-1)',
    background: 'var(--color-surface)',
    border: `2px solid ${isFocused ? 'var(--color-brand)' : 'var(--color-border)'}`,
    borderRadius: 'var(--radius-pill)',
    outline: 'none',
    transition: 'all var(--transition-base)',
    boxShadow: isFocused ? 'var(--shadow-s2)' : 'var(--shadow-s1)',
  };

  const iconContainerStyles: CSSProperties = {
    position: 'absolute',
    left: '18px',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '22px',
    height: '22px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: isFocused ? 'var(--color-brand)' : 'var(--color-gray-400)',
    transition: 'color var(--transition-base)',
    pointerEvents: 'none',
  };

  return (
    <div style={containerStyles}>
      {/* Magnifying Glass Icon */}
      <div style={iconContainerStyles}>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
          style={{ width: '100%', height: '100%' }}
          aria-hidden="true"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2.5} 
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
          />
        </svg>
      </div>
      
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        style={inputStyles}
        aria-label="Search"
      />
    </div>
  );
}
