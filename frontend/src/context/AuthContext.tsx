'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import api from '@/lib/api'
import { useRouter, usePathname } from 'next/navigation'

interface User {
    id: any
    name: string
    email: string
    mobile: string
    role: string
    api_token?: string
}

interface AuthContextType {
    user: User | null
    profile: any | null
    talentProfile: any | null
    loading: boolean
    signOut: () => void
    refreshAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    profile: null,
    talentProfile: null,
    loading: true,
    signOut: () => { },
    refreshAuth: async () => { },
})

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null)
    const [talentProfile, setTalentProfile] = useState<any | null>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('token')
            if (!token) {
                setLoading(false)
                return
            }

            // 1. Fetch User Data
            const { data: userData } = await api.get('/me.php')
            setUser(userData)

            // 2. Fetch Talent Profile
            try {
                const { data: talentData } = await api.get('/profile.php')
                setTalentProfile(talentData)
            } catch (err) {
                // It's okay if profile doesn't exist yet
                setTalentProfile(null)
            }

        } catch (error: any) {
            console.error("Auth init error:", error)
            if (error.response?.status === 401) {
                localStorage.removeItem('token')
                setUser(null)
                setTalentProfile(null)
            }
        } finally {
            setLoading(false)
        }
    }

    const pathname = usePathname()

    useEffect(() => {
        // If we already have a user, do a silent fetch in the background to verify session
        // If we don't have a user but we have a token, do a full fetch with loading state
        const token = localStorage.getItem('token')
        if (token) {
            fetchProfile()
        }
    }, [pathname])

    // Real-time synchronization polling
    useEffect(() => {
        const token = localStorage.getItem('token')
        if (!token) return

        // Ping the server every 15 seconds (15000ms) to check if the user is still valid and update their state if it changed
        const interval = setInterval(async () => {
            // ONLY ping the server if the user is actually looking at the tab.
            // This prevents thousands of idle background tabs from crashing the server!
            if (document.visibilityState !== 'visible') return;

            try {
                // This silent request will trigger the global 401 interceptor in api.ts
                // if the user is deleted from the database.
                const { data } = await api.get('/me.php');
                setUser(prev => {
                    if (!prev) return data;
                    // Update if critical fields like role or name changed
                    if (prev.role !== data.role || prev.name !== data.name) {
                        return { ...prev, ...data };
                    }
                    return prev;
                });
            } catch (err) {
                // 401s are handled globally in api.ts, redirecting them instantly
            }
        }, 15000)

        return () => clearInterval(interval)
    }, [user]) // Re-run when user logs in/out

    const signOut = () => {
        localStorage.removeItem('token')
        setUser(null)
        setTalentProfile(null)
        router.push('/login')
    }

    const refreshAuth = async () => {
        await fetchProfile()
    }

    return (
        <AuthContext.Provider value={{ user, profile: user, talentProfile, loading, signOut, refreshAuth }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
