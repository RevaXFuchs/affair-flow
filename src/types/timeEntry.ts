// Time entry types for tracking time spent on projects

export type TimeCategory = 'TRAJET' | 'ADMIN' | 'EXEC' | 'AUTRE';
export type TimeEntryKind = 'ACTUAL' | 'FORECAST';
export type TimeEntrySource = 'TIMER' | 'MANUAL' | 'TRAVEL_DEFAULT' | 'CALENDAR';

export interface TimeEntry {
  id: string;
  projectId: string;
  category: TimeCategory;
  kind: TimeEntryKind;
  minutes: number;
  date: string; // YYYY-MM-DD
  note?: string;
  createdAt: string;
  updatedAt?: string;
  source: TimeEntrySource;
}

export interface TimeSummary {
  totalActual: number;
  totalForecast: number;
  byCategory: {
    [key in TimeCategory]: {
      actual: number;
      forecast: number;
    };
  };
}

export interface TimeCategoryConfig {
  key: TimeCategory;
  label: string;
  color: string;
  minMinutes?: number; // Minimum minutes required (e.g., 30 for ADMIN/EXEC)
}

export const DEFAULT_TIME_CATEGORIES: TimeCategoryConfig[] = [
  { key: 'TRAJET', label: 'Trajet', color: 'hsl(200 70% 50%)' },
  { key: 'ADMIN', label: 'Administratif', color: 'hsl(280 60% 55%)', minMinutes: 30 },
  { key: 'EXEC', label: 'Dossier d\'exécution', color: 'hsl(142 60% 45%)', minMinutes: 30 },
  { key: 'AUTRE', label: 'Autre', color: 'hsl(45 80% 50%)' },
];

export const TIME_CATEGORY_LABELS: Record<TimeCategory, string> = {
  TRAJET: 'Trajet',
  ADMIN: 'Administratif',
  EXEC: 'Dossier d\'exécution',
  AUTRE: 'Autre',
};

// Helper function to format minutes to hours:minutes display
export function formatMinutesToDisplay(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}min`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h${mins.toString().padStart(2, '0')}`;
}

// Calculate time summary for a project
export function calculateTimeSummary(entries: TimeEntry[]): TimeSummary {
  const summary: TimeSummary = {
    totalActual: 0,
    totalForecast: 0,
    byCategory: {
      TRAJET: { actual: 0, forecast: 0 },
      ADMIN: { actual: 0, forecast: 0 },
      EXEC: { actual: 0, forecast: 0 },
      AUTRE: { actual: 0, forecast: 0 },
    },
  };

  entries.forEach((entry) => {
    if (entry.kind === 'ACTUAL') {
      summary.totalActual += entry.minutes;
      summary.byCategory[entry.category].actual += entry.minutes;
    } else {
      summary.totalForecast += entry.minutes;
      summary.byCategory[entry.category].forecast += entry.minutes;
    }
  });

  return summary;
}
