'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import styles from '@/components/Form.module.css'
import { supabase } from '@/lib/supabaseClient'

function LoginContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const registered = searchParams.get('registered')

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const [formData, setFormData] = useState({
        identifier: '', // Email or Mobile
        password: ''
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setLoading(true)

        try {
            let emailToLogin = formData.identifier
            const isEmail = formData.identifier.includes('@')

            // If identifier is NOT an email (assume mobile), look up email
            if (!isEmail) {
                const { data, error: dbError } = await supabase
                    .from('users')
                    .select('email')
                    .eq('mobile', formData.identifier)
                    .single()

                if (dbError || !data) {
                    throw new Error("Mobile number not found. Please register.")
                }
                emailToLogin = data.email
            }

            // Login with Email/Password
            const { error: authError } = await supabase.auth.signInWithPassword({
                email: emailToLogin,
                password: formData.password
            })

            if (authError) throw authError

            // Redirect
            router.push('/dashboard')

        } catch (err: any) {
            setError(err.message || 'Login failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className={styles.formContainer}>
            <div className={styles.card}>
                <h1 className={styles.title}>Welcome Back</h1>
                <p className={styles.subtitle}>Login to access your dashboard</p>

                {registered && (
                    <div style={{ color: 'var(--success)', background: 'rgba(16, 185, 129, 0.1)', padding: '10px', borderRadius: '4px', marginBottom: '16px', border: '1px solid var(--success)' }}>
                        Registration successful! Please login.
                    </div>
                )}

                {error && <div className={styles.error}>{error}</div>}

                <form onSubmit={handleLogin}>
                    <div className={styles.formGroup}>
                        <label>Mobile Number or Email</label>
                        <input
                            type="text"
                            name="identifier"
                            placeholder="john@example.com or +9198..."
                            required
                            value={formData.identifier}
                            onChange={handleChange}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Password</label>
                        <input
                            type="password"
                            name="password"
                            placeholder="••••••••"
                            required
                            value={formData.password}
                            onChange={handleChange}
                        />
                    </div>

                    <div style={{ textAlign: 'right', marginBottom: '15px' }}>
                        <Link href="/forgot-password" style={{ fontSize: '0.9rem', color: 'var(--primary)', textDecoration: 'none' }}>
                            Forgot Password?
                        </Link>
                    </div>

                    <button type="submit" className={styles.submitBtn} disabled={loading}>
                        {loading ? 'Logging In...' : 'Login'}
                    </button>
                </form>

                <div className={styles.footer}>
                    Don't have an account? <Link href="/register" className={styles.link}>Register</Link>
                </div>
            </div>
        </div>
    )
}

export default function Login() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <LoginContent />
        </Suspense>
    )
}
