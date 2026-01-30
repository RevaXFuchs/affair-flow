import { useTimeEntries } from '@/context/TimeEntryContext';
import { formatMinutesToDisplay } from '@/types/timeEntry';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface TimeSummaryBadgeProps {
  projectId: string;
  className?: string;
  compact?: boolean;
}

export function TimeSummaryBadge({ projectId, className, compact = false }: TimeSummaryBadgeProps) {
  const { getTimeSummaryForProject } = useTimeEntries();
  const summary = getTimeSummaryForProject(projectId);

  if (summary.totalActual === 0 && summary.totalForecast === 0) {
    return (
      <div className={cn('text-xs text-muted-foreground', className)}>
        <Clock size={12} className="inline mr-1" />
        <span>—</span>
      </div>
    );
  }

  if (compact) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn('inline-flex items-center gap-1 text-xs', className)}>
            <Clock size={12} className="text-muted-foreground" />
            <span className="font-medium">{formatMinutesToDisplay(summary.totalActual)}</span>
            {summary.totalForecast > 0 && (
              <span className="text-muted-foreground">
                / {formatMinutesToDisplay(summary.totalForecast)}
              </span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-xs space-y-1">
            <div>Temps passé: {formatMinutesToDisplay(summary.totalActual)}</div>
            <div>Temps prévisionnel: {formatMinutesToDisplay(summary.totalForecast)}</div>
            <div className="border-t pt-1 mt-1 space-y-0.5">
              <div>Trajet: {formatMinutesToDisplay(summary.byCategory.TRAJET.actual)}</div>
              <div>Admin: {formatMinutesToDisplay(summary.byCategory.ADMIN.actual)}</div>
              <div>Exec: {formatMinutesToDisplay(summary.byCategory.EXEC.actual)}</div>
              <div>Autre: {formatMinutesToDisplay(summary.byCategory.AUTRE.actual)}</div>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <div className={cn('flex flex-col gap-0.5 text-xs', className)}>
      <div className="flex items-center gap-1">
        <Clock size={12} className="text-muted-foreground" />
        <span className="font-medium">{formatMinutesToDisplay(summary.totalActual)}</span>
        {summary.totalForecast > 0 && (
          <span className="text-muted-foreground">
            / {formatMinutesToDisplay(summary.totalForecast)}
          </span>
        )}
      </div>
    </div>
  );
}
