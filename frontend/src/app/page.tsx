'use client'

import Link from 'next/link'
import styles from './page.module.css'
import { Clapperboard, Video, Camera, Mic, Palette, Scissors } from 'lucide-react'
import SocialCinemaIntro from '@/components/SocialCinemaIntro'
import { StudioIntro, WhyCreated, WhatWeDo, Philosophy, Ecosystem, PromiseCTA, FinalWord } from '@/components/MonkeyStudiosComponents'
import HeroSection from '@/components/HeroSection'
import { supabase } from '@/lib/supabaseClient'
import Preloader from '@/components/Preloader'
import { useEffect, useState } from 'react'

export default function Home() {
  const [loading, setLoading] = useState(true);

  return (
    <main>
      <Preloader onComplete={() => setLoading(false)} />

      {!loading && (
        <>
          <HeroSection />

          {/* Intro Section - Monkey Studios Style */}
          <StudioIntro />

          {/* Social Cinema Intro - Swaps image/content order */}
          <SocialCinemaIntro />

          <WhyCreated />
          <WhatWeDo />
          <Philosophy />
          <Ecosystem />

          {/* Final CTA */}
          <PromiseCTA />

          {/* Separated Final Word Section */}
          <FinalWord />
        </>
      )}
    </main>
  );
}
