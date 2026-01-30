import { useState, useEffect } from 'react';
import { useTimeEntries } from '@/context/TimeEntryContext';
import { TimeEntry, TimeCategory, TimeEntryKind, TIME_CATEGORY_LABELS } from '@/types/timeEntry';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface AddTimeEntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  kind: TimeEntryKind;
  editEntry?: TimeEntry | null;
  defaultTravelMinutes?: number;
}

export function AddTimeEntryDialog({
  open,
  onOpenChange,
  projectId,
  kind,
  editEntry,
  defaultTravelMinutes,
}: AddTimeEntryDialogProps) {
  const { addTimeEntry, updateTimeEntry, getCategoryConfig } = useTimeEntries();
  
  const [category, setCategory] = useState<TimeCategory>('ADMIN');
  const [hours, setHours] = useState('0');
  const [minutes, setMinutes] = useState('30');
  const [date, setDate] = useState<Date>(new Date());
  const [note, setNote] = useState('');

  // Reset form when dialog opens or editEntry changes
  useEffect(() => {
    if (open) {
      if (editEntry) {
        setCategory(editEntry.category);
        const totalMinutes = editEntry.minutes;
        setHours(Math.floor(totalMinutes / 60).toString());
        setMinutes((totalMinutes % 60).toString());
        setDate(parseISO(editEntry.date));
        setNote(editEntry.note || '');
      } else {
        setCategory('ADMIN');
        setHours('0');
        setMinutes('30');
        setDate(new Date());
        setNote('');
      }
    }
  }, [open, editEntry]);

  // Pre-fill travel time when category changes to TRAJET
  useEffect(() => {
    if (category === 'TRAJET' && defaultTravelMinutes && !editEntry) {
      setHours(Math.floor(defaultTravelMinutes / 60).toString());
      setMinutes((defaultTravelMinutes % 60).toString());
    }
  }, [category, defaultTravelMinutes, editEntry]);

  const handleSubmit = () => {
    const totalMinutes = parseInt(hours || '0') * 60 + parseInt(minutes || '0');

    if (editEntry) {
      const success = updateTimeEntry(editEntry.id, {
        category,
        minutes: totalMinutes,
        date: format(date, 'yyyy-MM-dd'),
        note: note.trim() || undefined,
      });
      if (success) {
        onOpenChange(false);
      }
    } else {
      const success = addTimeEntry({
        projectId,
        category,
        kind,
        minutes: totalMinutes,
        date: format(date, 'yyyy-MM-dd'),
        note: note.trim() || undefined,
        source: kind === 'FORECAST' ? 'CALENDAR' : 'MANUAL',
      });
      if (success) {
        onOpenChange(false);
      }
    }
  };

  const categoryConfig = getCategoryConfig(category);
  const totalMinutes = parseInt(hours || '0') * 60 + parseInt(minutes || '0');
  const isMinimumNotMet = categoryConfig?.minMinutes && totalMinutes < categoryConfig.minMinutes;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editEntry ? 'Modifier le temps' : `Ajouter temps ${kind === 'ACTUAL' ? 'passé' : 'prévisionnel'}`}
          </DialogTitle>
          <DialogDescription>
            {kind === 'ACTUAL' ? 'Temps réalisé sur cette affaire' : 'Temps planifié pour cette affaire'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Category */}
          <div className="space-y-2">
            <Label>Catégorie</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as TimeCategory)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(TIME_CATEGORY_LABELS) as TimeCategory[]).map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {TIME_CATEGORY_LABELS[cat]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <Label>Durée</Label>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Input
                  type="number"
                  min="0"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  className="w-16 text-center"
                />
                <span className="text-sm text-muted-foreground">h</span>
              </div>
              <div className="flex items-center gap-1">
                <Input
                  type="number"
                  min="0"
                  max="59"
                  value={minutes}
                  onChange={(e) => setMinutes(e.target.value)}
                  className="w-16 text-center"
                />
                <span className="text-sm text-muted-foreground">min</span>
              </div>
            </div>
            {isMinimumNotMet && (
              <p className="text-xs text-destructive">
                Durée minimale : {categoryConfig?.minMinutes} minutes
              </p>
            )}
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !date && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, 'PPP', { locale: fr }) : 'Sélectionner une date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(d) => d && setDate(d)}
                  locale={fr}
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Note */}
          <div className="space-y-2">
            <Label>Note (optionnel)</Label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ajouter une description..."
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={isMinimumNotMet || totalMinutes <= 0}>
            {editEntry ? 'Modifier' : 'Ajouter'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
