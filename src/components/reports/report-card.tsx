'use client';

import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, Users } from 'lucide-react';
import { Report, ReportStatus, Task, ReportAuthority } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import ContactAuthorityModal from '@/components/reports/contact-authority-modal';
import DriveCompletionModal from '../drives/drive-completion-modal';
import ReportResolveModal from './report-resolve-modal';
import StartMonitoringModal from '../start-monitoring-modal';

interface ReportCardProps {
  report: Report & {
    votes?: Report['unifiedVotes'];
    tasks?: Task[];
    reportAuthorities?: ReportAuthority[];
    drives?: { id: string }[];
  };
  showVoting?: boolean;
  showAuthorityContact?: boolean;
}

export function ReportCard({ report }: ReportCardProps) {
  const router = useRouter();

  const capitalize = (text?: string) => (text ? text.charAt(0).toUpperCase() + text.slice(1) : '');

  const [openContactModal, setOpenContactModal] = useState(false);
  const [openDriveCompletion, setOpenDriveCompletion] = useState(false);
  const [openResolveModal, setOpenResolveModal] = useState(false);
  const [openMonitoringModal, setOpenMonitoringModal] = useState(false);

  const getStatusBadge = (status: ReportStatus) => {
    const statusConfig: Record<ReportStatus, { label: string; className: string }> = {
      PENDING: { label: 'Pending', className: 'bg-yellow-100 text-yellow-800' },
      AUTHORITY_CONTACTED: {
        label: 'Authority Contacted',
        className: 'bg-blue-100 text-blue-800',
      },
      ELIGIBLE_FOR_DRIVE: {
        label: 'Eligible for Drive',
        className: 'bg-teal-100 text-teal-800',
      },
      IN_PROGRESS: {
        label: 'In Progress',
        className: 'bg-teal-200 text-teal-900',
      },
      READY_FOR_MONITORING: {
        label: 'Ready for Monitor',
        className: 'bg-green-100 text-green-800',
      },
      UNDER_MONITORING: {
        label: 'Under Monitoring',
        className: 'bg-gray-200 text-gray-800',
      },
      RESOLVED: { label: 'Resolved', className: 'bg-green-200 text-green-900' },
    };
    return (
      <Badge className={`px-2 py-1 rounded ${statusConfig[status].className}`}>
        {statusConfig[status].label}
      </Badge>
    );
  };

  const reportImage = report.imageUrl || report.media?.[0] || null;

  const locationString = report.city
    ? `${report.city}${report.region ? `, ${report.region}` : ''}, ${report.country ?? ''}`
    : 'Location TBD';

  const hasTwoActionButtons =
    report.status === 'PENDING' ||
    report.status === 'AUTHORITY_CONTACTED' ||
    report.status === 'IN_PROGRESS';

  const renderActionButtons = () => {
    switch (report.status) {
      case 'PENDING':
        return (
          <>
            <Button
              className='bg-red-500 hover:bg-red-600 text-white'
              onClick={() => router.push(`/authority?reportId=${report.id}`)}
            >
              Contact Authority
            </Button>

            <Button className='bg-yellow-400' onClick={() => setOpenContactModal(true)}>
              Contacted Authority?
            </Button>

            <ContactAuthorityModal
              open={openContactModal}
              onClose={() => setOpenContactModal(false)}
              reportId={report.id}
            />
          </>
        );

      case 'AUTHORITY_CONTACTED':
        return (
          <>
            <Button
              className='bg-green-600 hover:bg-green-700 text-white'
              onClick={async () => {
                await fetch(`/api/reports/${report.id}/status`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ status: 'READY_FOR_MONITORING' }),
                });
                router.refresh();
              }}
            >
              Resolved
            </Button>

            <Button
              className='bg-red-500 hover:bg-red-600 text-white'
              onClick={async () => {
                await fetch(`/api/reports/${report.id}/status`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ status: 'ELIGIBLE_FOR_DRIVE' }),
                });
                router.refresh();
              }}
            >
              Rejected
            </Button>
          </>
        );

      case 'READY_FOR_MONITORING':
        return (
          <>
            <Button
              className='bg-blue-600 hover:bg-blue-700 text-white'
              onClick={() => setOpenMonitoringModal(true)}
            >
              Start Monitoring
            </Button>

            {openMonitoringModal && (
              <StartMonitoringModal
                open={openMonitoringModal}
                onClose={() => setOpenMonitoringModal(false)}
                reportId={report.id}
              />
            )}
          </>
        );

      case 'ELIGIBLE_FOR_DRIVE':
        return (
          <Button
            className='bg-green-600 hover:bg-green-700 text-white'
            onClick={() => router.push('/drives/new')}
          >
            Create Drive
          </Button>
        );

      case 'IN_PROGRESS':
        return (
          <div className='flex gap-2'>
            <Button
              onClick={async () => {
                await fetch(`/api/drives/${report.drives?.[0]?.id}/volunteer`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ userId: 'CURRENT_USER_ID' }),
                });
                router.push(`/drives/${report.drives?.[0]?.id}`);
              }}
            >
              Volunteer
            </Button>

            <Button
              className='bg-green-600 text-white'
              onClick={() => setOpenDriveCompletion(true)}
            >
              Drive Completed?
            </Button>

            {report.drives?.[0]?.id && openDriveCompletion && (
              <DriveCompletionModal
                driveId={report.drives[0].id}
                reportId={report.id}
                onClose={() => setOpenDriveCompletion(false)}
              />
            )}
          </div>
        );

        return (
          <Button onClick={() => router.push(`/drives/${report.drives?.[0]?.id}`)}>
            Volunteer
          </Button>
        );

      case 'UNDER_MONITORING':
        return (
          <>
            <Button className='bg-green-600 text-white' onClick={() => setOpenResolveModal(true)}>
              Resolved?
            </Button>

            <ReportResolveModal
              reportId={report.id}
              open={openResolveModal}
              onClose={() => setOpenResolveModal(false)}
            />
          </>
        );

      default:
        return null;
    }
  };

  return (
    <Card className='overflow-hidden transition hover:shadow-lg rounded-2xl'>
      <CardHeader className='pb-3'>
        {reportImage && (
          <div
            className='relative aspect-video rounded-lg overflow-hidden bg-muted cursor-pointer transform transition-transform duration-300 hover:scale-105'
            onClick={() => router.push(`/reports/${report.id}`)}
          >
            <Image src={reportImage} alt={report.title} fill className='object-cover' />
          </div>
        )}
      </CardHeader>

      <CardContent className='space-y-4'>
        {getStatusBadge(report.status)}
        <h3 className='font-semibold text-card-foreground mb-2 line-clamp-2'>
          {capitalize(report.title)}
        </h3>
        <p className='text-sm text-muted-foreground line-clamp-3'>
          {capitalize(report.description)}
        </p>

        <div className='space-y-2'>
          <div className='flex items-center space-x-2 text-sm text-gray-500'>
            <MapPin className='h-4 w-4 text-gray-600' />
            <span>{locationString}</span>
          </div>

          <div className='flex items-center space-x-2 text-sm text-gray-500'>
            <Calendar className='h-4 w-4 text-gray-600' />
            <span>{new Date(report.createdAt).toLocaleDateString()}</span>
          </div>

          {report.tasks && report.tasks.length > 0 && (
            <div className='flex items-center space-x-2 text-sm text-muted-foreground'>
              <Users className='h-4 w-4' />
              <span>{report.tasks.filter((t) => t.id).length} assigned</span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className='pt-4 border-t bg-muted/20'>
        {hasTwoActionButtons ? (
          <div className='flex w-full gap-4'>
            {/* LEFT HALF*/}
            <div className='w-1/2 flex items-center justify-center'>
              <Button
                variant='white'
                size='sm'
                onClick={() => router.push(`/reports/${report.id}`)}
              >
                View Details
              </Button>
            </div>

            {/* RIGHT HALF  */}
            <div className='w-1/2 flex flex-col gap-2'>{renderActionButtons()}</div>
          </div>
        ) : (
          <div className='flex w-full items-center justify-between'>
            <Button variant='white' size='sm' onClick={() => router.push(`/reports/${report.id}`)}>
              View Details
            </Button>

            {renderActionButtons()}
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
