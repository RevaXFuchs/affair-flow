import { useSettings } from '@/context/SettingsContext';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const { getStatusLabel } = useSettings();
  
  return (
    <span className={cn('status-badge bg-muted text-foreground', className)}>
      {getStatusLabel(status)}
    </span>
  );
}
