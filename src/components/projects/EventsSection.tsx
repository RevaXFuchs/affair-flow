import { ProjectEvent } from '@/types/project';
import { AddEventDialog } from './AddEventDialog';
import { Button } from '@/components/ui/button';
import { Trash2, Calendar, Clock } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';

interface EventsSectionProps {
  events: ProjectEvent[];
  onAddEvent: (event: Omit<ProjectEvent, 'id'>) => void;
  onRemoveEvent: (eventId: string) => void;
}

export function EventsSection({
  events,
  onAddEvent,
  onRemoveEvent,
}: EventsSectionProps) {
  const handleRemoveEvent = (id: string) => {
    onRemoveEvent(id);
    toast.success('Événement supprimé');
  };

  const sortedEvents = [...events].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return (
    <div className="bg-card rounded-xl border p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold flex items-center gap-2">
          <Calendar size={18} />
          Événements
        </h2>
        <AddEventDialog onAddEvent={onAddEvent} />
      </div>

      {sortedEvents.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          Aucun événement personnalisé
        </p>
      ) : (
        <div className="grid gap-3">
          {sortedEvents.map((event) => (
            <div
              key={event.id}
              className="flex items-start justify-between p-3 bg-muted/50 rounded-lg"
            >
              <div className="space-y-1">
                <span className="font-medium">{event.title}</span>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock size={12} />
                  <span>
                    {format(parseISO(event.date), 'dd MMM yyyy', { locale: fr })}
                    {event.endDate && (
                      <> → {format(parseISO(event.endDate), 'dd MMM yyyy', { locale: fr })}</>
                    )}
                  </span>
                </div>
                {event.description && (
                  <p className="text-sm text-muted-foreground">{event.description}</p>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive hover:text-destructive shrink-0"
                onClick={() => handleRemoveEvent(event.id)}
              >
                <Trash2 size={14} />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
