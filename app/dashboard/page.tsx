import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { 
    User, 
    Plus, 
    Edit2, 
    Users, 
    Heart, 
    Baby, 
    UserPlus,
    ChevronRight,
    LayoutDashboard,
    Clock,
    MessageSquare,
    ShieldCheck
} from 'lucide-react'
import DashboardMessages from '@/components/DashboardMessages'

export default async function DashboardPage() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Fetch user profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    // Fetch members created by this user
    const { data: myMembers } = await supabase
        .from('family_members')
        .select('*')
        .eq('created_by_id', user.id)
        .order('created_date', { ascending: false })

    // Fetch all members for suggestions and relatives
    const { data: allMembers } = await supabase
        .from('family_members')
        .select('*')
        .eq('status', 'approved')

    // Find the family member entry that represents the user themselves
    const userMember = allMembers?.find(m => 
        (m.email && m.email.toLowerCase() === user.email?.toLowerCase()) || 
        (profile?.full_name && m.name.includes(profile.full_name))
    )

    // Find first degree relatives
    let relatives: any[] = []
    if (userMember) {
        relatives = allMembers?.filter(m => {
            if (m.id === userMember.id) return false
            
            // Parents
            if (m.id === userMember.father_id || m.id === userMember.mother_id) return true
            
            // Children
            if (m.father_id === userMember.id || m.mother_id === userMember.id) return true
            
            // Spouse
            if (m.id === userMember.spouse_id || m.spouse_id === userMember.id) return true
            
            // Siblings (same parents)
            if (userMember.father_id || userMember.mother_id) {
                const sameFather = userMember.father_id && m.father_id === userMember.father_id
                const sameMother = userMember.mother_id && m.mother_id === userMember.mother_id
                if (sameFather || sameMother) return true
            }

            return false
        }) || []
    }

    // Fetch messages
    const { data: messages } = await supabase
        .from('messages')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })

    // Simple suggestion logic
    const suggestions = allMembers?.filter(m => 
        (m.email && m.email === user.email) || 
        (profile?.full_name && m.name.includes(profile.full_name))
    ).filter(m => !myMembers?.some(my => my.id === m.id) && m.id !== userMember?.id) || []

    return (
        <main className="min-h-screen bg-stone-50 pb-20">
            {/* Header */}
            <div className="bg-white border-b border-stone-200 pt-12 pb-20 mb-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-secondary/5 -skew-x-12 translate-x-1/2" />
                
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="flex items-center gap-3 text-stone-400 text-sm font-black mb-4 uppercase tracking-widest">
                        <LayoutDashboard size={16} />
                        <span>מרכז שליטה אישי</span>
                    </div>
                    <h1 className="text-5xl md:text-6xl font-serif font-black text-primary">
                        שלום, {profile?.full_name || 'אורח'}
                    </h1>
                    <p className="text-xl text-stone-500 mt-4 font-medium max-w-2xl">
                        כאן תוכל לנהל את בני המשפחה שהוספת, לעקוב אחר סטטוס האישורים ולראות הצעות לקשרים חדשים בעץ המשפחה.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-12">
                    
                    {/* First Degree Relatives */}
                    <section>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-serif font-black text-primary flex items-center gap-2">
                                <Heart className="text-rose-500" size={24} />
                                קרובים מדרגה ראשונה
                            </h2>
                        </div>

                        {relatives.length > 0 ? (
                            <div className="grid sm:grid-cols-3 gap-4">
                                {relatives.map((relative) => (
                                    <Link 
                                        key={relative.id} 
                                        href={`/family/${relative.id}`}
                                        className="bg-white p-6 rounded-[2rem] border border-stone-100 shadow-sm hover:shadow-xl hover:translate-y-[-4px] transition-all text-center group"
                                    >
                                        <div className="w-20 h-20 rounded-2xl bg-stone-100 overflow-hidden mx-auto mb-4 border-4 border-stone-50 group-hover:border-primary/20 transition-all">
                                            {relative.image_url ? (
                                                <img src={relative.image_url} alt={relative.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-stone-300">
                                                    <User size={32} />
                                                </div>
                                            )}
                                        </div>
                                        <h3 className="font-black text-primary text-sm mb-1">{relative.name}</h3>
                                        <p className="text-[10px] font-black text-stone-400 uppercase tracking-wider">
                                            {relative.id === userMember?.father_id ? 'אבא' : 
                                             relative.id === userMember?.mother_id ? 'אמא' :
                                             (relative.id === userMember?.spouse_id || relative.spouse_id === userMember?.id) ? 'בן/בת זוג' :
                                             (relative.father_id === userMember?.id || relative.mother_id === userMember?.id) ? 'בן/בת' : 
                                             (relative.father_id === userMember?.father_id || relative.mother_id === userMember?.mother_id) ? 'אח/אחות' : 'קרוב/ה'}
                                        </p>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-stone-100/50 rounded-[2.5rem] p-10 text-center border border-stone-200">
                                <p className="text-stone-500 font-medium">לא נמצאו קרובים מדרגה ראשונה המקושרים אליך במערכת.</p>
                                {!userMember && (
                                    <p className="text-stone-400 text-sm mt-2">טיפ: וודא שקיים כרטיס עבורך בספר המשפחה עם האימייל שלך.</p>
                                )}
                            </div>
                        )}
                    </section>

                    {/* My Added Members */}
                    <section>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-serif font-black text-primary flex items-center gap-2">
                                <Users className="text-secondary" size={24} />
                                בני משפחה שהוספתי
                            </h2>
                            <Link 
                                href="/family/add"
                                className="bg-primary text-white px-4 py-2 rounded-xl font-black text-sm flex items-center gap-2 hover:shadow-lg transition-all"
                            >
                                <Plus size={18} />
                                הוספה חדשה
                            </Link>
                        </div>

                        {myMembers && myMembers.length > 0 ? (
                            <div className="grid sm:grid-cols-2 gap-4">
                                {myMembers.map((member) => (
                                    <div key={member.id} className="bg-white p-6 rounded-[2rem] border border-stone-100 shadow-sm hover:shadow-md transition-all group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 rounded-2xl bg-stone-100 overflow-hidden flex-shrink-0 border-2 border-stone-50">
                                                {member.image_url ? (
                                                    <img src={member.image_url} alt={member.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-stone-300">
                                                        <User size={24} />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-black text-primary truncate">{member.name}</h3>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase ${
                                                        member.status === 'approved' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'
                                                    }`}>
                                                        {member.status === 'approved' ? 'מאושר' : 'ממתין לאישור'}
                                                    </span>
                                                    <span className="text-stone-400 text-xs flex items-center gap-1">
                                                        <Clock size={10} />
                                                        {new Date(member.created_date).toLocaleDateString('he-IL')}
                                                    </span>
                                                </div>
                                            </div>
                                            <Link 
                                                href={`/family/${member.id}/edit`}
                                                className="w-10 h-10 rounded-xl bg-stone-50 flex items-center justify-center text-stone-400 hover:bg-primary hover:text-white transition-all"
                                            >
                                                <Edit2 size={18} />
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white rounded-[2.5rem] p-12 text-center border-2 border-dashed border-stone-200">
                                <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-6 text-stone-300">
                                    <Users size={40} />
                                </div>
                                <h3 className="text-xl font-black text-primary mb-2">עדיין לא הוספת בני משפחה</h3>
                                <p className="text-stone-500 mb-8">התחל לבנות את עץ המשפחה שלך על ידי הוספת האנשים הקרובים אליך.</p>
                                <Link 
                                    href="/family/add"
                                    className="inline-flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-primary/20 hover:translate-y-[-2px] transition-all"
                                >
                                    <Plus size={20} />
                                    הוסף את בן המשפחה הראשון
                                </Link>
                            </div>
                        )}
                    </section>
                </div>

                {/* Sidebar */}
                <div className="space-y-8">
                    {/* Messages Component */}
                    <DashboardMessages initialMessages={messages || []} userId={user.id} />

                    {/* Suggestions */}
                    <section className="bg-white rounded-[2.5rem] p-8 border border-stone-100 shadow-sm">
                        <h2 className="text-xl font-serif font-black text-primary mb-6 flex items-center gap-2">
                            <ShieldCheck className="text-amber-500" size={20} />
                            הצעות לקשרים
                        </h2>
                        
                        {suggestions.length > 0 ? (
                            <div className="space-y-4">
                                {suggestions.map((s) => (
                                    <div key={s.id} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-stone-50 transition-colors border border-transparent hover:border-stone-100">
                                        <div className="w-12 h-12 rounded-xl bg-stone-100 overflow-hidden flex-shrink-0">
                                            {s.image_url ? <img src={s.image_url} className="w-full h-full object-cover" /> : <User className="w-full h-full p-3 text-stone-300" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-primary text-sm truncate">{s.name}</p>
                                            <p className="text-[10px] text-stone-400 font-black">ייתכן שזה אתה?</p>
                                        </div>
                                        <Link href={`/family/${s.id}`} className="text-primary hover:text-secondary transition-colors">
                                            <ChevronRight size={20} />
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-6">
                                <p className="text-stone-400 text-sm font-medium">אין הצעות חדשות כרגע</p>
                            </div>
                        )}
                    </section>

                    {/* Quick Links */}
                    <section className="bg-primary rounded-[2.5rem] p-8 text-white shadow-xl shadow-primary/20 relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="text-xl font-serif font-black mb-2">חיפוש מהיר</h3>
                            <p className="text-white/80 text-sm font-medium mb-6">מצא בקלות כל אחד מבני המשפחה בארכיון.</p>
                            <Link href="/family" className="w-full bg-white text-primary py-3 rounded-xl font-black text-sm hover:bg-stone-100 transition-colors flex items-center justify-center gap-2">
                                <Users size={18} />
                                לספר המשפחה
                            </Link>
                        </div>
                        <div className="absolute -bottom-6 -right-6 text-white/10 transform -rotate-12">
                            <Users size={120} />
                        </div>
                    </section>
                </div>
            </div>
        </main>
    )
}
