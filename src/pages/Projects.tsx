import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProjectTable } from '@/components/projects/ProjectTable';
import { ProjectFilters } from '@/components/projects/ProjectFilters';
import { ImportCSVDialog } from '@/components/projects/ImportCSVDialog';
import { ExportCSVButton } from '@/components/projects/ExportCSVButton';
import { Button } from '@/components/ui/button';
import { Plus, Upload } from 'lucide-react';
import { motion } from 'framer-motion';
import { useProjects } from '@/context/ProjectContext';

export default function Projects() {
  const { filteredProjects } = useProjects();
  const [importDialogOpen, setImportDialogOpen] = useState(false);

  return (
    <AppLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Projets</h1>
            <p className="text-muted-foreground">
              {filteredProjects.length} affaire{filteredProjects.length > 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setImportDialogOpen(true)}>
              <Upload size={18} className="mr-2" />
              Importer CSV
            </Button>
            <ExportCSVButton />
            <Button>
              <Plus size={18} className="mr-2" />
              Nouvelle affaire
            </Button>
          </div>
        </div>

        {/* Filters */}
        <ProjectFilters />

        {/* Table */}
        <ProjectTable />
      </motion.div>

      <ImportCSVDialog open={importDialogOpen} onOpenChange={setImportDialogOpen} />
    </AppLayout>
  );
}
