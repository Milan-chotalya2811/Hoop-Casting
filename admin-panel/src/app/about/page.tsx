'use client'

export default function About() {
    return (
        <div className="container section">
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <h1 className="title-gradient" style={{ textAlign: 'center', marginBottom: '60px' }}>About CastingNet</h1>

                <div className="glass" style={{ padding: '40px', borderRadius: '16px', marginBottom: '40px' }}>
                    <h2 style={{ color: 'var(--primary)', marginBottom: '20px' }}>Who We Are</h2>
                    <p style={{ marginBottom: '20px', lineHeight: 1.8 }}>
                        CastingNet is a premier talent management and casting platform dedicated to discovering the next generation of stars.
                        We serve as the vital bridge between creative visionaries—directors, producers, and brand managers—and the exceptional talent that brings their stories to life.
                        Founded by industry veterans, we understand the nuances of the casting process better than anyone else.
                    </p>
                </div>

                <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '40px' }}>
                    <div className="glass" style={{ padding: '30px', borderRadius: '16px' }}>
                        <h3 style={{ marginBottom: '15px' }}>Our Mission</h3>
                        <p>To democratize the casting industry by providing a transparent, efficient, and accessible platform for talent of all backgrounds to showcase their potential.</p>
                    </div>
                    <div className="glass" style={{ padding: '30px', borderRadius: '16px' }}>
                        <h3 style={{ marginBottom: '15px' }}>Our Vision</h3>
                        <p>To become the global standard for talent discovery, where every casting call finds its perfect match accurately and instantly.</p>
                    </div>
                </div>

                <div className="glass" style={{ padding: '40px', borderRadius: '16px' }}>
                    <h2 style={{ color: 'var(--primary)', marginBottom: '20px' }}>Why Choose Us?</h2>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        <li style={{ marginBottom: '15px', display: 'flex', gap: '10px' }}>
                            <span style={{ color: 'var(--primary)' }}>✓</span>
                            <span><strong>Curated Talent Pool:</strong> We verify profiles to ensure high-quality, professional candidates.</span>
                        </li>
                        <li style={{ marginBottom: '15px', display: 'flex', gap: '10px' }}>
                            <span style={{ color: 'var(--primary)' }}>✓</span>
                            <span><strong>Seamless Technology:</strong> Our platform simplifies the scouting, filtering, and booking process.</span>
                        </li>
                        <li style={{ marginBottom: '15px', display: 'flex', gap: '10px' }}>
                            <span style={{ color: 'var(--primary)' }}>✓</span>
                            <span><strong>Industry Connections:</strong> Direct access to top production houses and casting directors.</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    )
}
