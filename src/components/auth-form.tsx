'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';

type AuthFormProps = {
  mode: 'login' | 'register';
};

type FormData = {
  name?: string;
  email: string;
  password: string;
};

export default function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
      });

      const result = await res.json().catch(() => ({}));

      if (!res.ok) {
        toast.error(result.error || 'Something went wrong');
        return;
      }

      toast.success(mode === 'login' ? 'Login successful!' : 'Account created!');
      router.push('/');
    } catch {
      toast.error('Request failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className='w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-gray-100 space-y-6'
    >
      {/* Heading */}
      <div className='text-center space-y-2'>
        <h1 className='text-3xl font-bold text-gray-900'>
          {mode === 'login' ? 'Welcome back to Dhara' : 'Create your Dhara account'}
        </h1>

        <p className='text-sm text-gray-600'>
          {mode === 'login'
            ? 'Sign in to continue reporting and resolving civic issues'
            : 'Join the community driving local change'}
        </p>
      </div>

      {/* Name */}
      {mode === 'register' && (
        <Input
          type='text'
          placeholder='Full Name'
          {...register('name')}
          disabled={loading}
          className='text-lg'
        />
      )}

      {/* Email */}
      <div className='space-y-1'>
        <Input
          type='email'
          placeholder='Email address'
          {...register('email', { required: 'Email is required' })}
          disabled={loading}
          className='text-lg'
        />
        {errors.email && <p className='text-red-500 text-sm'>{errors.email.message}</p>}
      </div>

      <div className='space-y-1'>
        <div className='relative'>
          <Input
            type={showPassword ? 'text' : 'password'}
            placeholder='Password'
            {...register('password', { required: 'Password is required' })}
            disabled={loading}
            className='text-lg pr-12'
          />

          <button
            type='button'
            onClick={() => setShowPassword(!showPassword)}
            className='absolute right-3 top-0 bottom-0 my-auto h-fit text-gray-500'
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        {errors.password && <p className='text-red-500 text-sm'>{errors.password.message}</p>}

        {mode === 'login' && (
          <p className='text-right'>
            <Link
              href='/password/forget-password'
              className='text-yellow-500 hover:underline text-sm'
            >
              Forgot Password?
            </Link>
          </p>
        )}
      </div>

      {/* Submit */}
      <Button type='submit' disabled={loading} className='w-full py-3 text-lg'>
        {loading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Register'}
      </Button>

      <p className='text-center text-gray-600 text-sm'>
        {mode === 'login' ? (
          <>
            New here?{' '}
            <Link href='/auth/register' className='text-yellow-500 hover:underline'>
              Create an account
            </Link>
          </>
        ) : (
          <>
            Already registered?{' '}
            <Link href='/auth/login' className='text-yellow-500 hover:underline'>
              Sign in
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
