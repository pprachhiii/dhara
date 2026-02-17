'use client';

import { Suspense } from 'react';
import DriveForm from '@/components/drives/drive-form';

export default function NewdrivePage() {
  return (
    <Suspense fallback={<div>Loading drive form...</div>}>
      <DriveForm />
    </Suspense>
  );
}
