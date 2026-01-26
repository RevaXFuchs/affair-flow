import { useState } from 'react';
import { motion } from 'framer-motion';
import { AppLayout } from '@/components/layout/AppLayout';
import { useSettings } from '@/context/SettingsContext';
import { useProjects } from '@/context/ProjectContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Plus, Trash2, Palette, Edit2, Circle } from 'lucide-react';
import { toast } from 'sonner';

export default function Settings() {
  const {
    settings,
    addStatus,
    removeStatus,
    updateStatus,
    addPriority,
    removePriority,
    updatePriority,
    addStt,
    removeStt,
    updateStt,
    updateMilestoneColor,
  } = useSettings();
  const { projects, remapProjectStatus, remapProjectPriority } = useProjects();

  // New status form
  const [newStatusId, setNewStatusId] = useState('');
  const [newStatusLabel, setNewStatusLabel] = useState('');

  // New priority form
  const [newPriorityId, setNewPriorityId] = useState('');
  const [newPriorityLabel, setNewPriorityLabel] = useState('');

  // New STT form
  const [newSttName, setNewSttName] = useState('');
  const [newSttBg, setNewSttBg] = useState('217 91% 90%');
  const [newSttText, setNewSttText] = useState('217 91% 35%');

  // Remap dialogs
  const [statusToDelete, setStatusToDelete] = useState<string | null>(null);
  const [remapStatusTo, setRemapStatusTo] = useState<string>('');
  const [priorityToDelete, setPriorityToDelete] = useState<string | null>(null);
  const [remapPriorityTo, setRemapPriorityTo] = useState<string>('');

  const handleAddStatus = () => {
    if (!newStatusId.trim() || !newStatusLabel.trim()) {
      toast.error('ID et libellé requis');
      return;
    }
    const id = newStatusId.trim().toLowerCase().replace(/\s+/g, '-');
    addStatus(id, newStatusLabel.trim());
    setNewStatusId('');
    setNewStatusLabel('');
    toast.success('Statut ajouté');
  };

  const handleDeleteStatus = (id: string) => {
    const usedByProjects = projects.filter((p) => p.status === id);
    if (usedByProjects.length > 0) {
      setStatusToDelete(id);
      setRemapStatusTo(settings.statuses.find((s) => s.id !== id)?.id || '');
    } else {
      removeStatus(id);
      toast.success('Statut supprimé');
    }
  };

  const confirmDeleteStatus = () => {
    if (statusToDelete && remapStatusTo) {
      remapProjectStatus(statusToDelete, remapStatusTo);
      removeStatus(statusToDelete);
      toast.success('Statut supprimé et projets remappés');
    }
    setStatusToDelete(null);
    setRemapStatusTo('');
  };

  const handleAddPriority = () => {
    if (!newPriorityId.trim() || !newPriorityLabel.trim()) {
      toast.error('ID et libellé requis');
      return;
    }
    const id = newPriorityId.trim().toLowerCase().replace(/\s+/g, '-');
    addPriority(id, newPriorityLabel.trim());
    setNewPriorityId('');
    setNewPriorityLabel('');
    toast.success('Priorité ajoutée');
  };

  const handleDeletePriority = (id: string) => {
    const usedByProjects = projects.filter((p) => p.priority === id);
    if (usedByProjects.length > 0) {
      setPriorityToDelete(id);
      setRemapPriorityTo(settings.priorities.find((p) => p.id !== id)?.id || '');
    } else {
      removePriority(id);
      toast.success('Priorité supprimée');
    }
  };

  const confirmDeletePriority = () => {
    if (priorityToDelete && remapPriorityTo) {
      remapProjectPriority(priorityToDelete, remapPriorityTo);
      removePriority(priorityToDelete);
      toast.success('Priorité supprimée et projets remappés');
    }
    setPriorityToDelete(null);
    setRemapPriorityTo('');
  };

  const handleAddStt = () => {
    if (!newSttName.trim()) {
      toast.error('Le nom est requis');
      return;
    }
    addStt(newSttName.trim().toUpperCase(), `hsl(${newSttBg})`, `hsl(${newSttText})`);
    setNewSttName('');
    toast.success('Intervenant ajouté');
  };

  const handleRemoveStt = (name: string) => {
    removeStt(name);
    toast.success('Intervenant supprimé');
  };

  const getProjectCountForStatus = (statusId: string) => {
    return projects.filter((p) => p.status === statusId).length;
  };

  const getProjectCountForPriority = (priorityId: string) => {
    return projects.filter((p) => p.priority === priorityId).length;
  };

  return (
    <AppLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto space-y-6"
      >
        <div>
          <h1 className="text-2xl font-bold">Paramètres</h1>
          <p className="text-muted-foreground">Gérez les statuts, priorités, intervenants et couleurs des jalons</p>
        </div>

        <Tabs defaultValue="statuses" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="statuses">Statuts</TabsTrigger>
            <TabsTrigger value="priorities">Priorités</TabsTrigger>
            <TabsTrigger value="stt">Intervenants</TabsTrigger>
            <TabsTrigger value="milestones">Jalons</TabsTrigger>
          </TabsList>

          {/* STATUSES TAB */}
          <TabsContent value="statuses" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Statuts des projets</CardTitle>
                <CardDescription>Gérez les différents statuts disponibles pour les projets</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Add new status */}
                <div className="p-4 border rounded-lg space-y-4">
                  <h3 className="font-medium flex items-center gap-2">
                    <Plus size={16} />
                    Ajouter un statut
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>ID (unique)</Label>
                      <Input
                        value={newStatusId}
                        onChange={(e) => setNewStatusId(e.target.value)}
                        placeholder="Ex: en-attente"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Libellé</Label>
                      <Input
                        value={newStatusLabel}
                        onChange={(e) => setNewStatusLabel(e.target.value)}
                        placeholder="Ex: En attente"
                      />
                    </div>
                    <div className="flex items-end">
                      <Button onClick={handleAddStatus} className="w-full">
                        <Plus size={16} className="mr-2" />
                        Ajouter
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Existing statuses */}
                <div className="grid gap-2">
                  {settings.statuses.map((status) => {
                    const count = getProjectCountForStatus(status.id);
                    return (
                      <div
                        key={status.id}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-xs text-muted-foreground">{status.id}</span>
                          <span className="font-medium">{status.label}</span>
                          {count > 0 && (
                            <span className="text-xs text-muted-foreground">
                              ({count} projet{count > 1 ? 's' : ''})
                            </span>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDeleteStatus(status.id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* PRIORITIES TAB */}
          <TabsContent value="priorities" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Priorités des projets</CardTitle>
                <CardDescription>Gérez les niveaux de priorité disponibles</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Add new priority */}
                <div className="p-4 border rounded-lg space-y-4">
                  <h3 className="font-medium flex items-center gap-2">
                    <Plus size={16} />
                    Ajouter une priorité
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>ID (unique)</Label>
                      <Input
                        value={newPriorityId}
                        onChange={(e) => setNewPriorityId(e.target.value)}
                        placeholder="Ex: urgent"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Libellé</Label>
                      <Input
                        value={newPriorityLabel}
                        onChange={(e) => setNewPriorityLabel(e.target.value)}
                        placeholder="Ex: Urgent"
                      />
                    </div>
                    <div className="flex items-end">
                      <Button onClick={handleAddPriority} className="w-full">
                        <Plus size={16} className="mr-2" />
                        Ajouter
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Existing priorities */}
                <div className="grid gap-2">
                  {settings.priorities.map((priority) => {
                    const count = getProjectCountForPriority(priority.id);
                    return (
                      <div
                        key={priority.id}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-xs text-muted-foreground">{priority.id}</span>
                          <span className="font-medium">{priority.label}</span>
                          {count > 0 && (
                            <span className="text-xs text-muted-foreground">
                              ({count} projet{count > 1 ? 's' : ''})
                            </span>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDeletePriority(priority.id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* STT TAB */}
          <TabsContent value="stt" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Intervenants (STT)</CardTitle>
                <CardDescription>Gérez les sous-traitants et leurs couleurs</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Add new STT */}
                <div className="p-4 border rounded-lg space-y-4">
                  <h3 className="font-medium flex items-center gap-2">
                    <Plus size={16} />
                    Ajouter un intervenant
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label>Nom</Label>
                      <Input
                        value={newSttName}
                        onChange={(e) => setNewSttName(e.target.value)}
                        placeholder="Ex: NEXANS"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Couleur fond (HSL)</Label>
                      <Input
                        value={newSttBg}
                        onChange={(e) => setNewSttBg(e.target.value)}
                        placeholder="217 91% 90%"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Couleur texte (HSL)</Label>
                      <Input
                        value={newSttText}
                        onChange={(e) => setNewSttText(e.target.value)}
                        placeholder="217 91% 35%"
                      />
                    </div>
                    <div className="flex items-end">
                      <Button onClick={handleAddStt} className="w-full">
                        <Plus size={16} className="mr-2" />
                        Ajouter
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Palette size={14} className="text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Aperçu:{' '}
                      <span
                        className="px-2 py-0.5 rounded text-sm font-medium"
                        style={{
                          backgroundColor: `hsl(${newSttBg})`,
                          color: `hsl(${newSttText})`,
                        }}
                      >
                        {newSttName || 'EXEMPLE'}
                      </span>
                    </span>
                  </div>
                </div>

                {/* Existing STT list */}
                <div className="grid gap-2">
                  {settings.sttList.map((stt) => (
                    <div
                      key={stt.name}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className="px-3 py-1 rounded text-sm font-medium"
                          style={{
                            backgroundColor: stt.bg,
                            color: stt.text,
                          }}
                        >
                          {stt.name}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleRemoveStt(stt.name)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* MILESTONES TAB */}
          <TabsContent value="milestones" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Couleurs des jalons</CardTitle>
                <CardDescription>
                  Personnalisez les couleurs des différents types de jalons. 
                  Les jalons prévisionnels (non confirmés) s'afficheront en couleur pâle.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3">
                  {settings.milestoneTypes.map((milestone) => (
                    <div
                      key={milestone.key}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <Circle size={16} fill={milestone.color} stroke={milestone.color} />
                        <span className="font-medium">{milestone.label}</span>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>Confirmé:</span>
                          <span
                            className="px-2 py-0.5 rounded text-white"
                            style={{ backgroundColor: milestone.color }}
                          >
                            {milestone.label}
                          </span>
                          <span>Prévisionnel:</span>
                          <span
                            className="px-2 py-0.5 rounded text-white opacity-50"
                            style={{ backgroundColor: milestone.color }}
                          >
                            {milestone.label}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          type="color"
                          value={milestone.color.startsWith('hsl') ? '#3b82f6' : milestone.color}
                          onChange={(e) => updateMilestoneColor(milestone.key, e.target.value)}
                          className="w-10 h-8 p-0 border-0"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Remap Status Dialog */}
      <AlertDialog open={!!statusToDelete} onOpenChange={() => setStatusToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce statut ?</AlertDialogTitle>
            <AlertDialogDescription>
              Ce statut est utilisé par des projets. Veuillez choisir un statut de remplacement.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label>Remapper vers :</Label>
            <Select value={remapStatusTo} onValueChange={setRemapStatusTo}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {settings.statuses
                  .filter((s) => s.id !== statusToDelete)
                  .map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.label}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteStatus} disabled={!remapStatusTo}>
              Confirmer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Remap Priority Dialog */}
      <AlertDialog open={!!priorityToDelete} onOpenChange={() => setPriorityToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette priorité ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette priorité est utilisée par des projets. Veuillez choisir une priorité de remplacement.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label>Remapper vers :</Label>
            <Select value={remapPriorityTo} onValueChange={setRemapPriorityTo}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {settings.priorities
                  .filter((p) => p.id !== priorityToDelete)
                  .map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.label}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeletePriority} disabled={!remapPriorityTo}>
              Confirmer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
