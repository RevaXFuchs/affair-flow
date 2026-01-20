import { useState } from 'react';
import { motion } from 'framer-motion';
import { AppLayout } from '@/components/layout/AppLayout';
import { useConfig } from '@/context/ConfigContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Palette } from 'lucide-react';
import { toast } from 'sonner';
import { ProjectStatus, ProjectPriority } from '@/types/project';

export default function Settings() {
  const { statuses, priorities, sttList, removeStatus, removePriority, addStt, removeStt, updateStt } = useConfig();
  
  const [newSttName, setNewSttName] = useState('');
  const [newSttBg, setNewSttBg] = useState('217 91% 90%');
  const [newSttText, setNewSttText] = useState('217 91% 35%');

  const handleAddStt = () => {
    if (!newSttName.trim()) {
      toast.error('Le nom est requis');
      return;
    }
    addStt(newSttName.trim().toUpperCase(), `hsl(${newSttBg})`, `hsl(${newSttText})`);
    setNewSttName('');
    toast.success('Intervenant ajouté');
  };

  const handleRemoveStatus = (id: ProjectStatus) => {
    removeStatus(id);
    toast.success('Statut supprimé');
  };

  const handleRemovePriority = (id: ProjectPriority) => {
    removePriority(id);
    toast.success('Priorité supprimée');
  };

  const handleRemoveStt = (name: string) => {
    removeStt(name);
    toast.success('Intervenant supprimé');
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
          <p className="text-muted-foreground">Gérez les statuts, priorités et intervenants</p>
        </div>

        <Tabs defaultValue="statuses" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="statuses">Statuts</TabsTrigger>
            <TabsTrigger value="priorities">Priorités</TabsTrigger>
            <TabsTrigger value="stt">Intervenants</TabsTrigger>
          </TabsList>

          <TabsContent value="statuses" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Statuts des projets</CardTitle>
                <CardDescription>Gérez les différents statuts disponibles pour les projets</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  {statuses.map((status) => (
                    <div
                      key={status.id}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs text-muted-foreground">{status.id}</span>
                        <span className="font-medium">{status.label}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleRemoveStatus(status.id)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="priorities" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Priorités des projets</CardTitle>
                <CardDescription>Gérez les niveaux de priorité disponibles</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  {priorities.map((priority) => (
                    <div
                      key={priority.id}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs text-muted-foreground">{priority.id}</span>
                        <span className="font-medium">{priority.label}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleRemovePriority(priority.id)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

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
                  {sttList.map((stt) => (
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
        </Tabs>
      </motion.div>
    </AppLayout>
  );
}
