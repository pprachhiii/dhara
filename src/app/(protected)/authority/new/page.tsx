'use client';

import AuthorityForm from '@/components/authority.form';
import { Suspense } from 'react';

export default function NewReportPage() {
  return (
    <Suspense fallback={<div>Loading ...</div>}>
      <AuthorityForm />
    </Suspense>
  );
}
