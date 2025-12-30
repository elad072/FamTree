import { createClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 })

    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    // Check if target user is admin
    const { data: targetProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', id)
        .single()

    if (targetProfile?.role === 'admin') {
        return NextResponse.json({ error: 'Cannot delete admin users' }, { status: 403 })
    }

    // Delete the profile (auth user deletion requires admin API which we don't have access to)
    const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.redirect(new URL('/admin', request.url), { status: 303 })
}
