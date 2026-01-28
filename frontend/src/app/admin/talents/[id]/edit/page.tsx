'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function EditTalent() {
    const router = useRouter()

    useEffect(() => {
        // alert("Admin Edit feature is under maintenance.")
        // router.push('/admin/talents')
    }, [])

    return (
        <div className="container section">
            <Link href="/admin/talents" className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                <ArrowLeft size={16} /> Back to List
            </Link>
            <div style={{ padding: '40px', textAlign: 'center', background: 'var(--surface)', borderRadius: '16px' }}>
                <h1>Feature Under Maintenance</h1>
                <p>The Admin Edit Talent feature is being migrated to the new backend. Please use the database directly or wait for the update.</p>
            </div>
        </div>
    )
}
