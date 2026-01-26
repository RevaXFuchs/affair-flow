import { Project, MilestoneType } from '@/types/project';

const STORAGE_KEYS = {
  projects: 'affaires-projects',
  settings: 'affaires-settings',
};

export interface MilestoneTypeConfig {
  key: string;
  label: string;
  color: string;
}

export interface SettingsData {
  statuses: { id: string; label: string }[];
  priorities: { id: string; label: string }[];
  sttList: { name: string; bg: string; text: string }[];
  milestoneTypes: MilestoneTypeConfig[];
}

const DEFAULT_STATUSES = [
  { id: 'standby', label: 'Stand-by' },
  { id: 'attente-dp', label: 'Attente DP' },
  { id: 'vt', label: 'VT' },
  { id: 'doe', label: 'DOE' },
  { id: 'en-cours', label: 'En cours' },
  { id: 'gc', label: 'GC' },
  { id: 'pre-sav', label: 'Pré-SAV' },
  { id: 'cat', label: 'CAT' },
  { id: 'factu', label: 'Factu' },
  { id: 'consuel', label: 'Consuel' },
  { id: 'enedis', label: 'Enedis' },
  { id: 'termine', label: 'Terminé' },
];

const DEFAULT_PRIORITIES = [
  { id: 'low', label: 'Basse' },
  { id: 'medium', label: 'Moyenne' },
  { id: 'high', label: 'Haute' },
  { id: 'very-high', label: 'Très haute' },
];

const DEFAULT_STT_LIST = [
  { name: 'ENSIO', bg: 'hsl(217 91% 90%)', text: 'hsl(217 91% 35%)' },
  { name: 'OKERMAD', bg: 'hsl(142 71% 90%)', text: 'hsl(142 71% 30%)' },
  { name: 'SVEG', bg: 'hsl(32 95% 90%)', text: 'hsl(32 95% 35%)' },
  { name: 'ALTEC', bg: 'hsl(280 65% 90%)', text: 'hsl(280 65% 35%)' },
  { name: 'NEXANS', bg: 'hsl(0 84% 90%)', text: 'hsl(0 84% 40%)' },
  { name: 'ENGIE', bg: 'hsl(45 93% 90%)', text: 'hsl(45 93% 35%)' },
];

const DEFAULT_MILESTONE_TYPES: MilestoneTypeConfig[] = [
  { key: 'vt', label: 'VT', color: 'hsl(217 91% 60%)' },
  { key: 'ltrk', label: 'LTRK', color: 'hsl(280 65% 60%)' },
  { key: 'gc', label: 'GC', color: 'hsl(142 71% 45%)' },
  { key: 'montage', label: 'Montage', color: 'hsl(32 95% 55%)' },
  { key: 'grutage', label: 'Grutage', color: 'hsl(0 84% 55%)' },
  { key: 'mer', label: 'MER', color: 'hsl(220 15% 55%)' },
];

const DEFAULT_PROJECTS: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'Projet Alpha - Installation PV',
    ntrk: 'TRK-2024-001',
    sharepointLink: 'https://sharepoint.com/alpha',
    address: '12 rue de la Paix, 75001 Paris',
    status: 'en-cours',
    priority: 'high',
    stt: ['ENSIO', 'OKERMAD'],
    comments: 'Installation panneaux solaires site industriel. RDV prévu semaine 12.',
    milestones: [
      { type: 'vt', startDate: '2024-03-15', completed: true },
      { type: 'ltrk', startDate: '2024-03-20', completed: true },
      { type: 'gc', startDate: '2024-04-01', endDate: '2024-04-05', completed: false },
      { type: 'montage', startDate: '2024-04-10', endDate: '2024-04-15', completed: false },
      { type: 'grutage', startDate: '2024-04-12', completed: false },
      { type: 'mer', startDate: '2024-04-20', completed: false },
    ],
    contacts: [],
    events: [],
  },
  {
    name: 'Projet Beta - Rénovation électrique',
    ntrk: 'TRK-2024-002',
    sharepointLink: 'https://sharepoint.com/beta',
    address: '45 avenue des Champs-Élysées, 75008 Paris',
    status: 'attente-dp',
    priority: 'medium',
    stt: ['SVEG'],
    comments: 'En attente de validation du permis de construire.',
    milestones: [
      { type: 'vt', startDate: '2024-04-01', completed: false },
      { type: 'ltrk', completed: false },
      { type: 'gc', completed: false },
      { type: 'montage', completed: false },
      { type: 'grutage', completed: false },
      { type: 'mer', completed: false },
    ],
    contacts: [],
    events: [],
  },
  {
    name: 'Projet Gamma - Extension réseau',
    ntrk: 'TRK-2024-003',
    address: '8 rue du Commerce, 69001 Lyon',
    status: 'vt',
    priority: 'very-high',
    stt: ['ALTEC', 'NEXANS'],
    comments: 'Visite technique programmée. Client prioritaire.',
    milestones: [
      { type: 'vt', startDate: '2024-03-25', completed: false },
      { type: 'ltrk', startDate: '2024-04-02', completed: false },
      { type: 'gc', startDate: '2024-04-15', endDate: '2024-04-20', completed: false },
      { type: 'montage', startDate: '2024-04-25', endDate: '2024-05-05', completed: false },
      { type: 'grutage', startDate: '2024-04-28', completed: false },
      { type: 'mer', startDate: '2024-05-10', completed: false },
    ],
    contacts: [],
    events: [],
  },
  {
    name: 'Projet Delta - Maintenance préventive',
    ntrk: 'TRK-2024-004',
    sharepointLink: 'https://sharepoint.com/delta',
    address: '23 boulevard Haussmann, 75009 Paris',
    status: 'termine',
    priority: 'low',
    stt: ['ENGIE'],
    comments: 'Projet clôturé avec succès.',
    milestones: [
      { type: 'vt', startDate: '2024-01-10', completed: true },
      { type: 'ltrk', startDate: '2024-01-15', completed: true },
      { type: 'gc', startDate: '2024-01-20', endDate: '2024-01-22', completed: true },
      { type: 'montage', startDate: '2024-01-25', endDate: '2024-01-28', completed: true },
      { type: 'grutage', startDate: '2024-01-26', completed: true },
      { type: 'mer', startDate: '2024-02-01', completed: true },
    ],
    contacts: [],
    events: [],
  },
  {
    name: 'Projet Epsilon - Nouveau raccordement',
    ntrk: 'TRK-2024-005',
    status: 'standby',
    priority: 'medium',
    stt: ['OKERMAD'],
    comments: 'En attente de confirmation client.',
    milestones: [
      { type: 'vt', completed: false },
      { type: 'ltrk', completed: false },
      { type: 'gc', completed: false },
      { type: 'montage', completed: false },
      { type: 'grutage', completed: false },
      { type: 'mer', completed: false },
    ],
    contacts: [],
    events: [],
  },
  {
    name: 'Projet Zeta - Installation industrielle',
    ntrk: 'TRK-2024-006',
    sharepointLink: 'https://sharepoint.com/zeta',
    address: '156 rue de la République, 13001 Marseille',
    status: 'consuel',
    priority: 'high',
    stt: ['ENSIO', 'SVEG', 'ALTEC'],
    comments: 'En attente validation Consuel. Prévoir relance si pas de retour.',
    milestones: [
      { type: 'vt', startDate: '2024-02-01', completed: true },
      { type: 'ltrk', startDate: '2024-02-10', completed: true },
      { type: 'gc', startDate: '2024-02-15', endDate: '2024-02-20', completed: true },
      { type: 'montage', startDate: '2024-02-25', endDate: '2024-03-05', completed: true },
      { type: 'grutage', startDate: '2024-02-28', completed: true },
      { type: 'mer', startDate: '2024-03-10', completed: true },
    ],
    contacts: [],
    events: [],
  },
  {
    name: 'Projet Eta - Remplacement transformateur',
    ntrk: 'TRK-2024-007',
    address: '78 avenue Jean Jaurès, 31000 Toulouse',
    status: 'gc',
    priority: 'high',
    stt: ['NEXANS'],
    comments: 'Travaux de génie civil en cours.',
    milestones: [
      { type: 'vt', startDate: '2024-03-01', completed: true },
      { type: 'ltrk', startDate: '2024-03-08', completed: true },
      { type: 'gc', startDate: '2024-03-20', endDate: '2024-03-28', completed: false },
      { type: 'montage', startDate: '2024-04-02', endDate: '2024-04-08', completed: false },
      { type: 'grutage', startDate: '2024-04-05', completed: false },
      { type: 'mer', startDate: '2024-04-15', completed: false },
    ],
    contacts: [],
    events: [],
  },
  {
    name: 'Projet Theta - Mise en conformité',
    ntrk: 'TRK-2024-008',
    sharepointLink: 'https://sharepoint.com/theta',
    address: '34 rue Sainte-Catherine, 33000 Bordeaux',
    status: 'factu',
    priority: 'low',
    stt: ['ENGIE', 'OKERMAD'],
    comments: 'Facturation en cours. Attente paiement client.',
    milestones: [
      { type: 'vt', startDate: '2024-01-15', completed: true },
      { type: 'ltrk', startDate: '2024-01-22', completed: true },
      { type: 'gc', startDate: '2024-02-01', endDate: '2024-02-05', completed: true },
      { type: 'montage', startDate: '2024-02-10', endDate: '2024-02-15', completed: true },
      { type: 'grutage', startDate: '2024-02-12', completed: true },
      { type: 'mer', startDate: '2024-02-20', completed: true },
    ],
    contacts: [],
    events: [],
  },
];

// Projects Storage
export function loadProjects(): Project[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.projects);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading projects:', error);
  }
  
  // Initialize with default projects
  const now = new Date().toISOString();
  const projects: Project[] = DEFAULT_PROJECTS.map((p, index) => ({
    ...p,
    id: `${Date.now()}-${index}`,
    createdAt: now,
    updatedAt: now,
  }));
  saveProjects(projects);
  return projects;
}

export function saveProjects(projects: Project[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.projects, JSON.stringify(projects));
  } catch (error) {
    console.error('Error saving projects:', error);
  }
}

// Settings Storage
export function loadSettings(): SettingsData {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.settings);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading settings:', error);
  }
  
  // Initialize with defaults
  const settings: SettingsData = {
    statuses: DEFAULT_STATUSES,
    priorities: DEFAULT_PRIORITIES,
    sttList: DEFAULT_STT_LIST,
    milestoneTypes: DEFAULT_MILESTONE_TYPES,
  };
  saveSettings(settings);
  return settings;
}

export function saveSettings(settings: SettingsData): void {
  try {
    localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving settings:', error);
  }
}

export { DEFAULT_STATUSES, DEFAULT_PRIORITIES, DEFAULT_STT_LIST, DEFAULT_MILESTONE_TYPES };
