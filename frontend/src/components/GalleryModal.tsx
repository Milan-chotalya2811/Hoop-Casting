
import { X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect } from 'react'
import { fixUrl } from '@/lib/utils'

interface GalleryModalProps {
    isOpen: boolean
    url: string | null
    onClose: () => void
}

export default function GalleryModal({ isOpen, url, onClose }: GalleryModalProps) {
    if (!url) return null;
    const isVideo = url.match(/\.(mp4|webm|ogg|mov)$/i)
    const fixedUrl = fixUrl(url)

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
                    background: 'rgba(0,0,0,0.95)',
                    zIndex: 9999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px'
                }}
            >
                <div
                    style={{ position: 'relative', width: 'auto', maxWidth: '100%', display: 'flex', justifyContent: 'center' }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <button
                        onClick={onClose}
                        style={{
                            position: 'absolute',
                            top: -50,
                            right: 0,
                            background: 'transparent',
                            border: 'none',
                            color: '#fff',
                            cursor: 'pointer',
                            zIndex: 10001
                        }}
                    >
                        <X size={32} />
                    </button>

                    {isVideo ? (
                        <video
                            src={fixedUrl}
                            controls
                            autoPlay
                            style={{ 
                                maxWidth: '90vw', 
                                maxHeight: '90vh', 
                                border: '1px solid #444', 
                                background: '#000',
                                boxShadow: '0 0 30px rgba(0,0,0,0.5)' 
                            }}
                        />
                    ) : (
                        <img
                            src={fixedUrl}
                            alt="Full Preview"
                            style={{ 
                                maxWidth: '95vw', 
                                maxHeight: '95vh', 
                                objectFit: 'contain', 
                                border: '1px solid #444',
                                background: '#111',
                                boxShadow: '0 0 30px rgba(0,0,0,0.8)' 
                            }}
                        />
                    )}
                </div>
            </motion.div>
        </AnimatePresence>
    )
}
