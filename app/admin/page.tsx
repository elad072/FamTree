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

    // Log for debugging
    if (membersError) {
        console.error('Error fetching pending members:', membersError)
    }

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

    return (
        <main className="min-h-screen bg-[#fdfcfb] pb-32">
            {/* Top Navigation Bar */}
            <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-stone-200/60">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <Link href="/" className="flex items-center gap-3 group">
                            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform overflow-hidden">
                                <img src="/logo.png" alt="Carmel Tree" className="w-full h-full object-cover" />
                            </div>
                            <span className="text-2xl font-serif font-black text-primary tracking-tight">Carmel Tree</span>
                        </Link>
                        
                        <div className="hidden md:flex items-center gap-1 text-stone-400 text-sm font-bold">
                            <ChevronRight size={14} />
                            <span className="text-primary bg-primary/5 px-3 py-1 rounded-full flex items-center gap-1.5">
                                <ShieldCheck size={16} />
                                ניהול מערכת
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="text-left hidden sm:block">
                            <p className="text-xs font-black text-stone-400 uppercase tracking-wider">מחובר כעת</p>
                            <p className="text-sm font-bold text-primary">{profile?.full_name || 'מנהל מערכת'}</p>
                        </div>
                        <form action="/api/auth/signout" method="POST">
                            <button className="flex items-center gap-2 bg-stone-100 hover:bg-rose-50 text-stone-600 hover:text-rose-600 px-4 py-2.5 rounded-xl font-bold transition-all border border-transparent hover:border-rose-100">
                                <LogOut size={18} />
                                <span className="hidden sm:inline">התנתקות</span>
                            </button>
                        </form>
                    </div>
                </div>
            </nav>

            {/* Hero Header */}
            <div className="relative overflow-hidden bg-white border-b border-stone-200 py-16 mb-12">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 -skew-x-12 translate-x-1/2" />
                <div className="max-w-7xl mx-auto px-6 relative">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                    <LayoutDashboard size={24} />
                                </div>
                                <span className="text-primary font-black tracking-widest uppercase text-sm">Admin Control Panel</span>
                            </div>
                            <h1 className="text-5xl md:text-6xl font-serif font-black text-primary leading-tight">
                                לוח בקרה <span className="text-secondary">וניהול</span>
                            </h1>
                            <p className="text-stone-500 mt-4 text-lg font-medium max-w-2xl">
                                ברוך הבא למרכז השליטה. כאן תוכל לנהל את משתמשי המערכת, לאשר תוכן חדש ולשמור על איכות הארכיון המשפחתי.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-stone-200/50 border border-stone-100 flex flex-col items-center text-center min-w-[140px]">
                                <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-3">
                                    <UsersIcon size={24} />
                                </div>
                                <span className="text-3xl font-black text-primary">{totalMembers || 0}</span>
                                <span className="text-xs font-bold text-stone-400 mt-1">בני משפחה</span>
                            </div>
                            <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-stone-200/50 border border-stone-100 flex flex-col items-center text-center min-w-[140px]">
                                <div className="w-12 h-12 bg-secondary/10 text-secondary rounded-2xl flex items-center justify-center mb-3">
                                    <FileText size={24} />
                                </div>
                                <span className="text-3xl font-black text-secondary">{pendingMembers?.length || 0}</span>
                                <span className="text-xs font-bold text-stone-400 mt-1">בקשות אישור</span>
                            </div>
                            <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-stone-200/50 border border-stone-100 flex flex-col items-center text-center min-w-[140px]">
                                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-3">
                                    <ShieldCheck size={24} />
                                </div>
                                <span className="text-3xl font-black text-emerald-600">{totalUsers || 0}</span>
                                <span className="text-xs font-bold text-stone-400 mt-1">משתמשים פעילים</span>
                            </div>
                            <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-stone-200/50 border border-stone-100 flex flex-col items-center text-center min-w-[140px]">
                                <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-3">
                                    <Clock size={24} />
                                </div>
                                <span className="text-3xl font-black text-amber-600">{totalComments || 0}</span>
                                <span className="text-xs font-bold text-stone-400 mt-1">תגובות וזכרונות</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 space-y-16">
                {/* Activity & Pending Grid */}
                <div className="grid lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2 space-y-12">
                        {/* Pending Users Section */}
                        {pendingUsers && pendingUsers.length > 0 && (
                            <section className="space-y-8">
                                <div className="flex items-center gap-4">
                                    <h2 className="text-3xl font-serif font-black text-primary">
                                        משתמשים חדשים
                                    </h2>
                                    <div className="h-px flex-1 bg-gradient-to-l from-stone-200 to-transparent" />
                                </div>
                                <div className="grid md:grid-cols-2 gap-6">
                                    {pendingUsers.map((userProfile: any) => (
                                        <div key={userProfile.id} className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-stone-200/40 border border-stone-100 hover:border-primary/20 transition-all group">
                                            <div className="flex items-start justify-between mb-6">
                                                <div className="w-16 h-16 rounded-2xl bg-stone-50 flex items-center justify-center text-stone-400 group-hover:bg-primary/5 group-hover:text-primary transition-colors overflow-hidden">
                                                    {userProfile.avatar_url ? (
                                                        <img src={userProfile.avatar_url} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <User size={32} />
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
                                                <p className="text-stone-400 font-bold text-sm">{userProfile.email}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Pending Content Section */}
                        <section className="space-y-8">
                            <div className="flex items-center gap-4">
                                <h2 className="text-3xl font-serif font-black text-primary">
                                    בקשות לתוכן חדש
                                </h2>
                                <div className="h-px flex-1 bg-gradient-to-l from-stone-200 to-transparent" />
                            </div>
                            
                            {!pendingMembers || pendingMembers.length === 0 ? (
                                <div className="bg-white rounded-[3rem] p-16 text-center border border-dashed border-stone-200">
                                    <div className="w-16 h-16 bg-stone-50 text-stone-200 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <Check size={32} />
                                    </div>
                                    <h3 className="text-xl font-serif font-black text-stone-400">כל הבקשות טופלו</h3>
                                </div>
                            ) : (
                                <div className="grid gap-6">
                                    {pendingMembers.map((member: any) => (
                                        <div key={member.id} className="bg-white rounded-[2.5rem] p-6 shadow-xl shadow-stone-200/40 border border-stone-100 flex flex-col md:flex-row items-center justify-between gap-6 hover:shadow-2xl transition-all">
                                            <div className="flex items-center gap-6 flex-1">
                                                <div className="w-20 h-20 rounded-2xl overflow-hidden bg-stone-100 border-4 border-stone-50 shadow-inner flex-shrink-0">
                                                    {member.image_url ? (
                                                        <img src={member.image_url} alt={member.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-stone-300">
                                                            <User size={32} />
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-serif font-black text-primary">{member.name}</h3>
                                                    <p className="text-stone-400 text-xs font-bold mt-1">נוסף על ידי: {member.created_by || 'אנונימי'}</p>
                                                </div>
                                            </div>

                                            <div className="flex gap-3">
                                                <Link
                                                    href={`/family/${member.id}/edit`}
                                                    className="p-3 bg-stone-100 text-stone-600 rounded-xl hover:bg-stone-200 transition-all"
                                                >
                                                    <Edit size={18} />
                                                </Link>
                                                <form action={`/api/admin/approve?id=${member.id}`} method="POST">
                                                    <button className="p-3 bg-green-500 text-white rounded-xl shadow-lg shadow-green-200 hover:bg-green-600 transition-all">
                                                        <Check size={18} />
                                                    </button>
                                                </form>
                                                <form action={`/api/admin/reject?id=${member.id}`} method="POST">
                                                    <button className="p-3 bg-white text-rose-500 border border-rose-100 rounded-xl hover:bg-rose-50 transition-all">
                                                        <X size={18} />
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
                    <div className="space-y-8">
                        <div className="flex items-center gap-4">
                            <h2 className="text-2xl font-serif font-black text-primary">
                                פעילות אחרונה
                            </h2>
                            <div className="h-px flex-1 bg-gradient-to-l from-stone-200 to-transparent" />
                        </div>

                        <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-stone-200/40 border border-stone-100 space-y-8">
                            {recentComments && recentComments.length > 0 ? (
                                recentComments.map((comment: any) => (
                                    <div key={comment.id} className="relative pr-6">
                                        <div className="absolute right-0 top-0 bottom-0 w-1 bg-primary/10 rounded-full" />
                                        <p className="text-xs font-black text-stone-400 uppercase tracking-wider mb-1">
                                            {new Date(comment.created_at).toLocaleDateString('he-IL')}
                                        </p>
                                        <p className="text-sm font-bold text-primary">
                                            {comment.profiles?.full_name || 'משתמש'} הגיב על {comment.family_members?.name}
                                        </p>
                                        <p className="text-stone-500 text-sm mt-2 line-clamp-2 italic">
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
                    <div className="flex items-center gap-4">
                        <h2 className="text-3xl font-serif font-black text-primary">
                            ניהול משתמשים
                        </h2>
                        <div className="h-px flex-1 bg-gradient-to-l from-stone-200 to-transparent" />
                    </div>
                    
                    <UserManagement 
                        initialUsers={allUsers || []} 
                        currentAdminId={user.id} 
                    />
                </section>
            </div>
        </main>
    )
}
