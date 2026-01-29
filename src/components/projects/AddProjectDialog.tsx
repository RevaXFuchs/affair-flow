import { useState } from 'react';
import { Project, MilestoneType } from '@/types/project';
import { useSettings } from '@/context/SettingsContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, Plus, X } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface AddProjectDialogProps {
  onAddProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => void;
  trigger?: React.ReactNode;
}

export function AddProjectDialog({ onAddProject, trigger }: AddProjectDialogProps) {
  const { settings } = useSettings();
  const [isOpen, setIsOpen] = useState(false);
  
  // Form state
  const [name, setName] = useState('');
  const [ntrk, setNtrk] = useState('');
  const [address, setAddress] = useState('');
  const [sharepointLink, setSharepointLink] = useState('');
  const [status, setStatus] = useState(settings.statuses[0]?.id || 'standby');
  const [priority, setPriority] = useState(settings.priorities[1]?.id || 'medium');
  const [selectedSTT, setSelectedSTT] = useState<string[]>([]);
  const [comments, setComments] = useState('');
  const [milestoneDates, setMilestoneDates] = useState<Record<MilestoneType, Date | undefined>>({
    vt: undefined,
    ltrk: undefined,
    gc: undefined,
    montage: undefined,
    grutage: undefined,
    mer: undefined,
  });

  const resetForm = () => {
    setName('');
    setNtrk('');
    setAddress('');
    setSharepointLink('');
    setStatus(settings.statuses[0]?.id || 'standby');
    setPriority(settings.priorities[1]?.id || 'medium');
    setSelectedSTT([]);
    setComments('');
    setMilestoneDates({
      vt: undefined,
      ltrk: undefined,
      gc: undefined,
      montage: undefined,
      grutage: undefined,
      mer: undefined,
    });
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      toast.error('Le nom du projet est requis');
      return;
    }

    const milestones = settings.milestoneTypes.map((type) => ({
      type: type.key as MilestoneType,
      startDate: milestoneDates[type.key as MilestoneType]?.toISOString().split('T')[0],
      completed: false,
    }));

    onAddProject({
      name: name.trim(),
      ntrk: ntrk.trim() || undefined,
      address: address.trim() || undefined,
      sharepointLink: sharepointLink.trim() || undefined,
      status: status as any,
      priority: priority as any,
      stt: selectedSTT.length > 0 ? selectedSTT : undefined,
      comments: comments.trim() || undefined,
      milestones,
      contacts: [],
      events: [],
    });

    toast.success('Projet créé avec succès');
    resetForm();
    setIsOpen(false);
  };

  const toggleSTT = (stt: string) => {
    setSelectedSTT((prev) =>
      prev.includes(stt) ? prev.filter((s) => s !== stt) : [...prev, stt]
    );
  };

  const setMilestoneDate = (type: MilestoneType, date: Date | undefined) => {
    setMilestoneDates((prev) => ({ ...prev, [type]: date }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus size={18} className="mr-2" />
            Nouvelle affaire
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nouvelle affaire</DialogTitle>
          <DialogDescription>
            Créez un nouveau projet avec ses informations de base
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Informations de base */}
          <div className="space-y-4">
            <h3 className="font-medium text-sm text-muted-foreground">Informations générales</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <Label>Nom du projet *</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Installation PV - Client ABC"
                />
              </div>

              <div className="space-y-2">
                <Label>n° TRK</Label>
                <Input
                  value={ntrk}
                  onChange={(e) => setNtrk(e.target.value)}
                  placeholder="Ex: TRK-2024-001"
                />
              </div>

              <div className="space-y-2">
                <Label>Adresse</Label>
                <Input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Adresse du chantier"
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label>Lien SharePoint</Label>
                <Input
                  value={sharepointLink}
                  onChange={(e) => setSharepointLink(e.target.value)}
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>

          {/* Statut et Priorité */}
          <div className="space-y-4">
            <h3 className="font-medium text-sm text-muted-foreground">Statut et priorité</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Statut</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {settings.statuses.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Priorité</Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {settings.priorities.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* STT Tags */}
          <div className="space-y-4">
            <h3 className="font-medium text-sm text-muted-foreground">Sous-traitants (STT)</h3>
            <div className="flex flex-wrap gap-2">
              {settings.sttList.map((stt) => (
                <Badge
                  key={stt.name}
                  variant={selectedSTT.includes(stt.name) ? 'default' : 'outline'}
                  className="cursor-pointer transition-colors"
                  style={
                    selectedSTT.includes(stt.name)
                      ? { backgroundColor: stt.bg, color: stt.text }
                      : {}
                  }
                  onClick={() => toggleSTT(stt.name)}
                >
                  {stt.name}
                  {selectedSTT.includes(stt.name) && (
                    <X size={12} className="ml-1" />
                  )}
                </Badge>
              ))}
            </div>
          </div>

          {/* Jalons */}
          <div className="space-y-4">
            <h3 className="font-medium text-sm text-muted-foreground">Dates des jalons</h3>
            <div className="grid grid-cols-3 gap-3">
              {settings.milestoneTypes.map((type) => (
                <div key={type.key} className="space-y-1">
                  <Label className="text-xs">{type.label}</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !milestoneDates[type.key as MilestoneType] && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-3 w-3" />
                        {milestoneDates[type.key as MilestoneType]
                          ? format(milestoneDates[type.key as MilestoneType]!, 'dd/MM/yy', { locale: fr })
                          : '—'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={milestoneDates[type.key as MilestoneType]}
                        onSelect={(date) => setMilestoneDate(type.key as MilestoneType, date)}
                        locale={fr}
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              ))}
            </div>
          </div>

          {/* Commentaires */}
          <div className="space-y-2">
            <Label>Commentaires</Label>
            <Textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Notes, remarques..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Annuler
          </Button>
          <Button onClick={handleSubmit}>Créer le projet</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
