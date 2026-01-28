'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import api from '@/lib/api'
import { useRouter } from 'next/navigation'

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

    useEffect(() => {
        fetchProfile()
    }, [])

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
