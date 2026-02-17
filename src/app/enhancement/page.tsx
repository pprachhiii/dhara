'use client';

import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

const staticEnhancements = [
  {
    id: '1',
    description:
      'Plant 20 native trees along the main street to prevent soil erosion and improve air quality.',
    image: '/images/tree-planting.jpg',
  },
  {
    id: '2',
    description:
      'Paint a colorful mural on the community wall promoting cleanliness and civic pride.',
    image: '/images/mural-painting.jpg',
  },
  {
    id: '3',
    description:
      'Install clear waste segregation signage with separate bins for wet, dry, and recyclable waste.',
    image: '/images/waste-signage.jpg',
  },
  {
    id: '4',
    description:
      'Plant flowering shrubs near park entrances to beautify the area and discourage littering.',
    image: '/images/shrubs.jpg',
  },
  {
    id: '5',
    description:
      'Set up community benches and small planters in cleaned-up areas for relaxation and greenery.',
    image: '/images/benches-planters.jpg',
  },
  {
    id: '6',
    description: 'Paint educational murals about local wildlife and environmental protection.',
    image: '/images/educational-mural.jpg',
  },
  {
    id: '7',
    description:
      'Install solar-powered street lights in cleaned alleys to improve safety and discourage dumping.',
    image: '/images/solar-lights.jpg',
  },
  {
    id: '8',
    description:
      'Create a small community garden in vacant lots with native plants and vegetables.',
    image: '/images/community-garden.jpg',
  },
  {
    id: '9',
    description: 'Add informative boards about local water conservation and cleanliness habits.',
    image: '/images/information-board.jpg',
  },
  {
    id: '10',
    description:
      'Install low-maintenance flower pots along streets to prevent litter accumulation.',
    image: '/images/flower-pots.jpg',
  },
];

export default function EnhancementPage() {
  return (
    <div className='h-screen p-6 overflow-y-auto'>
      {/* Caution Tape Marquee */}
      <div className='w-full overflow-hidden whitespace-nowrap mb-6'>
        <div className='inline-block animate-marquee bg-yellow-400 text-black font-extrabold px-4 py-2 rounded shadow'>
          {'⚠️ UNDER DEVELOPMENT ⚠️   '.repeat(20)}
        </div>
      </div>

      {/* Header */}
      <div className='flex items-center justify-between mb-6'>
        <h1 className='text-3xl font-bold'>Enhancements Hub</h1>
        <Button className='flex items-center'>
          <Plus className='w-4 h-4 mr-2' /> Add Enhancement
        </Button>
      </div>

      {/* Enhancements Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {staticEnhancements.map((e) => (
          <div
            key={e.id}
            className='bg-white shadow-sm rounded-xl p-4 hover:shadow-md transition cursor-pointer'
          >
            <div className='relative w-full h-40 mb-3 rounded-lg overflow-hidden'>
              <Image src={e.image} alt='Enhancement Idea' fill className='object-cover' />
            </div>
            <p className='text-sm text-muted-foreground'>{e.description}</p>
          </div>
        ))}
      </div>

      <style jsx>{`
        .animate-marquee {
          display: inline-block;
          white-space: nowrap;
          padding-left: 100%;
          animation: marquee 15s linear infinite;
        }
        @keyframes marquee {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
      `}</style>
    </div>
  );
}
