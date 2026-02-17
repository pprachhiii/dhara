'use client';

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { AuthorityCategory, AuthorityRole, ContactMode, Authority } from '@prisma/client';

/* ================= TYPES ================= */

interface Props {
  open: boolean;
  onClose: () => void;
  reportId: string;
}

interface FormState {
  category: AuthorityCategory | '';
  role: AuthorityRole | '';
  city: string;
  region: string;

  email: string;
  phone: string;
  website: string;
  other: string;

  message: string;
  referenceId: string;
  contactedAt: string;
}

interface NominatimResult {
  display_name: string;
  address: {
    city?: string;
    town?: string;
    village?: string;
    state?: string;
  };
}

/* ================= CONSTANTS ================= */

const CATEGORIES: AuthorityCategory[] = ['GOVERNMENT', 'NGO', 'COMMUNITY', 'OTHER'];

const ROLES: AuthorityRole[] = ['CLEANUP', 'WASTE_MANAGEMENT'];

/* ================= COMPONENT ================= */

export default function ContactAuthorityModal({ open, onClose, reportId }: Props) {
  const [loading, setLoading] = useState(false);

  /* ===== AUTHORITY LOOKUP ===== */

  const [authorityName, setAuthorityName] = useState('');
  const [existingAuthority, setExistingAuthority] = useState<Authority | null>(null);

  const isExisting = Boolean(existingAuthority?.id);

  /* ===== SINGLE SOURCE OF TRUTH ===== */

  const [contactMode, setContactMode] = useState<ContactMode | null>(null);

  /* ===== CITY SEARCH ===== */

  const [cityQuery, setCityQuery] = useState('');
  const [cityResults, setCityResults] = useState<NominatimResult[]>([]);

  /* ===== FORM STATE ===== */

  const [form, setForm] = useState<FormState>({
    category: '',
    role: '',
    city: '',
    region: '',

    email: '',
    phone: '',
    website: '',
    other: '',

    message: '',
    referenceId: '',
    contactedAt: '',
  });

  const update = (k: keyof FormState, v: string) => setForm((p) => ({ ...p, [k]: v }));

  /* ================= AUTHORITY SEARCH ================= */

  useEffect(() => {
    if (authorityName.length < 3) {
      setExistingAuthority(null);
      return;
    }

    const ctrl = new AbortController();

    fetch(`/api/authority?search=${encodeURIComponent(authorityName)}`, {
      signal: ctrl.signal,
    })
      .then((r) => r.ok && r.json())
      .then((res) => {
        if (res?.length) setExistingAuthority(res[0]);
        else setExistingAuthority(null);
      })
      .catch(() => {});

    return () => ctrl.abort();
  }, [authorityName]);

  /* ================= PREFILL EXISTING AUTHORITY ================= */

  useEffect(() => {
    if (!existingAuthority) return;

    setAuthorityName(existingAuthority.name);
    setContactMode(existingAuthority.contactMode as ContactMode);

    setForm({
      category: existingAuthority.category,
      role: existingAuthority.role,
      city: existingAuthority.city,
      region: existingAuthority.region ?? '',

      email: existingAuthority.email ?? '',
      phone: existingAuthority.phone ?? '',
      website: existingAuthority.website ?? '',
      other: existingAuthority.other ?? '',

      message: '',
      referenceId: '',
      contactedAt: '',
    });
  }, [existingAuthority]);

  /* ================= CITY SEARCH ================= */

  useEffect(() => {
    if (cityQuery.length < 2 || isExisting) return;

    fetch(
      `https://nominatim.openstreetmap.org/search?city=${cityQuery}&format=json&addressdetails=1`,
    )
      .then((r) => r.json())
      .then(setCityResults);
  }, [cityQuery, isExisting]);

  const selectCity = (c: NominatimResult) => {
    const city = c.address.city || c.address.town || c.address.village || '';

    setForm((p) => ({
      ...p,
      city,
      region: c.address.state || '',
    }));

    setCityQuery(city);
    setCityResults([]);
  };

  /* ================= SUBMIT ================= */

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const payload = {
      authority: {
        id: existingAuthority?.id ?? null,
        name: authorityName,
        category: form.category,
        role: form.role,
        city: form.city,
        region: form.region,
        contactMode,
        email: contactMode === ContactMode.EMAIL ? form.email : null,
        phone: contactMode === ContactMode.PHONE ? form.phone : null,
        website: contactMode === ContactMode.WEBSITE ? form.website : null,
        other:
          contactMode === ContactMode.SOCIAL_MEDIA ||
          contactMode === ContactMode.IN_PERSON ||
          contactMode === ContactMode.OTHER
            ? form.other
            : null,
      },

      reportAuthority: {
        contactMode,
        platformDetail: (() => {
          switch (contactMode) {
            case ContactMode.EMAIL:
              return form.email;
            case ContactMode.PHONE:
              return form.phone;
            case ContactMode.WEBSITE:
              return form.website;
            default:
              return form.other;
          }
        })(),

        submittedMessage: form.message,
        referenceId: form.referenceId || null,
        contactedAt: form.contactedAt,
      },
    };

    const res = await fetch(`/api/reports/${reportId}/contact-authority`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    setLoading(false);
    if (!res.ok) return alert('Failed');

    onClose();
    window.location.reload();
  }

  /* ================= UI ================= */

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className='max-w-2xl'>
        <DialogHeader>
          <DialogTitle>Contact Authority</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <Input
            value={authorityName}
            onChange={(e) => setAuthorityName(e.target.value)}
            placeholder='Authority name'
            required
          />

          <div className='grid grid-cols-2 gap-3'>
            <Select
              disabled={isExisting}
              value={form.category}
              onValueChange={(v) => update('category', v as AuthorityCategory)}
            >
              <SelectTrigger>
                <SelectValue placeholder='Category' />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              disabled={isExisting}
              value={form.role}
              onValueChange={(v) => update('role', v as AuthorityRole)}
            >
              <SelectTrigger>
                <SelectValue placeholder='Role' />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {!isExisting && (
            <>
              <Input
                value={cityQuery}
                onChange={(e) => setCityQuery(e.target.value)}
                placeholder='Search city'
              />

              {cityResults.map((c, i) => (
                <div
                  key={i}
                  onClick={() => selectCity(c)}
                  className='cursor-pointer border p-2 text-sm'
                >
                  {c.display_name}
                </div>
              ))}
            </>
          )}

          <Input value={form.region} readOnly placeholder='Region' />

          <Select
            value={contactMode ?? undefined}
            onValueChange={(v) => setContactMode(v as ContactMode)}
          >
            <SelectTrigger>
              <SelectValue placeholder='Contact mode' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='EMAIL'>Email</SelectItem>
              <SelectItem value='PHONE'>Phone</SelectItem>
              <SelectItem value='WEBSITE'>Website</SelectItem>
              <SelectItem value='SOCIAL_MEDIA'>Social Media</SelectItem>
              <SelectItem value='IN_PERSON'>In Person</SelectItem>
              <SelectItem value='OTHER'>Other</SelectItem>
            </SelectContent>
          </Select>

          {contactMode === 'EMAIL' && (
            <Input
              disabled={isExisting}
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              placeholder='Email'
            />
          )}

          {contactMode === 'PHONE' && (
            <Input
              disabled={isExisting}
              value={form.phone}
              onChange={(e) => update('phone', e.target.value)}
              placeholder='Phone number'
            />
          )}

          {contactMode === ContactMode.WEBSITE && (
            <Input
              disabled={isExisting}
              value={form.website}
              onChange={(e) => update('website', e.target.value)}
              placeholder='Website URL'
            />
          )}

          {(contactMode === 'SOCIAL_MEDIA' ||
            contactMode === 'IN_PERSON' ||
            contactMode === 'OTHER') && (
            <Input
              disabled={isExisting}
              value={form.other}
              onChange={(e) => update('other', e.target.value)}
              placeholder='Contact detail'
            />
          )}

          <Textarea
            value={form.message}
            onChange={(e) => update('message', e.target.value)}
            placeholder='Message sent'
            required
          />

          <Input
            value={form.referenceId}
            onChange={(e) => update('referenceId', e.target.value)}
            placeholder='Complaint / Reference ID'
          />

          <Input
            type='date'
            value={form.contactedAt}
            onChange={(e) => update('contactedAt', e.target.value)}
            required
          />

          <Button disabled={loading} type='submit'>
            {loading ? 'Saving...' : 'Confirm'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
