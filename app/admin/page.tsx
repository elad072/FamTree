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

    return (
        <main className="min-h-screen bg-[#fdfcfb] pb-32">
            {/* Top Navigation Bar */}
            <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-stone-200/60">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <Link href="/" className="flex items-center gap-2 group">
                            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
                                <Home size={20} />
                            </div>
                            <span className="text-xl font-serif font-black text-primary tracking-tight">שורשים</span>
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

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-stone-200/50 border border-stone-100 flex flex-col items-center text-center min-w-[160px]">
                                <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-3">
                                    <FileText size={24} />
                                </div>
                                <span className="text-3xl font-black text-primary">{pendingMembers?.length || 0}</span>
                                <span className="text-xs font-bold text-stone-400 mt-1">בקשות תוכן</span>
                            </div>
                            <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-stone-200/50 border border-stone-100 flex flex-col items-center text-center min-w-[160px]">
                                <div className="w-12 h-12 bg-secondary/10 text-secondary rounded-2xl flex items-center justify-center mb-3">
                                    <UserPlus size={24} />
                                </div>
                                <span className="text-3xl font-black text-secondary">{pendingUsers?.length || 0}</span>
                                <span className="text-xs font-bold text-stone-400 mt-1">משתמשים חדשים</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 space-y-16">
                {/* Pending Users Section */}
                {pendingUsers && pendingUsers.length > 0 && (
                    <section className="space-y-8">
                        <div className="flex items-center gap-4">
                            <h2 className="text-3xl font-serif font-black text-primary">
                                משתמשים הממתינים לאישור
                            </h2>
                            <div className="h-px flex-1 bg-gradient-to-l from-stone-200 to-transparent" />
                        </div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {pendingUsers.map((userProfile: any) => (
                                <div key={userProfile.id} className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-stone-200/40 border border-stone-100 hover:border-primary/20 transition-all group">
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="w-16 h-16 rounded-2xl bg-stone-50 flex items-center justify-center text-stone-400 group-hover:bg-primary/5 group-hover:text-primary transition-colors">
                                            <User size={32} />
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
                        <div className="bg-white rounded-[3rem] p-24 text-center border border-dashed border-stone-200">
                            <div className="w-24 h-24 bg-stone-50 text-stone-200 rounded-full flex items-center justify-center mx-auto mb-8">
                                <Check size={48} />
                            </div>
                            <h3 className="text-2xl font-serif font-black text-stone-400">כל הבקשות טופלו בהצלחה</h3>
                            <p className="text-stone-400 mt-2 font-medium">אין כרגע תוכן הממתין לאישור</p>
                        </div>
                    ) : (
                        <div className="grid gap-8">
                            {pendingMembers.map((member: any) => (
                                <div key={member.id} className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-stone-200/40 border border-stone-100 flex flex-col lg:flex-row items-center justify-between gap-10 hover:shadow-2xl hover:shadow-stone-200/60 transition-all">
                                    <div className="flex flex-col md:flex-row items-center gap-8 flex-1 text-center md:text-right">
                                        <div className="w-32 h-32 rounded-[2.5rem] overflow-hidden bg-stone-100 border-8 border-stone-50 shadow-inner flex-shrink-0 rotate-3 group-hover:rotate-0 transition-transform">
                                            {member.image_url ? (
                                                <img src={member.image_url} alt={member.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-stone-300">
                                                    <User size={48} />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex flex-col md:flex-row md:items-center gap-3 mb-3">
                                                <h3 className="text-3xl font-serif font-black text-primary">{member.name}</h3>
                                                <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-black self-center md:self-auto">ממתין לאישור</span>
                                            </div>
                                            <div className="flex flex-wrap justify-center md:justify-start gap-6 text-stone-500 text-sm font-bold">
                                                <span className="flex items-center gap-2">
                                                    <Calendar size={16} className="text-secondary" />
                                                    שנת לידה: {member.birth_year || '????'}
                                                </span>
                                                <span className="flex items-center gap-2">
                                                    <Clock size={16} className="text-secondary" />
                                                    נוסף על ידי: {member.created_by || 'אנונימי'}
                                                </span>
                                            </div>
                                            {member.life_story && (
                                                <div className="mt-6 relative">
                                                    <div className="absolute -right-4 top-0 bottom-0 w-1 bg-stone-100 rounded-full" />
                                                    <p className="text-stone-500 line-clamp-2 text-base leading-relaxed max-w-2xl italic pr-4">
                                                        "{member.life_story}"
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-4 w-full lg:w-auto">
                                        <Link
                                            href={`/family/${member.id}/edit`}
                                            className="flex-1 lg:flex-none bg-stone-100 text-stone-600 rounded-2xl px-8 py-4 font-black hover:bg-stone-200 transition-all flex items-center justify-center gap-2 border border-stone-200"
                                        >
                                            <Edit size={20} />
                                            עריכה
                                        </Link>
                                        <form action={`/api/admin/approve?id=${member.id}`} method="POST" className="flex-1 lg:flex-none">
                                            <button className="w-full bg-green-500 text-white rounded-2xl px-8 py-4 font-black shadow-lg shadow-green-200 hover:bg-green-600 transition-all flex items-center justify-center gap-2">
                                                <Check size={20} />
                                                אישור פרסום
                                            </button>
                                        </form>
                                        <form action={`/api/admin/reject?id=${member.id}`} method="POST" className="flex-1 lg:flex-none">
                                            <button className="w-full bg-white text-rose-500 border-2 border-rose-100 rounded-2xl px-8 py-4 font-black hover:bg-rose-50 transition-all flex items-center justify-center gap-2">
                                                <X size={20} />
                                                דחייה
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* All Users Management */}
                <section className="space-y-8">
                    <div className="flex items-center gap-4">
                        <h2 className="text-3xl font-serif font-black text-primary">
                            ניהול משתמשים
                        </h2>
                        <div className="h-px flex-1 bg-gradient-to-l from-stone-200 to-transparent" />
                    </div>
                    
                    <div className="bg-white rounded-[3rem] shadow-2xl shadow-stone-200/40 border border-stone-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-right border-collapse">
                                <thead>
                                    <tr className="bg-stone-50/50 border-b border-stone-100">
                                        <th className="py-6 px-8 text-sm font-black text-stone-400 uppercase tracking-wider">משתמש</th>
                                        <th className="py-6 px-8 text-sm font-black text-stone-400 uppercase tracking-wider">פרטי קשר</th>
                                        <th className="py-6 px-8 text-sm font-black text-stone-400 uppercase tracking-wider">תפקיד וסטטוס</th>
                                        <th className="py-6 px-8 text-sm font-black text-stone-400 uppercase tracking-wider">הצטרפות</th>
                                        <th className="py-6 px-8 text-sm font-black text-stone-400 uppercase tracking-wider text-center">פעולות</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-50">
                                    {allUsers?.map((u: any) => (
                                        <tr key={u.id} className="hover:bg-stone-50/30 transition-colors group">
                                            <td className="py-6 px-8">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-400 group-hover:bg-primary group-hover:text-white transition-all">
                                                        <User size={20} />
                                                    </div>
                                                    <span className="font-black text-primary text-lg">{u.full_name || 'ללא שם'}</span>
                                                </div>
                                            </td>
                                            <td className="py-6 px-8">
                                                <span className="text-stone-500 font-bold">{u.email}</span>
                                            </td>
                                            <td className="py-6 px-8">
                                                <div className="flex items-center gap-3">
                                                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${u.role === 'admin'
                                                        ? 'bg-primary text-white'
                                                        : 'bg-stone-100 text-stone-600'
                                                        }`}>
                                                        {u.role === 'admin' ? 'מנהל' : 'משתמש'}
                                                    </span>
                                                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${u.is_approved
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-amber-100 text-amber-700'
                                                        }`}>
                                                        {u.is_approved ? 'מאושר' : 'ממתין'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-6 px-8 text-stone-500 font-bold">
                                                {new Date(u.created_at).toLocaleDateString('he-IL')}
                                            </td>
                                            <td className="py-6 px-8">
                                                <div className="flex justify-center gap-3">
                                                    <Link
                                                        href={`/admin/users/${u.id}/edit`}
                                                        className="p-3 text-stone-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
                                                        title="עריכה"
                                                    >
                                                        <Edit size={18} />
                                                    </Link>
                                                    {u.role !== 'admin' && (
                                                        <form action={`/api/admin/delete-user?id=${u.id}`} method="POST">
                                                            <button
                                                                type="submit"
                                                                className="p-3 text-stone-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                                                                title="מחיקה"
                                                            >
                                                                <Trash2 size={18} />
                                                            </button>
                                                        </form>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    )
}
