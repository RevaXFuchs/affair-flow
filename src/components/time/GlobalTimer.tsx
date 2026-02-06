import { useState } from 'react';
import { useProjects } from '@/context/ProjectContext';
import { Timer } from './Timer';
import { TimeEntryDrawer } from './TimeEntryDrawer';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Clock, List, ChevronsUpDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GlobalTimerProps {
  className?: string;
  compact?: boolean;
}

export function GlobalTimer({ className, compact = false }: GlobalTimerProps) {
  const { projects } = useProjects();
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [showDrawer, setShowDrawer] = useState(false);
  const [open, setOpen] = useState(false);

  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  const ProjectSelector = () => (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedProject ? (
            <span className="truncate">{selectedProject.name}</span>
          ) : (
            <span className="text-muted-foreground">Rechercher une affaire...</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Rechercher une affaire..." />
          <CommandList>
            <CommandEmpty>Aucune affaire trouvée.</CommandEmpty>
            <CommandGroup>
              {projects.map((project) => (
                <CommandItem
                  key={project.id}
                  value={project.name}
                  onSelect={() => {
                    setSelectedProjectId(project.id);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      selectedProjectId === project.id ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  <span className="truncate">{project.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );

  if (compact) {
    return (
      <div className={cn('flex flex-col gap-3', className)}>
        <ProjectSelector />

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

      <div className="space-y-3">
        <ProjectSelector />

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
