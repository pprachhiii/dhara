'use client';

import { Suspense } from 'react';
import ReportForm from '@/components/reports/report-form';

export default function NewReportPage() {
  return (
    <Suspense fallback={<div>Loading ...</div>}>
      <ReportForm />
    </Suspense>
  );
}
