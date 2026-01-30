import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTimeEntries } from '@/context/TimeEntryContext';
import { useProjects } from '@/context/ProjectContext';
import { Timer } from './Timer';
import { AddTimeEntryDialog } from './AddTimeEntryDialog';
import { TimeEntry, TimeCategory, TimeEntryKind, formatMinutesToDisplay, TIME_CATEGORY_LABELS } from '@/types/timeEntry';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Clock, Plus, Trash2, Edit2, Calendar, Timer as TimerIcon, FileText, Car, Briefcase } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface TimeEntryDrawerProps {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TimeEntryDrawer({ projectId, open, onOpenChange }: TimeEntryDrawerProps) {
  const { getProjectById } = useProjects();
  const {
    getEntriesForProjectByKind,
    getTimeSummaryForProject,
    deleteTimeEntry,
    getCategoryColor,
  } = useTimeEntries();

  const [activeTab, setActiveTab] = useState<'actual' | 'forecast'>('actual');
  const [editEntry, setEditEntry] = useState<TimeEntry | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [addKind, setAddKind] = useState<TimeEntryKind>('ACTUAL');

  const project = getProjectById(projectId);
  if (!project) return null;

  const actualEntries = getEntriesForProjectByKind(projectId, 'ACTUAL');
  const forecastEntries = getEntriesForProjectByKind(projectId, 'FORECAST');
  const summary = getTimeSummaryForProject(projectId);

  const handleAddManual = (kind: TimeEntryKind) => {
    setAddKind(kind);
    setEditEntry(null);
    setShowAddDialog(true);
  };

  const handleEdit = (entry: TimeEntry) => {
    setEditEntry(entry);
    setAddKind(entry.kind);
    setShowAddDialog(true);
  };

  const getCategoryIcon = (category: TimeCategory) => {
    switch (category) {
      case 'TRAJET':
        return <Car size={14} />;
      case 'ADMIN':
        return <Briefcase size={14} />;
      case 'EXEC':
        return <FileText size={14} />;
      default:
        return <Clock size={14} />;
    }
  };

  const getSourceLabel = (source: string) => {
    switch (source) {
      case 'TIMER':
        return 'Minuteur';
      case 'MANUAL':
        return 'Manuel';
      case 'TRAVEL_DEFAULT':
        return 'Trajet défaut';
      case 'CALENDAR':
        return 'Calendrier';
      default:
        return source;
    }
  };

  const renderEntryList = (entries: TimeEntry[], kind: TimeEntryKind) => {
    if (entries.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          <Clock size={32} className="mx-auto mb-2 opacity-50" />
          <p>Aucun temps {kind === 'ACTUAL' ? 'passé' : 'prévisionnel'} enregistré</p>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {entries
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .map((entry) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors group"
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                style={{ backgroundColor: getCategoryColor(entry.category, entry.kind) }}
              >
                {getCategoryIcon(entry.category)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">
                    {TIME_CATEGORY_LABELS[entry.category]}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {getSourceLabel(entry.source)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar size={10} />
                  {format(parseISO(entry.date), 'dd MMM yyyy', { locale: fr })}
                  {entry.note && (
                    <span className="truncate max-w-[120px]">• {entry.note}</span>
                  )}
                </div>
              </div>
              <div className="font-mono font-bold text-sm">
                {formatMinutesToDisplay(entry.minutes)}
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7"
                  onClick={() => handleEdit(entry)}
                >
                  <Edit2 size={12} />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-destructive hover:text-destructive"
                  onClick={() => deleteTimeEntry(entry.id)}
                >
                  <Trash2 size={12} />
                </Button>
              </div>
            </motion.div>
          ))}
      </div>
    );
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader className="space-y-1">
            <SheetTitle className="flex items-center gap-2">
              <Clock size={20} />
              Temps de l'affaire
            </SheetTitle>
            <SheetDescription className="truncate">{project.name}</SheetDescription>
          </SheetHeader>

          {/* Summary */}
          <div className="mt-6 p-4 bg-muted/30 rounded-xl space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground">Récapitulatif</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-card p-3 rounded-lg">
                <div className="text-xs text-muted-foreground">Total passé</div>
                <div className="text-xl font-bold text-primary">
                  {formatMinutesToDisplay(summary.totalActual)}
                </div>
              </div>
              <div className="bg-card p-3 rounded-lg">
                <div className="text-xs text-muted-foreground">Total prévisionnel</div>
                <div className="text-xl font-bold text-muted-foreground">
                  {formatMinutesToDisplay(summary.totalForecast)}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {(Object.keys(summary.byCategory) as TimeCategory[]).map((cat) => (
                <div key={cat} className="flex items-center justify-between bg-card/50 px-2 py-1.5 rounded">
                  <span className="flex items-center gap-1">
                    {getCategoryIcon(cat)}
                    {TIME_CATEGORY_LABELS[cat]}
                  </span>
                  <span className="font-mono">
                    {formatMinutesToDisplay(summary.byCategory[cat].actual)}
                    {summary.byCategory[cat].forecast > 0 && (
                      <span className="text-muted-foreground ml-1">
                        ({formatMinutesToDisplay(summary.byCategory[cat].forecast)})
                      </span>
                    )}
                  </span>
                </div>
              ))}
            </div>
            {summary.totalForecast > 0 && (
              <div className="text-xs text-center text-muted-foreground">
                Écart : {formatMinutesToDisplay(Math.abs(summary.totalForecast - summary.totalActual))}
                {summary.totalActual > summary.totalForecast ? ' (dépassé)' : ' (restant)'}
              </div>
            )}
          </div>

          {/* Timer */}
          <div className="mt-6 p-4 bg-muted/30 rounded-xl">
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">Minuteur</h3>
            <Timer
              projectId={projectId}
              projectName={project.name}
              onComplete={() => {}}
            />
          </div>

          {/* Tabs for Actual / Forecast */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'actual' | 'forecast')} className="mt-6">
            <TabsList className="w-full">
              <TabsTrigger value="actual" className="flex-1">
                Passé ({actualEntries.length})
              </TabsTrigger>
              <TabsTrigger value="forecast" className="flex-1">
                Prévisionnel ({forecastEntries.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="actual" className="mt-4 space-y-4">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleAddManual('ACTUAL')}
                >
                  <Plus size={14} className="mr-1" />
                  Ajouter manuel
                </Button>
              </div>
              {renderEntryList(actualEntries, 'ACTUAL')}
            </TabsContent>

            <TabsContent value="forecast" className="mt-4 space-y-4">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => handleAddManual('FORECAST')}
              >
                <Plus size={14} className="mr-1" />
                Ajouter prévisionnel
              </Button>
              {renderEntryList(forecastEntries, 'FORECAST')}
            </TabsContent>
          </Tabs>
        </SheetContent>
      </Sheet>

      <AddTimeEntryDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        projectId={projectId}
        kind={addKind}
        editEntry={editEntry}
        defaultTravelMinutes={project.travelTimeMinutes}
      />
    </>
  );
}
