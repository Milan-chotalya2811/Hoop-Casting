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

export default function Home() {
  const [loading, setLoading] = useState(true);

  return (
    <main style={{ backgroundColor: 'var(--background)', minHeight: '100vh', color: 'var(--text-main)', overflowX: 'hidden' }}>
      <Preloader onComplete={() => setLoading(false)} />

      {!loading && (
        <>
          <HeroSection />
          <WhatIsHoopCasting />
          <WhyDifferent />
          <WhoCanApply />
          <WhatWeLookFor />
          <CastingProcess />
          <WhyTrust />
          <MessageForDreamers />
          <FinalCTA />
        </>
      )}
    </main>
  );
}
