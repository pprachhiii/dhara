import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FileText, Megaphone } from 'lucide-react';
import heroImage from '@/../public/hero-community.png';

export function HeroSection() {
  return (
    <section className='relative w-full overflow-hidden'>
      {/* Background */}
      <div className='absolute inset-0'>
        <Image
          src={heroImage}
          alt='Community environmental stewardship'
          fill
          priority
          className='object-cover'
        />
        <div className='absolute inset-0 hero-gradient opacity-85' />
        <div className='absolute inset-0 bg-black/40' />
      </div>

      <div className='relative z-10 flex items-center py-20 md:min-h-screen'>
        <div className='container mx-auto px-4 text-center text-white'>
          <h1 className='text-3xl sm:text-4xl md:text-6xl font-bold leading-tight'>
            Report Issues. <span className='text-yellow-400'>Drive Change.</span> Own Your
            Neighborhood.
          </h1>

          <p className='mx-auto mt-5 max-w-2xl text-base md:text-lg opacity-90'>
            Dhara empowers communities to identify, prioritize, and resolve civic issues through
            transparent tracking and volunteer action.
          </p>

          {/* Buttons */}
          <div className='mt-8 flex justify-center gap-4 flex-wrap'>
            <Button asChild size='lg'>
              <Link href='/reports/new'>
                <Megaphone className='mr-2 h-5 w-5' />
                Report Issue
              </Link>
            </Button>

            <Button asChild size='lg' variant='white'>
              <Link href='/reports'>
                <FileText className='mr-2 h-5 w-5' />
                Browse Reports
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
