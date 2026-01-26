import { useDraggable } from '@dnd-kit/core';
import { Project } from '@/types/project';
import { useSettings } from '@/context/SettingsContext';
import { PriorityBadge } from '@/components/projects/PriorityBadge';
import { SttBadge } from '@/components/projects/SttBadge';
import { cn } from '@/lib/utils';

interface KanbanCardProps {
  project: Project;
  onClick?: () => void;
  isDragging?: boolean;
}

export function KanbanCard({ project, onClick, isDragging }: KanbanCardProps) {
  const { getMilestoneConfig, settings } = useSettings();
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: project.id,
  });

  const style = transform
    ? {
        transform: `translate(${transform.x}px, ${transform.y}px)`,
      }
    : undefined;

  // Get next upcoming milestone
  const nextMilestone = project.milestones.find(
    (m) => !m.completed && m.startDate
  );

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={cn(
        'bg-card rounded-lg border p-3 cursor-grab hover:shadow-md transition-all select-none',
        isDragging && 'shadow-xl rotate-3 opacity-90',
        'active:cursor-grabbing'
      )}
    >
      <p className="font-medium text-sm mb-2 line-clamp-2">
        {project.name}
      </p>
      {project.ntrk && (
        <p className="text-xs text-muted-foreground mb-2">
          {project.ntrk}
        </p>
      )}
      <div className="flex items-center justify-between gap-2">
        <PriorityBadge priority={project.priority} />
        {project.stt && project.stt.length > 0 && (
          <div className="flex gap-1">
            {project.stt.slice(0, 2).map((s) => (
              <SttBadge key={s} stt={s} />
            ))}
            {project.stt.length > 2 && (
              <span className="text-xs text-muted-foreground">
                +{project.stt.length - 2}
              </span>
            )}
          </div>
        )}
      </div>
      {nextMilestone && (
        <div className="mt-2 text-xs text-muted-foreground">
          Prochain: {getMilestoneConfig(nextMilestone.type)?.label || nextMilestone.type}
          {nextMilestone.startDate && (
            <span className="ml-1">
              ({new Date(nextMilestone.startDate).toLocaleDateString('fr-FR')})
            </span>
          )}
        </div>
      )}
      {project.comments && (
        <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
          {project.comments}
        </p>
      )}
    </div>
  );
}
