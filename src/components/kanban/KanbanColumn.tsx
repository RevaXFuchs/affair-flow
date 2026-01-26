import { useDroppable } from '@dnd-kit/core';
import { motion } from 'framer-motion';
import { Project } from '@/types/project';
import { KanbanCard } from './KanbanCard';
import { cn } from '@/lib/utils';

interface KanbanColumnProps {
  status: { id: string; label: string };
  projects: Project[];
  onCardClick: (projectId: string) => void;
}

export function KanbanColumn({ status, projects, onCardClick }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: status.id,
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'w-72 flex-shrink-0 bg-muted/30 rounded-xl p-3 min-h-[500px] transition-colors',
        isOver && 'bg-accent/20 ring-2 ring-accent ring-inset'
      )}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">{status.label}</span>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            {projects.length}
          </span>
        </div>
      </div>

      {/* Cards */}
      <div className="space-y-2">
        {projects.map((project, index) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.02 }}
          >
            <KanbanCard project={project} onClick={() => onCardClick(project.id)} />
          </motion.div>
        ))}
        {projects.length === 0 && (
          <div className="text-center py-8 text-muted-foreground text-sm">
            Aucune affaire
          </div>
        )}
      </div>
    </div>
  );
}
