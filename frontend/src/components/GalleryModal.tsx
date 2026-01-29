import { X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'

interface GalleryModalProps {
    isOpen: boolean
    url: string | null
    onClose: () => void
}

export default function GalleryModal({ isOpen, url, onClose }: GalleryModalProps) {
    const isVideo = url?.match(/\.(mp4|webm|ogg|mov)$/i)

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }
        window.addEventListener('keydown', handleEsc)
        return () => window.removeEventListener('keydown', handleEsc)
    }, [onClose])

    if (!isOpen || !url) return null

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0,0,0,0.9)',
                    zIndex: 9999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px'
                }}
            >
                <div
                    style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh', width: 'auto', height: 'auto' }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <button
                        onClick={onClose}
                        style={{
                            position: 'absolute',
                            top: -40,
                            right: -10,
                            background: 'transparent',
                            border: 'none',
                            color: '#fff',
                            cursor: 'pointer'
                        }}
                    >
                        <X size={32} />
                    </button>

                    {isVideo ? (
                        <video
                            src={url}
                            controls
                            autoPlay
                            style={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: '8px', boxShadow: '0 0 20px rgba(0,0,0,0.5)' }}
                        />
                    ) : (
                        <img
                            src={url}
                            alt="Gallery Preview"
                            style={{ maxWidth: '100%', maxHeight: '90vh', objectFit: 'contain', borderRadius: '8px', boxShadow: '0 0 20px rgba(0,0,0,0.5)' }}
                        />
                    )}
                </div>
            </motion.div>
        </AnimatePresence>
    )
}
