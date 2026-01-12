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
  status: ProjectStatus;
  priority: ProjectPriority;
  stt?: string[];
  comments?: string;
  milestones: Milestone[];
  createdAt: string;
  updatedAt: string;
}

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
