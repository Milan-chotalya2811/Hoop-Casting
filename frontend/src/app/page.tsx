'use client';

import { useState } from 'react';
import Preloader from '@/components/Preloader';
import {
  HeroSection,
  WhatIsHoopCasting,
  WhyDifferent,
  WhoCanApply,
  WhatWeLookFor,
  CastingProcess,
  WhyTrust,
  MessageForDreamers,
  FinalCTA
} from '@/components/HomeSections';

import BlogSection from '@/components/BlogSection';

export default function Home() {
  const [loading, setLoading] = useState(true);

  return (
    <main style={{ backgroundColor: 'var(--background)', minHeight: '100vh', color: 'var(--text-main)', overflowX: 'hidden' }}>
      <Preloader onComplete={() => setLoading(false)} />

      {/* Content renders immediately but is covered by preloader initially. 
          This allows images (especially the Hero background) to fetch in the background. */}
      <div>
        <HeroSection />
        <WhatIsHoopCasting />
        <WhyDifferent />
        <WhoCanApply />
        <WhatWeLookFor />
        <CastingProcess />
        <WhyTrust />
        <MessageForDreamers />
        <BlogSection />
        <FinalCTA />
      </div>
    </main>
  );
}
