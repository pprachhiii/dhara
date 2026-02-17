'use client';

import { useState, useTransition } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

export default function ReportResolveModal({
  reportId,
  open,
  onClose,
}: {
  reportId: string;
  open: boolean;
  onClose: () => void;
}) {
  const [summary, setSummary] = useState('');
  const [authority, setAuthority] = useState(false);
  const [remaining, setRemaining] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = () => {
    startTransition(async () => {
      const res = await fetch(`/api/reports/${reportId}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resolutionSummary: summary,
          resolvedByAuthority: authority,
          resolutionDate: new Date(),
          remainingConcerns: remaining,
        }),
      });

      if (res.ok) {
        toast.success('Report marked as resolved');
        onClose();
        location.reload();
      } else {
        toast.error('Failed to resolve report');
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Resolve Report</DialogTitle>
        </DialogHeader>

        <Textarea
          placeholder='Describe how the issue was resolved...'
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
        />

        <div className='flex items-center gap-2'>
          <Checkbox checked={authority} onCheckedChange={() => setAuthority(!authority)} />
          <span>Resolved by authority</span>
        </div>

        <div className='flex items-center gap-2'>
          <Checkbox checked={remaining} onCheckedChange={() => setRemaining(!remaining)} />
          <span>Remaining concerns</span>
        </div>

        <Button onClick={handleSubmit} disabled={isPending}>
          Confirm Resolution
        </Button>
      </DialogContent>
    </Dialog>
  );
}
