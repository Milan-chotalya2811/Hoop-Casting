'use client'

import React, { useEffect, useState } from 'react'
import Lottie from 'lottie-react'

import animationData from '../../public/preloader.json'
import { motion, AnimatePresence } from 'framer-motion'

// Note: We'll use /logo.png for string path to avoid import issues with Next.js specific image handling if not enabled
// but here we just need styling. 

export default function GlobalPreloader({ onComplete }: { onComplete: () => void }) {
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Artificial delay for premium feel
        const timer = setTimeout(() => {
            setLoading(false)
            if (onComplete) onComplete()
        }, 3000)

        return () => clearTimeout(timer)
    }, [onComplete])


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
                        {/* Lottie Animation Background/Ring - add filter to make it fit dark theme if needed, but usually lottie is colored */}
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
