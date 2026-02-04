'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import styles from '@/app/admin/admin.module.css'
import { LayoutDashboard, Users, FileText, Settings, LogOut, KeyRound, MessageSquare, Mail, BookOpen } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

interface AdminSidebarProps {
    isOpen?: boolean
    onClose?: () => void
}

export default function AdminSidebar({ isOpen = false, onClose }: AdminSidebarProps) {
    const pathname = usePathname()
    const { signOut } = useAuth()

    const links = [
        { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/admin/talents', label: 'Talent Management', icon: Users },
        { href: '/admin/users', label: 'Registered Users', icon: KeyRound },
        { href: '/admin/forms', label: 'Form Builder', icon: FileText },
        { href: '/admin/blogs', label: 'Blogs', icon: BookOpen },
        { href: '/admin/contact', label: 'Contact Form', icon: Mail },
        // { href: '/admin/settings', label: 'Settings', icon: Settings },
    ]

    const handleLinkClick = () => {
        if (onClose) onClose()
    }

    return (
        <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
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
                            onClick={handleLinkClick}
                        >
                            <link.icon size={20} />
                            {link.label}
                        </Link>
                    )
                })}
            </nav>

            <div style={{ padding: '1rem' }}>
                <button
                    onClick={() => { signOut(); handleLinkClick() }}
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
