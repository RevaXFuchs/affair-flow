import { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, AlertCircle, CheckCircle2, AlertTriangle, X } from 'lucide-react';
import { parseCSV, autoMapColumns, validateAndImport, ColumnMapping, ValidationError, ImportResult } from '@/lib/csvUtils';
import { useProjects } from '@/context/ProjectContext';

interface ImportCSVDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type ImportStep = 'upload' | 'mapping' | 'validation' | 'complete';

const FIELD_LABELS: Record<keyof ColumnMapping, string> = {
  planif: 'Planif',
  name: 'Nom du projet *',
  sharepointLink: 'Lien Sharepoint',
  status: 'État',
  ntrk: 'n TRK',
  priority: 'Priorité',
  dateVT: 'Date VT',
  dateLTRK: 'Date L.TRK',
  dateGC: 'Dates GC',
  dateMontage: 'Date Montage',
  dateGrutage: 'Date Grutage',
  stt: 'STT',
  comments: 'Commentaire',
  cmdSTT: 'CMD STT',
  cmdEngins: 'CMD ENGINS',
  dateMER: 'Date MER',
  lastModified: 'Dernière modification',
  owner: 'Propriétaire',
  commercial: 'Commercial',
  projectManager: 'Chef de projet',
  amount: 'Montant',
  feeling: 'Ressenti',
};

export function ImportCSVDialog({ open, onOpenChange }: ImportCSVDialogProps) {
  const { addProject } = useProjects();
  const [step, setStep] = useState<ImportStep>('upload');
  const [csvContent, setCsvContent] = useState<string>('');
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<string[][]>([]);
  const [mapping, setMapping] = useState<ColumnMapping>({
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
  });
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [importedCount, setImportedCount] = useState(0);

  const resetState = useCallback(() => {
    setStep('upload');
    setCsvContent('');
    setHeaders([]);
    setRows([]);
    setMapping({
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
    });
    setImportResult(null);
    setImportedCount(0);
  }, []);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setCsvContent(content);
      
      const { headers: parsedHeaders, rows: parsedRows } = parseCSV(content);
      setHeaders(parsedHeaders);
      setRows(parsedRows);
      
      const autoMapping = autoMapColumns(parsedHeaders);
      setMapping(autoMapping);
      setStep('mapping');
    };
    reader.readAsText(file);
  }, []);

  const handleMappingChange = useCallback((field: keyof ColumnMapping, value: string) => {
    setMapping(prev => ({
      ...prev,
      [field]: value === '__none__' ? null : value,
    }));
  }, []);

  const handleValidate = useCallback(() => {
    const result = validateAndImport(rows, headers, mapping);
    setImportResult(result);
    setStep('validation');
  }, [rows, headers, mapping]);

  const handleImport = useCallback(() => {
    if (!importResult) return;

    importResult.projects.forEach(project => {
      addProject(project);
    });

    setImportedCount(importResult.projects.length);
    setStep('complete');
  }, [importResult, addProject]);

  const handleClose = useCallback(() => {
    resetState();
    onOpenChange(false);
  }, [resetState, onOpenChange]);

  const renderUploadStep = () => (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
        <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-sm text-muted-foreground mb-4">
          Glissez-déposez un fichier CSV ou cliquez pour sélectionner
        </p>
        <input
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          className="hidden"
          id="csv-upload"
        />
        <Button asChild variant="outline">
          <label htmlFor="csv-upload" className="cursor-pointer">
            <FileText className="mr-2 h-4 w-4" />
            Sélectionner un fichier CSV
          </label>
        </Button>
      </div>
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Le fichier CSV doit contenir au minimum une colonne pour le nom du projet.
          Les dates doivent être au format JJ/MM/AAAA.
        </AlertDescription>
      </Alert>
    </div>
  );

  const renderMappingStep = () => (
    <div className="space-y-4">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {rows.length} lignes détectées. Mappez les colonnes CSV avec les champs de l'application.
        </AlertDescription>
      </Alert>
      
      <ScrollArea className="h-[400px] pr-4">
        <div className="space-y-4">
          {(Object.keys(FIELD_LABELS) as Array<keyof ColumnMapping>).map((field) => (
            <div key={field} className="grid grid-cols-2 gap-4 items-center">
              <Label className="text-sm font-medium">{FIELD_LABELS[field]}</Label>
              <Select
                value={mapping[field] || '__none__'}
                onValueChange={(value) => handleMappingChange(field, value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Non mappé" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Non mappé</SelectItem>
                  {headers.map((header) => (
                    <SelectItem key={header} value={header}>
                      {header}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
      </ScrollArea>

      <DialogFooter>
        <Button variant="outline" onClick={() => setStep('upload')}>
          Retour
        </Button>
        <Button onClick={handleValidate} disabled={!mapping.name}>
          Valider le mapping
        </Button>
      </DialogFooter>
    </div>
  );

  const renderValidationStep = () => {
    if (!importResult) return null;

    return (
      <div className="space-y-4">
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            <span className="text-sm">{importResult.projects.length} projets valides</span>
          </div>
          {importResult.errors.length > 0 && (
            <div className="flex items-center gap-2">
              <X className="h-5 w-5 text-destructive" />
              <span className="text-sm">{importResult.errors.length} erreurs</span>
            </div>
          )}
          {importResult.warnings.length > 0 && (
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              <span className="text-sm">{importResult.warnings.length} avertissements</span>
            </div>
          )}
        </div>

        <ScrollArea className="h-[300px]">
          {importResult.errors.length > 0 && (
            <div className="space-y-2 mb-4">
              <h4 className="text-sm font-medium text-destructive">Erreurs (non importés)</h4>
              {importResult.errors.map((error, index) => (
                <Alert key={index} variant="destructive">
                  <AlertDescription className="text-xs">
                    Ligne {error.row}: {error.message}
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          )}

          {importResult.warnings.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-yellow-600">Avertissements (seront importés avec valeurs par défaut)</h4>
              {importResult.warnings.map((warning, index) => (
                <Alert key={index} className="border-yellow-500/50 bg-yellow-500/10">
                  <AlertDescription className="text-xs">
                    Ligne {warning.row}: {warning.message}
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          )}

          {importResult.errors.length === 0 && importResult.warnings.length === 0 && (
            <Alert className="border-green-500/50 bg-green-500/10">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <AlertDescription>
                Toutes les données sont valides et prêtes à être importées.
              </AlertDescription>
            </Alert>
          )}
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => setStep('mapping')}>
            Retour
          </Button>
          <Button onClick={handleImport} disabled={importResult.projects.length === 0}>
            Importer {importResult.projects.length} projet{importResult.projects.length > 1 ? 's' : ''}
          </Button>
        </DialogFooter>
      </div>
    );
  };

  const renderCompleteStep = () => (
    <div className="space-y-4 text-center py-8">
      <CheckCircle2 className="mx-auto h-16 w-16 text-green-500" />
      <h3 className="text-lg font-medium">Import terminé</h3>
      <p className="text-muted-foreground">
        {importedCount} projet{importedCount > 1 ? 's ont été importés' : ' a été importé'} avec succès.
      </p>
      <DialogFooter className="justify-center">
        <Button onClick={handleClose}>Fermer</Button>
      </DialogFooter>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Importer des projets
          </DialogTitle>
          <DialogDescription>
            {step === 'upload' && 'Sélectionnez un fichier CSV à importer'}
            {step === 'mapping' && 'Mappez les colonnes du fichier CSV'}
            {step === 'validation' && 'Vérifiez les données avant import'}
            {step === 'complete' && 'Import terminé'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-center gap-2 mb-4">
          {['upload', 'mapping', 'validation', 'complete'].map((s, index) => (
            <Badge
              key={s}
              variant={step === s ? 'default' : 'outline'}
              className="text-xs"
            >
              {index + 1}. {s === 'upload' ? 'Fichier' : s === 'mapping' ? 'Mapping' : s === 'validation' ? 'Validation' : 'Terminé'}
            </Badge>
          ))}
        </div>

        {step === 'upload' && renderUploadStep()}
        {step === 'mapping' && renderMappingStep()}
        {step === 'validation' && renderValidationStep()}
        {step === 'complete' && renderCompleteStep()}
      </DialogContent>
    </Dialog>
  );
}
