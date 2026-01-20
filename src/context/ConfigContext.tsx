import React, { createContext, useContext, useState, useCallback } from 'react';
import { ProjectStatus, ProjectPriority, STATUS_LABELS, PRIORITY_LABELS, STT_OPTIONS, STT_COLORS } from '@/types/project';

interface StatusConfig {
  id: ProjectStatus;
  label: string;
}

interface PriorityConfig {
  id: ProjectPriority;
  label: string;
}

interface SttConfig {
  name: string;
  bg: string;
  text: string;
}

interface ConfigContextType {
  statuses: StatusConfig[];
  priorities: PriorityConfig[];
  sttList: SttConfig[];
  addStatus: (id: ProjectStatus, label: string) => void;
  removeStatus: (id: ProjectStatus) => void;
  updateStatus: (id: ProjectStatus, label: string) => void;
  addPriority: (id: ProjectPriority, label: string) => void;
  removePriority: (id: ProjectPriority) => void;
  updatePriority: (id: ProjectPriority, label: string) => void;
  addStt: (name: string, bg: string, text: string) => void;
  removeStt: (name: string) => void;
  updateStt: (name: string, bg: string, text: string) => void;
  getStatusLabel: (id: ProjectStatus) => string;
  getPriorityLabel: (id: ProjectPriority) => string;
  getSttColor: (name: string) => { bg: string; text: string };
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

const initialStatuses: StatusConfig[] = Object.entries(STATUS_LABELS).map(([id, label]) => ({
  id: id as ProjectStatus,
  label,
}));

const initialPriorities: PriorityConfig[] = Object.entries(PRIORITY_LABELS).map(([id, label]) => ({
  id: id as ProjectPriority,
  label,
}));

const initialSttList: SttConfig[] = STT_OPTIONS.map((name) => ({
  name,
  ...(STT_COLORS[name] || { bg: 'hsl(200 20% 90%)', text: 'hsl(200 20% 35%)' }),
}));

export function ConfigProvider({ children }: { children: React.ReactNode }) {
  const [statuses, setStatuses] = useState<StatusConfig[]>(initialStatuses);
  const [priorities, setPriorities] = useState<PriorityConfig[]>(initialPriorities);
  const [sttList, setSttList] = useState<SttConfig[]>(initialSttList);

  const addStatus = useCallback((id: ProjectStatus, label: string) => {
    setStatuses((prev) => {
      if (prev.some((s) => s.id === id)) return prev;
      return [...prev, { id, label }];
    });
  }, []);

  const removeStatus = useCallback((id: ProjectStatus) => {
    setStatuses((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const updateStatus = useCallback((id: ProjectStatus, label: string) => {
    setStatuses((prev) =>
      prev.map((s) => (s.id === id ? { ...s, label } : s))
    );
  }, []);

  const addPriority = useCallback((id: ProjectPriority, label: string) => {
    setPriorities((prev) => {
      if (prev.some((p) => p.id === id)) return prev;
      return [...prev, { id, label }];
    });
  }, []);

  const removePriority = useCallback((id: ProjectPriority) => {
    setPriorities((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const updatePriority = useCallback((id: ProjectPriority, label: string) => {
    setPriorities((prev) =>
      prev.map((p) => (p.id === id ? { ...p, label } : p))
    );
  }, []);

  const addStt = useCallback((name: string, bg: string, text: string) => {
    setSttList((prev) => {
      if (prev.some((s) => s.name === name)) return prev;
      return [...prev, { name, bg, text }];
    });
  }, []);

  const removeStt = useCallback((name: string) => {
    setSttList((prev) => prev.filter((s) => s.name !== name));
  }, []);

  const updateStt = useCallback((name: string, bg: string, text: string) => {
    setSttList((prev) =>
      prev.map((s) => (s.name === name ? { ...s, bg, text } : s))
    );
  }, []);

  const getStatusLabel = useCallback(
    (id: ProjectStatus) => {
      const status = statuses.find((s) => s.id === id);
      return status?.label || id;
    },
    [statuses]
  );

  const getPriorityLabel = useCallback(
    (id: ProjectPriority) => {
      const priority = priorities.find((p) => p.id === id);
      return priority?.label || id;
    },
    [priorities]
  );

  const getSttColor = useCallback(
    (name: string) => {
      const stt = sttList.find((s) => s.name === name);
      return stt ? { bg: stt.bg, text: stt.text } : { bg: 'hsl(200 20% 90%)', text: 'hsl(200 20% 35%)' };
    },
    [sttList]
  );

  return (
    <ConfigContext.Provider
      value={{
        statuses,
        priorities,
        sttList,
        addStatus,
        removeStatus,
        updateStatus,
        addPriority,
        removePriority,
        updatePriority,
        addStt,
        removeStt,
        updateStt,
        getStatusLabel,
        getPriorityLabel,
        getSttColor,
      }}
    >
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfig() {
  const context = useContext(ConfigContext);
  if (context === undefined) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
}
