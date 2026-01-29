import { Project, ProjectStatus, ProjectPriority, Milestone, MilestoneType } from '@/types/project';

// Status mapping from French CSV values to system values
const STATUS_MAP: Record<string, ProjectStatus> = {
  'stand-by': 'standby',
  'standby': 'standby',
  'attente dp': 'attente-dp',
  'attente-dp': 'attente-dp',
  'vt': 'vt',
  'doe': 'doe',
  'en cours': 'en-cours',
  'en-cours': 'en-cours',
  'gc': 'gc',
  'pré-sav': 'pre-sav',
  'pre-sav': 'pre-sav',
  'cat': 'cat',
  'factu': 'factu',
  'consuel': 'consuel',
  'enedis': 'enedis',
  'enedis warn': 'enedis',
  'terminé': 'termine',
  'termine': 'termine',
};

const PRIORITY_MAP: Record<string, ProjectPriority> = {
  'basse': 'low',
  'low': 'low',
  'moyenne': 'medium',
  'medium': 'medium',
  'haute': 'high',
  'high': 'high',
  'très haute': 'very-high',
  'very-high': 'very-high',
  'pik zoizo': 'high', // Map custom priority to high
};

export interface CSVColumn {
  csvHeader: string;
  mappedField: string | null;
}

export interface ColumnMapping {
  planif: string | null;
  name: string | null;
  sharepointLink: string | null;
  status: string | null;
  ntrk: string | null;
  priority: string | null;
  dateVT: string | null;
  dateLTRK: string | null;
  dateGC: string | null;
  dateMontage: string | null;
  dateGrutage: string | null;
  stt: string | null;
  comments: string | null;
  cmdSTT: string | null;
  cmdEngins: string | null;
  dateMER: string | null;
  lastModified: string | null;
  owner: string | null;
  commercial: string | null;
  projectManager: string | null;
  amount: string | null;
  feeling: string | null;
}

export interface ValidationError {
  row: number;
  field: string;
  value: string;
  message: string;
}

export interface ImportResult {
  projects: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>[];
  errors: ValidationError[];
  warnings: ValidationError[];
}

// Default column mapping based on common CSV headers (Notion export)
export const DEFAULT_COLUMN_MAPPING: Record<string, keyof ColumnMapping> = {
  'planif': 'planif',
  'nom du projet': 'name',
  'nom': 'name',
  'name': 'name',
  'lien sharepoint': 'sharepointLink',
  'sharepoint': 'sharepointLink',
  'état': 'status',
  'etat': 'status',
  'status': 'status',
  'n trk': 'ntrk',
  'ntrk': 'ntrk',
  'priorité': 'priority',
  'priorite': 'priority',
  'priority': 'priority',
  'date vt': 'dateVT',
  'date l.trk': 'dateLTRK',
  'dates gc': 'dateGC',
  'date gc': 'dateGC',
  'date montage': 'dateMontage',
  'date grutage': 'dateGrutage',
  'stt': 'stt',
  'commentaire': 'comments',
  'comments': 'comments',
  'cmd stt': 'cmdSTT',
  'cmd engins': 'cmdEngins',
  'date mer': 'dateMER',
  'dernière modification': 'lastModified',
  'derniere modification': 'lastModified',
  'propriétaire': 'owner',
  'proprietaire': 'owner',
  'commercial': 'commercial',
  'chef de projet': 'projectManager',
  'montant': 'amount',
  'ressenti': 'feeling',
};

export function parseCSV(content: string): { headers: string[]; rows: string[][] } {
  const lines = content.split(/\r?\n/).filter(line => line.trim());
  if (lines.length === 0) return { headers: [], rows: [] };

  // Detect delimiter (comma, semicolon, or tab)
  const firstLine = lines[0].replace(/^\uFEFF/, '');
  let delimiter = ',';
  const semicolonCount = (firstLine.match(/;/g) || []).length;
  const commaCount = (firstLine.match(/,/g) || []).length;
  const tabCount = (firstLine.match(/\t/g) || []).length;
  
  if (semicolonCount > commaCount && semicolonCount > tabCount) {
    delimiter = ';';
  } else if (tabCount > commaCount && tabCount > semicolonCount) {
    delimiter = '\t';
  }

  const parseRow = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === delimiter && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  // Remove BOM if present
  const headerLine = firstLine;
  const headers = parseRow(headerLine);
  const rows = lines.slice(1).map(parseRow);

  return { headers, rows };
}

export function autoMapColumns(headers: string[]): ColumnMapping {
  const mapping: ColumnMapping = {
    planif: null,
    name: null,
    sharepointLink: null,
    status: null,
    ntrk: null,
    priority: null,
    dateVT: null,
    dateLTRK: null,
    dateGC: null,
    dateMontage: null,
    dateGrutage: null,
    stt: null,
    comments: null,
    cmdSTT: null,
    cmdEngins: null,
    dateMER: null,
    lastModified: null,
    owner: null,
    commercial: null,
    projectManager: null,
    amount: null,
    feeling: null,
  };

  headers.forEach(header => {
    const normalizedHeader = header.toLowerCase().trim();
    const mappedField = DEFAULT_COLUMN_MAPPING[normalizedHeader];
    if (mappedField && mapping[mappedField] === null) {
      mapping[mappedField] = header;
    }
  });

  return mapping;
}

function parseDate(value: string): string | undefined {
  if (!value || value.trim() === '') return undefined;
  
  // Handle date ranges like "21/05/2024 → 23/05/2024"
  const rangeSeparators = ['→', '->', ' - ', ' au '];
  for (const sep of rangeSeparators) {
    if (value.includes(sep)) {
      const parts = value.split(sep);
      if (parts.length === 2) {
        return parseDate(parts[0].trim());
      }
    }
  }

  // Try DD/MM/YYYY format
  const ddmmyyyy = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
  const match = value.match(ddmmyyyy);
  if (match) {
    const [, day, month, year] = match;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  // Try YYYY-MM-DD format
  const yyyymmdd = /^(\d{4})-(\d{2})-(\d{2})$/;
  if (yyyymmdd.test(value)) {
    return value;
  }

  return undefined;
}

function parseDateRange(value: string): { startDate?: string; endDate?: string } {
  if (!value || value.trim() === '') return {};
  
  const rangeSeparators = ['→', '->', ' - ', ' au '];
  for (const sep of rangeSeparators) {
    if (value.includes(sep)) {
      const parts = value.split(sep);
      if (parts.length === 2) {
        return {
          startDate: parseDate(parts[0].trim()),
          endDate: parseDate(parts[1].trim()),
        };
      }
    }
  }

  const singleDate = parseDate(value);
  return { startDate: singleDate };
}

function parseStatus(value: string): ProjectStatus | null {
  if (!value || value.trim() === '') return null;
  const normalized = value.toLowerCase().trim();
  return STATUS_MAP[normalized] || null;
}

function parsePriority(value: string): ProjectPriority | null {
  if (!value || value.trim() === '') return null;
  const normalized = value.toLowerCase().trim();
  return PRIORITY_MAP[normalized] || null;
}

function parseSTT(value: string): string[] {
  if (!value || value.trim() === '') return [];
  return value.split(/[,;]/).map(s => s.trim()).filter(Boolean);
}

export function validateAndImport(
  rows: string[][],
  headers: string[],
  mapping: ColumnMapping
): ImportResult {
  const projects: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>[] = [];
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  const getColumnIndex = (columnName: string | null): number => {
    if (!columnName) return -1;
    return headers.indexOf(columnName);
  };

  rows.forEach((row, rowIndex) => {
    const rowNumber = rowIndex + 2; // +2 for 1-indexed and header row

    // Get name (required)
    const nameIndex = getColumnIndex(mapping.name);
    const name = nameIndex >= 0 ? row[nameIndex]?.trim() : '';
    
    if (!name) {
      errors.push({
        row: rowNumber,
        field: 'name',
        value: '',
        message: 'Le nom du projet est requis',
      });
      return;
    }

    // Parse status
    const statusIndex = getColumnIndex(mapping.status);
    const statusValue = statusIndex >= 0 ? row[statusIndex] : '';
    let status = parseStatus(statusValue);
    
    if (!status) {
      if (statusValue) {
        warnings.push({
          row: rowNumber,
          field: 'status',
          value: statusValue,
          message: `Statut non reconnu "${statusValue}", défini sur "standby"`,
        });
      }
      status = 'standby';
    }

    // Parse priority
    const priorityIndex = getColumnIndex(mapping.priority);
    const priorityValue = priorityIndex >= 0 ? row[priorityIndex] : '';
    let priority = parsePriority(priorityValue);
    
    if (!priority) {
      if (priorityValue) {
        warnings.push({
          row: rowNumber,
          field: 'priority',
          value: priorityValue,
          message: `Priorité non reconnue "${priorityValue}", définie sur "medium"`,
        });
      }
      priority = 'medium';
    }

    // Parse other fields
    const sharepointIndex = getColumnIndex(mapping.sharepointLink);
    const ntrkIndex = getColumnIndex(mapping.ntrk);
    const sttIndex = getColumnIndex(mapping.stt);
    const commentsIndex = getColumnIndex(mapping.comments);

    // Parse milestones
    const milestones: Milestone[] = [];
    
    const milestoneFields: { type: MilestoneType; field: keyof ColumnMapping }[] = [
      { type: 'vt', field: 'dateVT' },
      { type: 'ltrk', field: 'dateLTRK' },
      { type: 'gc', field: 'dateGC' },
      { type: 'montage', field: 'dateMontage' },
      { type: 'grutage', field: 'dateGrutage' },
      { type: 'mer', field: 'dateMER' },
    ];

    milestoneFields.forEach(({ type, field }) => {
      const index = getColumnIndex(mapping[field]);
      const value = index >= 0 ? row[index] : '';
      const { startDate, endDate } = parseDateRange(value);
      
      milestones.push({
        type,
        startDate,
        endDate,
        completed: false,
      });
    });

    projects.push({
      name,
      sharepointLink: sharepointIndex >= 0 ? row[sharepointIndex]?.trim() : undefined,
      status,
      priority,
      ntrk: ntrkIndex >= 0 ? row[ntrkIndex]?.trim() : undefined,
      stt: sttIndex >= 0 ? parseSTT(row[sttIndex]) : undefined,
      comments: commentsIndex >= 0 ? row[commentsIndex]?.trim() : undefined,
      milestones,
    });
  });

  return { projects, errors, warnings };
}

export function exportToCSV(projects: Project[]): string {
  const headers = [
    'Nom du projet',
    'Lien Sharepoint',
    'État',
    'n TRK',
    'Priorité',
    'STT',
    'Commentaire',
    'Date VT',
    'Date L.TRK',
    'Dates GC',
    'Date Montage',
    'Date Grutage',
    'Date MER',
  ];

  const statusLabels: Record<ProjectStatus, string> = {
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

  const priorityLabels: Record<ProjectPriority, string> = {
    'low': 'Basse',
    'medium': 'Moyenne',
    'high': 'Haute',
    'very-high': 'Très haute',
  };

  const formatDate = (date?: string): string => {
    if (!date) return '';
    const [year, month, day] = date.split('-');
    return `${day}/${month}/${year}`;
  };

  const formatMilestone = (milestone?: Milestone): string => {
    if (!milestone) return '';
    if (milestone.startDate && milestone.endDate) {
      return `${formatDate(milestone.startDate)} → ${formatDate(milestone.endDate)}`;
    }
    return formatDate(milestone.startDate);
  };

  const escapeCSV = (value: string | undefined): string => {
    if (!value) return '';
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  };

  const rows = projects.map(project => {
    const getMilestone = (type: MilestoneType) => 
      project.milestones.find(m => m.type === type);

    return [
      escapeCSV(project.name),
      escapeCSV(project.sharepointLink),
      statusLabels[project.status],
      escapeCSV(project.ntrk),
      priorityLabels[project.priority],
      escapeCSV(project.stt?.join(', ')),
      escapeCSV(project.comments),
      formatMilestone(getMilestone('vt')),
      formatMilestone(getMilestone('ltrk')),
      formatMilestone(getMilestone('gc')),
      formatMilestone(getMilestone('montage')),
      formatMilestone(getMilestone('grutage')),
      formatMilestone(getMilestone('mer')),
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

export function downloadCSV(content: string, filename: string): void {
  const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}
