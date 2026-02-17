'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

import {
  ArrowLeft,
  ArrowRight,
  CalendarIcon,
  Clock,
  MapPin,
  Users,
  CheckCircle,
  Plus,
  Trash2,
  Info,
  Sparkles,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/stores';

/* ---------------- TYPES ---------------- */

interface Task {
  id: string;
  name: string;
  volunteersNeeded: number;
  description: string;
}

/* ---------------- PAGE ---------------- */

export default function CreateDrivePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reportIdFromUrl = searchParams.get('reportId');

  const { reports, fetchReports } = useAppStore();

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [date, setDate] = useState<Date | undefined>();

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    startTime: '',
    durationHr: '',
    volunteers: '',
    location: {
      area: '',
      wardNumber: '',
      city: '',
      pinCode: '',
      directions: '',
    },
    linkedReportId: reportIdFromUrl ?? '',
    safetyClassification: '',
    energyLevel: '',
    providedItems: [] as string[], // for checkboxes
    volunteerNotes: '',
    specialNotes: '',
  });

  const [tasks, setTasks] = useState<Task[]>([
    { id: crypto.randomUUID(), name: '', volunteersNeeded: 1, description: '' },
  ]);

  /* ---------------- DATA ---------------- */

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const eligibleReports = reports.filter((r) => r.status === 'ELIGIBLE_FOR_DRIVE');

  const categories = [
    'Clean-up',
    'Tree Plantation',
    'Awareness',
    'Repair',
    'Health Camp',
    'Education',
    'Other',
  ];

  /* ---------------- TASK HANDLERS ---------------- */

  const addTask = () =>
    setTasks((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name: '',
        volunteersNeeded: 1,
        description: '',
      },
    ]);

  const removeTask = (id: string) => tasks.length > 1 && setTasks(tasks.filter((t) => t.id !== id));

  const updateTask = (id: string, field: keyof Task, value: string | number) =>
    setTasks(tasks.map((t) => (t.id === id ? { ...t, [field]: value } : t)));

  /* ---------------- SUBMIT ---------------- */

  const handlePublish = async () => {
    if (!form.title || !date || !form.startTime || !form.location.area) {
      toast.error('Please fill all required fields');
      return;
    }

    if (!form.linkedReportId) {
      toast.error('Please select a report');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        title: form.title,
        description: form.description,
        category: form.category,
        date: format(date, 'yyyy-MM-dd'),
        startTime: form.startTime,
        durationHr: Number(form.durationHr),
        participant: Number(form.volunteers),
        location: form.location,
        safetyClassification: form.safetyClassification,
        energyLevel: form.energyLevel,
        providedItems: form.providedItems,
        volunteerNotes: form.volunteerNotes,
        specialNotes: form.specialNotes,
        linkedReportId: form.linkedReportId,
        tasks: tasks
          .filter((t) => t.name.trim())
          .map((t) => ({
            title: t.name,
            description: t.description,
            volunteersNeeded: t.volunteersNeeded,
          })),
      };

      const res = await fetch('/api/drives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to create drive');

      toast.success('Drive published successfully');
      router.push('/drives');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepIndicator = () => (
    <div className='flex items-center justify-center mb-8'>
      {[1, 2, 3, 4].map((s) => (
        <div key={s} className='flex items-center'>
          <div
            className={cn(
              'h-10 w-10 rounded-full flex items-center justify-center font-medium',
              step >= s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
            )}
          >
            {step > s ? <CheckCircle className='h-5 w-5' /> : s}
          </div>
          {s < 4 && <div className={cn('w-12 h-1 mx-2', step > s ? 'bg-primary' : 'bg-muted')} />}
        </div>
      ))}
    </div>
  );

  /* ---------------- UI ---------------- */

  return (
    <div className='min-h-screen bg-background'>
      <main className='container mx-auto px-4 py-8 max-w-3xl'>
        <Link
          href='/drives'
          className='inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6'
        >
          <ArrowLeft className='h-4 w-4 mr-1' />
          Back to Drives
        </Link>

        <div className='mb-8'>
          <h1 className='text-3xl font-bold mb-2'>Organize a Community Drive</h1>
          <p className='text-muted-foreground'>
            Create a volunteer drive to address civic issues in your community
          </p>
        </div>

        {renderStepIndicator()}

        {/* Step 1: Basic Info */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className='space-y-6'>
              <div className='space-y-2'>
                <Label htmlFor='title'>Drive Title *</Label>
                <Input
                  id='title'
                  placeholder='e.g., Community Park Clean-up Drive'
                  value={form.title}
                  onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='description'>Description *</Label>
                <Textarea
                  id='description'
                  rows={4}
                  value={form.description}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                />
              </div>

              <div className='grid gap-4 sm:grid-cols-2'>
                <div className='space-y-2'>
                  <Label>Category *</Label>
                  <Select
                    value={form.category}
                    onValueChange={(value) => setForm((prev) => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Select category' />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat.toLowerCase()}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className='space-y-2'>
                <Label>Link to Existing Report (Optional)</Label>
                <Select
                  value={form.linkedReportId || 'none'}
                  onValueChange={(value) =>
                    setForm((prev) => ({
                      ...prev,
                      linkedReportId: value === 'none' ? '' : value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select a verified report to address' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='none'>No linked report</SelectItem>
                    {eligibleReports.map((report) => (
                      <SelectItem key={report.id} value={report.id}>
                        {report.title} – {report.city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className='text-xs text-muted-foreground'>
                  Linking to a report helps track issue resolution
                </p>
              </div>

              <div className='flex justify-end'>
                <Button onClick={() => setStep(2)}>
                  Next: Schedule & Location
                  <ArrowRight className='h-4 w-4 ml-2' />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Schedule & Location */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Schedule & Location</CardTitle>
            </CardHeader>
            <CardContent className='space-y-6'>
              <div className='grid gap-4 sm:grid-cols-2'>
                <div className='space-y-2'>
                  <Label>Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant='white'
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !date && 'text-muted-foreground',
                        )}
                      >
                        <CalendarIcon className='mr-2 h-4 w-4' />
                        {date ? format(date, 'PPP') : 'Pick a date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className='w-auto p-0' align='start'>
                      <Calendar
                        mode='single'
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                        disabled={(date) => date < new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className='space-y-2'>
                  <Label>Duration *</Label>
                  <Select
                    value={form.durationHr}
                    onValueChange={(value) => setForm((prev) => ({ ...prev, durationHr: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Select duration' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='2'>2 hours</SelectItem>
                      <SelectItem value='3'>3 hours</SelectItem>
                      <SelectItem value='4'>4 hours</SelectItem>
                      <SelectItem value='6'>Half day (6 hours)</SelectItem>
                      <SelectItem value='8'>Full day</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className='grid gap-4 sm:grid-cols-2'>
                <div className='space-y-2'>
                  <Label>Start Time *</Label>
                  <Select
                    value={form.startTime}
                    onValueChange={(value) => setForm((prev) => ({ ...prev, startTime: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Select start time' />
                    </SelectTrigger>
                    <SelectContent>
                      {[
                        '6:00 AM',
                        '7:00 AM',
                        '8:00 AM',
                        '9:00 AM',
                        '10:00 AM',
                        '2:00 PM',
                        '3:00 PM',
                        '4:00 PM',
                      ].map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className='space-y-2'>
                  <Label>Volunteers Needed *</Label>
                  <Input
                    type='number'
                    min={5}
                    value={form.volunteers}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        volunteers: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <div className='space-y-4'>
                <Label>Location Details *</Label>
                <div className='grid gap-4 sm:grid-cols-2'>
                  <Input
                    placeholder='Area / Landmark'
                    value={form.location.area}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        location: { ...prev.location, area: e.target.value },
                      }))
                    }
                  />
                  <Input
                    placeholder='Ward Number'
                    value={form.location.wardNumber}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        location: {
                          ...prev.location,
                          wardNumber: e.target.value,
                        },
                      }))
                    }
                  />{' '}
                </div>
                <div className='grid gap-4 sm:grid-cols-2'>
                  <Input
                    placeholder='City'
                    value={form.location.city}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        location: { ...prev.location, city: e.target.value },
                      }))
                    }
                  />
                  <Input
                    placeholder='PIN Code'
                    value={form.location.pinCode}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        location: { ...prev.location, pinCode: e.target.value },
                      }))
                    }
                  />{' '}
                </div>
                <Textarea
                  placeholder='Meeting point and specific directions...'
                  value={form.location.directions}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      location: {
                        ...prev.location,
                        directions: e.target.value,
                      },
                    }))
                  }
                />
              </div>

              <div className='flex justify-between'>
                <Button variant='white' onClick={() => setStep(1)}>
                  <ArrowLeft className='h-4 w-4 mr-2' />
                  Previous
                </Button>
                <Button onClick={() => setStep(3)}>
                  Next: Tasks & Requirements
                  <ArrowRight className='h-4 w-4 ml-2' />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Tasks & Requirements */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Tasks & Requirements</CardTitle>
            </CardHeader>
            <CardContent className='space-y-6'>
              <div className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <Label>Task Breakdown</Label>
                  <Button variant='white' size='sm' onClick={addTask}>
                    <Plus className='h-4 w-4 mr-1' />
                    Add Task
                  </Button>
                </div>

                {tasks.map((task, index) => (
                  <div key={task.id} className='p-4 border rounded-lg space-y-3'>
                    <div className='flex items-center justify-between'>
                      <span className='text-sm font-medium'>Task {index + 1}</span>
                      {tasks.length > 1 && (
                        <Button size='sm' onClick={() => removeTask(task.id)}>
                          <Trash2 className='h-4 w-4 text-muted-foreground' />
                        </Button>
                      )}
                    </div>
                    <div className='grid gap-3 sm:grid-cols-3'>
                      <div className='sm:col-span-2'>
                        <Input
                          placeholder='Task name (e.g., Waste Collection)'
                          value={task.name}
                          onChange={(e) => updateTask(task.id, 'name', e.target.value)}
                        />
                      </div>
                      <Input
                        type='number'
                        placeholder='Volunteers'
                        min={1}
                        value={task.volunteersNeeded}
                        onChange={(e) =>
                          updateTask(task.id, 'volunteersNeeded', parseInt(e.target.value) || 1)
                        }
                      />
                    </div>
                    <Input
                      placeholder='Brief description (optional)'
                      value={task.description}
                      onChange={(e) => updateTask(task.id, 'description', e.target.value)}
                    />
                  </div>
                ))}
              </div>

              <div className='space-y-4'>
                <Label>What Will Be Provided</Label>
                <div className='grid gap-2 sm:grid-cols-2'>
                  {[
                    'Gloves',
                    'Equipment/Tools',
                    'Garbage Bags',
                    'First Aid',
                    'Refreshments',
                    'Water',
                    'Certificate',
                    'Transportation',
                  ].map((item) => (
                    <div key={item} className='flex items-center space-x-2'>
                      <Checkbox id={item} />
                      <label
                        htmlFor={item}
                        className='text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
                      >
                        {item}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className='space-y-2'>
                <Label>What Volunteers Should Bring</Label>
                <Textarea
                  placeholder='e.g., Comfortable clothes, water bottle, sunscreen...'
                  rows={3}
                />
              </div>

              <div className='space-y-2'>
                <Label>Special Requirements or Notes</Label>
                <Textarea
                  placeholder='Any age restrictions, physical requirements, or special instructions...'
                  rows={2}
                />
              </div>

              <div className='flex justify-between'>
                <Button variant='white' onClick={() => setStep(2)}>
                  <ArrowLeft className='h-4 w-4 mr-2' />
                  Previous
                </Button>
                <Button onClick={() => setStep(4)}>
                  Next: Review & Publish
                  <ArrowRight className='h-4 w-4 ml-2' />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        {/* STEP 4 */}
        {step === 4 && (
          <div className='space-y-6'>
            <Card>
              <CardHeader>
                <CardTitle>Review Your Drive</CardTitle>
              </CardHeader>
              <CardContent className='space-y-6'>
                <div className='p-4 bg-muted/50 rounded-lg space-y-4'>
                  <div className='flex items-start gap-3'>
                    <Sparkles className='h-5 w-5 text-primary mt-0.5' />
                    <div>
                      <h3 className='font-semibold text-lg'>{form.title}</h3>
                      <p className='text-sm text-muted-foreground mt-1'>{form.description}</p>
                    </div>
                  </div>

                  <div className='grid gap-3 sm:grid-cols-2 pt-2'>
                    <div className='flex items-center gap-2 text-sm'>
                      <CalendarIcon className='h-4 w-4' />
                      {date ? format(date, 'PPP') : '—'}
                    </div>
                    <div className='flex items-center gap-2 text-sm'>
                      <Clock className='h-4 w-4' />
                      {form.startTime}
                    </div>
                    <div className='flex items-center gap-2 text-sm'>
                      <MapPin className='h-4 w-4' />
                      {form.location.area}
                    </div>
                    <div className='flex items-center gap-2 text-sm'>
                      <Users className='h-4 w-4' />
                      {form.volunteers} volunteers
                    </div>
                  </div>

                  <div className='flex flex-wrap gap-2'>
                    {tasks
                      .filter((t) => t.name)
                      .map((t) => (
                        <Badge key={t.id} variant='secondary'>
                          {t.name} ({t.volunteersNeeded})
                        </Badge>
                      ))}
                  </div>
                </div>

                <div className='flex items-start gap-3 p-4 bg-amber-50 rounded-lg border border-amber-200'>
                  <Info className='h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5' />
                  <div className='text-sm'>
                    <p className='font-medium text-amber-800'>Before publishing:</p>
                    <ul className='text-amber-700 mt-1 space-y-1'>
                      <li>- Your drive will be visible to all community members</li>
                      <li>- You will be responsible for coordinating volunteers</li>
                      <li>- Make sure you have necessary permissions for the location</li>
                    </ul>
                  </div>
                </div>
                <div className='flex items-center space-x-2'>
                  <Checkbox id='terms' />
                  <label htmlFor='terms' className='text-sm'>
                    I confirm that I have the authority to organize this drive and will follow
                    community guidelines
                  </label>
                </div>
              </CardContent>
            </Card>

            <div className='flex justify-between'>
              <Button variant='white' onClick={() => setStep(3)}>
                <ArrowLeft className='h-4 w-4 mr-2' />
                Previous
              </Button>

              <Button onClick={handlePublish} disabled={isSubmitting}>
                <CheckCircle className='h-4 w-4 mr-2' />
                Publish Drive
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
