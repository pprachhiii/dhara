import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';

import Image from 'next/image';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  MessageSquare,
  Check,
  Building2,
  Phone,
} from 'lucide-react';

import { format, formatDistanceToNow, differenceInDays } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

import ReportActions from '@/components/reports/report-actions';
import { getUserFromPage } from '@/lib/pageAuth';
import { Badge } from '@/components/ui/badge';
import { CommentForm } from '@/components/reports/comment-form';

interface PageProps {
  params: { id: string };
}

export default async function ReportDetailPage({ params }: PageProps) {
  const user = await getUserFromPage();
  const report = await prisma.report.findUnique({
    where: { id: params.id },
    include: {
      reporter: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      unifiedVotes: true,
      reportAuthorities: { include: { authority: true } },
      drives: { include: { drive: true } },
      discussions: {
        include: {
          user: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!report) notFound();
  const reportId = report.id;

  const isOwner = user?.id === report.reporterId;
  const voteCount = report.unifiedVotes.length;
  const linkedDrive = report.drives[0]?.drive ?? null;

  const daysPending = differenceInDays(new Date(), report.createdAt);

  const timeline = [
    'PENDING',
    'AUTHORITY_CONTACTED',
    'ELIGIBLE_FOR_DRIVE',
    'IN_PROGRESS',
    'READY_FOR_MONITORING',
    'UNDER_MONITORING',
    'RESOLVED',
  ];

  const currentIndex = timeline.indexOf(report.status);

  const locationLines = [
    // Line 1: Landmark, Pincode
    [report.landmark, report.pinCode].filter(Boolean).join(', '),

    // Line 2: City, Region
    [report.city, report.region].filter(Boolean).join(', '),

    // Line 3: Country
    report.country,
  ].filter(Boolean);

  const locationString = report.landmark
    ? `${report.landmark}, ${report.city ?? ''}`
    : (report.city ?? 'Location TBD');

  const authorityContacts = report.reportAuthorities.map((ra) => ({
    id: ra.id,

    authorityName: ra.authority.name,
    department: ra.authority.role.replace(/_/g, ' '),

    contactMethod: ra.contactMode ?? 'N/A',
    contactDate: ra.contactedAt ?? ra.createdAt,

    referenceNumber: ra.referenceId,
    notes: ra.submittedMessage ?? ra.responseNote,

    responseStatus: ra.status,
  }));

  const formatStatus = (s: string) =>
    s
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/^\w/, (c) => c.toUpperCase());

  async function voteAction() {
    'use server';

    const user = await getUserFromPage();
    if (!user) return;

    const existingVote = await prisma.vote.findUnique({
      where: {
        userId_reportId: {
          userId: user.id,
          reportId,
        },
      },
    });

    if (existingVote) return;

    await prisma.vote.create({
      data: {
        userId: user.id,
        reportId,
      },
    });
  }

  return (
    <div className='min-h-screen bg-background'>
      <main className='container mx-auto px-4 py-8'>
        {/* BACK */}
        <Link
          href='/reports'
          className='inline-flex items-center gap-2 text-sm text-muted-foreground mb-6 hover:text-foreground'
        >
          <ArrowLeft className='h-4 w-4' />
          Back to reports
        </Link>

        <div className='grid gap-8 lg:grid-cols-3'>
          {/* ================= LEFT ================= */}
          <div className='lg:col-span-2 space-y-6'>
            {/* HEADER */}
            <div>
              <h1 className='text-3xl font-bold'>{report.title}</h1>

              <div className='flex flex-wrap gap-4 text-sm text-muted-foreground mt-3'>
                <div className='flex items-center gap-2'>
                  <Avatar className='h-6 w-6'>
                    <AvatarFallback>{report.reporter.name?.[0] ?? 'U'}</AvatarFallback>
                  </Avatar>
                  {report.reporter.name}
                </div>

                <div className='flex items-center gap-1'>
                  <Calendar className='h-4 w-4' />
                  {format(report.createdAt, 'MMM d, yyyy')}
                </div>

                <div className='flex items-center gap-1'>
                  <Clock className='h-4 w-4' />
                  {formatDistanceToNow(report.updatedAt, { addSuffix: true })}
                </div>

                <div className='flex items-center gap-1'>
                  <MapPin className='h-4 w-4' />
                  {locationString}
                </div>
              </div>
            </div>

            {/* MEDIA */}
            {report.media.length > 0 && (
              <div className='grid sm:grid-cols-2 gap-4'>
                {report.media.map((url, i) => (
                  <div key={i} className='overflow-hidden rounded-lg border'>
                    <Image
                      src={url}
                      alt=''
                      width={600}
                      height={400}
                      className='aspect-video w-full object-cover transition-transform duration-300 hover:scale-105'
                    />
                  </div>
                ))}
              </div>
            )}

            {/* DESCRIPTION */}
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>{report.description}</CardContent>
            </Card>

            {/* TIMELINE */}
            <Card>
              <CardHeader>
                <CardTitle>Status Timeline</CardTitle>
              </CardHeader>

              <CardContent>
                <div className='relative'>
                  {timeline.map((status, index) => {
                    const isPast = index < currentIndex;
                    const isCurrent = index === currentIndex;

                    return (
                      <div key={status} className='flex gap-4 pb-6 last:pb-0'>
                        {/* LEFT DOT */}
                        <div className='relative flex flex-col items-center'>
                          <div
                            className={`flex h-8 w-8 items-center justify-center rounded-full border-2
                  ${
                    isCurrent
                      ? 'border-primary bg-primary text-primary-foreground'
                      : isPast
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-muted-foreground/30 text-muted-foreground/40'
                  }`}
                          >
                            {isPast ? (
                              <Check className='h-4 w-4' />
                            ) : (
                              <span className='text-xs font-medium'>{index + 1}</span>
                            )}
                          </div>

                          {index < timeline.length - 1 && (
                            <div
                              className={`absolute top-8 h-full w-0.5 ${
                                isPast ? 'bg-primary' : 'bg-muted-foreground/20'
                              }`}
                            />
                          )}
                        </div>

                        {/* TEXT */}
                        <div className='flex-1'>
                          <p
                            className={`font-medium ${
                              isCurrent
                                ? 'text-foreground'
                                : isPast
                                  ? 'text-muted-foreground'
                                  : 'text-muted-foreground/50'
                            }`}
                          >
                            {status.replace(/_/g, ' ')}
                          </p>

                          {isCurrent && (
                            <p className='text-sm text-muted-foreground mt-1'>Current status</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Authority Contacts */}
            {authorityContacts && authorityContacts.length > 0 && (
              <Card>
                <CardHeader className='flex flex-row items-center justify-between'>
                  <CardTitle className='text-lg'>Authority Contacts</CardTitle>
                  <Badge variant='secondary'>{authorityContacts.length} contacts</Badge>
                </CardHeader>
                <CardContent className='space-y-4'>
                  {authorityContacts.map((contact) => (
                    <div key={contact.id} className='rounded-lg border p-4'>
                      <div className='flex items-start justify-between'>
                        <div className='flex items-center gap-3'>
                          <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-secondary'>
                            <Building2 className='h-5 w-5 text-muted-foreground' />
                          </div>
                          <div>
                            <p className='font-medium'>{contact.authorityName}</p>
                            <p className='text-sm text-muted-foreground'>{contact.department}</p>
                          </div>
                        </div>
                        <Badge
                          variant='outline'
                          className={
                            contact.responseStatus === 'RESPONDED'
                              ? 'border-primary/30 bg-primary/10 text-primary'
                              : contact.responseStatus === 'CONTACTED'
                                ? 'border-amber-500/30 bg-amber-500/10 text-amber-600'
                                : contact.responseStatus === 'NO_RESPONSE'
                                  ? 'border-destructive/30 bg-destructive/10 text-destructive'
                                  : 'border-muted-foreground/30'
                          }
                        >
                          {formatStatus(contact.responseStatus)}
                        </Badge>
                      </div>
                      <div className='mt-3 flex items-center gap-4 text-sm text-muted-foreground'>
                        <span className='flex items-center gap-1'>
                          <Phone className='h-3.5 w-3.5' />
                          {contact.contactMethod}
                        </span>
                        <span className='flex items-center gap-1'>
                          <Calendar className='h-3.5 w-3.5' />
                          {format(contact.contactDate, 'MMM d, yyyy')}
                        </span>
                        {contact.referenceNumber && <span>Ref: {contact.referenceNumber}</span>}
                      </div>
                      {contact.notes && (
                        <p className='mt-3 text-sm text-muted-foreground'>{contact.notes}</p>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* DISCUSSION */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <MessageSquare className='h-5 w-5' />
                  Discussion
                </CardTitle>
              </CardHeader>

              <CardContent className='space-y-4'>
                <CommentForm
                  reportId={report.id}
                  initialComments={report.discussions.map((d) => ({
                    id: d.id,
                    userName: d.user.name ?? 'User',
                    content: d.content,
                    createdAt: d.createdAt,
                  }))}
                  currentUserName={user?.name ?? 'User'}
                />
              </CardContent>
            </Card>
          </div>

          {/* ================= RIGHT ================= */}
          <div className='space-y-6'>
            {/* VOTES */}
            <Card>
              <CardHeader>
                <CardTitle>Total Votes</CardTitle>
              </CardHeader>

              <CardContent className='text-center'>
                <p className='text-3xl font-bold'>{voteCount}</p>

                <form action={voteAction}>
                  <Button className='mt-4 w-full' type='submit'>
                    Vote Priority
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* MAP (FIXED) */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <MapPin className='h-5 w-5' />
                  Location
                </CardTitle>
              </CardHeader>

              <CardContent className='p-4'>
                <div className='overflow-hidden rounded-lg min-h-[150px]'>
                  <iframe
                    className='block w-full h-full'
                    loading='lazy'
                    referrerPolicy='no-referrer-when-downgrade'
                    src={
                      typeof report.latitude === 'number' && typeof report.longitude === 'number'
                        ? `https://www.google.com/maps?q=${report.latitude},${report.longitude}&z=15&output=embed`
                        : `https://www.google.com/maps?q=${encodeURIComponent(
                            report.city ?? 'India',
                          )}&z=13&output=embed`
                    }
                  />
                </div>

                <div className='flex items-start gap-2 mt-0.5'>
                  <MapPin className='h-4 w-4 shrink-0' />
                  <div className='text-sm text-muted-foreground leading-snug'>
                    {locationLines.map((line, i) => (
                      <div key={i}>{line}</div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ACTIONS */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <ReportActions
                  reportId={report.id}
                  status={report.status}
                  daysPending={daysPending}
                  drive={linkedDrive}
                  isOwner={isOwner}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
