import { ReactNode, CSSProperties } from 'react';

interface ChipProps {
  children: ReactNode;
  color?: string;
  bgColor?: string;
  onClick?: () => void;
  style?: CSSProperties;
}

export default function Chip({ children, color, bgColor, onClick, style }: ChipProps) {
  return (
    <span
      className="chip"
      onClick={onClick}
      style={{
        ...(color && { color }),
        ...(bgColor && { background: bgColor }),
        ...(onClick && { cursor: 'pointer' }),
        ...style,
      }}
    >
      {children}
    </span>
  );
}
