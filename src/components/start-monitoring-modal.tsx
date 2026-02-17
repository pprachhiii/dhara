'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Volunteer } from '@/lib/types';
import { format } from 'date-fns';

interface Props {
  open: boolean;
  onClose: () => void;
  reportId: string;
}

export default function StartMonitoringModal({ open, onClose, reportId }: Props) {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [selectedVolunteer, setSelectedVolunteer] = useState<string | null>(null);
  const [checkDate, setCheckDate] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch('/api/volunteers')
      .then((res) => res.json())
      .then(setVolunteers);
  }, []);

  const handleSubmit = async () => {
    if (!checkDate) return alert('Please select a check date');
    setSubmitting(true);

    try {
      await fetch('/api/monitoring', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportId,
          volunteerId: selectedVolunteer,
          checkDate,
          notes,
        }),
      });
      onClose();
      window.location.reload();
    } catch {
      alert('Failed to start monitoring');
    } finally {
      setSubmitting(false);
    }
  };

  const today = new Date();
  const maxDate = new Date();
  maxDate.setMonth(today.getMonth() + 1);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className='max-w-lg'>
        <DialogHeader>
          <DialogTitle>Start Monitoring</DialogTitle>
        </DialogHeader>

        <div className='space-y-4'>
          <div>
            <Select onValueChange={setSelectedVolunteer}>
              <SelectTrigger>
                <SelectValue placeholder='Select Volunteer' />
              </SelectTrigger>
              <SelectContent>
                {volunteers.map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    {v.user.name ?? v.user.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Input
              type='date'
              value={checkDate}
              onChange={(e) => setCheckDate(e.target.value)}
              min={format(today, 'yyyy-MM-dd')}
              max={format(maxDate, 'yyyy-MM-dd')}
            />
          </div>

          <div>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder='Optional instructions'
            />
          </div>

          <div className='flex justify-end gap-2'>
            <Button onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Starting...' : 'Start Monitoring'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
