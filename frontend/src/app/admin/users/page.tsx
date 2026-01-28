'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'
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
    }, [])

    const fetchUsers = async () => {
        setLoading(true)
        try {
            const { data } = await api.get('/admin/users.php')
            if (data) {
                setUsers(data)
            }
        } catch (error) {
            console.error('Error fetching users:', error)
        }
        setLoading(false)
    }

    const setTempPassword = async (userId: string, newPass: string) => {
        alert("Not implemented in PHP version yet.")
    }

    const sendPasswordReset = async (email: string, userId: string) => {
        alert("Not implemented in PHP version yet.")
        // if (!confirm(`Are you sure you want to send a password reset email to ${email}?`)) return

        // setResetting(userId)
        // try {
        //     // Use explicitly defined site URL if available, otherwise fallback to current origin
        //     // This ensures if Admin is on localhost but wants to send live link (unlikely but possible), they can set env var.
        //     // But mostly it ensures that if they ARE on live, it uses live.
        //     // Users often test on localhost and complain it sends localhost links. 
        //     // I will force it to use the window origin which IS the correct behavior for 99% of cases, 
        //     // but I'll add a check for a production override if they want to hardcode it in .env.
        //     const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin

        //     const { error } = await supabase.auth.resetPasswordForEmail(email, {
        //         redirectTo: `${siteUrl}/reset-password`,
        //     })

        //     if (error) throw error

        //     alert(`Password reset email sent to ${email}`)

        //     // Log manually since this is client side
        //     await supabase.from('admin_logs').insert({
        //         admin_id: adminProfile?.id,
        //         target_user_id: userId,
        //         action_type: 'password_reset_link',
        //         details: 'Admin sent reset link via Client SDK'
        //     })

        // } catch (error: any) {
        //     alert('Error sending reset email: ' + error.message)
        // } finally {
        //     setResetting(null)
        // }
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
