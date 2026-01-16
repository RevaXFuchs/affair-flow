import { STT_COLORS } from '@/types/project';

interface SttBadgeProps {
  stt: string;
  className?: string;
}

export function SttBadge({ stt, className }: SttBadgeProps) {
  const colors = STT_COLORS[stt] || { bg: 'hsl(215 20% 95%)', text: 'hsl(215 16% 47%)' };
  
  return (
    <span
      className={`text-xs px-1.5 py-0.5 rounded font-medium ${className || ''}`}
      style={{ backgroundColor: colors.bg, color: colors.text }}
    >
      {stt}
    </span>
  );
}
