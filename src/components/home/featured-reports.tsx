'use client';

import { useEffect, useState } from 'react';
import { ReportCard } from '@/components/reports/report-card';
import { Report } from '@/lib/types';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export function FeaturedReports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReports() {
      try {
        const res = await fetch('/api/reports/featured');
        if (!res.ok) {
          throw new Error(`Failed to fetch: ${res.status}`);
        }
        const data = await res.json();
        setReports(data);
      } catch (error) {
        console.error('Failed to load featured reports', error);
      } finally {
        setLoading(false);
      }
    }
    fetchReports();
  }, []);

  if (loading) return <p className='text-center py-12'>Loading...</p>;

  return (
    <section className='border-t bg-secondary/30 py-16'>
      <div className='container mx-auto px-4'>
        {/* Header */}
        <div className='mb-8 flex items-center justify-between'>
          <div>
            <h2 className='text-2xl font-bold'>Priority Issues</h2>
            <p className='text-muted-foreground'>High-impact reports needing community attention</p>
          </div>

          <Link href='/reports'>
            <Button variant='white' className='gap-2'>
              View All
              <ArrowRight className='h-4 w-4' />
            </Button>
          </Link>
        </div>

        {/* Content */}
        {reports.length === 0 ? (
          <p className='text-center text-muted-foreground'>No priority reports yet.</p>
        ) : (
          <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-2'>
            {reports.map((report) => (
              <ReportCard key={report.id} report={report} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
