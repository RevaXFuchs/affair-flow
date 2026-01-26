import { useSettings } from '@/context/SettingsContext';
import { cn } from '@/lib/utils';
import { ArrowUp, ArrowDown, Minus, ChevronsUp } from 'lucide-react';

const PRIORITY_ICONS: Record<string, typeof ArrowUp> = {
  'low': ArrowDown,
  'medium': Minus,
  'high': ArrowUp,
  'very-high': ChevronsUp,
};

const PRIORITY_COLORS: Record<string, string> = {
  'low': 'priority-low',
  'medium': 'priority-medium',
  'high': 'priority-high',
  'very-high': 'priority-very-high',
};

interface PriorityBadgeProps {
  priority: string;
  className?: string;
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const { getPriorityLabel } = useSettings();
  const Icon = PRIORITY_ICONS[priority] || Minus;
  const colorClass = PRIORITY_COLORS[priority] || '';
  
  return (
    <span className={cn('priority-badge', colorClass, className)}>
      <Icon size={12} />
      {getPriorityLabel(priority)}
    </span>
  );
}
