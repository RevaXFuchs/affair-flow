import { useSettings } from '@/context/SettingsContext';

interface SttBadgeProps {
  stt: string;
  className?: string;
}

export function SttBadge({ stt, className }: SttBadgeProps) {
  const { getSttColor } = useSettings();
  const colors = getSttColor(stt);
  
  return (
    <span
      className={`text-xs px-1.5 py-0.5 rounded font-medium ${className || ''}`}
      style={{ backgroundColor: colors.bg, color: colors.text }}
    >
      {stt}
    </span>
  );
}
