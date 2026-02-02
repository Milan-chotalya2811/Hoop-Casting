'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

interface AuthContextType {
    user: User | null
    profile: any | null
    loading: boolean
    signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    profile: null,
    loading: true,
    signOut: async () => { },
})

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null)
    const [profile, setProfile] = useState<any | null>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        // Check active session
        const checkUser = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession()
                setUser(session?.user ?? null)

                if (session?.user) {
                    fetchProfile(session.user.id)
                } else {
                    setLoading(false)
                }
            } catch (error) {
                console.error("Error checking session:", error)
                setLoading(false)
            }
        }

        checkUser()

        // Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            setUser(session?.user ?? null)
            if (session?.user) {
                fetchProfile(session.user.id)
            } else {
                setProfile(null)
                setLoading(false)
            }
        })

        return () => subscription.unsubscribe()
    }, [])

    const fetchProfile = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', userId)
                .single()

            if (error) {
                // If row not found (PGRST116), try to self-heal by inserting user
                if (error.code === 'PGRST116') {
                    console.warn('Profile missing in public.users, attempting self-heal...')
                    const { data: { session } } = await supabase.auth.getSession()
                    if (session?.user) {
                        const { error: insertError } = await supabase.from('users').insert({
                            id: session.user.id,
                            email: session.user.email,
                            role: 'talent' // Default role
                        })

                        if (!insertError) {
                            // Retry fetch
                            const { data: retryData } = await supabase.from('users').select('*').eq('id', userId).single()
                            if (retryData) {
                                setProfile(retryData)
                                return // specific return not strictly needed but good flow
                            }
                        } else {
                            console.error('Failed to create missing public user record:', insertError)
                        }
                    }
                } else {
                    console.error('Error fetching profile:', error.message, error)
                }
            } else {
                setProfile(data)
                // Force Password Change Check
                if (data.must_change_password && window.location.pathname !== '/change-password') {
                    router.push('/change-password')
                }
            }
        } catch (err) {
            console.error('Error in fetchProfile:', err)
        } finally {
            setLoading(false)
        }
    }

    const signOut = async () => {
        await supabase.auth.signOut()
        router.push('/login')
    }

    return (
        <AuthContext.Provider value={{ user, profile, loading, signOut }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
