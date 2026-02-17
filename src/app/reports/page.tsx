'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ReportCard } from '@/components/reports/report-card';
import { useAppStore } from '@/lib/stores';
import { Plus, Search, Filter } from 'lucide-react';
import Link from 'next/link';
import { ReportStatus } from '@prisma/client';
import { Report } from '@/lib/types';

/* -------------------------- COMPONENT -------------------------- */
export default function Reports() {
  /* -------------------------- STATE -------------------------- */
  const [expandedSections, setExpandedSections] = useState<{
    [key: string]: boolean;
  }>({});
  const { reports, setReports } = useAppStore();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('recent');

  /* -------------------------- HELPERS -------------------------- */
  const formatStatusLabel = (status: string) =>
    status
      .toLowerCase()
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());

  const mapReportForCard = (report: Report): Report => ({
    ...report,
    unifiedVotes: report.unifiedVotes?.map((v) => ({
      id: v.id,
      userId: v.userId,
      user: v.user,
      reportId: v.reportId,
      report: v.report,
      createdAt: v.createdAt,
    })),
    tasks: report.tasks?.map((t) => ({
      id: t.id,
      title: t.title,
      description: t.description ?? null,

      volunteersNeeded: t.volunteersNeeded,

      engagement: t.engagement,

      driveId: t.driveId ?? null,
      drive: t.drive ?? null,

      reportId: t.reportId ?? null,
      report: t.report ?? null,

      status: t.status,

      volunteerId: t.volunteerId ?? null,
      volunteer: t.volunteer ?? null,

      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
    })),
    reportAuthorities: report.reportAuthorities?.map((ra) => ({
      id: ra.id,
      reportId: ra.reportId,
      report: ra.report,
      authorityId: ra.authorityId,
      authority: ra.authority,
      volunteerId: ra.volunteerId ?? null,
      volunteer: ra.volunteer ?? null,
      contactedAt: ra.contactedAt ?? null,
      status: ra.status,
      createdAt: ra.createdAt,
      updatedAt: ra.updatedAt,
    })),
  });

  const renderSection = (
    title: string,
    description: string,
    reportsArray: Report[],
    sectionKey: string,
  ) => {
    if (reportsArray.length === 0) return null;
    const isExpanded = expandedSections[sectionKey] ?? false;
    const visibleReports = isExpanded ? reportsArray : reportsArray.slice(0, 3);

    return (
      <div className='space-y-4' key={sectionKey}>
        <h2 className='text-2xl font-bold'>
          {title} ({reportsArray.length})
        </h2>
        <p className='text-sm text-muted-foreground'>{description}</p>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {visibleReports.map((report, index) => (
            <ReportCard
              key={`${sectionKey}-${report.id}-${index}`}
              report={mapReportForCard(report)}
            />
          ))}
        </div>
        {reportsArray.length > 3 && (
          <Button
            variant='white'
            className='mt-2'
            onClick={() =>
              setExpandedSections((prev) => ({
                ...prev,
                [sectionKey]: !isExpanded,
              }))
            }
          >
            {isExpanded ? 'Collapse' : 'View All'}
          </Button>
        )}
      </div>
    );
  };

  /* -------------------------- FETCH -------------------------- */
  useEffect(() => {
    const fetchReports = async (): Promise<void> => {
      try {
        const res = await fetch('/api/reports');
        if (!res.ok) throw new Error('Failed to fetch reports');
        const data: Report[] = await res.json();
        setReports(data);
      } catch (err) {
        console.error('Error fetching reports:', err);
      }
    };
    fetchReports();
  }, [setReports]);

  /* -------------------------- FILTER & SORT -------------------------- */
  const filteredReports: Report[] = reports
    .filter((report: Report) => {
      const matchesSearch =
        report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a: Report, b: Report) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'votes':
          return (b.unifiedVotes?.length ?? 0) - (a.unifiedVotes?.length ?? 0);
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

  /* -------------------------- HUBS -------------------------- */
  const hubs = [
    {
      key: 'pending',
      title: 'Pending Hub',
      description: 'Newly submitted reports awaiting review or initial action.',
      reports: filteredReports.filter((r) => r.status === ReportStatus.PENDING),
    },
    {
      key: 'authorityContacted',
      title: 'Authority Contacted Hub',
      description: 'Reports that have been forwarded to authorities and awaiting response.',
      reports: filteredReports.filter((r) => r.status === ReportStatus.AUTHORITY_CONTACTED),
    },
    {
      key: 'resolvedByAuthority',
      title: 'Ready for Monitor',
      description: 'Reports successfully resolved by relevant authorities.',
      reports: filteredReports.filter((r) => r.status === ReportStatus.READY_FOR_MONITORING),
    },
    {
      key: 'eligibleForDrive',
      title: 'Eligible for Drive Hub',
      description: 'Reports identified as eligible for environmental drives and campaigns.',
      reports: filteredReports.filter((r) => r.status === ReportStatus.ELIGIBLE_FOR_DRIVE),
    },
    {
      key: 'inProgress',
      title: 'In Progress Hub',
      description: 'Reports actively being worked on by community or authorities.',
      reports: filteredReports.filter((r) => r.status === ReportStatus.IN_PROGRESS),
    },
    {
      key: 'underMonitoring',
      title: 'Under Monitoring Hub',
      description: 'Reports under ongoing observation to ensure long-term resolution.',
      reports: filteredReports.filter((r) => r.status === ReportStatus.UNDER_MONITORING),
    },
    {
      key: 'resolved',
      title: '🏆 Resolved Hub',
      description: 'Reports that have been completely resolved and closed.',
      reports: filteredReports.filter((r) => r.status === ReportStatus.RESOLVED),
    },
  ];

  /* -------------------------- RETURN -------------------------- */
  return (
    <div className='container mx-auto px-4 py-8 space-y-10'>
      {/* Header */}
      <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-6'>
        {/* Heading + Subheading */}
        <div className='flex flex-col gap-1'>
          <h1 className='text-3xl font-bold text-foreground truncate'>Browse Reports</h1>
          <p className='text-muted-foreground truncate'>
            Track, support, and follow civic issues across every stage - from newly reported to
            fully resolved.
          </p>
        </div>

        {/* Button */}
        <Button
          className='bg-emerald-800 hover:bg-emerald-900 text-white px-6 py-3 rounded-xl shadow-md'
          asChild
        >
          <Link href='/reports/new'>
            <Plus className='h-4 w-4 mr-2' />
            Report Issue
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className='flex flex-col md:flex-row gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100'>
        {/* Search */}
        <div className='relative flex-1'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
          <Input
            placeholder='Search reports by title or description...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='pl-10 focus-visible:ring-yellow-400 focus-visible:border-yellow-400'
          />
        </div>

        {/* Status Filter */}
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className='w-full md:w-56 focus:ring-yellow-400 focus:border-yellow-400'>
            <Filter className='h-4 w-4 mr-2' />
            <SelectValue placeholder='Filter by status' />
          </SelectTrigger>

          <SelectContent className='bg-white border border-gray-200'>
            <SelectItem value='all' className='hover:bg-yellow-400 focus:bg-yellow-400'>
              All statuses
            </SelectItem>
            {Object.values(ReportStatus).map((status) => (
              <SelectItem
                key={status}
                value={status}
                className='hover:bg-yellow-400 focus:bg-yellow-400'
              >
                {formatStatusLabel(status)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Sort */}
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className='w-full md:w-56 focus:ring-yellow-400 focus:border-yellow-400'>
            <SelectValue placeholder='Sort by' />
          </SelectTrigger>

          <SelectContent className='bg-white border border-gray-200'>
            <SelectItem value='recent' className='hover:bg-yellow-400 focus:bg-yellow-400'>
              Most recent
            </SelectItem>
            <SelectItem value='votes' className='hover:bg-yellow-400 focus:bg-yellow-400'>
              Most voted
            </SelectItem>
            <SelectItem value='status' className='hover:bg-yellow-400 focus:bg-yellow-400'>
              By status
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Status Hubs */}
      {hubs.map((hub) => renderSection(hub.title, hub.description, hub.reports, hub.key))}

      {/* Empty State */}
      {filteredReports.length === 0 && (
        <div className='text-center py-16'>
          <div className='max-w-md mx-auto'>
            <div className='w-16 h-16 mx-auto mb-4 bg-emerald-800 rounded-full flex items-center justify-center shadow-md'>
              <Search className='h-8 w-8 text-white' />
            </div>

            <h3 className='text-lg font-semibold mb-2'>No reports found</h3>
            <p className='text-muted-foreground mb-6'>
              {searchTerm || statusFilter !== 'all'
                ? 'Try adjusting your filters.'
                : 'Be the first to submit a report!'}
            </p>

            <Button
              className='bg-emerald-800 hover:bg-emerald-900 text-white px-6 py-3 rounded-xl shadow-md'
              asChild
            >
              <Link href='/reports/new'>
                <Plus className='h-4 w-4 mr-2' />
                Submit First Report
              </Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
