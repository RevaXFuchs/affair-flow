import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { TimeEntry, TimeCategory, TimeEntryKind, TimeEntrySource, TimeSummary, calculateTimeSummary, DEFAULT_TIME_CATEGORIES, TimeCategoryConfig } from '@/types/timeEntry';
import { toast } from 'sonner';

const STORAGE_KEY = 'affaires-time-entries';
const SETTINGS_KEY = 'affaires-time-settings';

interface TimeEntryContextType {
  timeEntries: TimeEntry[];
  timeCategories: TimeCategoryConfig[];
  // CRUD operations
  addTimeEntry: (entry: Omit<TimeEntry, 'id' | 'createdAt'>) => boolean;
  updateTimeEntry: (id: string, updates: Partial<TimeEntry>) => boolean;
  deleteTimeEntry: (id: string) => void;
  // Query operations
  getEntriesForProject: (projectId: string) => TimeEntry[];
  getEntriesForProjectByKind: (projectId: string, kind: TimeEntryKind) => TimeEntry[];
  getTimeSummaryForProject: (projectId: string) => TimeSummary;
  // Category config
  getCategoryConfig: (category: TimeCategory) => TimeCategoryConfig | undefined;
  getCategoryColor: (category: TimeCategory, kind: TimeEntryKind) => string;
  updateCategoryColor: (category: TimeCategory, color: string) => void;
  // Validation
  validateTimeEntry: (category: TimeCategory, minutes: number) => { valid: boolean; message?: string };
}

const TimeEntryContext = createContext<TimeEntryContextType | undefined>(undefined);

function loadTimeEntries(): TimeEntry[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading time entries:', error);
  }
  return [];
}

function saveTimeEntries(entries: TimeEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch (error) {
    console.error('Error saving time entries:', error);
  }
}

function loadTimeSettings(): TimeCategoryConfig[] {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading time settings:', error);
  }
  return DEFAULT_TIME_CATEGORIES;
}

function saveTimeSettings(categories: TimeCategoryConfig[]): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(categories));
  } catch (error) {
    console.error('Error saving time settings:', error);
  }
}

export function TimeEntryProvider({ children }: { children: React.ReactNode }) {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>(loadTimeEntries);
  const [timeCategories, setTimeCategories] = useState<TimeCategoryConfig[]>(loadTimeSettings);

  // Persist on change
  useEffect(() => {
    saveTimeEntries(timeEntries);
  }, [timeEntries]);

  useEffect(() => {
    saveTimeSettings(timeCategories);
  }, [timeCategories]);

  const validateTimeEntry = useCallback(
    (category: TimeCategory, minutes: number): { valid: boolean; message?: string } => {
      const config = timeCategories.find((c) => c.key === category);
      if (config?.minMinutes && minutes < config.minMinutes) {
        return {
          valid: false,
          message: `La durée minimale pour ${config.label} est de ${config.minMinutes} minutes`,
        };
      }
      if (minutes <= 0) {
        return {
          valid: false,
          message: 'La durée doit être supérieure à 0',
        };
      }
      return { valid: true };
    },
    [timeCategories]
  );

  const addTimeEntry = useCallback(
    (entry: Omit<TimeEntry, 'id' | 'createdAt'>): boolean => {
      const validation = validateTimeEntry(entry.category, entry.minutes);
      if (!validation.valid) {
        toast.error(validation.message);
        return false;
      }

      const newEntry: TimeEntry = {
        ...entry,
        id: `te-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };

      setTimeEntries((prev) => [...prev, newEntry]);
      toast.success('Temps enregistré');
      return true;
    },
    [validateTimeEntry]
  );

  const updateTimeEntry = useCallback(
    (id: string, updates: Partial<TimeEntry>): boolean => {
      const entry = timeEntries.find((e) => e.id === id);
      if (!entry) {
        toast.error('Entrée non trouvée');
        return false;
      }

      const newMinutes = updates.minutes ?? entry.minutes;
      const newCategory = updates.category ?? entry.category;

      const validation = validateTimeEntry(newCategory, newMinutes);
      if (!validation.valid) {
        toast.error(validation.message);
        return false;
      }

      setTimeEntries((prev) =>
        prev.map((e) =>
          e.id === id ? { ...e, ...updates, updatedAt: new Date().toISOString() } : e
        )
      );
      toast.success('Temps modifié');
      return true;
    },
    [timeEntries, validateTimeEntry]
  );

  const deleteTimeEntry = useCallback((id: string) => {
    setTimeEntries((prev) => prev.filter((e) => e.id !== id));
    toast.success('Temps supprimé');
  }, []);

  const getEntriesForProject = useCallback(
    (projectId: string): TimeEntry[] => {
      return timeEntries.filter((e) => e.projectId === projectId);
    },
    [timeEntries]
  );

  const getEntriesForProjectByKind = useCallback(
    (projectId: string, kind: TimeEntryKind): TimeEntry[] => {
      return timeEntries.filter((e) => e.projectId === projectId && e.kind === kind);
    },
    [timeEntries]
  );

  const getTimeSummaryForProject = useCallback(
    (projectId: string): TimeSummary => {
      const entries = timeEntries.filter((e) => e.projectId === projectId);
      return calculateTimeSummary(entries);
    },
    [timeEntries]
  );

  const getCategoryConfig = useCallback(
    (category: TimeCategory): TimeCategoryConfig | undefined => {
      return timeCategories.find((c) => c.key === category);
    },
    [timeCategories]
  );

  const getCategoryColor = useCallback(
    (category: TimeCategory, kind: TimeEntryKind): string => {
      const config = timeCategories.find((c) => c.key === category);
      if (!config) return 'hsl(220 15% 55%)';

      if (kind === 'ACTUAL') {
        return config.color;
      }
      // Return pale version for forecast
      const match = config.color.match(/hsl\((\d+)\s+(\d+)%\s+(\d+)%\)/);
      if (match) {
        const [, h, s, l] = match;
        return `hsl(${h} ${Math.max(10, parseInt(s) - 30)}% ${Math.min(85, parseInt(l) + 20)}%)`;
      }
      return config.color;
    },
    [timeCategories]
  );

  const updateCategoryColor = useCallback((category: TimeCategory, color: string) => {
    setTimeCategories((prev) =>
      prev.map((c) => (c.key === category ? { ...c, color } : c))
    );
  }, []);

  return (
    <TimeEntryContext.Provider
      value={{
        timeEntries,
        timeCategories,
        addTimeEntry,
        updateTimeEntry,
        deleteTimeEntry,
        getEntriesForProject,
        getEntriesForProjectByKind,
        getTimeSummaryForProject,
        getCategoryConfig,
        getCategoryColor,
        updateCategoryColor,
        validateTimeEntry,
      }}
    >
      {children}
    </TimeEntryContext.Provider>
  );
}

export function useTimeEntries() {
  const context = useContext(TimeEntryContext);
  if (context === undefined) {
    throw new Error('useTimeEntries must be used within a TimeEntryProvider');
  }
  return context;
}
