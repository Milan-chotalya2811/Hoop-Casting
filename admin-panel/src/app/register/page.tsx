'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import styles from '@/components/Form.module.css'
import { supabase } from '@/lib/supabaseClient'

export default function Register() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const [formData, setFormData] = useState({
        fullName: '',
        mobile: '',
        email: '',
        password: '',
        confirmPassword: ''
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setLoading(true)

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match")
            setLoading(false)
            return
        }

        try {
            // 1. Sign up with Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        full_name: formData.fullName, // Meta data
                    }
                }
            })

            if (authError) throw authError

            if (authData.user) {
                // 2. Insert into public.users table
                const { error: dbError } = await supabase
                    .from('users')
                    .insert({
                        id: authData.user.id,
                        name: formData.fullName,
                        email: formData.email,
                        mobile: formData.mobile,
                        role: 'user'
                    })

                if (dbError) {
                    // If DB insert fails, we can't easily rollback Auth user on client, 
                    // but arguably we should show error.
                    console.error("Database error:", dbError)
                    throw new Error("Account created but profile setup failed. Please contact support.")
                }

                // Success -> Redirect to Login
                router.push('/login?registered=true')
            }

        } catch (err: any) {
            setError(err.message || 'Registration failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className={styles.formContainer}>
            <div className={styles.card}>
                <h1 className={styles.title}>Join the Cast</h1>
                <p className={styles.subtitle}>Create your talent profile today</p>

                {error && <div className={styles.error}>{error}</div>}

                <form onSubmit={handleRegister}>
                    <div className={styles.formGroup}>
                        <label>Full Name</label>
                        <input
                            type="text"
                            name="fullName"
                            placeholder="John Doe"
                            required
                            value={formData.fullName}
                            onChange={handleChange}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Mobile Number</label>
                        <input
                            type="tel"
                            name="mobile"
                            placeholder="+91 9876543210"
                            required
                            value={formData.mobile}
                            onChange={handleChange}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Email Address</label>
                        <input
                            type="email"
                            name="email"
                            placeholder="john@example.com"
                            required
                            value={formData.email}
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

                    <div className={styles.formGroup}>
                        <label>Confirm Password</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            placeholder="••••••••"
                            required
                            value={formData.confirmPassword}
                            onChange={handleChange}
                        />
                    </div>

                    <button type="submit" className={styles.submitBtn} disabled={loading}>
                        {loading ? 'Creating Account...' : 'Register Now'}
                    </button>
                </form>

                <div className={styles.footer}>
                    Already have an account? <Link href="/login" className={styles.link}>Login</Link>
                </div>
            </div>
        </div>
    )
}
