import AuthForm from '@/components/auth-form';

export default function RegisterPage() {
  return (
    <>
      <main className='min-h-[calc(100vh-140px)] flex items-center justify-center bg-gray-50 px-4'>
        <AuthForm mode='register' />
      </main>
    </>
  );
}
