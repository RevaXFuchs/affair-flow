import { ProjectPriority, PRIORITY_LABELS, PRIORITY_STYLES } from '@/types/project';
import { cn } from '@/lib/utils';
import { ArrowUp, ArrowDown, Minus, ChevronsUp } from 'lucide-react';

const PRIORITY_ICONS: Record<ProjectPriority, typeof ArrowUp> = {
  'low': ArrowDown,
  'medium': Minus,
  'high': ArrowUp,
  'very-high': ChevronsUp,
};

interface PriorityBadgeProps {
  priority: ProjectPriority;
  className?: string;
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const Icon = PRIORITY_ICONS[priority];
  
  return (
    <span className={cn('priority-badge', PRIORITY_STYLES[priority], className)}>
      <Icon size={12} />
      {PRIORITY_LABELS[priority]}
    </span>
  );
}
