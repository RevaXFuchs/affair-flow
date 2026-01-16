import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useProjects } from '@/context/ProjectContext';
import { exportToCSV, downloadCSV } from '@/lib/csvUtils';

interface ExportCSVButtonProps {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export function ExportCSVButton({ variant = 'outline', size = 'default', className }: ExportCSVButtonProps) {
  const { filteredProjects } = useProjects();

  const handleExport = () => {
    const csvContent = exportToCSV(filteredProjects);
    const filename = `projets_export_${new Date().toISOString().split('T')[0]}.csv`;
    downloadCSV(csvContent, filename);
  };

  return (
    <Button variant={variant} size={size} onClick={handleExport} className={className}>
      <Download size={18} className="mr-2" />
      Exporter CSV
    </Button>
  );
}
