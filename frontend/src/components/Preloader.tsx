'use client'

import React, { useEffect, useState } from 'react'
import Lottie from 'lottie-react'
import { usePathname } from 'next/navigation'
import animationData from '../../public/preloader.json'
import { motion, AnimatePresence } from 'framer-motion'
import logo from '../../public/logo.png' // Import logo to get dimensions if needed, or just use string path
// Note: We'll use /logo.png for string path to avoid import issues with Next.js specific image handling if not enabled
// but here we just need styling. 

export default function GlobalPreloader() {
    const pathname = usePathname()
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        // Only show loader if:
        // 1. It's the Home Page ('/')
        // 2. It hasn't been shown in this session yet
        const hasLoaded = sessionStorage.getItem('monkey_preloader_shown')

        if (pathname === '/' && !hasLoaded) {
            setLoading(true)

            // Artificial delay for premium feel
            const timer = setTimeout(() => {
                setLoading(false)
                sessionStorage.setItem('monkey_preloader_shown', 'true')
            }, 2000)

            return () => clearTimeout(timer)
        } else {
            setLoading(false)
        }
    }, [pathname]) // Dependence on pathname is okay if we gate it with logic, but simpler to run once on mount if strictly "entry". 
    // However, if user navigates to Home via link, do we show it? 
    // "jab website pe enter hoga tab hi" usually means session start.
    // If I click Home from About, it's not "Entering website".
    // So the session storage check handles that. If I already saw it, I won't see it again.


    // Lock scrolling when loading
    useEffect(() => {
        if (loading) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'auto'
        }
    }, [loading])

    return (
        <AnimatePresence mode="wait">
            {loading && (
                <motion.div
                    className="preloader-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        backgroundColor: '#ffffff', // White background
                        zIndex: 9999,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}
                >
                    <div style={{ position: 'relative', width: '300px', height: '300px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        {/* Lottie Animation Background/Ring */}
                        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1 }}>
                            <Lottie animationData={animationData} loop={true} />
                        </div>

                        {/* Center Logo */}
                        {/* 
                           "Animate the logo with a 0% to 100% color fill"
                           We can approximate this "fill" effect or "reveal" effect using clip-path or opacity.
                           Here we use a motion opacity + scale reveal. 
                        */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8, filter: 'grayscale(100%)' }}
                            animate={{
                                opacity: 1,
                                scale: 1,
                                filter: 'grayscale(0%)',
                                transition: {
                                    duration: 1.5,
                                    ease: "easeInOut",
                                    repeat: Infinity,
                                    repeatType: "reverse"
                                }
                            }}
                            style={{
                                zIndex: 2,
                                width: '120px',
                                height: 'auto'
                            }}
                        >
                            <img
                                src="/logo.png"
                                alt="Loading..."
                                style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
                            />
                        </motion.div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
