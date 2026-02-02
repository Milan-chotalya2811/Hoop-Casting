'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import styles from '@/components/Form.module.css'
import { Lock, Save } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

export default function ChangePassword() {
    const { user, signOut } = useAuth()
    const router = useRouter()

    const [oldPassword, setOldPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [message, setMessage] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setMessage('')

        if (newPassword !== confirmPassword) {
            setError('New passwords do not match')
            return
        }
        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters')
            return
        }

        setLoading(true)

        try {
            // 1. Re-authenticate to verify old password (optional but requested)
            // Actually supabase.auth.updateUser doesn't strictly require old password if logged in,
            // BUT for 'Change Password' specifically with 'Old Password' field, we should verify it.
            // Supabase client SDK doesn't have a direct "verify password" without signing in.
            // So we try signing in with the current email + old password.
            if (user?.email) {
                const { error: signInError } = await supabase.auth.signInWithPassword({
                    email: user.email,
                    password: oldPassword
                })
                if (signInError) throw new Error('Incorrect old password')
            }

            // 2. Update Password
            const { error: updateError } = await supabase.auth.updateUser({ password: newPassword })
            if (updateError) throw updateError

            // 3. Clear must_change_password flag
            if (user) {
                await supabase
                    .from('users')
                    .update({ must_change_password: false })
                    .eq('id', user.id)
            }

            setMessage('Password changed successfully! You can now continue.')

            // Redirect to dashboard
            setTimeout(() => {
                router.push('/dashboard')
            }, 1500)

        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="container section" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className={styles.card} style={{ maxWidth: '500px', width: '100%' }}>
                <h1 className="title-gradient" style={{ textAlign: 'center', marginBottom: '20px' }}>Change Password</h1>
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '30px' }}>
                    For your security, please update your password.
                </p>

                {error && <div style={{ color: '#ef4444', marginBottom: '15px', textAlign: 'center', padding: '10px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '4px' }}>{error}</div>}
                {message && <div style={{ color: '#10b981', marginBottom: '15px', textAlign: 'center', padding: '10px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '4px' }}>{message}</div>}

                <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '20px' }}>
                    <div className={styles.formGroup}>
                        <label>Current Password</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                type="password"
                                value={oldPassword}
                                onChange={(e) => setOldPassword(e.target.value)}
                                style={{ paddingLeft: '40px' }}
                                required
                            />
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label>New Password</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                style={{ paddingLeft: '40px' }}
                                required
                            />
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label>Confirm New Password</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                style={{ paddingLeft: '40px' }}
                                required
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                        {loading ? 'Updating...' : 'Change Password'} <Save size={18} style={{ marginLeft: '8px' }} />
                    </button>

                    <button type="button" onClick={() => router.push('/dashboard')} className="btn btn-outline" style={{ width: '100%', marginTop: '-10px' }} disabled={loading}>
                        Cancel
                    </button>
                </form>
            </div>
        </div>
    )
}
