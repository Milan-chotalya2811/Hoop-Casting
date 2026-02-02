'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import styles from './Header.module.css'
import { Menu, X, User as UserIcon, LogOut, LayoutDashboard, UserCircle } from 'lucide-react'

const Header = () => {
    const { user, profile, signOut } = useAuth()
    const pathname = usePathname()
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    const isActive = (path: string) => pathname === path ? styles.navLinkActive : ''

    const NavLinks = () => (
        <>
            <Link href="/" className={`${styles.navLink} ${isActive('/')}`}>Home</Link>
            <Link href="/categories" className={`${styles.navLink} ${isActive('/categories')}`}>Categories</Link>
            <Link href="/fresh-models" className={`${styles.navLink} ${isActive('/fresh-models')}`}>Fresh Models</Link>
            <Link href="/about" className={`${styles.navLink} ${isActive('/about')}`}>About Us</Link>
            <Link href="/contact" className={`${styles.navLink} ${isActive('/contact')}`}>Contact</Link>
        </>
    )

    return (
        <header className={styles.header}>
            <div className={styles.container}>
                <div className={styles.logo}>
                    <Link href="/">CASTING<span style={{ color: '#fff' }}>NET</span></Link>
                </div>

                {/* Desktop Nav */}
                <nav className={styles.nav}>
                    <NavLinks />
                </nav>

                <div className={styles.authButtons}>
                    {user ? (
                        <div
                            className={styles.avatarContainer}
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            style={{ position: 'relative' }}
                        >
                            <div className={styles.avatar}>
                                {profile?.name ? profile.name[0].toUpperCase() : <UserIcon size={20} />}
                            </div>

                            {/* Dropdown - Toggle via State */}
                            {isDropdownOpen && (
                                <div className={styles.dropdown} style={{ display: 'flex' }}>
                                    {['admin', 'super_admin'].includes(profile?.role) && (
                                        <Link href="/admin" className={styles.dropdownItem}>
                                            <LayoutDashboard size={16} style={{ marginRight: 8 }} /> Admin Panel
                                        </Link>
                                    )}
                                    <Link href="/dashboard" className={styles.dropdownItem}>
                                        <LayoutDashboard size={16} style={{ marginRight: 8 }} /> Dashboard
                                    </Link>
                                    <Link href="/profile" className={styles.dropdownItem}>
                                        <UserCircle size={16} style={{ marginRight: 8 }} /> Talent Profile
                                    </Link>
                                    <button onClick={signOut} className={styles.dropdownItem} style={{ width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center' }}>
                                        <LogOut size={16} style={{ marginRight: 8 }} /> Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link href="/register" className="btn btn-primary" style={{ fontSize: '0.9rem', padding: '8px 20px' }}>
                            Login / Register
                        </Link>
                    )}

                    {/* Mobile Menu Toggle */}
                    <button className={styles.mobileMenuBtn} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                        {mobileMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay can be added here if needed, for now focusing on desktop richness */}
        </header>
    )
}

export default Header
