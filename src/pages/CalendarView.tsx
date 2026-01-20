import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AppLayout } from '@/components/layout/AppLayout';
import { useProjects } from '@/context/ProjectContext';
import { MilestoneType, MILESTONE_LABELS, Project, ProjectEvent } from '@/types/project';
import { AddEventDialog } from '@/components/projects/AddEventDialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, parseISO, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CalendarEvent {
  project: Project;
  milestoneType?: MilestoneType;
  customEvent?: ProjectEvent;
  date: string;
  endDate?: string;
  title: string;
  type: 'milestone' | 'custom';
}

export default function CalendarView() {
  const navigate = useNavigate();
  const { projects, addEvent } = useProjects();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedMilestone, setSelectedMilestone] = useState<MilestoneType | 'all' | 'custom'>('all');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');

  const events = useMemo(() => {
    const allEvents: CalendarEvent[] = [];
    
    projects.forEach((project) => {
      // Add milestone events
      project.milestones.forEach((milestone) => {
        if (milestone.startDate) {
          if (selectedMilestone === 'all' || selectedMilestone === milestone.type) {
            allEvents.push({
              project,
              milestoneType: milestone.type,
              date: milestone.startDate,
              endDate: milestone.endDate,
              title: `${MILESTONE_LABELS[milestone.type]} - ${project.name}`,
              type: 'milestone',
            });
          }
        }
      });

      // Add custom events
      if (selectedMilestone === 'all' || selectedMilestone === 'custom') {
        (project.events || []).forEach((event) => {
          allEvents.push({
            project,
            customEvent: event,
            date: event.date,
            endDate: event.endDate,
            title: `${event.title} - ${project.name}`,
            type: 'custom',
          });
        });
      }
    });
    
    return allEvents;
  }, [projects, selectedMilestone]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getEventsForDay = (day: Date) => {
    return events.filter((event) => {
      const eventDate = parseISO(event.date);
      if (event.endDate) {
        const endDate = parseISO(event.endDate);
        return day >= eventDate && day <= endDate;
      }
      return isSameDay(eventDate, day);
    });
  };

  const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  const handleAddEvent = (event: Omit<ProjectEvent, 'id'>) => {
    if (selectedProjectId) {
      addEvent(selectedProjectId, event);
    }
  };

  return (
    <AppLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold">Calendrier</h1>
            <p className="text-muted-foreground">Vue par jalons et événements</p>
          </div>
          <div className="flex items-center gap-4">
            <Select
              value={selectedMilestone}
              onValueChange={(value) => setSelectedMilestone(value as MilestoneType | 'all' | 'custom')}
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les événements</SelectItem>
                <SelectItem value="custom">Événements personnalisés</SelectItem>
                {(Object.keys(MILESTONE_LABELS) as MilestoneType[]).map((type) => (
                  <SelectItem key={type} value={type}>
                    {MILESTONE_LABELS[type]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <AddEventDialog
              onAddEvent={handleAddEvent}
              projects={projects}
              selectedProjectId={selectedProjectId}
              onSelectProject={setSelectedProjectId}
              trigger={
                <Button>
                  <Plus size={16} className="mr-2" />
                  Nouvel événement
                </Button>
              }
            />
          </div>
        </div>

        {/* Calendar Navigation */}
        <div className="bg-card rounded-xl border p-4">
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentDate(subMonths(currentDate, 1))}
            >
              <ChevronLeft size={18} />
            </Button>
            <h2 className="text-lg font-semibold capitalize">
              {format(currentDate, 'MMMM yyyy', { locale: fr })}
            </h2>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentDate(addMonths(currentDate, 1))}
            >
              <ChevronRight size={18} />
            </Button>
          </div>

          {/* Week Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map((day) => (
              <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, index) => {
              const dayEvents = getEventsForDay(day);
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isCurrentDay = isToday(day);

              return (
                <motion.div
                  key={day.toISOString()}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.01 }}
                  className={cn(
                    'min-h-[100px] p-1 border rounded-lg transition-colors',
                    isCurrentMonth ? 'bg-background' : 'bg-muted/20',
                    isCurrentDay && 'ring-2 ring-accent'
                  )}
                >
                  <div className={cn(
                    'text-sm font-medium mb-1 px-1',
                    !isCurrentMonth && 'text-muted-foreground',
                    isCurrentDay && 'text-accent'
                  )}>
                    {format(day, 'd')}
                  </div>
                  <div className="space-y-1 overflow-y-auto max-h-[80px]">
                    {dayEvents.slice(0, 3).map((event, eventIndex) => (
                      <button
                        key={`${event.project.id}-${event.milestoneType || event.customEvent?.id}-${eventIndex}`}
                        onClick={() => navigate(`/project/${event.project.id}`)}
                        className={cn(
                          'calendar-event w-full text-left',
                          event.type === 'custom' && 'bg-accent/20'
                        )}
                      >
                        <span className="font-medium">
                          {event.type === 'milestone' 
                            ? MILESTONE_LABELS[event.milestoneType!]
                            : event.customEvent?.title
                          }
                        </span>
                        <span className="opacity-80 ml-1">- {event.project.name.slice(0, 12)}...</span>
                      </button>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-xs text-muted-foreground px-2">
                        +{dayEvents.length - 3} autres
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </AppLayout>
  );
}
