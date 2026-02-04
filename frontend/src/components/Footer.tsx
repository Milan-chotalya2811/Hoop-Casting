'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import styles from './Footer.module.css'
import { Facebook, Twitter, Instagram, Linkedin, Youtube, Mail, MapPin, Phone } from 'lucide-react'

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <div className="container">
                <div className={styles.footerContainer}>
                    {/* Brand Column */}
                    <div className={styles.brandColumn}>
                        <Link href="/" style={{ display: 'inline-block', marginBottom: '15px' }}>
                            <img src="/footer_logo.png" alt="Monkey Casting Logo" style={{ height: '60px', width: 'auto', objectFit: 'contain' }} />
                        </Link>
                        <p className={styles.brandDesc}>
                            The premier casting gateway connecting extraordinary talent with world-class productions.
                        </p>
                        <div className={styles.socialRow}>
                            <a href="#" className={styles.socialIcon}><Instagram size={20} /></a>
                            <a href="#" className={styles.socialIcon}><Linkedin size={20} /></a>
                            <a href="#" className={styles.socialIcon}><Youtube size={20} /></a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className={styles.columnTitle}>Quick Links</h4>
                        <ul className={styles.linksList}>
                            <li><Link href="/">Home</Link></li>
                            <li><Link href="/about">About Us</Link></li>
                            <li><Link href="/register">Join the Cast</Link></li>
                            <li><Link href="/contact">Contact</Link></li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h4 className={styles.columnTitle}>Support</h4>
                        <ul className={styles.linksList}>
                            <li><Link href="/contact">Contact Support</Link></li>
                            <li><Link href="/privacy">Privacy Policy</Link></li>
                            <li><Link href="/terms">Terms of Service</Link></li>
                        </ul>
                    </div>

                    {/* Contact & Newsletter */}
                    <div>
                        <h4 className={styles.columnTitle}>Stay Connected</h4>
                        <ul className={`${styles.linksList} ${styles.contactList}`}>
                            <li style={{ display: 'flex', gap: '10px' }}><MapPin size={20} color="var(--primary)" style={{ flexShrink: 0 }} /> A-607 Swastik Universal, Surat</li>
                            <li style={{ display: 'flex', gap: '10px' }}><Phone size={20} color="var(--primary)" style={{ flexShrink: 0 }} /> +91 90164 75421</li>
                            <li style={{ display: 'flex', gap: '10px' }}><Mail size={20} color="var(--primary)" style={{ flexShrink: 0 }} /> support@hoopcasting.com</li>
                        </ul>

                        <div style={{ marginTop: '25px' }}>
                            <p style={{ color: '#aaa', fontSize: '0.9rem' }}>Subscribe for auditions updates.</p>
                            <form className={styles.newsletterForm}>
                                <input type="email" placeholder="Your email" className={styles.input} suppressHydrationWarning />
                                <button type="submit" className={styles.subscribeBtn} suppressHydrationWarning>Join</button>
                            </form>
                        </div>
                    </div>
                </div>

                <div className={styles.bottomBar}>
                    <p>&copy; {new Date().getFullYear()} Hoop Casting. All rights reserved.</p>
                    <div style={{ display: 'flex', gap: '20px' }}>
                        <span>Designed with ❤️ by Hoop Casting</span>
                    </div>
                </div>
            </div>
        </footer>
    )
}
