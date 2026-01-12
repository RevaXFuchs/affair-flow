import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AppLayout } from '@/components/layout/AppLayout';
import { useProjects } from '@/context/ProjectContext';
import { MilestoneType, MILESTONE_LABELS, Project } from '@/types/project';
import { StatusBadge } from '@/components/projects/StatusBadge';
import { PriorityBadge } from '@/components/projects/PriorityBadge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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
  milestoneType: MilestoneType;
  date: string;
  endDate?: string;
}

export default function MontageCalendar() {
  const navigate = useNavigate();
  const { projects } = useProjects();
  const [currentDate, setCurrentDate] = useState(new Date());
  const milestoneType: MilestoneType = 'montage';

  const events = projects
    .flatMap((project) => {
      const milestone = project.milestones.find(m => m.type === milestoneType);
      if (milestone?.startDate) {
        return [{
          project,
          milestoneType: milestone.type,
          date: milestone.startDate,
          endDate: milestone.endDate,
        }];
      }
      return [];
    });

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

  return (
    <AppLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Calendrier Montage</h1>
            <p className="text-muted-foreground">Planification des montages</p>
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
                    {dayEvents.map((event, eventIndex) => (
                      <button
                        key={`${event.project.id}-${eventIndex}`}
                        onClick={() => navigate(`/project/${event.project.id}`)}
                        className="calendar-event w-full text-left"
                      >
                        <span className="truncate">{event.project.name.slice(0, 20)}...</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="bg-card rounded-xl border p-4">
          <h3 className="font-medium mb-3">Montages prévus ce mois</h3>
          <div className="space-y-2">
            {events
              .filter(e => {
                const eventDate = parseISO(e.date);
                return isSameMonth(eventDate, currentDate);
              })
              .map((event) => (
                <button
                  key={event.project.id}
                  onClick={() => navigate(`/project/${event.project.id}`)}
                  className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-secondary/50 transition-colors text-left"
                >
                  <div>
                    <p className="font-medium">{event.project.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(parseISO(event.date), 'dd MMM', { locale: fr })}
                      {event.endDate && ` - ${format(parseISO(event.endDate), 'dd MMM', { locale: fr })}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={event.project.status} />
                    <PriorityBadge priority={event.project.priority} />
                  </div>
                </button>
              ))}
          </div>
        </div>
      </motion.div>
    </AppLayout>
  );
}
