import React, { createContext, useContext, useState, useCallback } from 'react';
import { Project, ProjectFilter, ProjectStatus, ProjectPriority, MilestoneType } from '@/types/project';
import { mockProjects } from '@/data/mockProjects';

interface ProjectContextType {
  projects: Project[];
  filteredProjects: Project[];
  filter: ProjectFilter;
  setFilter: (filter: ProjectFilter) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  updateProjectStatus: (id: string, status: ProjectStatus) => void;
  updateProjectPriority: (id: string, priority: ProjectPriority) => void;
  updateMilestoneDate: (projectId: string, milestoneType: MilestoneType, startDate?: string, endDate?: string) => void;
  toggleMilestoneCompleted: (projectId: string, milestoneType: MilestoneType) => void;
  getProjectById: (id: string) => Project | undefined;
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => void;
  deleteProject: (id: string) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [filter, setFilter] = useState<ProjectFilter>({});

  const filteredProjects = React.useMemo(() => {
    return projects.filter((project) => {
      if (filter.status && filter.status.length > 0) {
        if (!filter.status.includes(project.status)) return false;
      }
      if (filter.priority && filter.priority.length > 0) {
        if (!filter.priority.includes(project.priority)) return false;
      }
      if (filter.search) {
        const searchLower = filter.search.toLowerCase();
        const matchesName = project.name.toLowerCase().includes(searchLower);
        const matchesNtrk = project.ntrk?.toLowerCase().includes(searchLower);
        const matchesComments = project.comments?.toLowerCase().includes(searchLower);
        if (!matchesName && !matchesNtrk && !matchesComments) return false;
      }
      if (filter.stt && filter.stt.length > 0) {
        if (!project.stt || !filter.stt.some(s => project.stt?.includes(s))) return false;
      }
      return true;
    });
  }, [projects, filter]);

  const updateProject = useCallback((id: string, updates: Partial<Project>) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, ...updates, updatedAt: new Date().toISOString() }
          : p
      )
    );
  }, []);

  const updateProjectStatus = useCallback((id: string, status: ProjectStatus) => {
    updateProject(id, { status });
  }, [updateProject]);

  const updateProjectPriority = useCallback((id: string, priority: ProjectPriority) => {
    updateProject(id, { priority });
  }, [updateProject]);

  const updateMilestoneDate = useCallback(
    (projectId: string, milestoneType: MilestoneType, startDate?: string, endDate?: string) => {
      setProjects((prev) =>
        prev.map((p) => {
          if (p.id !== projectId) return p;
          const milestones = p.milestones.map((m) =>
            m.type === milestoneType
              ? { ...m, startDate, endDate }
              : m
          );
          return { ...p, milestones, updatedAt: new Date().toISOString() };
        })
      );
    },
    []
  );

  const toggleMilestoneCompleted = useCallback(
    (projectId: string, milestoneType: MilestoneType) => {
      setProjects((prev) =>
        prev.map((p) => {
          if (p.id !== projectId) return p;
          const milestones = p.milestones.map((m) =>
            m.type === milestoneType
              ? { ...m, completed: !m.completed }
              : m
          );
          return { ...p, milestones, updatedAt: new Date().toISOString() };
        })
      );
    },
    []
  );

  const getProjectById = useCallback(
    (id: string) => projects.find((p) => p.id === id),
    [projects]
  );

  const addProject = useCallback(
    (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
      const now = new Date().toISOString();
      const newProject: Project = {
        ...project,
        id: `${Date.now()}`,
        createdAt: now,
        updatedAt: now,
      };
      setProjects((prev) => [...prev, newProject]);
    },
    []
  );

  const deleteProject = useCallback((id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
  }, []);

  return (
    <ProjectContext.Provider
      value={{
        projects,
        filteredProjects,
        filter,
        setFilter,
        updateProject,
        updateProjectStatus,
        updateProjectPriority,
        updateMilestoneDate,
        toggleMilestoneCompleted,
        getProjectById,
        addProject,
        deleteProject,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProjects() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
}
