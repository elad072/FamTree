import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import {
    Check,
    X,
    User,
    Calendar,
    Clock,
    ShieldCheck,
    ChevronRight,
    Home
} from 'lucide-react'
import Link from 'next/link'

export default async function AdminDashboard() {
    const supabase = await createClient()

    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'admin') {
        redirect('/')
    }

    // Fetch pending members
    const { data: pendingMembers } = await supabase
        .from('family_members')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

    // Fetch pending users (profiles not approved)
    const { data: pendingUsers } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_approved', false)
        .eq('role', 'member')
        .order('created_at', { ascending: false })

    return (
        <main className="min-h-screen bg-stone-50 pb-32">
            {/* Header */}
            <div className="bg-white border-b border-stone-200 py-10 mb-12">
                <div className="max-w-7xl mx-auto px-6">
                    <nav className="flex items-center gap-2 text-stone-400 text-sm font-bold mb-4">
                        <Link href="/" className="hover:text-primary flex items-center gap-1 text-stone-400">
                            <Home size={14} />
                            בית
                        </Link>
                        <ChevronRight size={14} />
                        <span className="text-primary font-black flex items-center gap-1">
                            <ShieldCheck size={16} />
                            ניהול מערכת
                        </span>
                    </nav>

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-serif font-black text-primary">
                                לוח בקרה
                            </h1>
                            <p className="text-stone-500 mt-2 font-medium">
                                ניהול בקשות הצטרפות ואישור תוכן חדש בספר המשפחה
                            </p>
                        </div>

                        <div className="flex gap-4">
                            <div className="bg-primary/10 text-primary px-6 py-3 rounded-2xl font-black border border-primary/20">
                                {pendingMembers?.length || 0} בקשות תוכן
                            </div>
                            <div className="bg-secondary/10 text-secondary px-6 py-3 rounded-2xl font-black border border-secondary/20">
                                {pendingUsers?.length || 0} משתמשים חדשים
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 space-y-12">
                {/* Pending Users Section */}
                {pendingUsers && pendingUsers.length > 0 && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-serif font-black text-primary px-2 flex items-center gap-2">
                            משתמשים הממתינים לאישור גישה
                        </h2>
                        <div className="grid gap-4">
                            {pendingUsers.map((userProfile) => (
                                <div key={userProfile.id} className="bg-white rounded-[2rem] p-6 heritage-shadow border border-stone-100 flex items-center justify-between gap-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center text-stone-400">
                                            <User size={24} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-lg text-primary">{userProfile.full_name || 'ללא שם'}</p>
                                            <p className="text-sm text-stone-400 font-bold">{userProfile.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <form action={`/api/admin/approve-user?id=${userProfile.id}`} method="POST">
                                            <button className="bg-green-500 text-white p-3 rounded-xl hover:bg-green-600 transition-all shadow-md">
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
                            ))}
                        </div>
                    </div>
                )}

                {/* Pending Content Section */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-serif font-black text-primary px-2">
                        בקשות לתוכן חדש
                    </h2>
                    {!pendingMembers || pendingMembers.length === 0 ? (
                        <div className="bg-white rounded-[2.5rem] p-20 text-center heritage-shadow border border-stone-100">
                            <div className="w-20 h-20 bg-stone-50 text-stone-300 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Check size={40} />
                            </div>
                            <h2 className="text-2xl font-serif font-black text-stone-400">אין בקשות תוכן חדשות</h2>
                        </div>
                    ) : (
                        <div className="grid gap-6">
                            {pendingMembers.map((member) => (
                                <div key={member.id} className="bg-white rounded-[2rem] p-8 heritage-shadow border border-stone-100 flex flex-col md:flex-row items-center justify-between gap-8">
                                    <div className="flex items-center gap-6 flex-1">
                                        <div className="w-24 h-24 rounded-[2rem] overflow-hidden bg-stone-100 border-4 border-stone-50 shadow-inner flex-shrink-0">
                                            {member.image_url ? (
                                                <img src={member.image_url} alt={member.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-stone-300">
                                                    <User size={32} />
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <h3 className="text-2xl font-serif font-black text-primary mb-1">{member.name}</h3>
                                            <div className="flex flex-wrap gap-4 text-stone-500 text-sm font-bold">
                                                <span className="flex items-center gap-1.5">
                                                    <Calendar size={14} className="text-secondary" />
                                                    נולד ב-{member.birth_year || '????'}
                                                </span>
                                                <span className="flex items-center gap-1.5">
                                                    <Clock size={14} className="text-secondary" />
                                                    נוסף על ידי: {member.created_by || 'אנונימי'}
                                                </span>
                                            </div>
                                            {member.life_story && (
                                                <p className="mt-4 text-stone-500 line-clamp-2 text-sm leading-relaxed max-w-xl italic">
                                                    "{member.life_story}"
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex gap-4 w-full md:w-auto">
                                        <form action={`/api/admin/approve?id=${member.id}`} method="POST" className="flex-1 md:flex-none">
                                            <button className="w-full bg-green-500 text-white rounded-2xl px-6 py-4 font-black shadow-lg shadow-green-200 hover:bg-green-600 transition-all flex items-center justify-center gap-2">
                                                <Check size={20} />
                                                אישור
                                            </button>
                                        </form>
                                        <form action={`/api/admin/reject?id=${member.id}`} method="POST" className="flex-1 md:flex-none">
                                            <button className="w-full bg-white text-rose-500 border-2 border-rose-100 rounded-2xl px-6 py-4 font-black hover:bg-rose-50 transition-all flex items-center justify-center gap-2">
                                                <X size={20} />
                                                דחייה
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </main>
    )
}
