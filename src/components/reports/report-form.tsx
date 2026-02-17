'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';

import { Upload, X, ArrowLeft, Check } from 'lucide-react';
import toast from 'react-hot-toast';

/* ---------------- TYPES ---------------- */

interface NominatimAddress {
  city?: string;
  town?: string;
  village?: string;
  state?: string;
  country?: string;
  postcode?: string;
}

interface NominatimResult {
  display_name: string;
  lat: string;
  lon: string;
  address: NominatimAddress;
}

interface ReportFormData {
  title: string;
  description: string;
  city: string;
  region: string;
  country: string;
  pinCode: string;
  media: string[];
  landmark: string;
  nearSchoolOrHospital: boolean;
}

/* ---------------- PAGE ---------------- */

export default function CreateReportPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('id');
  const isEdit = Boolean(editId);

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<ReportFormData>({
    title: '',
    description: '',
    city: '',
    region: '',
    country: '',
    pinCode: '',
    media: [],
    landmark: '',
    nearSchoolOrHospital: false,
  });

  const [cityQuery, setCityQuery] = useState('');
  const [cityResults, setCityResults] = useState<NominatimResult[]>([]);

  /* ---------------- LOAD EDIT DATA ---------------- */

  useEffect(() => {
    if (!isEdit || !editId) return;

    (async () => {
      const res = await fetch(`/api/reports/${editId}`);
      const report: ReportFormData = await res.json();

      setFormData((prev) => ({ ...prev, ...report }));
      setCityQuery(report.city || '');
    })();
  }, [editId, isEdit]);

  // --- Properly typed handleChange ---
  const handleChange = <K extends keyof ReportFormData>(key: K, value: ReportFormData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  /* ---------------- CITY AUTOCOMPLETE ---------------- */

  useEffect(() => {
    if (cityQuery.length < 2) return;

    const controller = new AbortController();

    fetch(
      `https://nominatim.openstreetmap.org/search?city=${cityQuery}&format=json&addressdetails=1`,
      { signal: controller.signal },
    )
      .then((r) => r.json())
      .then(setCityResults)
      .catch((err) => {
        if (err.name !== 'AbortError') console.error(err);
      });

    return () => controller.abort();
  }, [cityQuery]);

  const handleCitySelect = (c: NominatimResult) => {
    setFormData((prev) => ({
      ...prev,
      city: c.address.city || c.address.town || '',
      region: c.address.state || '',
      country: c.address.country || '',
      pinCode: c.address.postcode || '',
    }));
    setCityQuery(c.display_name);
    setCityResults([]);
  };

  /* ---------------- FILE UPLOAD ---------------- */

  const handleFileUpload = async (file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', body: fd });
    const data: { url: string } = await res.json();

    setFormData((prev) => ({ ...prev, media: [...prev.media, data.url] }));
  };

  const removeMedia = (i: number) =>
    setFormData((prev) => ({
      ...prev,
      media: prev.media.filter((_, x) => x !== i),
    }));

  /* ---------------- SUBMIT ---------------- */

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await fetch(isEdit ? `/api/reports/${editId}` : '/api/reports', {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      toast.success('Report submitted!');
      router.push('/reports');
    } catch (err) {
      console.error(err);
      toast.error('Failed to submit report');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canStep1 = formData.title && formData.description && formData.media.length > 0;
  const canStep2 = formData.city && formData.country && formData.pinCode && formData.landmark;

  /* ---------------- UI ---------------- */

  return (
    <div className='min-h-screen bg-background'>
      <main className='container mx-auto max-w-3xl px-4 py-8'>
        {/* Back */}
        <Link
          href='/reports'
          className='mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground'
        >
          <ArrowLeft className='h-4 w-4' /> Back to Reports
        </Link>

        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-3xl font-bold'>Report a Civic Issue</h1>
          <p className='mt-2 text-muted-foreground'>
            Help improve your community by reporting issues that need attention
          </p>
        </div>

        {/* Steps */}
        <div className='mb-8 flex items-center gap-2'>
          {[1, 2, 3].map((s) => (
            <div key={s} className='flex items-center gap-2'>
              <div
                className={`h-8 w-8 rounded-full border-2 flex items-center justify-center ${step >= s ? 'border-primary text-primary' : 'border-muted'}`}
              >
                {step > s ? <Check className='h-4 w-4' /> : s}
              </div>
              {s < 3 && <div className='h-0.5 w-12 bg-muted' />}
            </div>
          ))}
        </div>

        {/* ---------------- STEP 1 ---------------- */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Add photos and describe the issue you want to report
              </CardDescription>
            </CardHeader>

            <CardContent className='space-y-6'>
              {/* Photos */}
              <div>
                <Label>
                  Photos <span className='text-red-500'>*</span>
                </Label>

                <div className='grid sm:grid-cols-3 gap-4 mt-3'>
                  {formData.media.map((m, i) => (
                    <div
                      key={i}
                      className='relative aspect-video rounded-lg border overflow-hidden'
                    >
                      <Image src={m} alt='' fill className='object-cover' />
                      <button
                        onClick={() => removeMedia(i)}
                        className='absolute top-2 right-2 bg-white p-1 rounded shadow'
                      >
                        <X className='h-4 w-4' />
                      </button>
                    </div>
                  ))}

                  {/* Add Photo */}
                  <button
                    onClick={() => document.getElementById('file')?.click()}
                    className='border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-2 h-32 hover:border-yellow-400 hover:bg-yellow-50 transition'
                  >
                    <Upload className='h-8 w-8 text-muted-foreground' />
                    <span className='text-sm font-medium text-muted-foreground'>Add Photo</span>
                  </button>

                  <input
                    id='file'
                    type='file'
                    hidden
                    multiple
                    onChange={(e) =>
                      e.target.files && Array.from(e.target.files).forEach(handleFileUpload)
                    }
                  />
                </div>
              </div>

              <div>
                <Label>
                  Title <span className='text-red-500'>*</span>{' '}
                </Label>
                <Input
                  placeholder='Brief summary of the issue'
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                />
              </div>

              <div>
                <Label>
                  Description <span className='text-red-500'>*</span>{' '}
                </Label>
                <Textarea
                  placeholder='Provide detailed information...'
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                />
              </div>

              <div className='flex justify-end'>
                <Button disabled={!canStep1} onClick={() => setStep(2)}>
                  Continue
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ---------------- STEP 2 ---------------- */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Location Details</CardTitle>
              <CardDescription>Provide city and nearby landmark</CardDescription>
            </CardHeader>

            <CardContent className='space-y-6'>
              <div>
                <Label>
                  City <span className='text-red-500'>*</span>{' '}
                </Label>
                <Input
                  value={cityQuery}
                  onChange={(e) => setCityQuery(e.target.value)}
                  placeholder='Search city'
                />
                {cityResults.length > 0 && (
                  <ul className='border mt-2 rounded bg-white max-h-40 overflow-y-auto'>
                    {cityResults.map((c, i) => (
                      <li
                        key={i}
                        className='p-2 hover:bg-gray-100 cursor-pointer'
                        onClick={() => handleCitySelect(c)}
                      >
                        {c.display_name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <Label>
                  Pin Code <span className='text-red-500'>*</span>{' '}
                </Label>
                <Input
                  value={formData.pinCode}
                  onChange={(e) => handleChange('pinCode', e.target.value)}
                />
              </div>

              <div>
                <Label>
                  Landmark <span className='text-red-500'>*</span>{' '}
                </Label>
                <Input
                  placeholder='Near Sunrise Public School'
                  value={formData.landmark}
                  onChange={(e) => handleChange('landmark', e.target.value)}
                />
              </div>

              <div className='flex justify-between'>
                <Button variant='white' onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button disabled={!canStep2} onClick={() => setStep(3)}>
                  Continue
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ---------------- STEP 3  ---------------- */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Final Details</CardTitle>
              <CardDescription>Confirm sensitive area and submit</CardDescription>
            </CardHeader>

            <CardContent className='space-y-6'>
              <div className='flex gap-3 border p-4 rounded-lg'>
                <Checkbox
                  checked={formData.nearSchoolOrHospital}
                  onCheckedChange={(v) => handleChange('nearSchoolOrHospital', v as boolean)}
                />
                <div>
                  <Label>Near School or Hospital</Label>
                  <p className='text-sm text-muted-foreground'>
                    Is this issue located near a sensitive area?
                  </p>
                </div>
              </div>

              <div className='bg-secondary/50 p-4 rounded-lg text-sm space-y-2'>
                <div className='flex justify-between'>
                  <span>Title</span>
                  <span>{formData.title}</span>
                </div>
                <div className='flex justify-between'>
                  <span>City</span>
                  <span>{formData.city}</span>
                </div>
                <div className='flex justify-between'>
                  <span>Landmark</span>
                  <span>{formData.landmark}</span>
                </div>
                <div className='flex justify-between'>
                  <span>Photos</span>
                  <span>{formData.media.length}</span>
                </div>
              </div>

              <div className='flex justify-between'>
                <Button variant='white' onClick={() => setStep(2)}>
                  Back
                </Button>
                <Button onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Submit Report'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
