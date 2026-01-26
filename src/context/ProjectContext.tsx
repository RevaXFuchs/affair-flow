import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Project, ProjectFilter, MilestoneType, Contact, ProjectEvent } from '@/types/project';
import { loadProjects, saveProjects } from '@/lib/storage';

interface ProjectContextType {
  projects: Project[];
  filteredProjects: Project[];
  filter: ProjectFilter;
  setFilter: (filter: ProjectFilter) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  updateProjectStatus: (id: string, status: string) => void;
  updateProjectPriority: (id: string, priority: string) => void;
  updateMilestoneDate: (projectId: string, milestoneType: MilestoneType, startDate?: string, endDate?: string) => void;
  toggleMilestoneCompleted: (projectId: string, milestoneType: MilestoneType) => void;
  getProjectById: (id: string) => Project | undefined;
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => void;
  deleteProject: (id: string) => void;
  addContact: (projectId: string, contact: Omit<Contact, 'id'>) => void;
  updateContact: (projectId: string, contactId: string, updates: Partial<Contact>) => void;
  removeContact: (projectId: string, contactId: string) => void;
  addEvent: (projectId: string, event: Omit<ProjectEvent, 'id'>) => void;
  updateEvent: (projectId: string, eventId: string, updates: Partial<ProjectEvent>) => void;
  removeEvent: (projectId: string, eventId: string) => void;
  importProjects: (projects: Project[]) => void;
  remapProjectStatus: (oldStatus: string, newStatus: string) => void;
  remapProjectPriority: (oldPriority: string, newPriority: string) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>(loadProjects);
  const [filter, setFilter] = useState<ProjectFilter>({});

  // Persist on change
  useEffect(() => {
    saveProjects(projects);
  }, [projects]);

  const filteredProjects = React.useMemo(() => {
    return projects.filter((project) => {
      if (filter.status && filter.status.length > 0) {
        if (!filter.status.includes(project.status as any)) return false;
      }
      if (filter.priority && filter.priority.length > 0) {
        if (!filter.priority.includes(project.priority as any)) return false;
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

  const updateProjectStatus = useCallback((id: string, status: string) => {
    updateProject(id, { status: status as any });
  }, [updateProject]);

  const updateProjectPriority = useCallback((id: string, priority: string) => {
    updateProject(id, { priority: priority as any });
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

  const addContact = useCallback((projectId: string, contact: Omit<Contact, 'id'>) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p;
        const newContact: Contact = {
          ...contact,
          id: `${Date.now()}`,
        };
        return {
          ...p,
          contacts: [...(p.contacts || []), newContact],
          updatedAt: new Date().toISOString(),
        };
      })
    );
  }, []);

  const updateContact = useCallback((projectId: string, contactId: string, updates: Partial<Contact>) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p;
        return {
          ...p,
          contacts: (p.contacts || []).map((c) =>
            c.id === contactId ? { ...c, ...updates } : c
          ),
          updatedAt: new Date().toISOString(),
        };
      })
    );
  }, []);

  const removeContact = useCallback((projectId: string, contactId: string) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p;
        return {
          ...p,
          contacts: (p.contacts || []).filter((c) => c.id !== contactId),
          updatedAt: new Date().toISOString(),
        };
      })
    );
  }, []);

  const addEvent = useCallback((projectId: string, event: Omit<ProjectEvent, 'id'>) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p;
        const newEvent: ProjectEvent = {
          ...event,
          id: `${Date.now()}`,
        };
        return {
          ...p,
          events: [...(p.events || []), newEvent],
          updatedAt: new Date().toISOString(),
        };
      })
    );
  }, []);

  const updateEvent = useCallback((projectId: string, eventId: string, updates: Partial<ProjectEvent>) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p;
        return {
          ...p,
          events: (p.events || []).map((e) =>
            e.id === eventId ? { ...e, ...updates } : e
          ),
          updatedAt: new Date().toISOString(),
        };
      })
    );
  }, []);

  const removeEvent = useCallback((projectId: string, eventId: string) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p;
        return {
          ...p,
          events: (p.events || []).filter((e) => e.id !== eventId),
          updatedAt: new Date().toISOString(),
        };
      })
    );
  }, []);

  const importProjects = useCallback((newProjects: Project[]) => {
    setProjects((prev) => {
      const updated = [...prev];
      newProjects.forEach((np) => {
        const existingIndex = updated.findIndex((p) => p.id === np.id);
        if (existingIndex >= 0) {
          updated[existingIndex] = np;
        } else {
          updated.push(np);
        }
      });
      return updated;
    });
  }, []);

  const remapProjectStatus = useCallback((oldStatus: string, newStatus: string) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.status === oldStatus
          ? { ...p, status: newStatus as any, updatedAt: new Date().toISOString() }
          : p
      )
    );
  }, []);

  const remapProjectPriority = useCallback((oldPriority: string, newPriority: string) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.priority === oldPriority
          ? { ...p, priority: newPriority as any, updatedAt: new Date().toISOString() }
          : p
      )
    );
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
        addContact,
        updateContact,
        removeContact,
        addEvent,
        updateEvent,
        removeEvent,
        importProjects,
        remapProjectStatus,
        remapProjectPriority,
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
