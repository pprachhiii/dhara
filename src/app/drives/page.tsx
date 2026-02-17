'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Filter } from 'lucide-react';
import { DriveStatus } from '@prisma/client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { DriveCard } from '@/components/drives/drive-card';
import { useAppStore } from '@/lib/stores';
import { Drive, Task, Vote, Enhancement } from '@/lib/types';

export default function Drives() {
  /* -------------------------- STATE -------------------------- */
  const { drives, setDrives } = useAppStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  /* -------------------------- FETCH -------------------------- */
  useEffect(() => {
    const fetchDrives = async () => {
      try {
        const res = await fetch('/api/drives');
        if (!res.ok) throw new Error('Failed to fetch drives');
        const data = await res.json();
        setDrives(data);
      } catch (err) {
        console.error('Error fetching drives:', err);
      }
    };
    fetchDrives();
  }, [setDrives]);

  /* -------------------------- FILTER & SORT -------------------------- */
  const filteredDrives = drives
    .filter((drive) => {
      const matchesSearch =
        drive.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (drive.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);

      const matchesStatus = statusFilter === 'all' || drive.status === statusFilter;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'participants':
          return (b.participant ?? 0) - (a.participant ?? 0);
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

  const isFilterActive = searchTerm.trim() !== '' || statusFilter !== 'all';

  /* -------------------------- MAPPERS -------------------------- */
  type DriveType = (typeof drives)[number];

  const mapDriveForCard = (drive: DriveType): Drive => ({
    ...drive,
    reports: drive.reports?.map((r) => ({
      id: r.id,
      title: r.report.title,
      description: r.report.description,
      reportId: r.reportId,
      driveId: r.driveId,
      drive: r.drive,
      report: r.report,
    })),
    unifiedVotes: drive.unifiedVotes?.map((v: Vote) => ({
      id: v.id,
      userId: v.userId,
      user: v.user,
      driveId: v.driveId,
      drive: v.drive,
      createdAt: v.createdAt,
      reportId: v.reportId,
      report: v.report,
    })),
    tasks: drive.tasks?.map((t: Task) => ({
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

    enhancements: drive.enhancements?.map((e: Enhancement) => ({
      id: e.id,
      driveId: e.driveId,
      drive: e.drive,
      type: e.type,
      description: e.description,
      referenceUrls: e.referenceUrls,
      createdAt: e.createdAt,
    })),
    monitorings: drive.monitorings ?? [],
    driveVolunteers: drive.driveVolunteers ?? [],
    discussions: drive.discussions ?? [],
  });

  /* -------------------------- GROUP BY STATUS -------------------------- */
  const drivesByStatus: Record<DriveStatus, Drive[]> = {
    [DriveStatus.PLANNED]: filteredDrives
      .filter((d) => d.status === DriveStatus.PLANNED)
      .map(mapDriveForCard),

    [DriveStatus.ONGOING]: filteredDrives
      .filter((d) => d.status === DriveStatus.ONGOING)
      .map(mapDriveForCard),

    [DriveStatus.VOTING_FINALIZED]: filteredDrives
      .filter((d) => d.status === DriveStatus.VOTING_FINALIZED)
      .map(mapDriveForCard),

    [DriveStatus.COMPLETED]: filteredDrives
      .filter((d) => d.status === DriveStatus.COMPLETED)
      .map(mapDriveForCard),
  };

  /* -------------------------- SECTION RENDERER -------------------------- */
  const renderSection = (
    title: string,
    sectionKey: string,
    description: string,
    drivesArray: Drive[],
    cardProps?: {
      showRegister?: boolean;
      showParticipation?: boolean;
      showSummary?: boolean;
    },
  ) => {
    if (drivesArray.length === 0) return null;

    const isExpanded = expandedSections[sectionKey] ?? false;
    const visibleDrives = isExpanded ? drivesArray : drivesArray.slice(0, 3);

    return (
      <div className='space-y-4'>
        <h2 className='text-xl font-semibold text-foreground'>
          {title} ({drivesArray.length})
        </h2>
        <p className='text-sm text-muted-foreground'>{description}</p>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {visibleDrives.map((drive) => (
            <DriveCard key={drive.id} drive={drive} {...cardProps} />
          ))}
        </div>

        {drivesArray.length > 3 && (
          <Button
            variant='white'
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

  /* -------------------------- RETURN -------------------------- */
  return (
    <div className='container mx-auto px-4 py-8 space-y-10'>
      {/* Header */}
      <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
        <div>
          <h1 className='text-3xl font-bold'>Community Drives</h1>
          <p className='text-muted-foreground'>
            Join organized community efforts to address environmental issues.
          </p>
        </div>

        <Button
          className='bg-emerald-800 hover:bg-emerald-900 text-white px-6 py-3 rounded-xl shadow-md'
          asChild
        >
          <Link href='/drives/new'>
            <Plus className='h-4 w-4 mr-2' />
            Submit Drive
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className='flex flex-col md:flex-row gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100'>
        <div className='relative flex-1'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
          <Input
            placeholder='Search drives by title or description...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='pl-10 focus-visible:ring-yellow-400 focus-visible:border-yellow-400'
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className='w-full md:w-56 focus:ring-yellow-400 focus:border-yellow-400'>
            <Filter className='h-4 w-4 mr-2' />
            <SelectValue placeholder='Filter by status' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All statuses</SelectItem>
            {Object.values(DriveStatus).map((status) => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className='w-full md:w-56 focus:ring-yellow-400 focus:border-yellow-400'>
            <SelectValue placeholder='Sort by' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='recent'>Most recent</SelectItem>
            <SelectItem value='participants'>Most participants</SelectItem>
            <SelectItem value='status'>By status</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Sections */}
      {renderSection(
        'Upcoming Drives',
        DriveStatus.PLANNED,
        'Drives planned for the near future.',
        drivesByStatus[DriveStatus.PLANNED],
        { showRegister: true },
      )}

      {renderSection(
        'Ongoing Drives',
        DriveStatus.ONGOING,
        'Drives currently in progress.',
        drivesByStatus[DriveStatus.ONGOING],
        { showParticipation: true },
      )}

      {renderSection(
        'Voting Finalized Drives',
        DriveStatus.VOTING_FINALIZED,
        'Drives with voting finalized.',
        drivesByStatus[DriveStatus.VOTING_FINALIZED],
        { showSummary: true },
      )}

      {renderSection(
        'Completed Drives',
        DriveStatus.COMPLETED,
        'Drives that have been successfully completed.',
        drivesByStatus[DriveStatus.COMPLETED],
        { showSummary: true },
      )}

      {filteredDrives.length === 0 && (
        <div className='text-center py-16'>
          <div className='max-w-md mx-auto'>
            <div className='w-16 h-16 mx-auto mb-4 bg-emerald-800 rounded-full flex items-center justify-center shadow-md'>
              <Search className='h-8 w-8 text-white' />
            </div>

            <h3 className='text-lg font-semibold mb-2'>No drives found</h3>

            <p className='text-muted-foreground mb-6'>
              {isFilterActive
                ? 'Try adjusting your filters.'
                : 'Be the first to submit a community drive!'}
            </p>

            {!isFilterActive && (
              <Button
                className='bg-emerald-800 hover:bg-emerald-900 text-white px-6 py-3 rounded-xl shadow-md'
                asChild
              >
                <Link href='/drives/new'>
                  <Plus className='h-4 w-4 mr-2' />
                  Submit First Drive
                </Link>
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
