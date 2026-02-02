'use client'

export default function CinematicBackground() {
    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: -10,
            pointerEvents: 'none',
            background: 'var(--background)'
        }} />
    )
}
