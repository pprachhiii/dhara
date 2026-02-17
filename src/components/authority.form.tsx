'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { Check, ArrowLeft } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

import type { AuthorityCategory, AuthorityRole } from '@/lib/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
/* ---------------- CONSTANTS ---------------- */

const AUTHORITY_CATEGORIES: AuthorityCategory[] = ['GOVERNMENT', 'NGO', 'COMMUNITY', 'OTHER'];

const AUTHORITY_ROLES: AuthorityRole[] = ['CLEANUP', 'WASTE_MANAGEMENT'];

/* ---------------- TYPES ---------------- */

interface AuthorityFormData {
  name: string;
  category: AuthorityCategory | '';
  role: AuthorityRole | '';
  city: string;
  region: string;
  email: string;
  phone: string;
  website: string;
  other: string;
  active: boolean;
}

interface NominatimAddress {
  city?: string;
  town?: string;
  village?: string;
  state?: string;
}

interface NominatimResult {
  display_name: string;
  address: NominatimAddress;
}

/* ---------------- PAGE ---------------- */

export default function AuthorityFormPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('id');
  const isEdit = Boolean(editId);

  const [cityQuery, setCityQuery] = useState('');
  const [cityResults, setCityResults] = useState<NominatimResult[]>([]);
  const [step, setStep] = useState(1);
  type ContactMode = 'EMAIL' | 'PHONE' | 'WEBSITE' | 'OTHER';

  const [contactMode, setContactMode] = useState<ContactMode | ''>('');

  const [form, setForm] = useState<AuthorityFormData>({
    name: '',
    category: '',
    role: '',
    city: '',
    region: '',
    email: '',
    phone: '',
    website: '',
    other: '',
    active: true,
  });

  const hasAtLeastOneContact = Boolean(form.email || form.phone || form.website || form.other);

  const formatEnumLabel = (value: string) =>
    value
      .toLowerCase()
      .split('_')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

  const handleChange = <K extends keyof AuthorityFormData>(k: K, v: AuthorityFormData[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  /* ---------------- SUBMIT ---------------- */

  const handleSubmit = async () => {
    const res = await fetch(isEdit ? `/api/authority/${editId}` : '/api/authority', {
      method: isEdit ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        contactMode,
      }),
    });
    if (res.status === 409) {
      toast.error('Authority already exists');
      return;
    }

    if (!res.ok) {
      toast.error('Failed to save authority');
      return;
    }

    toast.success('Authority saved successfully');
    router.push('/authority');
  };

  const canStep1 = form.name && form.category && form.role;
  const canStep2 = form.city && form.region;

  const Required = () => <span className='text-red-500 ml-1'>*</span>;

  useEffect(() => {
    if (cityQuery.length < 2) {
      setCityResults([]);
      return;
    }

    fetch(
      `https://nominatim.openstreetmap.org/search?city=${cityQuery}&format=json&addressdetails=1`,
    )
      .then((r) => r.json())
      .then(setCityResults);
  }, [cityQuery]);
  const handleCitySelect = (c: NominatimResult) => {
    const city = c.address.city || c.address.town || c.address.village || '';

    setForm((p) => ({
      ...p,
      city,
      region: c.address.state || '',
    }));

    setCityQuery(city);
    setCityResults([]);
  };
  useEffect(() => {
    if (!isEdit) return;

    fetch(`/api/authority/${editId}`)
      .then((r) => r.json())
      .then((data) => {
        setForm({
          name: data.name,
          category: data.category,
          role: data.role,
          city: data.city,
          region: data.region ?? '',
          email: data.email ?? '',
          phone: data.phone ?? '',
          website: data.website ?? '',
          other: data.other ?? '',
          active: data.active,
        });

        setContactMode(data.contactMode);
        setCityQuery(data.city);
      });
  }, [editId, isEdit]);

  /* ---------------- UI ---------------- */

  return (
    <div className='min-h-screen bg-background'>
      <main className='container mx-auto max-w-3xl px-4 py-8'>
        {/* Back */}
        <Link
          href='/authority'
          className='mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground'
        >
          <ArrowLeft className='h-4 w-4' />
          Back to Authorities
        </Link>

        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-3xl font-bold'>{isEdit ? 'Edit Authority' : 'Create Authority'}</h1>
          <p className='mt-2 text-muted-foreground'>
            Add and manage organizations responsible for civic actions
          </p>
        </div>

        {/* Steps */}
        <div className='mb-8 flex items-center gap-2'>
          {[1, 2, 3].map((s) => (
            <div key={s} className='flex items-center gap-2'>
              <div
                className={`h-8 w-8 rounded-full border-2 flex items-center justify-center ${
                  step >= s ? 'border-primary text-primary' : 'border-muted'
                }`}
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
              <CardTitle>Authority Details</CardTitle>
              <CardDescription>Basic identity and responsibility</CardDescription>
            </CardHeader>

            <CardContent className='space-y-6'>
              <div>
                <Label>
                  Name <Required />
                </Label>
                <Input value={form.name} onChange={(e) => handleChange('name', e.target.value)} />
              </div>

              <div className='space-y-1'>
                <Label>
                  Category <Required />
                </Label>

                <Select
                  value={form.category}
                  onValueChange={(v) => handleChange('category', v as AuthorityCategory | '')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select Category' />
                  </SelectTrigger>

                  <SelectContent>
                    {AUTHORITY_CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {formatEnumLabel(c)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-1'>
                <Label>
                  Role <Required />
                </Label>

                <Select
                  value={form.role}
                  onValueChange={(v) => handleChange('role', v as AuthorityRole | '')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select Role' />
                  </SelectTrigger>

                  <SelectContent>
                    {AUTHORITY_ROLES.map((r) => (
                      <SelectItem key={r} value={r}>
                        {formatEnumLabel(r)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
              <CardTitle>Location</CardTitle>
              <CardDescription>Operational city and region</CardDescription>
            </CardHeader>

            <CardContent className='space-y-6'>
              <div>
                <Label>
                  City <Required />
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
                  Region / State <Required />
                </Label>
                <Input value={form.region} readOnly />
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

        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Contact & Status</CardTitle>
              <CardDescription>Select how this authority can be contacted</CardDescription>
            </CardHeader>

            <CardContent className='space-y-6'>
              <div>
                <Label>
                  Contact Method <Required />
                </Label>
                <Select
                  value={contactMode}
                  onValueChange={(v: ContactMode) => {
                    setContactMode(v);
                    setForm((p) => ({
                      ...p,
                      email: '',
                      phone: '',
                      website: '',
                      other: '',
                    }));
                  }}
                >
                  <SelectTrigger className='w-full h-9'>
                    <SelectValue placeholder='Select contact method' />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value='EMAIL'>Email</SelectItem>
                    <SelectItem value='PHONE'>Phone</SelectItem>
                    <SelectItem value='WEBSITE'>Website</SelectItem>
                    <SelectItem value='OTHER'>Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {contactMode === 'EMAIL' && (
                <Input
                  placeholder='Email'
                  value={form.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                />
              )}

              {contactMode === 'PHONE' && (
                <Input
                  placeholder='Phone number'
                  value={form.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                />
              )}

              {contactMode === 'WEBSITE' && (
                <Input
                  placeholder='Website URL'
                  value={form.website}
                  onChange={(e) => handleChange('website', e.target.value)}
                />
              )}

              {contactMode === 'OTHER' && (
                <Input
                  placeholder='Other contact info'
                  value={form.other}
                  onChange={(e) => handleChange('other', e.target.value)}
                />
              )}

              <div className='flex gap-3 border p-4 rounded-lg'>
                <Checkbox
                  checked={form.active}
                  onCheckedChange={(v) => handleChange('active', Boolean(v))}
                />
                <div>
                  <Label>Active Authority</Label>
                  <p className='text-sm text-muted-foreground'>
                    Can this authority be assigned tasks?
                  </p>
                </div>
              </div>

              <div className='flex justify-between'>
                <Button variant='white' onClick={() => setStep(2)}>
                  Back
                </Button>
                <Button onClick={handleSubmit} disabled={!hasAtLeastOneContact || !contactMode}>
                  {isEdit ? 'Update Authority' : 'Create Authority'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
