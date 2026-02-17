import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import { Calendar, Clock, MapPin, Users, CheckCircle, ArrowLeft, FileText } from 'lucide-react';
import DriveCommentSection from '@/components/drives/drive-comment-section';
import DriveSidebarClient from '@/components/drives/drive-sidebar';
import { getUserFromPage } from '@/lib/pageAuth';

interface DriveDetailProps {
  params: { id: string };
}

export default async function DriveDetail({ params }: DriveDetailProps) {
  const { id } = params;

  const drive = await prisma.drive.findUnique({
    where: { id },
    include: {
      createdBy: true,
      tasks: true,
      timeSlots: true,
      driveVolunteers: {
        include: {
          volunteer: { include: { user: true } },
          timeSlot: true,
          preferredTask: true,
        },
      },
      reports: { include: { report: true } },
      enhancements: true,
      monitorings: true,
      discussions: { include: { user: true } },
      unifiedVotes: { include: { user: true } },
      updates: { include: { author: true }, orderBy: { date: 'desc' } },
    },
  });

  if (!drive) return <p>Drive not found</p>;

  const driveId = drive.id;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PLANNED':
        return 'bg-sky-100 text-sky-800';
      case 'ONGOING':
        return 'bg-emerald-100 text-emerald-800';
      case 'COMPLETED':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const discussions = drive.discussions.map((d) => ({
    ...d,
    createdAt: d.createdAt.toISOString(),
    user: {
      ...d.user,
      createdAt: d.user.createdAt.toISOString(),
      updatedAt: d.user.updatedAt.toISOString(),
    },
  }));

  const user = await getUserFromPage();

  const alreadyVolunteer = user
    ? drive.driveVolunteers.some((dv) => dv.volunteer.userId === user.id)
    : false;

  async function joinDrive(data: { timeSlot: string; preferredTaskId: string; notes: string }) {
    'use server';

    if (!user) return { error: 'UNAUTHORIZED' };

    const volunteer = await prisma.volunteer.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id },
    });

    const existing = await prisma.driveVolunteer.findUnique({
      where: {
        driveId_volunteerId: {
          driveId,
          volunteerId: volunteer.id,
        },
      },
    });

    if (existing) return { alreadyJoined: true };

    await prisma.$transaction(async (tx) => {
      await tx.driveVolunteer.create({
        data: {
          driveId,
          volunteerId: volunteer.id,
          driveTimeSlotId: data.timeSlot || null,
          preferredTaskId: data.preferredTaskId || null,
          notes: data.notes || null,
        },
      });

      if (data.timeSlot) {
        await tx.driveTimeSlot.update({
          where: { id: data.timeSlot },
          data: { available: { decrement: 1 } },
        });
      }
    });

    return { joined: true };
  }

  return (
    <div className='min-h-screen bg-background'>
      <main className='container mx-auto px-4 py-8'>
        <Link
          href='/drives'
          className='inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6'
        >
          <ArrowLeft className='h-4 w-4 mr-1' />
          Back to Drives
        </Link>

        <div className='grid gap-6 lg:grid-cols-3'>
          {/* Main Content */}
          <div className='lg:col-span-2 space-y-6'>
            <Card>
              <CardContent className='pt-6'>
                <div className='flex flex-wrap gap-2 mb-4'>
                  <Badge className={getStatusColor(drive.status)}>
                    {drive.status.replace('_', ' ')}
                  </Badge>
                  {drive.safetyClassification && (
                    <Badge variant='outline'>{drive.safetyClassification}</Badge>
                  )}
                  {drive.energyLevel && <Badge variant='outline'>{drive.energyLevel} Energy</Badge>}
                </div>

                <h1 className='text-2xl font-bold mb-2'>{drive.title}</h1>
                <p className='text-muted-foreground mb-6'>{drive.description}</p>

                <div className='grid gap-4 sm:grid-cols-2'>
                  <div className='flex items-center gap-3'>
                    <div className='h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center'>
                      <Calendar className='h-5 w-5 text-primary' />
                    </div>
                    <div>
                      <p className='text-sm text-muted-foreground'>Date</p>
                      <p className='font-medium'>
                        {new Date(drive.startDate).toLocaleDateString('en-IN', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>

                  <div className='flex items-center gap-3'>
                    <div className='h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center'>
                      <Clock className='h-5 w-5 text-primary' />
                    </div>
                    <div>
                      <p className='text-sm text-muted-foreground'>Time</p>
                      <p className='font-medium'>{drive.startTime}</p>
                    </div>
                  </div>

                  <div className='flex items-center gap-3'>
                    <div className='h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center'>
                      <MapPin className='h-5 w-5 text-primary' />
                    </div>
                    <div>
                      <p className='text-sm text-muted-foreground'>Linked Reports</p>
                      <p className='font-medium'>
                        {drive.reports.length} report
                        {drive.reports.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>

                  <div className='flex items-center gap-3'>
                    <div className='h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center'>
                      <Users className='h-5 w-5 text-primary' />
                    </div>
                    <div>
                      <p className='text-sm text-muted-foreground'>Organizer</p>
                      <p className='font-medium'>{drive.createdBy?.name ?? 'Unknown'}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs defaultValue='details' className='space-y-4'>
              <TabsList className='grid w-full grid-cols-4'>
                <TabsTrigger value='details'>Details</TabsTrigger>
                <TabsTrigger value='tasks'>Tasks</TabsTrigger>
                <TabsTrigger value='updates'>Updates</TabsTrigger>
                <TabsTrigger value='discussion'>Discussion</TabsTrigger>
              </TabsList>

              {/* Details */}
              <TabsContent value='details' className='space-y-4'>
                <Card>
                  <CardHeader>
                    <CardTitle className='text-lg'>About This Drive</CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-4'>
                    <div>
                      <h4 className='font-medium mb-2'>Objective</h4>
                      <p className='text-sm text-muted-foreground'>{drive.description}</p>
                    </div>
                    <div>
                      <h4 className='font-medium mb-2'>What to Bring</h4>
                      {drive.volunteerInstructions ? (
                        <p className='text-sm text-muted-foreground'>
                          {drive.volunteerInstructions}
                        </p>
                      ) : (
                        <p className='text-sm text-muted-foreground italic'>
                          Nothing specific has been mentioned. Please come prepared for general
                          outdoor activity.
                        </p>
                      )}
                    </div>

                    <div>
                      <h4 className='font-medium mb-2'>What We Provide</h4>
                      {drive.providedItems.length > 0 ? (
                        <ul className='text-sm text-muted-foreground space-y-1'>
                          {drive.providedItems.map((item, i) => (
                            <li key={i}>- {item}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className='text-sm text-muted-foreground italic'>
                          No items have been specified by the organizer.
                        </p>
                      )}
                    </div>

                    <div>
                      <h4 className='font-medium mb-2'>Meeting Point</h4>
                      <p className='text-sm text-muted-foreground'>
                        {drive.meetingPoint ?? 'Not specified'}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tasks */}
              <TabsContent value='tasks' className='space-y-4'>
                <Card>
                  <CardHeader>
                    <CardTitle className='text-lg'>Task Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className='space-y-3'>
                      {drive.tasks.map((task) => (
                        <div
                          key={task.id}
                          className='flex items-center justify-between p-3 rounded-lg border'
                        >
                          <div className='flex items-center gap-3'>
                            <div
                              className={`h-8 w-8 rounded-full flex items-center justify-center ${
                                task.status === 'ASSIGNED' ? 'bg-emerald-100' : 'bg-amber-100'
                              }`}
                            >
                              {task.status === 'ASSIGNED' ? (
                                <CheckCircle className='h-4 w-4 text-emerald-600' />
                              ) : (
                                <Clock className='h-4 w-4 text-amber-600' />
                              )}
                            </div>
                            <div>
                              <p className='font-medium'>{task.title}</p>
                              <p className='text-sm text-muted-foreground'>
                                {task.volunteersNeeded} volunteers needed
                              </p>
                            </div>
                          </div>
                          <Badge
                            variant={task.status === 'ASSIGNED' ? 'default' : 'secondary'}
                            className={
                              task.status === 'ASSIGNED' ? 'bg-emerald-100 text-emerald-800' : ''
                            }
                          >
                            {task.status.toLowerCase()}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Updates */}
              <TabsContent value='updates' className='space-y-4'>
                {drive.updates.length === 0 ? (
                  <Card>
                    <CardContent className='pt-6 text-sm text-muted-foreground italic'>
                      No updates have been posted for this drive yet.
                    </CardContent>
                  </Card>
                ) : (
                  drive.updates.map((update) => (
                    <Card key={update.id}>
                      <CardContent className='pt-6'>
                        <div className='flex items-start gap-4'>
                          <div className='h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0'>
                            <FileText className='h-5 w-5 text-primary' />
                          </div>
                          <div className='flex-1'>
                            <div className='flex items-center justify-between mb-1'>
                              <h4 className='font-medium'>{update.title}</h4>
                              <span className='text-sm text-muted-foreground'>
                                {new Date(update.date).toLocaleDateString('en-IN')}
                              </span>
                            </div>
                            <p className='text-sm text-muted-foreground mb-2'>{update.content}</p>
                            <p className='text-xs text-muted-foreground'>
                              Posted by {update.author?.name ?? 'Unknown'}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value='discussion'>
                <DriveCommentSection driveId={drive.id} discussions={discussions} />
              </TabsContent>
            </Tabs>
          </div>
          {/* Sidebar */}
          <DriveSidebarClient
            drive={drive}
            volunteers={drive.driveVolunteers}
            alreadyVolunteer={alreadyVolunteer}
            onJoin={joinDrive}
          />
        </div>
      </main>
    </div>
  );
}
