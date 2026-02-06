import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTimeEntries } from '@/context/TimeEntryContext';
import { useProjects } from '@/context/ProjectContext';
import { Timer } from './Timer';
import { AddTimeEntryDialog } from './AddTimeEntryDialog';
import { TimeEntry, TimeCategory, TimeEntryKind, formatMinutesToDisplay, TIME_CATEGORY_LABELS } from '@/types/timeEntry';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, Plus, Trash2, Edit2, Calendar, Car, Briefcase, FileText, Check, Save } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ProjectTimeSectionProps {
  projectId: string;
}

export function ProjectTimeSection({ projectId }: ProjectTimeSectionProps) {
  const { getProjectById, updateProject } = useProjects();
  const {
    getEntriesForProjectByKind,
    getTimeSummaryForProject,
    deleteTimeEntry,
    getCategoryColor,
    addTimeEntry,
  } = useTimeEntries();

  const [activeTab, setActiveTab] = useState<'actual' | 'forecast'>('actual');
  const [editEntry, setEditEntry] = useState<TimeEntry | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [addKind, setAddKind] = useState<TimeEntryKind>('ACTUAL');
  const [travelMinutes, setTravelMinutes] = useState('');

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

  const handleSaveTravelTime = () => {
    const minutes = parseInt(travelMinutes);
    if (isNaN(minutes) || minutes <= 0) {
      toast.error('Entrez un temps de trajet valide');
      return;
    }
    updateProject(projectId, { travelTimeMinutes: minutes });
    toast.success('Temps de trajet par défaut enregistré');
  };

  const handleAddTravelEntry = () => {
    const minutes = project.travelTimeMinutes;
    if (!minutes || minutes <= 0) {
      toast.error("Définissez d'abord un temps de trajet");
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
        <AnimatePresence>
          {entries
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .map((entry) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors group"
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0"
                  style={{ backgroundColor: getCategoryColor(entry.category, entry.kind) }}
                >
                  {getCategoryIcon(entry.category)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">
                      {TIME_CATEGORY_LABELS[entry.category]}
                    </span>
                    <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                      {getSourceLabel(entry.source)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar size={10} />
                    {format(parseISO(entry.date), 'dd MMM yyyy', { locale: fr })}
                    {entry.note && (
                      <span className="truncate max-w-[200px]">• {entry.note}</span>
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
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="bg-card rounded-xl border p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold flex items-center gap-2">
          <Clock size={18} />
          Suivi des temps
        </h2>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-muted/30 p-3 rounded-lg">
          <div className="text-xs text-muted-foreground">Total passé</div>
          <div className="text-xl font-bold text-primary">
            {formatMinutesToDisplay(summary.totalActual)}
          </div>
        </div>
        <div className="bg-muted/30 p-3 rounded-lg">
          <div className="text-xs text-muted-foreground">Total prévisionnel</div>
          <div className="text-xl font-bold text-muted-foreground">
            {formatMinutesToDisplay(summary.totalForecast)}
          </div>
        </div>
        {summary.totalForecast > 0 && (
          <div className="bg-muted/30 p-3 rounded-lg col-span-2">
            <div className="text-xs text-muted-foreground">Écart</div>
            <div className={cn(
              'text-xl font-bold',
              summary.totalActual > summary.totalForecast ? 'text-destructive' : 'text-status-done'
            )}>
              {formatMinutesToDisplay(Math.abs(summary.totalForecast - summary.totalActual))}
              <span className="text-sm font-normal ml-1">
                {summary.totalActual > summary.totalForecast ? '(dépassé)' : '(restant)'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Category breakdown */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {(Object.keys(summary.byCategory) as TimeCategory[]).map((cat) => (
          <div key={cat} className="flex items-center justify-between bg-muted/20 px-3 py-2 rounded-lg text-sm">
            <span className="flex items-center gap-2">
              {getCategoryIcon(cat)}
              {TIME_CATEGORY_LABELS[cat]}
            </span>
            <span className="font-mono font-medium">
              {formatMinutesToDisplay(summary.byCategory[cat].actual)}
            </span>
          </div>
        ))}
      </div>

      {/* Travel time setting */}
      <div className="bg-muted/20 p-4 rounded-lg space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Car size={16} />
          Temps de trajet par défaut
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 flex-1">
            <Input
              type="number"
              min="0"
              value={travelMinutes || project.travelTimeMinutes?.toString() || ''}
              onChange={(e) => setTravelMinutes(e.target.value)}
              placeholder="Minutes"
              className="w-24"
            />
            <span className="text-sm text-muted-foreground">min</span>
            <Button size="sm" variant="outline" onClick={handleSaveTravelTime}>
              <Save size={12} className="mr-1" />
              Définir
            </Button>
          </div>
          {project.travelTimeMinutes && (
            <Button size="sm" variant="secondary" onClick={handleAddTravelEntry}>
              <Plus size={14} className="mr-1" />
              Ajouter trajet ({formatMinutesToDisplay(project.travelTimeMinutes)})
            </Button>
          )}
        </div>
      </div>

      {/* Timer */}
      <div className="bg-muted/20 p-4 rounded-lg space-y-3">
        <div className="text-sm font-medium">Minuteur</div>
        <Timer projectId={projectId} projectName={project.name} />
      </div>

      {/* Tabs for Actual / Forecast */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'actual' | 'forecast')}>
        <TabsList className="w-full">
          <TabsTrigger value="actual" className="flex-1">
            Temps passés ({actualEntries.length})
          </TabsTrigger>
          <TabsTrigger value="forecast" className="flex-1">
            Temps prévisionnels ({forecastEntries.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="actual" className="mt-4 space-y-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleAddManual('ACTUAL')}
          >
            <Plus size={14} className="mr-1" />
            Ajouter temps passé
          </Button>
          {renderEntryList(actualEntries, 'ACTUAL')}
        </TabsContent>

        <TabsContent value="forecast" className="mt-4 space-y-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleAddManual('FORECAST')}
          >
            <Plus size={14} className="mr-1" />
            Ajouter temps prévisionnel
          </Button>
          {renderEntryList(forecastEntries, 'FORECAST')}
        </TabsContent>
      </Tabs>

      <AddTimeEntryDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        projectId={projectId}
        kind={addKind}
        editEntry={editEntry}
        defaultTravelMinutes={project.travelTimeMinutes}
      />
    </div>
  );
}
