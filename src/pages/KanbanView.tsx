import { motion } from 'framer-motion';
import { AppLayout } from '@/components/layout/AppLayout';
import { KanbanBoard } from '@/components/kanban/KanbanBoard';

export default function KanbanView() {
  return (
    <AppLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Kanban</h1>
          <p className="text-muted-foreground">Vue des affaires par statut (glisser-déposer)</p>
        </div>

        {/* Kanban Board */}
        <KanbanBoard />
      </motion.div>
    </AppLayout>
  );
}
