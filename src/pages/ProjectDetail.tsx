import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useProjects } from '@/context/ProjectContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { StatusBadge } from '@/components/projects/StatusBadge';
import { PriorityBadge } from '@/components/projects/PriorityBadge';
import { ProjectStatus, ProjectPriority, STATUS_LABELS, PRIORITY_LABELS, MILESTONE_LABELS, MilestoneType, STT_OPTIONS } from '@/types/project';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
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
import { ArrowLeft, ExternalLink, CalendarIcon, Save } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getProjectById, updateProject, updateProjectStatus, updateProjectPriority, updateMilestoneDate, toggleMilestoneCompleted } = useProjects();
  
  const project = getProjectById(id || '');
  const [comments, setComments] = useState(project?.comments || '');
  const [selectedStt, setSelectedStt] = useState<string[]>(project?.stt || []);

  useEffect(() => {
    if (project) {
      setComments(project.comments || '');
      setSelectedStt(project.stt || []);
    }
  }, [project]);

  if (!project) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <p className="text-muted-foreground">Affaire non trouvée</p>
          <Button onClick={() => navigate('/projects')}>
            Retour aux projets
          </Button>
        </div>
      </AppLayout>
    );
  }

  const handleSaveComments = () => {
    updateProject(project.id, { comments });
  };

  const toggleStt = (stt: string) => {
    const newStt = selectedStt.includes(stt)
      ? selectedStt.filter(s => s !== stt)
      : [...selectedStt, stt];
    setSelectedStt(newStt);
    updateProject(project.id, { stt: newStt });
  };

  const getMilestone = (type: MilestoneType) => {
    return project.milestones.find(m => m.type === type);
  };

  return (
    <AppLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto space-y-6"
      >
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/projects')}
          >
            <ArrowLeft size={20} />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{project.name}</h1>
            {project.ntrk && (
              <p className="text-muted-foreground">{project.ntrk}</p>
            )}
          </div>
          {project.sharepointLink && (
            <Button variant="outline" asChild>
              <a href={project.sharepointLink} target="_blank" rel="noopener noreferrer">
                <ExternalLink size={16} className="mr-2" />
                SharePoint
              </a>
            </Button>
          )}
        </div>

        {/* Status & Priority Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-card rounded-xl border p-4 space-y-2">
            <label className="text-sm text-muted-foreground">Statut</label>
            <Select
              value={project.status}
              onValueChange={(value) => updateProjectStatus(project.id, value as ProjectStatus)}
            >
              <SelectTrigger className="w-full">
                <StatusBadge status={project.status} />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(STATUS_LABELS) as ProjectStatus[]).map((status) => (
                  <SelectItem key={status} value={status}>
                    <StatusBadge status={status} />
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="bg-card rounded-xl border p-4 space-y-2">
            <label className="text-sm text-muted-foreground">Priorité</label>
            <Select
              value={project.priority}
              onValueChange={(value) => updateProjectPriority(project.id, value as ProjectPriority)}
            >
              <SelectTrigger className="w-full">
                <PriorityBadge priority={project.priority} />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(PRIORITY_LABELS) as ProjectPriority[]).map((priority) => (
                  <SelectItem key={priority} value={priority}>
                    <PriorityBadge priority={priority} />
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="bg-card rounded-xl border p-4 space-y-2">
            <label className="text-sm text-muted-foreground">Créé le</label>
            <p className="font-medium">
              {format(parseISO(project.createdAt), 'dd MMMM yyyy', { locale: fr })}
            </p>
          </div>

          <div className="bg-card rounded-xl border p-4 space-y-2">
            <label className="text-sm text-muted-foreground">Modifié le</label>
            <p className="font-medium">
              {format(parseISO(project.updatedAt), 'dd MMMM yyyy', { locale: fr })}
            </p>
          </div>
        </div>

        {/* STT / Intervenants */}
        <div className="bg-card rounded-xl border p-6 space-y-4">
          <h2 className="font-semibold">Intervenants (STT)</h2>
          <div className="flex flex-wrap gap-2">
            {STT_OPTIONS.map((stt) => (
              <button
                key={stt}
                onClick={() => toggleStt(stt)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                  selectedStt.includes(stt)
                    ? 'bg-accent text-accent-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                )}
              >
                {stt}
              </button>
            ))}
          </div>
        </div>

        {/* Milestones */}
        <div className="bg-card rounded-xl border p-6 space-y-4">
          <h2 className="font-semibold">Jalons</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {(['vt', 'ltrk', 'gc', 'montage', 'grutage', 'mer'] as MilestoneType[]).map((type) => {
              const milestone = getMilestone(type);
              const date = milestone?.startDate;
              const endDate = milestone?.endDate;
              const completed = milestone?.completed || false;

              return (
                <div
                  key={type}
                  className={cn(
                    'p-4 rounded-lg border transition-colors',
                    completed ? 'bg-status-done/5 border-status-done/20' : 'bg-muted/30'
                  )}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium">{MILESTONE_LABELS[type]}</span>
                    <Checkbox
                      checked={completed}
                      onCheckedChange={() => toggleMilestoneCompleted(project.id, type)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" className="w-full justify-start">
                          <CalendarIcon size={14} className="mr-2" />
                          {date ? format(parseISO(date), 'dd/MM/yyyy', { locale: fr }) : 'Date début'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={date ? parseISO(date) : undefined}
                          onSelect={(d) => updateMilestoneDate(project.id, type, d?.toISOString().split('T')[0], endDate)}
                          locale={fr}
                        />
                      </PopoverContent>
                    </Popover>
                    {(type === 'gc' || type === 'montage') && (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" size="sm" className="w-full justify-start">
                            <CalendarIcon size={14} className="mr-2" />
                            {endDate ? format(parseISO(endDate), 'dd/MM/yyyy', { locale: fr }) : 'Date fin'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={endDate ? parseISO(endDate) : undefined}
                            onSelect={(d) => updateMilestoneDate(project.id, type, date, d?.toISOString().split('T')[0])}
                            locale={fr}
                          />
                        </PopoverContent>
                      </Popover>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Comments */}
        <div className="bg-card rounded-xl border p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Commentaires</h2>
            <Button size="sm" onClick={handleSaveComments}>
              <Save size={14} className="mr-2" />
              Enregistrer
            </Button>
          </div>
          <Textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="Ajouter des commentaires..."
            rows={4}
          />
        </div>
      </motion.div>
    </AppLayout>
  );
}
