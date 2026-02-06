import { useState } from 'react';
import { useProjects } from '@/context/ProjectContext';
import { Timer } from './Timer';
import { TimeEntryDrawer } from './TimeEntryDrawer';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Clock, List } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GlobalTimerProps {
  className?: string;
  compact?: boolean;
}

export function GlobalTimer({ className, compact = false }: GlobalTimerProps) {
  const { projects } = useProjects();
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [showDrawer, setShowDrawer] = useState(false);

  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  if (compact) {
    return (
      <div className={cn('flex flex-col gap-3', className)}>
        {/* Project selector */}
        <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Sélectionner une affaire..." />
          </SelectTrigger>
          <SelectContent>
            {projects.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                {project.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Timer + drawer button */}
        {selectedProject && (
          <div className="flex items-center gap-2">
            <Timer
              projectId={selectedProject.id}
              projectName={selectedProject.name}
              className="flex-1"
            />
            <Button
              variant="outline"
              size="sm"
              className="h-8"
              onClick={() => setShowDrawer(true)}
            >
              <List size={14} />
            </Button>
          </div>
        )}

        {selectedProject && showDrawer && (
          <TimeEntryDrawer
            projectId={selectedProject.id}
            open={showDrawer}
            onOpenChange={setShowDrawer}
          />
        )}
      </div>
    );
  }

  return (
    <div className={cn('p-4 bg-card rounded-xl border shadow-sm', className)}>
      <div className="flex items-center gap-2 mb-4">
        <Clock size={18} className="text-muted-foreground" />
        <h3 className="font-semibold">Minuteur</h3>
      </div>

      {/* Project selector */}
      <div className="space-y-3">
        <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Sélectionner une affaire..." />
          </SelectTrigger>
          <SelectContent>
            {projects.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                {project.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selectedProject ? (
          <div className="space-y-3">
            <Timer
              projectId={selectedProject.id}
              projectName={selectedProject.name}
            />
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => setShowDrawer(true)}
            >
              <List size={14} className="mr-2" />
              Voir les temps de l'affaire
            </Button>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            Sélectionnez une affaire pour démarrer le minuteur
          </p>
        )}
      </div>

      {selectedProject && showDrawer && (
        <TimeEntryDrawer
          projectId={selectedProject.id}
          open={showDrawer}
          onOpenChange={setShowDrawer}
        />
      )}
    </div>
  );
}
