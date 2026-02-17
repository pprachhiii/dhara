'use client';

import React, { ReactElement } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';

interface Props {
  reportId: string;
  status: string;
  daysPending: number;
  drive: {
    id: string;
    status: string;
  } | null;
  isOwner: boolean;
}

export default function ReportActions({ reportId, status, daysPending, drive, isOwner }: Props) {
  const router = useRouter();

  async function flagReport() {
    try {
      await fetch(`/api/reports/${reportId}/flag`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Needs review' }),
      });
      toast.success('Report flagged for review');
    } catch {
      toast.error('Failed to flag report');
    }
  }

  async function deleteReport() {
    const confirmed = confirm('Are you sure you want to delete this report?');
    if (!confirmed) return;

    await fetch(`/api/reports/${reportId}`, { method: 'DELETE' });
    toast.success('Report deleted');
    router.push('/reports');
  }

  const actions: ReactElement[] = [];

  /* ================= FLAG (ALWAYS) ================= */
  actions.push(
    <Button key='flag' variant='white' onClick={flagReport}>
      Flag as Inoperative
    </Button>,
  );

  /* ================= STATUS LOGIC ================= */

  if (status === 'PENDING') {
    actions.push(
      <Button
        key='contact'
        className='bg-red-600 hover:bg-red-700'
        onClick={() => router.push(`/authority?report=${reportId}`)}
      >
        Contact Authority
      </Button>,
    );

    if (daysPending >= 7 && !drive) {
      actions.push(
        <Button
          key='propose-drive'
          className='bg-green-600 hover:bg-green-700'
          onClick={() => router.push(`/drives/new?report=${reportId}`)}
        >
          Propose Drive
        </Button>,
      );
    }
  }

  if (drive) {
    actions.push(
      <Button
        key='view-drive'
        className='bg-purple-600 hover:bg-purple-700'
        onClick={() => router.push(`/drives/${drive.id}`)}
      >
        View Drive
      </Button>,
    );
  }

  /* ================= OWNER ACTIONS ================= */

  if (isOwner) {
    actions.push(
      <Button key='edit' variant='white' onClick={() => router.push(`/reports/${reportId}/edit`)}>
        Edit Report
      </Button>,
    );

    actions.push(
      <Button key='delete' onClick={deleteReport} className='bg-red-500'>
        Delete Report
      </Button>,
    );
  }

  if (status === 'RESOLVED' || status === 'READY_FOR_MONITORING') {
    return (
      <p className='text-sm text-muted-foreground text-center'>This report has been resolved.</p>
    );
  }

  return <div className='flex flex-col gap-2'>{actions}</div>;
}
