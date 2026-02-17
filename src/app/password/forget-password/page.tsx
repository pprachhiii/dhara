'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/auth/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'forgot', email }),
      });

      const data: { message?: string; error?: string } = await res.json();

      if (!res.ok) {
        const errorMessage = typeof data.error === 'string' ? data.error : 'Something went wrong';
        toast.error(errorMessage);
      } else {
        toast.success(data.message || 'Password reset email sent');

        router.push('/password/check-email');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className='max-w-md mx-auto p-6 bg-white shadow rounded-xl space-y-4'
    >
      <h1 className='text-2xl font-bold'>Forgot Password</h1>
      <Input
        type='email'
        placeholder='Enter your email'
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <Button type='submit' disabled={loading} className='w-full'>
        {loading ? 'Sending...' : 'Send Reset Link'}
      </Button>
    </form>
  );
}
