'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Users, AlertCircle } from 'lucide-react';

type DriveTimeSlot = {
  id: string;
  label: string;
  available: number;
};

type DriveTask = {
  id: string;
  title: string;
};

type DriveVolunteerItem = {
  volunteer: {
    user: {
      id: string;
      name: string | null;
      role: string;
    };
  };
};

type DriveSidebarDrive = {
  id: string;
  title: string;
  maxParticipants: number | null;
  createdBy?: { name?: string | null } | null;
  tasks: DriveTask[];
  timeSlots: DriveTimeSlot[];
  reports: {
    report: {
      id: string;
      title: string;
      description: string;
    };
  }[];
};

export default function DriveSidebarClient({
  drive,
  volunteers,
  alreadyVolunteer,
  onJoin,
}: {
  drive: DriveSidebarDrive;
  volunteers: DriveVolunteerItem[];
  alreadyVolunteer: boolean;
  onJoin: (data: { timeSlot: string; preferredTaskId: string; notes: string }) => Promise<any>;
}) {
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [notes, setNotes] = useState('');
  const [isPending, startTransition] = useTransition();

  const currentVolunteers = volunteers.length;
  const max = drive.maxParticipants ?? currentVolunteers;
  const progress = max > 0 ? (currentVolunteers / max) * 100 : 100;

  const handleConfirmJoin = () => {
    startTransition(async () => {
      const res = await onJoin({
        timeSlot: selectedSlot,
        preferredTaskId: selectedTaskId,
        notes,
      });

      if (res?.alreadyJoined) {
        toast.info('You already joined this drive');
        return;
      }

      if (res?.joined) {
        toast.success('Successfully registered!');
        setJoinDialogOpen(false);
        location.reload();
      }
    });
  };

  return (
    <div className='space-y-6'>
      {/* JOIN CARD */}
      <Card className='sticky top-4'>
        <CardContent className='pt-6 space-y-4'>
          <div className='space-y-2'>
            <div className='flex justify-between text-sm'>
              <span>Volunteers Joined</span>
              <span className='font-medium'>
                {currentVolunteers} / {max}
              </span>
            </div>

            <Progress value={progress} className='h-2' />

            <p className='text-xs text-muted-foreground'>
              {Math.max(0, max - currentVolunteers)} spots remaining
            </p>
          </div>

          <Dialog open={joinDialogOpen} onOpenChange={setJoinDialogOpen}>
            <DialogTrigger asChild>
              <Button className='w-full' size='lg' disabled={alreadyVolunteer}>
                <Users className='h-4 w-4 mr-2' />
                {alreadyVolunteer ? 'Already Joined' : 'Join This Drive'}
              </Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>Join {drive.title}</DialogTitle>
                <DialogDescription>
                  Select your preferences and confirm participation
                </DialogDescription>
              </DialogHeader>

              <div className='space-y-4 py-4'>
                {/* TIME SLOT */}
                <div className='space-y-2'>
                  <Label>Select Time Slot</Label>
                  <Select value={selectedSlot} onValueChange={setSelectedSlot}>
                    <SelectTrigger>
                      <SelectValue placeholder='Choose a time slot...' />
                    </SelectTrigger>
                    <SelectContent>
                      {drive.timeSlots?.map((slot: any) => (
                        <SelectItem key={slot.id} value={slot.id}>
                          {slot.label} ({slot.available} spots)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* TASK */}
                <div className='space-y-2'>
                  <Label>Preferred Task (Optional)</Label>
                  <Select value={selectedTaskId} onValueChange={setSelectedTaskId}>
                    <SelectTrigger>
                      <SelectValue placeholder='Any task' />
                    </SelectTrigger>
                    <SelectContent>
                      {drive.tasks?.map((task: any) => (
                        <SelectItem key={task.id} value={task.id}>
                          {task.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* NOTES */}
                <div className='space-y-2'>
                  <Label>Additional Notes</Label>
                  <Textarea
                    placeholder='Any special requirements or skills...'
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                  />
                </div>

                <Button className='w-full' disabled={isPending} onClick={handleConfirmJoin}>
                  Confirm Registration
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* ORGANIZER */}
      <Card>
        <CardHeader>
          <CardTitle className='text-base'>Organizer</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='flex items-center gap-3'>
            <Avatar>
              <AvatarFallback>
                {(drive.createdBy?.name ?? 'U')
                  .split(' ')
                  .map((n: string) => n[0])
                  .join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className='font-medium'>{drive.createdBy?.name}</p>
              <p className='text-sm text-muted-foreground'>Community Leader</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Volunteers Card */}
      <Card>
        <CardHeader>
          <CardTitle className='text-base'>Volunteers ({volunteers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-3'>
            {volunteers.slice(0, 4).map((v, index) => {
              const user = v.volunteer.user;

              return (
                <div key={index} className='flex items-center gap-3'>
                  <Avatar className='h-8 w-8'>
                    <AvatarFallback className='text-xs'>
                      {(user.name ?? 'U')
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </AvatarFallback>
                  </Avatar>

                  <div className='flex-1 min-w-0'>
                    <p className='text-sm font-medium truncate'>{user.name ?? 'Anonymous'}</p>
                    <p className='text-xs text-muted-foreground'>{user.role}</p>
                  </div>
                </div>
              );
            })}

            {volunteers.length > 4 && (
              <Button size='sm' className='w-full'>
                View all {volunteers.length} volunteers
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
      {/* LINKED REPORTS */}
      {drive.reports?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className='text-base'>Linked Reports</CardTitle>
          </CardHeader>

          <CardContent className='space-y-3'>
            {drive.reports.map((dr) => {
              const report = dr.report;

              return (
                <Link
                  key={report.id}
                  href={`/reports/${report.id}`}
                  className='block rounded-lg border p-4 transition hover:bg-muted/50'
                >
                  <div className='flex gap-3'>
                    <AlertCircle className='h-5 w-5 text-amber-500 mt-0.5' />

                    <div className='space-y-1'>
                      <p className='text-sm font-medium'>{report.title}</p>

                      <p className='text-xs text-muted-foreground line-clamp-2'>
                        {report.description}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
