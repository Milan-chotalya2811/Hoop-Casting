'use client'

import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import styles from './admin.module.css'
import AdminSidebar from '@/components/admin/Sidebar'
import { ShieldAlert } from 'lucide-react'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user, profile, loading } = useAuth()
    const router = useRouter()
    const [isAuthorized, setIsAuthorized] = useState(false)

    useEffect(() => {
        if (!loading) {
            if (!user) {
                // router.push('/login') // Or show access denied
            } else if (profile?.role === 'super_admin') {
                setIsAuthorized(true)
            }
        }
    }, [user, profile, loading, router])

    if (loading) {
        return (
            <div className={styles.accessDenied}>
                <p>Loading Admin Panel...</p>
            </div>
        )
    }

    if (!user || profile?.role !== 'super_admin') {
        return (
            <div className={styles.accessDenied}>
                <ShieldAlert className={styles.lockIcon} />
                <h1 className={styles.title}>Access Denied</h1>
                <p style={{ marginTop: '0.5rem', color: '#4b5563' }}>
                    You do not have permission to view this page.
                </p>
                <button
                    className={`${styles.btn} ${styles.btnPrimary}`}
                    style={{ marginTop: '1.5rem' }}
                    onClick={() => router.push('/')}
                >
                    Return Home
                </button>
            </div>
        )
    }

    return (
        <div className={styles.adminParams}>
            <AdminSidebar />
            <main className={styles.mainContent}>
                {children}
            </main>
        </div>
    )
}
