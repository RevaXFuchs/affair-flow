import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { useProjects } from '@/context/ProjectContext';
import { StatusBadge } from '@/components/projects/StatusBadge';
import { PriorityBadge } from '@/components/projects/PriorityBadge';
import { ProjectStatus, STATUS_LABELS, PRIORITY_LABELS, ProjectPriority } from '@/types/project';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  LayoutDashboard, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp,
  Calendar,
  ArrowRight 
} from 'lucide-react';
import { format, parseISO, isThisWeek, isThisMonth } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function Dashboard() {
  const { projects } = useProjects();

  // Stats
  const totalProjects = projects.length;
  const inProgressCount = projects.filter(p => 
    ['en-cours', 'vt', 'doe', 'gc'].includes(p.status)
  ).length;
  const completedCount = projects.filter(p => p.status === 'termine').length;
  const urgentCount = projects.filter(p => 
    p.priority === 'very-high' || p.priority === 'high'
  ).length;

  // Status distribution
  const statusCounts = projects.reduce((acc, p) => {
    acc[p.status] = (acc[p.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Priority distribution
  const priorityCounts = projects.reduce((acc, p) => {
    acc[p.priority] = (acc[p.priority] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Recent projects
  const recentProjects = [...projects]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  // Upcoming milestones
  const upcomingMilestones = projects
    .flatMap(p => 
      p.milestones
        .filter(m => m.startDate && !m.completed)
        .map(m => ({ project: p, milestone: m }))
    )
    .sort((a, b) => 
      new Date(a.milestone.startDate!).getTime() - new Date(b.milestone.startDate!).getTime()
    )
    .slice(0, 5);

  const statCards = [
    { 
      title: 'Total Affaires', 
      value: totalProjects, 
      icon: LayoutDashboard, 
      color: 'text-accent' 
    },
    { 
      title: 'En cours', 
      value: inProgressCount, 
      icon: Clock, 
      color: 'text-status-inprogress' 
    },
    { 
      title: 'Terminées', 
      value: completedCount, 
      icon: CheckCircle2, 
      color: 'text-status-done' 
    },
    { 
      title: 'Priorité haute', 
      value: urgentCount, 
      icon: AlertTriangle, 
      color: 'text-status-urgent' 
    },
  ];

  return (
    <AppLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Tableau de bord</h1>
          <p className="text-muted-foreground">Vue d'ensemble de vos affaires</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.title}</p>
                      <p className="text-3xl font-bold mt-1">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-lg bg-secondary ${stat.color}`}>
                      <stat.icon size={24} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Projects */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Affaires récentes</CardTitle>
              <Link 
                to="/projects" 
                className="text-sm text-accent hover:underline flex items-center gap-1"
              >
                Voir tout <ArrowRight size={14} />
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentProjects.map((project, index) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      to={`/project/${project.id}`}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{project.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Modifié {format(parseISO(project.updatedAt), 'dd MMM', { locale: fr })}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <StatusBadge status={project.status} />
                        <PriorityBadge priority={project.priority} />
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Milestones */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Prochains jalons</CardTitle>
              <Link 
                to="/calendar" 
                className="text-sm text-accent hover:underline flex items-center gap-1"
              >
                Calendrier <ArrowRight size={14} />
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingMilestones.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    Aucun jalon à venir
                  </p>
                ) : (
                  upcomingMilestones.map(({ project, milestone }, index) => (
                    <motion.div
                      key={`${project.id}-${milestone.type}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link
                        to={`/project/${project.id}`}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors"
                      >
                        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-accent/10 text-accent">
                          <Calendar size={18} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{project.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {milestone.type.toUpperCase()} - {format(parseISO(milestone.startDate!), 'dd MMM yyyy', { locale: fr })}
                          </p>
                        </div>
                      </Link>
                    </motion.div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Status & Priority Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Répartition par statut</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(Object.entries(statusCounts) as [ProjectStatus, number][])
                  .sort((a, b) => b[1] - a[1])
                  .map(([status, count]) => (
                    <div key={status} className="flex items-center gap-3">
                      <StatusBadge status={status} />
                      <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(count / totalProjects) * 100}%` }}
                          transition={{ duration: 0.5, ease: 'easeOut' }}
                          className="h-full bg-accent rounded-full"
                        />
                      </div>
                      <span className="text-sm text-muted-foreground w-8 text-right">
                        {count}
                      </span>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Priority Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Répartition par priorité</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(Object.entries(priorityCounts) as [ProjectPriority, number][])
                  .sort((a, b) => {
                    const order = { 'very-high': 4, 'high': 3, 'medium': 2, 'low': 1 };
                    return order[b[0]] - order[a[0]];
                  })
                  .map(([priority, count]) => (
                    <div key={priority} className="flex items-center gap-3">
                      <PriorityBadge priority={priority} className="min-w-[100px]" />
                      <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(count / totalProjects) * 100}%` }}
                          transition={{ duration: 0.5, ease: 'easeOut' }}
                          className="h-full bg-accent rounded-full"
                        />
                      </div>
                      <span className="text-sm text-muted-foreground w-8 text-right">
                        {count}
                      </span>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </AppLayout>
  );
}
