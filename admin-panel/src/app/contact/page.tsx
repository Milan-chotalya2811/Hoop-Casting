'use client'

import styles from '@/components/Form.module.css'

export default function Contact() {
    return (
        <div className="container section">
            <div className={styles.card} style={{ maxWidth: '800px', margin: '0 auto' }}>
                <h1 className="title-gradient" style={{ textAlign: 'center', marginBottom: '10px' }}>Get in Touch</h1>
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '40px' }}>
                    Have questions? We'd love to hear from you.
                </p>

                <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '40px' }}>

                    <div>
                        <form>
                            <div className={styles.formGroup}>
                                <label>Name</label>
                                <input type="text" placeholder="Your Name" />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Email</label>
                                <input type="email" placeholder="Your Email" />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Message</label>
                                <textarea rows={5} placeholder="How can we help?" style={{ width: '100%', padding: '12px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', color: 'white' }}></textarea>
                            </div>
                            <button type="button" className="btn btn-primary" style={{ width: '100%' }}>Send Message</button>
                        </form>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                        <div>
                            <h3 style={{ color: 'var(--primary)', marginBottom: '10px' }}>Office Address</h3>
                            <p style={{ color: 'var(--text-muted)' }}>
                                123 Cinema Boulevard, <br />
                                Mumbai, Maharashtra 400053<br />
                                India
                            </p>
                        </div>
                        <div>
                            <h3 style={{ color: 'var(--primary)', marginBottom: '10px' }}>Contact Info</h3>
                            <p style={{ color: 'var(--text-muted)' }}>
                                Email: casting@castingnet.com<br />
                                Phone: +91 98765 43210
                            </p>
                        </div>
                        <div>
                            <h3 style={{ color: 'var(--primary)', marginBottom: '10px' }}>Working Hours</h3>
                            <p style={{ color: 'var(--text-muted)' }}>
                                Mon - Fri: 10:00 AM - 7:00 PM<br />
                                Sat: 10:00 AM - 2:00 PM
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}
