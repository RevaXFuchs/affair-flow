import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import { useState } from 'react';
import { useProjects } from '@/context/ProjectContext';
import { useSettings } from '@/context/SettingsContext';
import { Project } from '@/types/project';
import { KanbanColumn } from './KanbanColumn';
import { KanbanCard } from './KanbanCard';

export function KanbanBoard() {
  const navigate = useNavigate();
  const { projects, updateProjectStatus } = useProjects();
  const { settings } = useSettings();
  const [activeProject, setActiveProject] = useState<Project | null>(null);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 8,
      },
    })
  );

  const projectsByStatus = useMemo(() => {
    const grouped: Record<string, Project[]> = {};
    settings.statuses.forEach((status) => {
      grouped[status.id] = projects.filter((p) => p.status === status.id);
    });
    return grouped;
  }, [projects, settings.statuses]);

  const handleDragStart = (event: DragStartEvent) => {
    const project = projects.find((p) => p.id === event.active.id);
    setActiveProject(project || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveProject(null);

    if (!over) return;

    const projectId = active.id as string;
    const newStatus = over.id as string;

    // Check if dropping on a column
    if (settings.statuses.some((s) => s.id === newStatus)) {
      const project = projects.find((p) => p.id === projectId);
      if (project && project.status !== newStatus) {
        updateProjectStatus(projectId, newStatus);
      }
    }
  };

  const handleCardClick = (projectId: string) => {
    navigate(`/project/${projectId}`);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-max">
          {settings.statuses.map((status, index) => (
            <motion.div
              key={status.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <KanbanColumn
                status={status}
                projects={projectsByStatus[status.id] || []}
                onCardClick={handleCardClick}
              />
            </motion.div>
          ))}
        </div>
      </div>

      <DragOverlay>
        {activeProject ? (
          <KanbanCard project={activeProject} isDragging />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
