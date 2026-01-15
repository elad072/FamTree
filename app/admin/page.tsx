import { createClient } from '@/lib/supabase-server'
import { createAdminClient } from '@/lib/supabase-admin'
import { redirect } from 'next/navigation'
import {
    Check,
    X,
    User,
    Calendar,
    Clock,
    ShieldCheck,
    ChevronRight,
    Home,
    Users as UsersIcon,
    Edit,
    Trash2,
    LogOut,
    LayoutDashboard,
    UserPlus,
    FileText
} from 'lucide-react'
import Link from 'next/link'
import UserManagement from '@/components/UserManagement'
import AdminMessageManager from '@/components/AdminMessageManager'
import React from 'react'

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
    const { data: pendingMembers, error: membersError } = await adminClient
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
    const { data: allMessages, error: messagesError } = await adminClient
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

                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { label: 'בני משפחה', value: totalMembers, icon: <UsersIcon size={24} />, color: 'text-primary', bg: 'bg-primary/5' },
                                { label: 'בקשות אישור', value: pendingMembers?.length, icon: <FileText size={24} />, color: 'text-secondary', bg: 'bg-secondary/5' },
                                { label: 'משתמשים', value: totalUsers, icon: <ShieldCheck size={24} />, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                                { label: 'תגובות', value: totalComments, icon: <Clock size={24} />, color: 'text-amber-600', bg: 'bg-amber-50' },
                            ].map((stat, i) => (
                                <div key={i} className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-stone-200/50 border border-stone-100 flex flex-col items-center text-center min-w-[160px]">
                                    <div className={`w-14 h-14 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-4 shadow-inner`}>
                                        {stat.icon}
                                    </div>
                                    <span className={`text-4xl font-black ${stat.color}`}>{stat.value || 0}</span>
                                    <span className="text-xs font-black text-stone-400 uppercase tracking-wider mt-2">{stat.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 space-y-20">
                {/* Activity & Pending Grid */}
                <div className="grid lg:grid-cols-12 gap-12">
                    <div className="lg:col-span-8 space-y-20">
                        {/* Messages Section */}
                        <section className="space-y-8">
                            <div className="flex items-center gap-6">
                                <h2 className="text-3xl font-serif font-black text-primary">
                                    פניות והודעות
                                </h2>
                                <div className="h-px flex-1 bg-gradient-to-l from-stone-200 to-transparent" />
                            </div>
                            <AdminMessageManager initialMessages={messagesWithProfiles || []} />
                        </section>

                        {/* Pending Users Section */}
                        {pendingUsers && pendingUsers.length > 0 && (
                            <section className="space-y-8">
                                <div className="flex items-center gap-6">
                                    <h2 className="text-3xl font-serif font-black text-primary">
                                        משתמשים חדשים
                                    </h2>
                                    <div className="h-px flex-1 bg-gradient-to-l from-stone-200 to-transparent" />
                                </div>
                                <div className="grid sm:grid-cols-2 gap-6">
                                    {pendingUsers.map((userProfile: any) => (
                                        <div key={userProfile.id} className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-stone-200/40 border border-stone-100 hover:border-primary/20 transition-all group">
                                            <div className="flex items-start justify-between mb-6">
                                                <div className="w-16 h-16 rounded-2xl bg-stone-50 flex items-center justify-center text-stone-400 group-hover:bg-primary/5 group-hover:text-primary transition-colors overflow-hidden border-2 border-white shadow-inner">
                                                    {userProfile.avatar_url ? (
                                                        <img src={userProfile.avatar_url} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <User size={28} />
                                                    )}
                                                </div>
                                                <div className="flex gap-2">
                                                    <form action={`/api/admin/approve-user?id=${userProfile.id}`} method="POST">
                                                        <button className="bg-green-500 text-white p-3 rounded-xl hover:bg-green-600 transition-all shadow-lg shadow-green-200">
                                                            <Check size={20} />
                                                        </button>
                                                    </form>
                                                    <form action={`/api/admin/reject-user?id=${userProfile.id}`} method="POST">
                                                        <button className="bg-white text-rose-500 border border-rose-100 p-3 rounded-xl hover:bg-rose-50 transition-all">
                                                            <X size={20} />
                                                        </button>
                                                    </form>
                                                </div>
                                            </div>
                                            <div>
                                                <h3 className="font-black text-xl text-primary mb-1">{userProfile.full_name || 'ללא שם'}</h3>
                                                <p className="text-stone-400 font-bold text-sm truncate">{userProfile.email}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Pending Content Section */}
                        <section className="space-y-8">
                            <div className="flex items-center gap-6">
                                <h2 className="text-3xl font-serif font-black text-primary">
                                    בקשות לתוכן חדש
                                </h2>
                                <div className="h-px flex-1 bg-gradient-to-l from-stone-200 to-transparent" />
                            </div>
                            
                            {!pendingMembers || pendingMembers.length === 0 ? (
                                <div className="bg-white rounded-[3rem] p-20 text-center border border-dashed border-stone-200">
                                    <div className="w-20 h-20 bg-stone-50 text-stone-200 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <Check size={40} />
                                    </div>
                                    <h3 className="text-2xl font-serif font-black text-stone-400">כל הבקשות טופלו</h3>
                                </div>
                            ) : (
                                <div className="grid gap-6">
                                    {pendingMembers.map((member: any) => (
                                        <div key={member.id} className="bg-white rounded-[2.5rem] p-6 shadow-xl shadow-stone-200/40 border border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-6 hover:shadow-2xl transition-all group">
                                            <div className="flex items-center gap-6 flex-1 w-full sm:w-auto">
                                                <div className="w-24 h-24 rounded-3xl overflow-hidden bg-stone-100 border-4 border-white shadow-inner flex-shrink-0 group-hover:scale-105 transition-transform">
                                                    {member.image_url ? (
                                                        <img src={member.image_url} alt={member.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-stone-300">
                                                            <User size={32} />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <h3 className="text-2xl font-serif font-black text-primary truncate">{member.name}</h3>
                                                    <p className="text-stone-400 text-xs font-bold mt-1 truncate">נוסף על ידי: {member.created_by || 'אנונימי'}</p>
                                                </div>
                                            </div>

                                            <div className="flex gap-3 w-full sm:w-auto justify-end">
                                                <Link
                                                    href={`/family/${member.id}/edit`}
                                                    className="p-4 bg-stone-100 text-stone-600 rounded-2xl hover:bg-stone-200 transition-all"
                                                >
                                                    <Edit size={20} />
                                                </Link>
                                                <form action={`/api/admin/approve?id=${member.id}`} method="POST">
                                                    <button className="p-4 bg-green-500 text-white rounded-2xl shadow-lg shadow-green-200 hover:bg-green-600 transition-all">
                                                        <Check size={20} />
                                                    </button>
                                                </form>
                                                <form action={`/api/admin/reject?id=${member.id}`} method="POST">
                                                    <button className="p-4 bg-white text-rose-500 border border-rose-100 rounded-2xl hover:bg-rose-50 transition-all">
                                                        <X size={20} />
                                                    </button>
                                                </form>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    </div>

                    {/* Sidebar: Recent Activity */}
                    <div className="lg:col-span-4 space-y-12">
                        <div className="flex items-center gap-4">
                            <h2 className="text-2xl font-serif font-black text-primary">
                                פעילות אחרונה
                            </h2>
                            <div className="h-px flex-1 bg-gradient-to-l from-stone-200 to-transparent" />
                        </div>

                        <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-stone-200/40 border border-stone-100 space-y-8">
                            {recentComments && recentComments.length > 0 ? (
                                recentComments.map((comment: any) => (
                                    <div key={comment.id} className="relative pr-6 group">
                                        <div className="absolute right-0 top-0 bottom-0 w-1 bg-primary/10 rounded-full group-hover:bg-primary transition-colors" />
                                        <p className="text-[10px] font-black text-stone-400 uppercase tracking-wider mb-1">
                                            {new Date(comment.created_at).toLocaleDateString('he-IL')}
                                        </p>
                                        <p className="text-sm font-bold text-primary">
                                            {comment.profiles?.full_name || 'משתמש'} הגיב על {comment.family_members?.name}
                                        </p>
                                        <p className="text-stone-500 text-sm mt-2 line-clamp-3 italic leading-relaxed">
                                            "{comment.content}"
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-stone-400 text-sm italic text-center py-8">אין פעילות לאחרונה</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* All Users Management */}
                <section className="space-y-8">
                    <div className="flex items-center gap-6">
                        <h2 className="text-3xl font-serif font-black text-primary">
                            ניהול משתמשים
                        </h2>
                        <div className="h-px flex-1 bg-gradient-to-l from-stone-200 to-transparent" />
                    </div>
                    
                    <div className="bg-white rounded-[3rem] p-8 shadow-xl shadow-stone-200/40 border border-stone-100">
                        <UserManagement 
                            initialUsers={allUsers || []} 
                            currentAdminId={user.id} 
                        />
                    </div>
                </section>
            </div>
        </main>
    )
}
