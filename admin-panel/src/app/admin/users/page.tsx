'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import styles from '../admin.module.css'
import { KeyRound, Search, Shield, RefreshCw, Mail } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

export default function UserManagement() {
    const { profile: adminProfile } = useAuth()
    const [users, setUsers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [resetting, setResetting] = useState<string | null>(null)

    useEffect(() => {
        fetchUsers()

        // Realtime Subscription for Users
        const userChannel = supabase
            .channel('public:users')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'users' },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        setUsers(prev => [payload.new, ...prev])
                    } else if (payload.eventType === 'UPDATE') {
                        setUsers(prev => prev.map(u => u.id === payload.new.id ? { ...u, ...payload.new } : u))
                    } else if (payload.eventType === 'DELETE') {
                        setUsers(prev => prev.filter(u => u.id !== payload.old.id))
                    }
                }
            )
            .subscribe()

        // Realtime Subscription for Talent Profiles (1:1 with User)
        const customProfileChannel = supabase
            .channel('public:talent_profiles_linked')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'talent_profiles' },
                (payload) => {
                    setUsers(currentUsers => {
                        return currentUsers.map(u => {
                            // If this profile change belongs to this user
                            if ((payload.new && (payload.new as any).user_id === u.id) || (payload.old && (payload.old as any).user_id === u.id)) {

                                if (payload.eventType === 'DELETE') {
                                    // Profile deleted -> linked profile is null
                                    return { ...u, talent_profiles: null }
                                } else {
                                    // INSERT or UPDATE -> Update the profile object
                                    return { ...u, talent_profiles: payload.new }
                                }
                            }
                            return u
                        })
                    })
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(userChannel)
            supabase.removeChannel(customProfileChannel)
        }
    }, [])

    const fetchUsers = async () => {
        setLoading(true)
        // We only get users from public.users table. 
        // NOTE: Supabase client cannot list auth.users by default for security.
        // We rely on the public.users table being synced.
        const { data, error } = await supabase
            .from('users')
            .select(`
                *,
                talent_profiles (
                    id,
                    deleted_at,
                    user_id
                )
            `)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching users:', error)
        } else {
            setUsers(data || [])
        }
        setLoading(false)
    }

    const setTempPassword = async (userId: string, newPass: string) => {
        setResetting(userId)
        try {
            const res = await fetch('/api/admin/set-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    password: newPass,
                    adminId: adminProfile?.id // For auditing
                })
            })

            const data = await res.json()

            if (!res.ok) throw new Error(data.error || 'Failed to set password')

            alert('Temporary password set successfully. The user can now login with this password.')
        } catch (error: any) {
            alert('Error: ' + error.message)
            console.error(error)
        } finally {
            setResetting(null)
        }
    }

    const sendPasswordReset = async (email: string, userId: string) => {
        if (!confirm(`Are you sure you want to send a password reset email to ${email}?`)) return

        setResetting(userId)
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            })

            if (error) throw error

            alert(`Password reset email sent to ${email}`)

            // Log manually since this is client side
            await supabase.from('admin_logs').insert({
                admin_id: adminProfile?.id,
                target_user_id: userId,
                action_type: 'password_reset_link',
                details: 'Admin sent reset link via Client SDK'
            })

        } catch (error: any) {
            alert('Error sending reset email: ' + error.message)
        } finally {
            setResetting(null)
        }
    }

    // Client-side search
    const filteredUsers = users.filter(u => {
        const name = (u.name || '').toLowerCase()
        const email = (u.email || '').toLowerCase()
        const term = search.toLowerCase()
        return name.includes(term) || email.includes(term)
    })

    // Access Control check (also handled in Layout but double safety)
    if (adminProfile?.role !== 'super_admin') {
        return <div style={{ padding: '2rem' }}>Only Super Admins can manage user credentials.</div>
    }

    return (
        <div>
            <div className={styles.header}>
                <h1 className={styles.title}>Registered Users <span style={{ fontSize: '0.8em', opacity: 0.7 }}>({users.length})</span></h1>
            </div>

            <div className={styles.tableContainer}>
                <div className={styles.tableHeader}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <input
                            type="text"
                            placeholder="Search users..."
                            className={styles.searchBar}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <button onClick={fetchUsers} className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSm}`}>
                        <RefreshCw size={14} /> Refresh
                    </button>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Role</th>
                                <th>Mobile</th>
                                <th>Signed Up</th>
                                <th>Linked Profile</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>Loading...</td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>No users found.</td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user.id}>
                                        <td>
                                            <div style={{ fontWeight: 600 }}>{user.name || 'No Name'}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{user.email}</div>
                                        </td>
                                        <td>
                                            <span style={{
                                                background: user.role === 'super_admin' ? '#7c3aed' : user.role === 'admin' ? '#2563eb' : '#374151',
                                                color: '#fff',
                                                padding: '2px 8px',
                                                borderRadius: '4px',
                                                fontSize: '0.75rem'
                                            }}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td>
                                            <div>{user.mobile || '-'}</div>
                                        </td>
                                        <td>{new Date(user.created_at).toLocaleDateString()}</td>
                                        <td>
                                            {user.talent_profiles && !user.talent_profiles.deleted_at ? (
                                                <span style={{ color: '#10b981', fontWeight: 500 }}>Yes</span>
                                            ) : (
                                                <span style={{ color: '#9ca3af' }}>No</span>
                                            )}
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button
                                                    className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSm}`}
                                                    onClick={() => sendPasswordReset(user.email, user.id)}
                                                    disabled={resetting === user.id}
                                                    title="Send Password Reset Email"
                                                    style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                                                >
                                                    <Mail size={14} />
                                                    Email Link
                                                </button>
                                                <button
                                                    className={`${styles.btn} ${styles.btnPrimary} ${styles.btnSm}`}
                                                    onClick={() => {
                                                        const newPass = prompt(`Set temporary password for ${user.email}:`)
                                                        if (newPass) setTempPassword(user.id, newPass)
                                                    }}
                                                    disabled={resetting === user.id}
                                                    title="Set Temporary Password (Requires Server Key)"
                                                    style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                                                >
                                                    <KeyRound size={14} />
                                                    Set Temp
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
