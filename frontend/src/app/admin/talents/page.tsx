'use client'

import { useEffect, useState, Suspense } from 'react'
import api from '@/lib/api'
import styles from '../admin.module.css'
import { Eye, EyeOff, Trash2, Edit, ExternalLink, RefreshCw, FilePlus, KeyRound, Mail, Filter, X } from 'lucide-react'
import { FaWhatsapp } from 'react-icons/fa'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

const PREDEFINED_CATEGORIES = [
    'Actor', 'Model', 'Anchor', 'Videographer',
    'Makeup Artist', 'Stylist', 'Art Direction', 'Set Designer',
    'Voice Over', 'Dancer', 'Singer', 'Writer', 'Photographer'
]

function TalentManagementContent() {
    const { profile: adminProfile } = useAuth()
    const searchParams = useSearchParams()

    // Get filter from URL, default to 'all' if empty
    const filterParam = searchParams.get('filter') as 'all' | 'hidden' | 'deleted' | null

    const [talents, setTalents] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [filter, setFilter] = useState<'all' | 'hidden' | 'deleted'>('all')
    const [resetting, setResetting] = useState<string | null>(null)

    // Advanced Filters
    const [showFilters, setShowFilters] = useState(false)
    const [categoryFilter, setCategoryFilter] = useState('')
    const [locationFilter, setLocationFilter] = useState('')

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
        try {
            const { data } = await api.get(`/admin/talents.php?t=${Date.now()}`)
            if (Array.isArray(data)) {
                // Map flat structure Back to nested structure for compatibility
                const mapped = data.map((t: any) => ({
                    ...t,
                    users: {
                        name: t.name,
                        email: t.email,
                        mobile: t.mobile,
                        id: t.user_id
                    }
                }))
                setTalents(mapped)
            } else {
                console.warn('API returned non-array data:', data)
                setTalents([])
            }
        } catch (error) {
            console.error('Error fetching talents:', error)
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

        try {
            await api.post('/admin/talent_action.php', { action: 'toggle_hidden', id })
        } catch (e) {
            alert('Error updating status')
            fetchTalents()
        }
    }

    const softDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this profile? It will be moved to the Deleted bin.')) return

        setTalents(current => current.filter(t => t.id !== id))
        try {
            await api.post('/admin/talent_action.php', { action: 'delete', id })
        } catch (e) {
            alert('Error deleting profile')
            fetchTalents()
        }
    }

    const restore = async (id: string) => {
        if (!confirm('Restore this profile? It will become active again.')) return

        if (filter === 'deleted') {
            setTalents(current => current.filter(t => t.id !== id))
        }
        try {
            await api.post('/admin/talent_action.php', { action: 'restore', id })
        } catch (e) {
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
        alert("Password reset features handled via standard forgot password flow.")
    }

    // Derived Lists for Filters
    // 1. Categories
    const availableCategories = Array.from(new Set([
        ...PREDEFINED_CATEGORIES,
        ...talents.map(t => t.category).filter(Boolean)
    ])).sort()

    // 2. Locations
    const availableLocations = Array.from(new Set(
        talents.map(t => {
            if (!t.city) return null;
            return t.city.trim().replace(/\w\S*/g, (w: string) => (w.replace(/^\w/, (c) => c.toUpperCase())));
        }).filter(Boolean)
    )).sort()

    // Client-side search & filter
    const filteredTalents = talents.filter(t => {
        const name = (t.users?.name || t.internal_name || '').toLowerCase()
        const email = (t.users?.email || t.internal_email || '').toLowerCase()
        const searchLower = search.toLowerCase()

        const matchesSearch = name.includes(searchLower) || email.includes(searchLower)
        const matchesCategory = categoryFilter ? t.category === categoryFilter : true

        // Looser Location Matching (Case Insensitive)
        const matchesLocation = locationFilter ?
            (t.city && t.city.toLowerCase() === locationFilter.toLowerCase())
            : true

        return matchesSearch && matchesCategory && matchesLocation
    })

    return (
        <div>
            <div className={styles.header}>
                <h1 className={styles.title}>Talent Management</h1>
                {/* Fixed Link Structure */}
                <Link href="/admin/talents/create" className={`${styles.btn} ${styles.btnPrimary}`} style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    <FilePlus size={16} />
                    Add Talent
                </Link>
            </div>

            <div className={styles.tableContainer}>
                <div className={styles.tableHeader}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        {/* Filter Toggle Icon */}
                        <button
                            className={`${styles.btn} ${styles.btnSecondary}`}
                            onClick={() => setShowFilters(!showFilters)}
                            title="Toggle Filters"
                            style={{ padding: '8px' }}
                        >
                            <Filter size={18} />
                        </button>

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

                {/* Advanced Filters Row */}
                {showFilters && (
                    <div style={{ padding: '1rem 1.5rem', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4b5563' }}>Category</span>
                            <select
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                className={styles.searchBar}
                                style={{ width: '200px' }}
                            >
                                <option value="">All Categories</option>
                                {availableCategories.map((c: any) => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4b5563' }}>Location (City)</span>
                            <select
                                value={locationFilter}
                                onChange={(e) => setLocationFilter(e.target.value)}
                                className={styles.searchBar}
                                style={{ width: '200px' }}
                            >
                                <option value="">All Locations</option>
                                {availableLocations.map((l: any) => <option key={l} value={l}>{l}</option>)}
                            </select>
                        </div>

                        {(categoryFilter || locationFilter) && (
                            <button
                                onClick={() => { setCategoryFilter(''); setLocationFilter('') }}
                                className={styles.btn}
                                style={{ marginTop: 'auto', color: '#ef4444', textDecoration: 'underline', background: 'none' }}
                            >
                                <X size={14} /> Clear Filters
                            </button>
                        )}
                    </div>
                )}

                <div style={{ overflowX: 'auto' }}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Name / Email</th>
                                <th>Category</th>
                                <th>Location</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>Loading...</td>
                                </tr>
                            ) : filteredTalents.length === 0 ? (
                                <tr>
                                    <td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>No profiles found.</td>
                                </tr>
                            ) : (
                                filteredTalents.map((talent) => (
                                    <tr key={talent.id}>
                                        <td>
                                            <div style={{ fontWeight: 600 }}>{talent.users?.name || talent.internal_name || 'Unknown'}</div>
                                            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                                                {talent.users?.email || talent.internal_email}
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
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                {(talent.users?.mobile) && (
                                                    <a
                                                        href={`https://wa.me/${talent.users.mobile.replace(/\D/g, '')}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className={`${styles.btn} ${styles.btnSm}`}
                                                        style={{ background: '#25D366', color: '#fff', border: 'none' }}
                                                        title="Chat on WhatsApp"
                                                    >
                                                        <FaWhatsapp size={14} />
                                                    </a>
                                                )}

                                                {/* Edit */}
                                                <Link href={`/admin/talents/edit?id=${talent.id}`}>
                                                    <span className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSm}`} title="Edit Profile">
                                                        <Edit size={14} />
                                                    </span>
                                                </Link>

                                                {/* Preview */}
                                                <a href={`/talent?id=${talent.id}`} target="_blank" rel="noopener noreferrer">
                                                    <span className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSm}`} title="Preview">
                                                        <ExternalLink size={14} />
                                                    </span>
                                                </a>

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

export default function TalentManagement() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <TalentManagementContent />
        </Suspense>
    )
}
