import { useState } from 'react';
import { useProjects } from '@/context/ProjectContext';
import { ProjectStatus, ProjectPriority, STATUS_LABELS, PRIORITY_LABELS } from '@/types/project';
import { Search, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';

export function ProjectFilters() {
  const { filter, setFilter } = useProjects();
  const [searchValue, setSearchValue] = useState(filter.search || '');

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    setFilter({ ...filter, search: value || undefined });
  };

  const toggleStatusFilter = (status: ProjectStatus) => {
    const currentStatuses = filter.status || [];
    const newStatuses = currentStatuses.includes(status)
      ? currentStatuses.filter((s) => s !== status)
      : [...currentStatuses, status];
    setFilter({ ...filter, status: newStatuses.length > 0 ? newStatuses : undefined });
  };

  const togglePriorityFilter = (priority: ProjectPriority) => {
    const currentPriorities = filter.priority || [];
    const newPriorities = currentPriorities.includes(priority)
      ? currentPriorities.filter((p) => p !== priority)
      : [...currentPriorities, priority];
    setFilter({ ...filter, priority: newPriorities.length > 0 ? newPriorities : undefined });
  };

  const clearFilters = () => {
    setSearchValue('');
    setFilter({});
  };

  const activeFilterCount = 
    (filter.status?.length || 0) + 
    (filter.priority?.length || 0) + 
    (filter.search ? 1 : 0);

  return (
    <div className="flex items-center gap-3">
      {/* Search */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher une affaire..."
          value={searchValue}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Status Filter */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="gap-2">
            <Filter size={16} />
            Statut
            {filter.status && filter.status.length > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                {filter.status.length}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-56 p-3" align="start">
          <div className="space-y-2">
            {(Object.keys(STATUS_LABELS) as ProjectStatus[]).map((status) => (
              <label
                key={status}
                className="flex items-center gap-2 cursor-pointer hover:bg-secondary/50 p-1.5 rounded-md transition-colors"
              >
                <Checkbox
                  checked={filter.status?.includes(status) || false}
                  onCheckedChange={() => toggleStatusFilter(status)}
                />
                <span className="text-sm">{STATUS_LABELS[status]}</span>
              </label>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {/* Priority Filter */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="gap-2">
            <Filter size={16} />
            Priorité
            {filter.priority && filter.priority.length > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                {filter.priority.length}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-48 p-3" align="start">
          <div className="space-y-2">
            {(Object.keys(PRIORITY_LABELS) as ProjectPriority[]).map((priority) => (
              <label
                key={priority}
                className="flex items-center gap-2 cursor-pointer hover:bg-secondary/50 p-1.5 rounded-md transition-colors"
              >
                <Checkbox
                  checked={filter.priority?.includes(priority) || false}
                  onCheckedChange={() => togglePriorityFilter(priority)}
                />
                <span className="text-sm">{PRIORITY_LABELS[priority]}</span>
              </label>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {/* Clear Filters */}
      {activeFilterCount > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="gap-1 text-muted-foreground"
        >
          <X size={14} />
          Effacer ({activeFilterCount})
        </Button>
      )}
    </div>
  );
}
