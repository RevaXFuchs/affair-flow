import { ProjectStatus, STATUS_LABELS, STATUS_STYLES } from '@/types/project';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: ProjectStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span className={cn('status-badge', STATUS_STYLES[status], className)}>
      {STATUS_LABELS[status]}
    </span>
  );
}
