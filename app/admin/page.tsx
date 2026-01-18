import { createClient } from '@/lib/supabase-server'
import { createAdminClient } from '@/lib/supabase-admin'
import { redirect } from 'next/navigation'
import {
    ShieldCheck,
} from 'lucide-react'
import React from 'react'
import AdminTabs from '@/components/AdminTabs'

export const revalidate = 0 // Admin page should always be fresh

export default async function AdminDashboard() {
    const supabase = await createClient()
    const adminClient = createAdminClient()

    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: profile } = await supabase
        .from('profiles')
        .select('role, full_name')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'admin') {
        redirect('/')
    }

    // Use admin client to fetch pending members (bypasses RLS)
    const { data: pendingMembers } = await adminClient
        .from('family_members')
        .select('*')
        .eq('status', 'pending')
        .order('created_date', { ascending: false })

    // Fetch pending users (profiles not approved)
    const { data: pendingUsers } = await adminClient
        .from('profiles')
        .select('*')
        .eq('is_approved', false)
        .neq('role', 'admin')
        .order('created_at', { ascending: false })

    // Fetch all users for management
    const { data: allUsers } = await adminClient
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

    // Fetch Statistics
    const { count: totalMembers } = await adminClient
        .from('family_members')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved')

    const { count: totalComments } = await adminClient
        .from('comments')
        .select('*', { count: 'exact', head: true })

    const { count: totalUsers } = await adminClient
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('is_approved', true)

    // Fetch Recent Activity (Latest comments)
    const { data: recentComments } = await adminClient
        .from('comments')
        .select('*, profiles(full_name), family_members(name)')
        .order('created_at', { ascending: false })
        .limit(5)

    // Fetch all messages for admin
    const { data: allMessages } = await adminClient
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false })

    // Fetch profiles separately to avoid join issues
    const { data: messageProfiles } = await adminClient
        .from('profiles')
        .select('id, full_name, email')

    const messagesWithProfiles = allMessages?.map(msg => ({
        ...msg,
        profiles: messageProfiles?.find(p => p.id === msg.user_id)
    }))

    return (
        <main className="min-h-screen bg-stone-50 pb-32">
            {/* Hero Header */}
            <div className="relative overflow-hidden bg-white border-b border-stone-200 pt-16 pb-24 mb-12">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 -skew-x-12 translate-x-1/2" />
                <div className="max-w-7xl mx-auto px-6 relative">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-12">
                        <div className="space-y-6">
                            <div className="inline-flex items-center gap-3 px-4 py-2 bg-primary/10 rounded-2xl text-primary text-sm font-black tracking-widest uppercase">
                                <ShieldCheck size={20} />
                                Admin Control Panel
                            </div>
                            <h1 className="text-5xl md:text-7xl font-serif font-black text-primary leading-tight">
                                לוח בקרה <br />
                                <span className="text-stone-300 italic">וניהול המערכת</span>
                            </h1>
                            <p className="text-xl text-stone-500 font-medium max-w-2xl leading-relaxed">
                                ברוך הבא למרכז השליטה. כאן תוכל לנהל את משתמשי המערכת, לאשר תוכן חדש ולשמור על איכות הארכיון המשפחתי.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6">
                <AdminTabs 
                    pendingUsers={pendingUsers || []}
                    pendingMembers={pendingMembers || []}
                    allUsers={allUsers || []}
                    recentComments={recentComments || []}
                    messagesWithProfiles={messagesWithProfiles || []}
                    currentAdminId={user.id}
                    stats={{
                        totalMembers: totalMembers || 0,
                        pendingMembersCount: pendingMembers?.length || 0,
                        totalUsers: totalUsers || 0,
                        totalComments: totalComments || 0
                    }}
                />
            </div>
        </main>
    )
}
