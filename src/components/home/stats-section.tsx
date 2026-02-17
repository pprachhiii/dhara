'use client';
import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { FileText, Users, Award, TrendingUp } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  className?: string;
}

function StatsCard({ title, value, description, icon: Icon, className }: StatsCardProps) {
  return (
    <Card className={cn('relative overflow-hidden', className)}>
      <CardContent className='p-6'>
        <div className='flex items-start justify-between'>
          <div className='space-y-1'>
            <p className='text-sm font-medium text-muted-foreground'>{title}</p>
            <p className='text-3xl font-bold tracking-tight'>{value}</p>
            {description && <p className='text-sm text-muted-foreground'>{description}</p>}
          </div>
          <div className='rounded-lg bg-primary/10 p-3'>
            <Icon className='h-6 w-6 text-primary' />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function StatsSection() {
  const [stats, setStats] = useState({
    activeReports: 0,
    activeDrives: 0,
    completedReports: 0,
    activeVolunteers: 0,
  });

  useEffect(() => {
    fetch('/api/platform-stats')
      .then((res) => res.json())
      .then((data) => setStats(data));
  }, []);

  return (
    <section className='container mx-auto px-4 py-16'>
      <div className='mb-8 text-center'>
        <h2 className='text-2xl font-bold'>Platform Impact</h2>
        <p className='mt-2 text-muted-foreground'>Real-time community action metrics</p>
      </div>

      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        <StatsCard
          title='Active Reports'
          value={stats.activeReports}
          description='Awaiting community action'
          icon={FileText}
        />
        <StatsCard
          title='Active Drives'
          value={stats.activeDrives}
          description='Community drives in progress'
          icon={Users}
        />
        <StatsCard
          title='Completed'
          value={stats.completedReports}
          description='Issues resolved'
          icon={Award}
        />
        <StatsCard
          title='Volunteers'
          value={stats.activeVolunteers}
          description='Active community members'
          icon={TrendingUp}
        />
      </div>
    </section>
  );
}
