'use client';

import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

import { useEffect, useState } from 'react';

export type DashboardStats = {
  reportsCreated: number;
  drivesJoined: number;
  activeMonitorings: number;
  resolvedReports: number;
};

export function useDashboardStats() {
  const [data, setData] = useState<DashboardStats>({
    reportsCreated: 0,
    drivesJoined: 0,
    activeMonitorings: 0,
    resolvedReports: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard/stats', { credentials: 'include' })
      .then((res) => res.json())
      .then((json) =>
        setData({
          reportsCreated: json.reportsCreated ?? json.myReports ?? 0,
          drivesJoined: json.drivesJoined ?? 0,
          activeMonitorings: json.activeMonitorings ?? 0,
          resolvedReports: json.resolvedReports ?? json.completedDrives ?? 0,
        }),
      )
      .finally(() => setLoading(false));
  }, []);

  return { data, loading };
}

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className,
}: StatsCardProps) {
  return (
    <Card className={cn('relative overflow-hidden', className)}>
      <CardContent className='p-6'>
        <div className='flex items-start justify-between'>
          <div className='space-y-1'>
            <p className='text-sm font-medium text-muted-foreground'>{title}</p>
            <p className='text-3xl font-bold tracking-tight'>{value}</p>
            {description && <p className='text-sm text-muted-foreground'>{description}</p>}
            {trend && (
              <p
                className={cn(
                  'text-sm font-medium',
                  trend.isPositive ? 'text-primary' : 'text-destructive',
                )}
              >
                {trend.isPositive ? '+' : '-'}
                {Math.abs(trend.value)}% from last month
              </p>
            )}
          </div>
          <div className='rounded-lg bg-primary/10 p-3'>
            <Icon className='h-6 w-6 text-primary' />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
