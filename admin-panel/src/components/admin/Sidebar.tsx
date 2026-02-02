'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import styles from '@/app/admin/admin.module.css'
import { LayoutDashboard, Users, FileText, Settings, LogOut, KeyRound } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

export default function AdminSidebar() {
    const pathname = usePathname()
    const { signOut } = useAuth()

    const links = [
        { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/admin/talents', label: 'Talent Management', icon: Users },
        { href: '/admin/users', label: 'Registered Users', icon: KeyRound },
        { href: '/admin/forms', label: 'Form Builder', icon: FileText },
        // { href: '/admin/settings', label: 'Settings', icon: Settings },
    ]

    return (
        <aside className={styles.sidebar}>
            <div className={styles.sidebarHeader}>
                <LayoutDashboard size={28} />
                <span>Admin Panel</span>
            </div>

            <nav className={styles.nav}>
                {links.map((link) => {
                    const isActive = pathname === link.href
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
                        >
                            <link.icon size={20} />
                            {link.label}
                        </Link>
                    )
                })}
            </nav>

            <div style={{ padding: '1rem' }}>
                <button
                    onClick={signOut}
                    className={styles.navItem}
                    style={{ width: '100%', background: 'transparent', border: 'none', cursor: 'pointer' }}
                >
                    <LogOut size={20} />
                    Sign Out
                </button>
            </div>
        </aside>
    )
}
