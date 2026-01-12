import { AppLayout } from '@/components/layout/AppLayout';
import { ProjectTable } from '@/components/projects/ProjectTable';
import { ProjectFilters } from '@/components/projects/ProjectFilters';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useProjects } from '@/context/ProjectContext';

export default function Projects() {
  const { filteredProjects } = useProjects();

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
          <Button>
            <Plus size={18} className="mr-2" />
            Nouvelle affaire
          </Button>
        </div>

        {/* Filters */}
        <ProjectFilters />

        {/* Table */}
        <ProjectTable />
      </motion.div>
    </AppLayout>
  );
}
