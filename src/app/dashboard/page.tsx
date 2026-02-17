'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Calendar, CheckCircle, ShieldCheck, Users, FileText } from 'lucide-react';

import { ReportCard } from '@/components/reports/report-card';
import { DriveCard } from '@/components/drives/drive-card';
import { StatsCard, useDashboardStats } from '@/components/stats-card';
import { Report, Drive, Task, DriveVolunteer, ReportAuthority } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';

/* ---------------- TYPES ---------------- */
type DashboardReport = Report & {
  tasks?: Task[];
  reportAuthorities?: ReportAuthority[];
  drives?: { id: string }[];
  unifiedVotes?: Report['unifiedVotes'];
};

type DashboardDrive = Drive & {
  tasks?: Task[];
  driveVolunteers?: DriveVolunteer[];
};

type DashboardData = {
  user: {
    id: string;
    name: string | null;
  };
  reports: DashboardReport[];
  drives: DashboardDrive[];
  priorityReports: DashboardReport[];
  community: {
    reportsThisWeek: number;
    resolutionRate: number;
    activeVolunteers: number;
  };
};

/* ---------------- PAGE ---------------- */

export default function DashboardPage() {
  // dashboard page data
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);

  // stats card data
  const { data: stats, loading: statsLoading } = useDashboardStats();

  // fetch dashboard data
  useEffect(() => {
    fetch('/api/dashboard')
      .then((res) => res.json())
      .then(setDashboard);
  }, []);

  // loading state
  if (!dashboard || statsLoading || !stats) return null;

  const { user, reports, drives } = dashboard;
  const displayName = user.name?.trim() || 'User';

  return (
    <div className='min-h-screen bg-background'>
      <main className='container mx-auto px-4 py-8'>
        {/* Welcome */}
        <div className='mb-8 flex justify-between'>
          <div className='flex items-center gap-4'>
            <Avatar className='h-16 w-16'>
              <AvatarFallback>
                {displayName
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <h1 className='text-2xl font-bold'>Welcome back, {displayName.split(' ')[0]}!</h1>
          </div>

          <div className='flex gap-2'>
            <Link href='/reports/new'>
              <Button>
                <Plus className='h-4 w-4 mr-2' />
                Report Issue
              </Button>
            </Link>
            <Link href='/drives/new'>
              <Button variant='white'>
                <Calendar className='h-4 w-4 mr-2' />
                Propose Drive
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className='mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          <StatsCard
            title='Reports Created'
            value={stats.reportsCreated}
            description="Issues you've reported"
            icon={FileText}
          />
          <StatsCard
            title='Drives Joined'
            value={stats.drivesJoined}
            description='Community events participated'
            icon={Users}
          />
          <StatsCard
            title='Active Monitorings'
            value={stats.activeMonitorings}
            description="Areas you're monitoring"
            icon={ShieldCheck}
          />
          <StatsCard
            title='Reports Resolved'
            value={stats.resolvedReports}
            icon={CheckCircle}
            description="Issues you've resolved"
          />
        </div>

        {/* Tabs */}
        <Tabs defaultValue='my-reports'>
          <TabsList>
            <TabsTrigger value='my-reports'>My Reports</TabsTrigger>
            <TabsTrigger value='my-drives'>My Drives</TabsTrigger>
          </TabsList>

          {/* My Reports Tab */}
          <TabsContent value='my-reports' className='space-y-6'>
            <div className='flex items-center justify-between'>
              <h2 className='text-lg font-semibold'>Reports I Created</h2>
              <Link href='/reports/new'>
                <Button size='sm' className='gap-2'>
                  <Plus className='h-4 w-4' />
                  New Report
                </Button>
              </Link>
            </div>

            {reports.length > 0 ? (
              <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
                {reports.map((report) => (
                  <ReportCard key={report.id} report={report} />
                ))}
              </div>
            ) : (
              <Card className='py-12'>
                <CardContent className='flex flex-col items-center text-center'>
                  <FileText className='h-12 w-12 text-muted-foreground/50' />
                  <h3 className='mt-4 font-semibold'>No reports yet</h3>
                  <p className='mt-2 text-sm text-muted-foreground'>
                    Start contributing by reporting a civic issue in your area
                  </p>
                  <Link href='/reports/new'>
                    <Button className='mt-4 gap-2'>
                      <Plus className='h-4 w-4' />
                      Report Your First Issue
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* My Drives Tab */}
          <TabsContent value='my-drives' className='space-y-6'>
            <div className='flex items-center justify-between'>
              <h2 className='text-lg font-semibold'>Drives I am Part Of</h2>
              <Link href='/drives/new'>
                <Button size='sm' className='gap-2'>
                  <Plus className='h-4 w-4' />
                  Propose Drive
                </Button>
              </Link>
            </div>

            {drives.length > 0 ? (
              <div className='grid gap-4 md:grid-cols-2'>
                {drives.map((drive) => (
                  <DriveCard key={drive.id} drive={drive} />
                ))}
              </div>
            ) : (
              <Card className='py-12'>
                <CardContent className='flex flex-col items-center text-center'>
                  <Calendar className='h-12 w-12 text-muted-foreground/50' />
                  <h3 className='mt-4 font-semibold'>No drives yet</h3>
                  <p className='mt-2 text-sm text-muted-foreground'>
                    Join a community drive or propose one to address local issues
                  </p>
                  <Link href='/drives'>
                    <Button className='mt-4 gap-2'>Browse Upcoming Drives</Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
