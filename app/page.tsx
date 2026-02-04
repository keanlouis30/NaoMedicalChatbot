'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import TextType from '@/components/TextType';
import { Button } from '@/components/ui/button';

const Silk = dynamic(() => import('@/components/Silk'), { ssr: false });

export default function Home() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Silk Background */}
      <div className="absolute inset-0 w-full h-full">
        <Silk
          speed={5}
          scale={1}
          color="#91a4f3"
          noiseIntensity={0}
          rotation={0}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4">
        {/* Text Animation */}
        <div className="mb-16 text-center">
          <TextType
            text={["Welcome to Nao Medical Chat"]}
            typingSpeed={75}
            pauseDuration={3000}
            showCursor
            cursorCharacter="_"
            deletingSpeed={50}
            loop={false}
            className="text-5xl md:text-7xl font-bold text-white drop-shadow-2xl tracking-tight"
            as="h1"
          />
        </div>

        {/* Test Button */}
        <Link href="/setup">
          <Button 
            size="lg"
            className="text-xl px-12 py-7 bg-white/90 hover:bg-white text-slate-900 font-semibold rounded-2xl shadow-2xl backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-purple-500/50"
          >
            Test
          </Button>
        </Link>
      </div>
    </div>
  );
}
