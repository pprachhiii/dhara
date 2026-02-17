'use client';

import Link from 'next/link';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Calendar, Clock, MapPin, Users, ArrowRight, CheckCircle } from 'lucide-react';
import { Drive, Task, DriveVolunteer } from '@/lib/types';

interface DriveCardProps {
  drive: Drive & {
    tasks?: Task[];
    driveVolunteers?: DriveVolunteer[];
  };

  onViewDetails?: () => void;

  showRegister?: boolean;
  showParticipation?: boolean;
  showSummary?: boolean;
}

const STATUS_STYLES: Record<Drive['status'], { label: string; className: string }> = {
  PLANNED: {
    label: 'Planned',
    className: 'border-muted text-muted-foreground',
  },
  VOTING_FINALIZED: {
    label: 'Voting Finalized',
    className: 'border-accent text-accent',
  },
  ONGOING: { label: 'Ongoing', className: 'border-primary text-primary' },
  COMPLETED: {
    label: 'Completed',
    className: 'border-emerald-500 text-emerald-600',
  },
};

export function DriveCard({ drive }: DriveCardProps) {
  const volunteersJoined = drive.driveVolunteers?.length ?? 0;
  const targetParticipants = drive.participant;

  const participantProgress =
    targetParticipants > 0 ? Math.min((volunteersJoined / targetParticipants) * 100, 100) : 0;

  const completedTasks = drive.tasks?.filter((t) => t.status === 'COMPLETED').length ?? 0;
  const totalTasks = drive.tasks?.length ?? 0;

  const status = STATUS_STYLES[drive.status];

  return (
    <Card className='group overflow-hidden transition-shadow hover:shadow-md'>
      <CardContent className='p-5 space-y-4'>
        {/* Header */}
        <div className='flex items-start justify-between gap-3'>
          <div className='flex-1'>
            <Badge variant='outline' className={status.className}>
              {status.label}
            </Badge>
            <h3 className='mt-2 line-clamp-2 font-semibold'>{drive.title}</h3>
          </div>
        </div>

        {/* Description */}
        {drive.description && (
          <p className='text-sm text-muted-foreground line-clamp-2'>{drive.description}</p>
        )}

        {/* Category */}
        <div className='text-sm text-muted-foreground'>
          Category: <span className='font-medium'>{drive.category}</span>
        </div>

        {/* Schedule */}
        <div className='space-y-2 text-sm'>
          <div className='flex items-center gap-2'>
            <Calendar className='h-4 w-4 text-muted-foreground' />
            <span>{new Date(drive.startDate).toLocaleDateString()}</span>
          </div>

          <div className='flex items-center gap-2'>
            <Clock className='h-4 w-4 text-muted-foreground' />
            <span>
              {drive.startTime} · {drive.durationHr} hrs
            </span>
          </div>

          <div className='flex items-center gap-2 text-muted-foreground'>
            <MapPin className='h-4 w-4 shrink-0' />
            <span className='line-clamp-1'>
              {drive.area}, {drive.city}
              {drive.wardNumber && ` · Ward ${drive.wardNumber}`}
            </span>
          </div>
        </div>

        {/* Participants */}
        <div>
          <div className='mb-2 flex items-center justify-between text-sm'>
            <div className='flex items-center gap-2'>
              <Users className='h-4 w-4 text-muted-foreground' />
              <span className='text-muted-foreground'>Participants</span>
            </div>
            <span className='font-medium'>
              {volunteersJoined} / {targetParticipants}
            </span>
          </div>
          <Progress value={participantProgress} className='h-2' />
        </div>

        {/* Tasks Progress */}
        {totalTasks > 0 && (
          <div className='flex items-center gap-2 text-sm text-muted-foreground'>
            <CheckCircle className='h-4 w-4' />
            <span>
              {completedTasks}/{totalTasks} tasks completed
            </span>
          </div>
        )}
      </CardContent>

      <CardFooter className='border-t bg-secondary/30 p-3'>
        <div className='flex w-full items-center justify-between'>
          <div className='text-sm text-muted-foreground'>{drive.finalVoteCount ?? 0} votes</div>

          <Link href={`/drives/${drive.id}`}>
            <Button variant='white' size='sm' className='gap-1'>
              View Details
              <ArrowRight className='h-4 w-4' />
            </Button>
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
