'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabaseClient'
import { ArrowLeft, User, MapPin, Edit, Shield } from 'lucide-react'
import Link from 'next/link'

export default function MyProfile() {
    const { user, profile: authProfile, loading } = useAuth()
    const router = useRouter()
    const [profile, setProfile] = useState<any>(null)
    const [fetching, setFetching] = useState(true)

    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.push('/login')
                return
            }

            const fetchMyProfile = async () => {
                const { data, error } = await supabase
                    .from('talent_profiles')
                    .select('*')
                    .eq('user_id', user.id)
                    .single()

                if (data) {
                    setProfile(data)
                } else {
                    // IF NO PROFILE -> Redirect to Edit (Create) Form
                    router.push('/profile/edit')
                }
                setFetching(false)
            }
            fetchMyProfile()
        }
    }, [user, loading, router])

    if (loading || fetching) return <div className="container section">Loading Profile...</div>
    if (!profile) return null

    if (profile.deleted_at) {
        return (
            <div className="container section">
                <div style={{ textAlign: 'center', padding: '40px', background: 'var(--surface)', borderRadius: '16px', border: '1px solid #ef4444' }}>
                    <h2 style={{ color: '#ef4444', marginBottom: '16px' }}>Account Suspended</h2>
                    <p>Your profile has been deleted by an administrator.</p>
                    <p style={{ marginTop: '10px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Please contact support if you believe this is a mistake.</p>
                </div>
            </div>
        )
    }

    const age = profile.dob ? new Date().getFullYear() - new Date(profile.dob).getFullYear() : 'N/A'
    const displayName = authProfile?.name || 'Talent'

    return (
        <div className="container" style={{ paddingBottom: '80px' }}>
            <div style={{ marginTop: '20px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Link href="/dashboard" className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    <ArrowLeft size={16} /> Dashboard
                </Link>

                <Link href="/profile/edit" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    <Edit size={16} /> Edit Profile
                </Link>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '40px' }}>
                {/* Left Column: Image & Contact */}
                <div>
                    <div style={{ position: 'sticky', top: '100px' }}>
                        <div style={{ position: 'relative' }}>
                            <img
                                src={profile.profile_photo_url || 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?q=80&w=1000&auto=format&fit=crop'}
                                alt="Profile"
                                style={{ width: '100%', borderRadius: '16px', border: '1px solid var(--border)', marginBottom: '20px', objectFit: 'cover', aspectRatio: '3/4' }}
                            />
                            {/* Admin badge if user is admin, just for visibility */}
                            {(authProfile?.role === 'admin' || authProfile?.role === 'super_admin') && (
                                <div style={{
                                    position: 'absolute', top: '10px', right: '10px',
                                    background: 'var(--primary)', color: '#000',
                                    padding: '4px 12px', borderRadius: '20px',
                                    fontSize: '0.8rem', fontWeight: 'bold',
                                    display: 'flex', alignItems: 'center', gap: '4px'
                                }}>
                                    <Shield size={12} /> Admin
                                </div>
                            )}
                        </div>

                        <div className="glass" style={{ padding: '20px', borderRadius: '16px' }}>
                            <h3 style={{ marginBottom: '16px', color: 'var(--primary)' }}>Quick Info</h3>
                            <div style={{ marginBottom: '10px', display: 'flex', gap: '10px' }}>
                                <MapPin size={18} /> {profile.city}, {profile.state}
                            </div>
                            <div style={{ marginBottom: '10px', display: 'flex', gap: '10px' }}>
                                <User size={18} /> {profile.gender}, {age} Years
                            </div>
                            <div style={{ marginTop: '15px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                This is how your profile appears to casting directors.
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Details */}
                <div>
                    <h1 className="title-gradient" style={{ fontSize: '3rem', lineHeight: 1.1 }}>{displayName}</h1>
                    <p style={{ fontSize: '1.5rem', color: 'var(--primary)', marginBottom: '30px' }}>{profile.category}</p>

                    <div className="glass" style={{ padding: '30px', borderRadius: '16px', marginBottom: '30px' }}>
                        <h3 style={{ marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>Physical Stats</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '20px' }}>
                            {[
                                { label: 'Height', value: profile.height_cm ? `${profile.height_cm} cm` : '-' },
                                { label: 'Weight', value: profile.weight_kg ? `${profile.weight_kg} kg` : '-' },
                                { label: 'Hair', value: profile.hair_color || '-' },
                                { label: 'Eyes', value: profile.eye_color || '-' },
                                { label: 'Skin Tone', value: profile.skin_tone || '-' },
                                { label: 'Chest', value: profile.chest_in ? `${profile.chest_in}"` : '-' },
                                { label: 'Waist', value: profile.waist_in ? `${profile.waist_in}"` : '-' },
                                { label: 'Hips', value: profile.hips_in ? `${profile.hips_in}"` : '-' },
                            ].map((stat, i) => (
                                <div key={i}>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{stat.label}</div>
                                    <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{stat.value}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="glass" style={{ padding: '30px', borderRadius: '16px', marginBottom: '30px' }}>
                        <h3 style={{ marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>Professional Details</h3>

                        <div style={{ marginBottom: '20px' }}>
                            <div style={{ color: 'var(--text-muted)' }}>Experience</div>
                            <div style={{ fontSize: '1.1rem' }}>{profile.years_experience} Years</div>
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <div style={{ color: 'var(--text-muted)' }}>Skills</div>
                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '8px' }}>
                                {profile.skills && profile.skills.length > 0 ? profile.skills.map((s: string, i: number) => (
                                    <span key={i} style={{ background: 'var(--surface-highlight)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.9rem' }}>{s}</span>
                                )) : '-'}
                            </div>
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <div style={{ color: 'var(--text-muted)' }}>Languages</div>
                            <p>{profile.languages ? profile.languages.join(', ') : '-'}</p>
                        </div>

                        <div>
                            <div style={{ color: 'var(--text-muted)' }}>Past Work</div>
                            <p style={{ lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{profile.past_work || 'No past work listed.'}</p>
                        </div>
                    </div>

                    {/* Custom Fields (Dynamic) */}
                    {profile.custom_fields && Object.keys(profile.custom_fields).length > 0 && (
                        <div className="glass" style={{ padding: '30px', borderRadius: '16px', marginBottom: '30px' }}>
                            <h3 style={{ marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>Additional Info</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '20px' }}>
                                {Object.entries(profile.custom_fields).map(([key, value]: [string, any]) => (
                                    <div key={key}>
                                        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textTransform: 'capitalize' }}>
                                            {key.replace(/_/g, ' ')}
                                        </div>
                                        <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>
                                            {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : (value?.toString() || '-')}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {profile.portfolio_links && profile.portfolio_links.length > 0 && (
                        <div className="glass" style={{ padding: '30px', borderRadius: '16px' }}>
                            <h3 style={{ marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>Portfolio</h3>
                            <div style={{ display: 'grid', gap: '10px' }}>
                                {profile.portfolio_links.map((link: string, i: number) => (
                                    <a key={i} href={link} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>
                                        {link}
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    )
}
