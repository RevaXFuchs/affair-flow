import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { loadSettings, saveSettings, SettingsData, MilestoneTypeConfig } from '@/lib/storage';
import { toast } from 'sonner';

interface SettingsContextType {
  settings: SettingsData;
  // Statuses
  addStatus: (id: string, label: string) => void;
  removeStatus: (id: string, remapTo?: string) => void;
  updateStatus: (id: string, label: string) => void;
  getStatusLabel: (id: string) => string;
  // Priorities
  addPriority: (id: string, label: string) => void;
  removePriority: (id: string, remapTo?: string) => void;
  updatePriority: (id: string, label: string) => void;
  getPriorityLabel: (id: string) => string;
  // STT
  addStt: (name: string, bg: string, text: string) => void;
  removeStt: (name: string) => void;
  updateStt: (name: string, bg: string, text: string) => void;
  getSttColor: (name: string) => { bg: string; text: string };
  // Milestones
  getMilestoneConfig: (key: string) => MilestoneTypeConfig | undefined;
  getMilestoneColor: (key: string, confirmed: boolean) => string;
  updateMilestoneColor: (key: string, color: string) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SettingsData>(loadSettings);

  // Persist on change
  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  // Status methods
  const addStatus = useCallback((id: string, label: string) => {
    setSettings((prev) => {
      if (prev.statuses.some((s) => s.id === id)) {
        toast.error('Ce statut existe déjà');
        return prev;
      }
      return { ...prev, statuses: [...prev.statuses, { id, label }] };
    });
  }, []);

  const removeStatus = useCallback((id: string, remapTo?: string) => {
    setSettings((prev) => ({
      ...prev,
      statuses: prev.statuses.filter((s) => s.id !== id),
    }));
  }, []);

  const updateStatus = useCallback((id: string, label: string) => {
    setSettings((prev) => ({
      ...prev,
      statuses: prev.statuses.map((s) => (s.id === id ? { ...s, label } : s)),
    }));
  }, []);

  const getStatusLabel = useCallback(
    (id: string) => settings.statuses.find((s) => s.id === id)?.label || id,
    [settings.statuses]
  );

  // Priority methods
  const addPriority = useCallback((id: string, label: string) => {
    setSettings((prev) => {
      if (prev.priorities.some((p) => p.id === id)) {
        toast.error('Cette priorité existe déjà');
        return prev;
      }
      return { ...prev, priorities: [...prev.priorities, { id, label }] };
    });
  }, []);

  const removePriority = useCallback((id: string, remapTo?: string) => {
    setSettings((prev) => ({
      ...prev,
      priorities: prev.priorities.filter((p) => p.id !== id),
    }));
  }, []);

  const updatePriority = useCallback((id: string, label: string) => {
    setSettings((prev) => ({
      ...prev,
      priorities: prev.priorities.map((p) => (p.id === id ? { ...p, label } : p)),
    }));
  }, []);

  const getPriorityLabel = useCallback(
    (id: string) => settings.priorities.find((p) => p.id === id)?.label || id,
    [settings.priorities]
  );

  // STT methods
  const addStt = useCallback((name: string, bg: string, text: string) => {
    setSettings((prev) => {
      if (prev.sttList.some((s) => s.name === name)) {
        toast.error('Cet intervenant existe déjà');
        return prev;
      }
      return { ...prev, sttList: [...prev.sttList, { name, bg, text }] };
    });
  }, []);

  const removeStt = useCallback((name: string) => {
    setSettings((prev) => ({
      ...prev,
      sttList: prev.sttList.filter((s) => s.name !== name),
    }));
  }, []);

  const updateStt = useCallback((name: string, bg: string, text: string) => {
    setSettings((prev) => ({
      ...prev,
      sttList: prev.sttList.map((s) => (s.name === name ? { ...s, bg, text } : s)),
    }));
  }, []);

  const getSttColor = useCallback(
    (name: string) => {
      const stt = settings.sttList.find((s) => s.name === name);
      return stt ? { bg: stt.bg, text: stt.text } : { bg: 'hsl(200 20% 90%)', text: 'hsl(200 20% 35%)' };
    },
    [settings.sttList]
  );

  // Milestone methods
  const getMilestoneConfig = useCallback(
    (key: string) => settings.milestoneTypes.find((m) => m.key === key),
    [settings.milestoneTypes]
  );

  const getMilestoneColor = useCallback(
    (key: string, confirmed: boolean) => {
      const config = settings.milestoneTypes.find((m) => m.key === key);
      if (!config) return 'hsl(220 15% 55%)';
      
      if (confirmed) {
        return config.color;
      }
      // Return a pale version (increased lightness, reduced saturation)
      const match = config.color.match(/hsl\((\d+)\s+(\d+)%\s+(\d+)%\)/);
      if (match) {
        const [, h, s, l] = match;
        return `hsl(${h} ${Math.max(10, parseInt(s) - 40)}% ${Math.min(90, parseInt(l) + 25)}%)`;
      }
      return config.color;
    },
    [settings.milestoneTypes]
  );

  const updateMilestoneColor = useCallback((key: string, color: string) => {
    setSettings((prev) => ({
      ...prev,
      milestoneTypes: prev.milestoneTypes.map((m) =>
        m.key === key ? { ...m, color } : m
      ),
    }));
  }, []);

  return (
    <SettingsContext.Provider
      value={{
        settings,
        addStatus,
        removeStatus,
        updateStatus,
        getStatusLabel,
        addPriority,
        removePriority,
        updatePriority,
        getPriorityLabel,
        addStt,
        removeStt,
        updateStt,
        getSttColor,
        getMilestoneConfig,
        getMilestoneColor,
        updateMilestoneColor,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
