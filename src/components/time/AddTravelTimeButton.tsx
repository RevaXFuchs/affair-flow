import { useState } from 'react';
import { useTimeEntries } from '@/context/TimeEntryContext';
import { useProjects } from '@/context/ProjectContext';
import { formatMinutesToDisplay } from '@/types/timeEntry';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Car, Plus, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface AddTravelTimeButtonProps {
  projectId: string;
  className?: string;
}

export function AddTravelTimeButton({ projectId, className }: AddTravelTimeButtonProps) {
  const { getProjectById, updateProject } = useProjects();
  const { addTimeEntry } = useTimeEntries();
  const [open, setOpen] = useState(false);
  const [travelMinutes, setTravelMinutes] = useState('');

  const project = getProjectById(projectId);
  if (!project) return null;

  const handleSaveTravelTime = () => {
    const minutes = parseInt(travelMinutes);
    if (isNaN(minutes) || minutes <= 0) {
      toast.error('Entrez un temps de trajet valide');
      return;
    }
    updateProject(projectId, { travelTimeMinutes: minutes });
    toast.success('Temps de trajet enregistré');
    setOpen(false);
  };

  const handleAddTravelEntry = () => {
    const minutes = project.travelTimeMinutes;
    if (!minutes || minutes <= 0) {
      toast.error('Définissez d\'abord un temps de trajet');
      return;
    }

    addTimeEntry({
      projectId,
      category: 'TRAJET',
      kind: 'ACTUAL',
      minutes,
      date: new Date().toISOString().split('T')[0],
      source: 'TRAVEL_DEFAULT',
    });
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn('h-7 px-2 text-xs gap-1', className)}
        >
          <Car size={12} />
          {project.travelTimeMinutes ? (
            <span>{formatMinutesToDisplay(project.travelTimeMinutes)}</span>
          ) : (
            <span className="text-muted-foreground">Trajet</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64" align="start">
        <div className="space-y-3">
          <div className="text-sm font-medium">Temps de trajet</div>
          
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min="0"
              value={travelMinutes || project.travelTimeMinutes?.toString() || ''}
              onChange={(e) => setTravelMinutes(e.target.value)}
              placeholder="Minutes"
              className="flex-1"
            />
            <span className="text-sm text-muted-foreground">min</span>
            <Button size="icon" variant="ghost" onClick={handleSaveTravelTime}>
              <Check size={14} />
            </Button>
          </div>

          {project.travelTimeMinutes && (
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={handleAddTravelEntry}
            >
              <Plus size={14} className="mr-1" />
              Ajouter trajet ({formatMinutesToDisplay(project.travelTimeMinutes)})
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
