import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, Square, Clock } from 'lucide-react';
import { TimeCategory, TIME_CATEGORY_LABELS, formatMinutesToDisplay } from '@/types/timeEntry';
import { useTimeEntries } from '@/context/TimeEntryContext';
import { cn } from '@/lib/utils';
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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface TimerProps {
  projectId: string;
  projectName: string;
  defaultCategory?: TimeCategory;
  onComplete?: () => void;
  className?: string;
}

type TimerState = 'idle' | 'running' | 'paused';

export function Timer({
  projectId,
  projectName,
  defaultCategory = 'ADMIN',
  onComplete,
  className,
}: TimerProps) {
  const { addTimeEntry, getCategoryConfig, validateTimeEntry } = useTimeEntries();
  const [state, setState] = useState<TimerState>('idle');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [category, setCategory] = useState<TimeCategory>(defaultCategory);
  const [note, setNote] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedTimeRef = useRef<number>(0);

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const startTimer = useCallback(() => {
    if (state === 'idle') {
      startTimeRef.current = Date.now();
      pausedTimeRef.current = 0;
    } else if (state === 'paused') {
      startTimeRef.current = Date.now() - pausedTimeRef.current * 1000;
    }

    setState('running');
    intervalRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      setElapsedSeconds(elapsed);
    }, 1000);
  }, [state]);

  const pauseTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    pausedTimeRef.current = elapsedSeconds;
    setState('paused');
  }, [elapsedSeconds]);

  const stopTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    // Show confirmation dialog
    setShowConfirmDialog(true);
  }, []);

  const resetTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setState('idle');
    setElapsedSeconds(0);
    pausedTimeRef.current = 0;
    setNote('');
  }, []);

  const confirmSave = useCallback(() => {
    // Round up to the nearest minute
    const minutes = Math.ceil(elapsedSeconds / 60);

    const validation = validateTimeEntry(category, minutes);
    if (!validation.valid) {
      toast.error(validation.message);
      return;
    }

    const success = addTimeEntry({
      projectId,
      category,
      kind: 'ACTUAL',
      minutes,
      date: new Date().toISOString().split('T')[0],
      note: note.trim() || undefined,
      source: 'TIMER',
    });

    if (success) {
      resetTimer();
      setShowConfirmDialog(false);
      onComplete?.();
    }
  }, [elapsedSeconds, category, note, projectId, addTimeEntry, validateTimeEntry, resetTimer, onComplete]);

  const cancelSave = useCallback(() => {
    setShowConfirmDialog(false);
    resetTimer();
  }, [resetTimer]);

  const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const roundedMinutes = Math.ceil(elapsedSeconds / 60);
  const categoryConfig = getCategoryConfig(category);

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* Category selector */}
      <Select value={category} onValueChange={(v) => setCategory(v as TimeCategory)} disabled={state !== 'idle'}>
        <SelectTrigger className="w-32 h-8 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {(Object.keys(TIME_CATEGORY_LABELS) as TimeCategory[]).map((cat) => (
            <SelectItem key={cat} value={cat} className="text-xs">
              {TIME_CATEGORY_LABELS[cat]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Timer display */}
      <div
        className={cn(
          'font-mono text-sm px-3 py-1 rounded-lg min-w-[70px] text-center transition-colors',
          state === 'running' && 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
          state === 'paused' && 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
          state === 'idle' && 'bg-muted text-muted-foreground'
        )}
      >
        {formatTime(elapsedSeconds)}
      </div>

      {/* Controls */}
      {state === 'idle' && (
        <Button size="sm" variant="outline" onClick={startTimer} className="h-8 px-2">
          <Play size={14} className="mr-1" />
          Start
        </Button>
      )}
      {state === 'running' && (
        <>
          <Button size="sm" variant="outline" onClick={pauseTimer} className="h-8 px-2">
            <Pause size={14} />
          </Button>
          <Button size="sm" variant="destructive" onClick={stopTimer} className="h-8 px-2">
            <Square size={14} />
          </Button>
        </>
      )}
      {state === 'paused' && (
        <>
          <Button size="sm" variant="outline" onClick={startTimer} className="h-8 px-2">
            <Play size={14} />
          </Button>
          <Button size="sm" variant="destructive" onClick={stopTimer} className="h-8 px-2">
            <Square size={14} />
          </Button>
        </>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enregistrer le temps</DialogTitle>
            <DialogDescription>
              Confirmez l'enregistrement du temps pour {projectName}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between bg-muted/50 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <Clock size={18} className="text-muted-foreground" />
                <span className="font-medium">{TIME_CATEGORY_LABELS[category]}</span>
              </div>
              <div className="text-lg font-bold">
                {formatMinutesToDisplay(roundedMinutes)}
              </div>
            </div>

            {categoryConfig?.minMinutes && roundedMinutes < categoryConfig.minMinutes && (
              <div className="text-sm text-destructive bg-destructive/10 rounded-lg p-3">
                ⚠️ La durée minimale pour {categoryConfig.label} est de {categoryConfig.minMinutes} minutes.
                Ce temps ne pourra pas être enregistré.
              </div>
            )}

            <div className="space-y-2">
              <Label>Note (optionnel)</Label>
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ajouter une note..."
                rows={2}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={cancelSave}>
              Annuler
            </Button>
            <Button
              onClick={confirmSave}
              disabled={categoryConfig?.minMinutes ? roundedMinutes < categoryConfig.minMinutes : false}
            >
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
