import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// Initialize Admin Client
// This requires SUPABASE_SERVICE_ROLE_KEY to be set in .env.local
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
)

export async function POST(req: NextRequest) {
    // 1. Check if Service Key is present (pseudo-check, if it's anon key it won't work for admin update)
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        return NextResponse.json({ error: 'Server misconfiguration: Service Role Key missing.' }, { status: 500 })
    }

    try {
        const body = await req.json()
        const { userId, password, adminId } = body

        if (!userId || !password) {
            return NextResponse.json({ error: 'Missing userId or password' }, { status: 400 })
        }

        // 2. Perform Password Update via Admin Client
        const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
            userId,
            { password: password }
        )

        if (error) throw error

        // 3. Log to DB (Admin Log)
        if (adminId) {
            await supabaseAdmin.from('admin_logs').insert({
                admin_id: adminId,
                target_user_id: userId,
                action_type: 'set_temp_password',
                details: 'Admin set temporary password via API'
            })
        }

        // 4. Set must_change_password flag in public.users
        const { error: flagError } = await supabaseAdmin
            .from('users')
            .update({ must_change_password: true })
            .eq('id', userId)

        if (flagError) console.error('Error setting flag:', flagError)

        return NextResponse.json({ success: true, user: data.user })

    } catch (error: any) {
        console.error('Set Password Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
