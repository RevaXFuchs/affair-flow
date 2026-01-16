import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useProjects } from '@/context/ProjectContext';
import { Project, ProjectStatus, ProjectPriority, STATUS_LABELS, PRIORITY_LABELS, MILESTONE_LABELS, MilestoneType } from '@/types/project';
import { StatusBadge } from './StatusBadge';
import { PriorityBadge } from './PriorityBadge';
import { SttBadge } from './SttBadge';
import { AddressLink } from './AddressLink';
import { DeleteProjectDialog } from './DeleteProjectDialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { ExternalLink, ChevronUp, ChevronDown, Trash2, MapPin, FolderOpen } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

type SortField = 'name' | 'status' | 'priority' | 'updatedAt';
type SortDirection = 'asc' | 'desc';

export function ProjectTable() {
  const navigate = useNavigate();
  const { filteredProjects, updateProjectStatus, updateProjectPriority, updateMilestoneDate, toggleMilestoneCompleted, deleteProject } = useProjects();
  const [sortField, setSortField] = useState<SortField>('updatedAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const sortedProjects = [...filteredProjects].sort((a, b) => {
    let comparison = 0;
    switch (sortField) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'status':
        comparison = a.status.localeCompare(b.status);
        break;
      case 'priority':
        const priorityOrder = { 'low': 0, 'medium': 1, 'high': 2, 'very-high': 3 };
        comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
        break;
      case 'updatedAt':
        comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
        break;
    }
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
  };

  const getMilestoneDate = (project: Project, type: MilestoneType) => {
    const milestone = project.milestones.find(m => m.type === type);
    return milestone?.startDate;
  };

  const isMilestoneCompleted = (project: Project, type: MilestoneType) => {
    const milestone = project.milestones.find(m => m.type === type);
    return milestone?.completed || false;
  };

  return (
    <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead 
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center gap-1">
                  Affaire <SortIcon field="name" />
                </div>
              </TableHead>
              <TableHead>Liens</TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center gap-1">
                  Statut <SortIcon field="status" />
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => handleSort('priority')}
              >
                <div className="flex items-center gap-1">
                  Priorité <SortIcon field="priority" />
                </div>
              </TableHead>
              <TableHead>nTRK</TableHead>
              <TableHead>STT</TableHead>
              {(['vt', 'ltrk', 'gc', 'montage', 'grutage', 'mer'] as MilestoneType[]).map(type => (
                <TableHead key={type} className="text-center">
                  {MILESTONE_LABELS[type]}
                </TableHead>
              ))}
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedProjects.map((project, index) => (
              <motion.tr
                key={project.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02 }}
                className="table-row-hover cursor-pointer group"
                onClick={() => navigate(`/project/${project.id}`)}
              >
                <TableCell className="font-medium max-w-[200px]">
                  <span className="truncate block">{project.name}</span>
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-2">
                    {project.sharepointLink && (
                      <a
                        href={project.sharepointLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-accent transition-colors bg-secondary px-2 py-1 rounded"
                        title="Ouvrir SharePoint"
                      >
                        <FolderOpen size={12} />
                        <span>SP</span>
                      </a>
                    )}
                    {project.address && (
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(project.address)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-accent transition-colors bg-secondary px-2 py-1 rounded"
                        title={project.address}
                      >
                        <MapPin size={12} />
                        <span>Maps</span>
                      </a>
                    )}
                  </div>
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Select
                    value={project.status}
                    onValueChange={(value) => updateProjectStatus(project.id, value as ProjectStatus)}
                  >
                    <SelectTrigger className="w-auto border-none shadow-none h-auto p-0 hover:bg-transparent">
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
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Select
                    value={project.priority}
                    onValueChange={(value) => updateProjectPriority(project.id, value as ProjectPriority)}
                  >
                    <SelectTrigger className="w-auto border-none shadow-none h-auto p-0 hover:bg-transparent">
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
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {project.ntrk || '—'}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1 flex-wrap max-w-[120px]">
                    {project.stt?.slice(0, 2).map((s) => (
                      <SttBadge key={s} stt={s} />
                    ))}
                    {(project.stt?.length || 0) > 2 && (
                      <span className="text-xs text-muted-foreground">
                        +{(project.stt?.length || 0) - 2}
                      </span>
                    )}
                  </div>
                </TableCell>
                {(['vt', 'ltrk', 'gc', 'montage', 'grutage', 'mer'] as MilestoneType[]).map(type => {
                  const date = getMilestoneDate(project, type);
                  const completed = isMilestoneCompleted(project, type);
                  return (
                    <TableCell key={type} className="text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1">
                        <Checkbox
                          checked={completed}
                          onCheckedChange={() => toggleMilestoneCompleted(project.id, type)}
                          className="h-3.5 w-3.5"
                        />
                        <Popover>
                          <PopoverTrigger asChild>
                            <button
                              className={cn(
                                'text-xs px-1.5 py-0.5 rounded hover:bg-secondary transition-colors',
                                completed && 'line-through text-muted-foreground'
                              )}
                            >
                              {date ? format(parseISO(date), 'dd/MM', { locale: fr }) : '—'}
                            </button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="center">
                            <Calendar
                              mode="single"
                              selected={date ? parseISO(date) : undefined}
                              onSelect={(d) => updateMilestoneDate(project.id, type, d?.toISOString().split('T')[0])}
                              locale={fr}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </TableCell>
                  );
                })}
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <DeleteProjectDialog
                    projectName={project.name}
                    onConfirm={() => deleteProject(project.id)}
                    trigger={
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 size={14} />
                      </Button>
                    }
                  />
                </TableCell>
              </motion.tr>
            ))}
          </TableBody>
        </Table>
      </div>
      {sortedProjects.length === 0 && (
        <div className="py-12 text-center text-muted-foreground">
          Aucune affaire trouvée
        </div>
      )}
    </div>
  );
}
