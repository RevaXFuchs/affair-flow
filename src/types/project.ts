export type ProjectStatus = 
  | 'standby'
  | 'attente-dp'
  | 'vt'
  | 'doe'
  | 'en-cours'
  | 'gc'
  | 'pre-sav'
  | 'cat'
  | 'factu'
  | 'consuel'
  | 'enedis'
  | 'termine';

export type ProjectPriority = 'low' | 'medium' | 'high' | 'very-high';

export type MilestoneType = 'vt' | 'ltrk' | 'gc' | 'montage' | 'grutage' | 'mer';

export interface Milestone {
  type: MilestoneType;
  startDate?: string;
  endDate?: string;
  completed: boolean;
}

export interface Project {
  id: string;
  name: string;
  ntrk?: string;
  sharepointLink?: string;
  address?: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  stt?: string[];
  comments?: string;
  milestones: Milestone[];
  createdAt: string;
  updatedAt: string;
}

// STT Colors mapping
export const STT_COLORS: Record<string, { bg: string; text: string }> = {
  'ENSIO': { bg: 'hsl(217 91% 90%)', text: 'hsl(217 91% 35%)' },
  'OKERMAD': { bg: 'hsl(142 71% 90%)', text: 'hsl(142 71% 30%)' },
  'SVEG': { bg: 'hsl(32 95% 90%)', text: 'hsl(32 95% 35%)' },
  'ALTEC': { bg: 'hsl(280 65% 90%)', text: 'hsl(280 65% 35%)' },
  'NEXANS': { bg: 'hsl(0 84% 90%)', text: 'hsl(0 84% 40%)' },
  'ENGIE': { bg: 'hsl(45 93% 90%)', text: 'hsl(45 93% 35%)' },
};

export interface ProjectFilter {
  status?: ProjectStatus[];
  priority?: ProjectPriority[];
  search?: string;
  stt?: string[];
}

export const STATUS_LABELS: Record<ProjectStatus, string> = {
  'standby': 'Stand-by',
  'attente-dp': 'Attente DP',
  'vt': 'VT',
  'doe': 'DOE',
  'en-cours': 'En cours',
  'gc': 'GC',
  'pre-sav': 'Pré-SAV',
  'cat': 'CAT',
  'factu': 'Factu',
  'consuel': 'Consuel',
  'enedis': 'Enedis',
  'termine': 'Terminé',
};

export const STATUS_STYLES: Record<ProjectStatus, string> = {
  'standby': 'status-standby',
  'attente-dp': 'status-waiting',
  'vt': 'status-inprogress',
  'doe': 'status-inprogress',
  'en-cours': 'status-inprogress',
  'gc': 'status-inprogress',
  'pre-sav': 'status-waiting',
  'cat': 'status-todo',
  'factu': 'status-waiting',
  'consuel': 'status-waiting',
  'enedis': 'status-waiting',
  'termine': 'status-done',
};

export const PRIORITY_LABELS: Record<ProjectPriority, string> = {
  'low': 'Basse',
  'medium': 'Moyenne',
  'high': 'Haute',
  'very-high': 'Très haute',
};

export const PRIORITY_STYLES: Record<ProjectPriority, string> = {
  'low': 'priority-low',
  'medium': 'priority-medium',
  'high': 'priority-high',
  'very-high': 'priority-very-high',
};

export const MILESTONE_LABELS: Record<MilestoneType, string> = {
  'vt': 'VT',
  'ltrk': 'LTRK',
  'gc': 'GC',
  'montage': 'Montage',
  'grutage': 'Grutage',
  'mer': 'MER',
};

export const STT_OPTIONS = [
  'ENSIO',
  'OKERMAD',
  'SVEG',
  'ALTEC',
  'NEXANS',
  'ENGIE',
];
