'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'
import styles from '@/components/Form.module.css' // Reusing some card styles
import { UserCircle, Edit, Shield } from 'lucide-react'

export default function Dashboard() {
    const { user, profile, loading } = useAuth()
    const router = useRouter()
    const [talentProfile, setTalentProfile] = useState<any>(null)
    const [fetching, setFetching] = useState(true)

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login')
        }

        if (user) {
            // Fetch Talent Profile if exists
            const fetchTalentProfile = async () => {
                const { data } = await supabase
                    .from('talent_profiles')
                    .select('*')
                    .eq('user_id', user.id)
                    .single()

                // STRICT RESET: If deleted_at is set, we treat it as NO PROFILE
                if (data && !data.deleted_at) {
                    setTalentProfile(data)
                } else {
                    setTalentProfile(null)
                }
                setFetching(false)
            }
            fetchTalentProfile()

            // Real-time subscription for deletion events
            const channel = supabase
                .channel('public:talent_profiles')
                .on(
                    'postgres_changes',
                    { event: '*', schema: 'public', table: 'talent_profiles', filter: `user_id=eq.${user.id}` },
                    (payload) => {
                        console.log('Profile changed:', payload)
                        if (payload.eventType === 'DELETE' || (payload.eventType === 'UPDATE' && payload.new.deleted_at)) {
                            setTalentProfile(null)
                        } else if (payload.eventType === 'UPDATE' && !payload.new.deleted_at) {
                            setTalentProfile(payload.new)
                        } else if (payload.eventType === 'INSERT') {
                            setTalentProfile(payload.new)
                        }
                    }
                )
                .subscribe()

            return () => {
                supabase.removeChannel(channel)
            }
        }
    }, [user, loading, router])

    if (loading || fetching) {
        return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>
    }

    if (!user) return null

    return (
        <div className="container section">
            <h1 className="title-gradient" style={{ fontSize: '2.5rem', marginBottom: '20px' }}>Dashboard</h1>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>

                {/* User Card */}
                <div className="glass" style={{ padding: '30px', borderRadius: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
                        <div style={{ padding: '20px', background: 'var(--surface)', borderRadius: '50%' }}>
                            <UserCircle size={40} color="var(--primary)" />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1.5rem' }}>{profile?.name || user.email}</h2>
                            <p style={{ color: 'var(--text-muted)' }}>{profile?.role === 'admin' ? 'Administrator' : 'Talent'}</p>
                        </div>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <p className={styles.label}>Email</p>
                        <p>{user.email}</p>
                    </div>
                    <div>
                        <p className={styles.label}>Mobile</p>
                        <p>{profile?.mobile}</p>
                    </div>

                    {['admin', 'super_admin'].includes(profile?.role) && (
                        <Link href="/admin" className="btn btn-outline" style={{ marginTop: '20px', width: '100%' }}>
                            <Shield size={18} style={{ marginRight: '8px' }} /> Go to Admin Panel
                        </Link>
                    )}
                </div>

                {/* Talent Profile Status */}
                <div className="glass" style={{ padding: '30px', borderRadius: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                        <h2 style={{ marginBottom: '15px' }}>Talent Profile</h2>
                        {talentProfile ? (
                            <div>
                                <span style={{
                                    background: 'rgba(16, 185, 129, 0.2)',
                                    color: 'var(--success)',
                                    padding: '4px 12px',
                                    borderRadius: '12px',
                                    fontSize: '0.8rem',
                                    fontWeight: 'bold'
                                }}>Active</span>
                                <p style={{ marginTop: '20px', color: 'var(--text-muted)' }}>
                                    Your profile is live. Keep it updated to increase your chances of being cast.
                                </p>
                                <div style={{ marginTop: '15px' }}>
                                    <strong>Category:</strong> {talentProfile.category} <br />
                                    <strong>Views:</strong> 0
                                </div>
                                <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
                                    {talentProfile.profile_photo_url ? (
                                        <img src={talentProfile.profile_photo_url} alt="Profile" style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover' }} />
                                    ) : (
                                        <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <UserCircle size={30} />
                                        </div>
                                    )}
                                    <div>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Profile Status: <span style={{ color: '#fff' }}>Visible</span></p>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Category: <span style={{ color: '#fff' }}>{talentProfile.category}</span></p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <span style={{
                                    background: 'rgba(239, 68, 68, 0.2)',
                                    color: 'var(--error)',
                                    padding: '4px 12px',
                                    borderRadius: '12px',
                                    fontSize: '0.8rem',
                                    fontWeight: 'bold'
                                }}>Incomplete</span>
                                <p style={{ marginTop: '20px', color: 'var(--text-muted)' }}>
                                    You haven't created a talent profile yet. Create one to get discovered!
                                </p>
                            </div>
                        )}
                    </div>

                    <Link href={talentProfile ? "/profile" : "/profile/edit"} className="btn btn-primary" style={{ marginTop: '20px', width: '100%' }}>
                        <Edit size={18} style={{ marginRight: '8px' }} />
                        {talentProfile ? 'View Talent Profile' : 'Create Talent Profile'}
                    </Link>
                </div>
            </div>
        </div>
    )
}
