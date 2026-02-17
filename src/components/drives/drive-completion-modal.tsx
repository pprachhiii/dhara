'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

interface DriveCompletionModalProps {
  driveId: string;
  reportId: string;
  onClose: () => void;
}

export default function DriveCompletionModal({
  driveId,
  reportId,
  onClose,
}: DriveCompletionModalProps) {
  const [summary, setSummary] = useState('');
  const [successful, setSuccessful] = useState(true);
  const [remainingIssues, setRemainingIssues] = useState(false);
  const [proofImages, setProofImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);

    const uploadedImages = proofImages.map((file) => URL.createObjectURL(file));

    try {
      await fetch(`/api/drives/${driveId}/completion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          summary,
          successful,
          remainingIssues,
          proofImages: uploadedImages,
        }),
      });

      await fetch(`/api/reports/${reportId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'READY_FOR_MONITORING' }),
      });

      onClose();
      window.location.reload();
    } catch (err) {
      console.error(err);
      setLoading(false);
      alert('Failed to submit drive completion.');
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>Drive Completion Details</DialogTitle>
        </DialogHeader>

        <div className='space-y-4'>
          <textarea
            className='w-full border rounded p-2'
            placeholder='Summary of the drive'
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
          />

          <div className='flex items-center space-x-4'>
            <label>
              <input
                type='checkbox'
                checked={successful}
                onChange={() => setSuccessful(!successful)}
              />
              Successful
            </label>
            <label>
              <input
                type='checkbox'
                checked={remainingIssues}
                onChange={() => setRemainingIssues(!remainingIssues)}
              />
              Remaining Issues
            </label>
          </div>

          <input
            type='file'
            multiple
            onChange={(e) => setProofImages(Array.from(e.target.files || []))}
          />
        </div>

        <DialogFooter>
          <Button onClick={onClose} variant='white'>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Submitting...' : 'Submit'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
