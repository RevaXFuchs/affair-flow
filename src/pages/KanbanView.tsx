import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AppLayout } from '@/components/layout/AppLayout';
import { useProjects } from '@/context/ProjectContext';
import { ProjectStatus, STATUS_LABELS, STATUS_STYLES } from '@/types/project';
import { StatusBadge } from '@/components/projects/StatusBadge';
import { PriorityBadge } from '@/components/projects/PriorityBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const KANBAN_COLUMNS: ProjectStatus[] = [
  'standby',
  'attente-dp',
  'vt',
  'en-cours',
  'gc',
  'consuel',
  'termine',
];

export default function KanbanView() {
  const navigate = useNavigate();
  const { projects, updateProjectStatus } = useProjects();

  const getProjectsByStatus = (status: ProjectStatus) => {
    return projects.filter(p => p.status === status);
  };

  return (
    <AppLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Kanban</h1>
          <p className="text-muted-foreground">Vue des affaires par statut</p>
        </div>

        {/* Kanban Board */}
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-max">
            {KANBAN_COLUMNS.map((status, columnIndex) => {
              const columnProjects = getProjectsByStatus(status);
              
              return (
                <motion.div
                  key={status}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: columnIndex * 0.05 }}
                  className="w-72 flex-shrink-0"
                >
                  <div className="bg-muted/30 rounded-xl p-3 h-full min-h-[500px]">
                    {/* Column Header */}
                    <div className="flex items-center justify-between mb-3 px-1">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={status} />
                        <span className="text-sm text-muted-foreground">
                          ({columnProjects.length})
                        </span>
                      </div>
                    </div>

                    {/* Cards */}
                    <div className="space-y-2">
                      {columnProjects.map((project, index) => (
                        <motion.div
                          key={project.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.02 }}
                          whileHover={{ scale: 1.02 }}
                          onClick={() => navigate(`/project/${project.id}`)}
                          className="bg-card rounded-lg border p-3 cursor-pointer hover:shadow-md transition-all"
                        >
                          <p className="font-medium text-sm mb-2 line-clamp-2">
                            {project.name}
                          </p>
                          {project.ntrk && (
                            <p className="text-xs text-muted-foreground mb-2">
                              {project.ntrk}
                            </p>
                          )}
                          <div className="flex items-center justify-between">
                            <PriorityBadge priority={project.priority} />
                            {project.stt && project.stt.length > 0 && (
                              <div className="flex gap-1">
                                {project.stt.slice(0, 2).map((s) => (
                                  <span 
                                    key={s} 
                                    className="text-xs bg-secondary px-1.5 py-0.5 rounded"
                                  >
                                    {s}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          {project.comments && (
                            <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                              {project.comments}
                            </p>
                          )}
                        </motion.div>
                      ))}
                      {columnProjects.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground text-sm">
                          Aucune affaire
                        </div>
                      )}
                    </div>
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
