'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import styles from '../admin.module.css'
import { Eye, EyeOff, Trash2, Search, Edit, ExternalLink, RefreshCw, FilePlus, KeyRound } from 'lucide-react' // Added KeyRound
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

export default function TalentManagement() {
    const { profile: adminProfile } = useAuth()
    const searchParams = useSearchParams()

    // Get filter from URL, default to 'all' if empty
    const filterParam = searchParams.get('filter') as 'all' | 'hidden' | 'deleted' | null

    const [talents, setTalents] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [filter, setFilter] = useState<'all' | 'hidden' | 'deleted'>('all')
    const [resetting, setResetting] = useState<string | null>(null)

    // Update state when URL param changes
    useEffect(() => {
        if (filterParam && ['all', 'hidden', 'deleted'].includes(filterParam)) {
            setFilter(filterParam as 'all' | 'hidden' | 'deleted')
        }
    }, [filterParam])

    useEffect(() => {
        fetchTalents()
    }, [filter])

    const fetchTalents = async () => {
        setLoading(true)
        // Use left join (users) instead of inner join to include admin-created orphan profiles
        // IMPORTANT: Admin query must load ALL users, ignoring RLS if possible or assuming admin has view_all
        let query = supabase
            .from('talent_profiles')
            .select(`
                *,
                users (
                    id,
                    name,
                    email,
                    mobile
                )
            `)
            .order('created_at', { ascending: false })

        if (filter === 'hidden') {
            query = query.eq('is_hidden', true).is('deleted_at', null)
        } else if (filter === 'deleted') {
            query = query.not('deleted_at', 'is', null)
        } else {
            // Default: Show non-deleted.
            query = query.is('deleted_at', null)
        }

        const { data, error } = await query

        if (error) {
            console.error('Error fetching talents:', error)
        } else {
            setTalents(data || [])
        }
        setLoading(false)
    }

    const toggleHidden = async (id: string, currentStatus: boolean) => {
        // Optimistic update
        setTalents(current => current.map(t =>
            t.id === id ? { ...t, is_hidden: !currentStatus } : t
        ).filter(t => {
            if (filter === 'hidden') return t.is_hidden;
            return true;
        }))

        const { error } = await supabase
            .from('talent_profiles')
            .update({ is_hidden: !currentStatus })
            .eq('id', id)

        if (error) {
            alert('Error updating status')
            fetchTalents() // Revert on error
        }
    }

    const softDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this profile? It will be moved to the Deleted bin.')) return

        // Instant UI Removal
        setTalents(current => current.filter(t => t.id !== id))

        const { error } = await supabase
            .from('talent_profiles')
            .update({ deleted_at: new Date().toISOString() })
            .eq('id', id)

        if (error) {
            alert('Error deleting profile')
            fetchTalents()
        }
    }

    const restore = async (id: string) => {
        if (!confirm('Restore this profile? It will become active again.')) return

        // Instant UI Removal from Deleted list
        if (filter === 'deleted') {
            setTalents(current => current.filter(t => t.id !== id))
        }

        const { error } = await supabase
            .from('talent_profiles')
            .update({ deleted_at: null })
            .eq('id', id)

        if (error) {
            alert('Error restoring profile')
            fetchTalents()
        }
    }

    // Password Management Functions (Reused from Users page but adapted for Talents context)
    const handlePasswordAction = async (talent: any) => {
        if (!talent.users?.email) {
            alert('No linked user account found for this profile. Cannot reset password.')
            return
        }

        const action = prompt(`Manage Password for ${talent.users.name || talent.users.email}:\n\nType "1" to Send Reset Email\nType "2" to Set Temporary Password`)

        if (action === '1') {
            await sendPasswordReset(talent.users.email, talent.users.id)
        } else if (action === '2') {
            const newPass = prompt(`Enter new temporary password for ${talent.users.email}:`)
            if (newPass) await setTempPassword(talent.users.id, newPass)
        }
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
                    adminId: adminProfile?.id
                })
            })

            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Failed to set password')
            alert('Temporary password set successfully. User will be forced to change it on next login.')
        } catch (error: any) {
            alert('Error: ' + error.message)
        } finally {
            setResetting(null)
        }
    }

    const sendPasswordReset = async (email: string, userId: string) => {
        setResetting(userId)
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            })

            if (error) throw error
            alert(`Password reset email sent to ${email}`)

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
    const filteredTalents = talents.filter(t => {
        const name = (t.users?.name || t.internal_name || '').toLowerCase()
        const email = (t.users?.email || t.internal_email || '').toLowerCase()
        const searchLower = search.toLowerCase()
        return name.includes(searchLower) || email.includes(searchLower)
    })

    return (
        <div>
            <div className={styles.header}>
                <h1 className={styles.title}>Talent Management</h1>
                <Link href="/admin/talents/create">
                    <button className={`${styles.btn} ${styles.btnPrimary}`}>
                        <FilePlus size={16} />
                        Add Talent
                    </button>
                </Link>
            </div>

            <div className={styles.tableContainer}>
                <div className={styles.tableHeader}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            className={styles.searchBar}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <select
                            className={styles.searchBar}
                            style={{ width: '150px' }}
                            value={filter}
                            onChange={(e) => setFilter(e.target.value as any)}
                        >
                            <option value="all">Active Profiles</option>
                            <option value="hidden">Hidden Only</option>
                            <option value="deleted">Deleted Only</option>
                        </select>
                    </div>
                    <button onClick={fetchTalents} className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSm}`}>
                        <RefreshCw size={14} /> Refresh
                    </button>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Name / Email</th>
                                <th>Category</th>
                                <th>Location</th>
                                <th>Status</th>
                                <th>Experience</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>Loading...</td>
                                </tr>
                            ) : filteredTalents.length === 0 ? (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>No profiles found.</td>
                                </tr>
                            ) : (
                                filteredTalents.map((talent) => (
                                    <tr key={talent.id}>
                                        <td>
                                            <div style={{ fontWeight: 600 }}>{talent.users?.name || talent.internal_name || 'Unknown'}</div>
                                            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                                                {talent.users?.email || talent.internal_email}
                                                {adminProfile?.role === 'super_admin' && talent.users?.email && (
                                                    <span style={{ marginLeft: '6px', color: '#f59e0b', fontSize: '0.7rem' }}>(Linked)</span>
                                                )}
                                            </div>
                                            {talent.users?.mobile && <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{talent.users.mobile}</div>}
                                        </td>
                                        <td>{talent.category}</td>
                                        <td>{talent.city}, {talent.state}</td>
                                        <td>
                                            {talent.deleted_at ? (
                                                <span className={`${styles.badge} ${styles.badgeDeleted}`}>Deleted</span>
                                            ) : talent.is_hidden ? (
                                                <span className={`${styles.badge} ${styles.badgeHidden}`}>Hidden</span>
                                            ) : (
                                                <span className={`${styles.badge} ${styles.badgeActive}`}>Active</span>
                                            )}
                                        </td>
                                        <td>{talent.years_experience} Years</td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                {/* Edit */}
                                                <Link href={`/admin/talents/${talent.id}/edit`}>
                                                    <button className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSm}`} title="Edit Profile">
                                                        <Edit size={14} />
                                                    </button>
                                                </Link>

                                                {/* Preview */}
                                                <Link href={`/talent/${talent.id}`} target="_blank">
                                                    <button className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSm}`} title="Preview">
                                                        <ExternalLink size={14} />
                                                    </button>
                                                </Link>

                                                {/* Super Admin Password Key */}
                                                {adminProfile?.role === 'super_admin' && (
                                                    <button
                                                        className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSm}`}
                                                        onClick={() => handlePasswordAction(talent)}
                                                        title={talent.users ? "Credentials & Security" : "No Linked User Account"}
                                                        style={{
                                                            color: talent.users ? '#f59e0b' : '#9ca3af',
                                                            borderColor: talent.users ? '#f59e0b' : '#e5e7eb',
                                                            cursor: talent.users ? 'pointer' : 'not-allowed',
                                                            opacity: talent.users ? 1 : 0.6
                                                        }}
                                                    >
                                                        <KeyRound size={14} />
                                                    </button>
                                                )}

                                                {/* Hide/Unhide */}
                                                {!talent.deleted_at && (
                                                    <button
                                                        className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSm}`}
                                                        onClick={() => toggleHidden(talent.id, talent.is_hidden)}
                                                        title={talent.is_hidden ? "Unhide" : "Hide"}
                                                    >
                                                        {talent.is_hidden ? <Eye size={14} /> : <EyeOff size={14} />}
                                                    </button>
                                                )}

                                                {/* Delete/Restore */}
                                                {talent.deleted_at ? (
                                                    <button
                                                        className={`${styles.btn} ${styles.btnPrimary} ${styles.btnSm}`}
                                                        onClick={() => restore(talent.id)}
                                                        title="Restore Profile"
                                                    >
                                                        Restore
                                                    </button>
                                                ) : (
                                                    <button
                                                        className={`${styles.btn} ${styles.btnDanger} ${styles.btnSm}`}
                                                        onClick={() => softDelete(talent.id)}
                                                        title="Delete (Soft)"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                )}
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
