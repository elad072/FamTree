import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { User, Users, Calendar, Image as ImageIcon, Heart, Plus } from 'lucide-react'
import FamilyGrid from '@/components/FamilyGrid'

export default async function HomePage() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Fetch all family members
    const { data: members } = await supabase
        .from('family_members')
        .select('*')
        .order('name')

    // Calculate children count for each member
    const familyMembers = members?.map(m => ({
        ...m,
        children_count: members.filter(child => child.father_id === m.id || child.mother_id === m.id).length
    }))

    return (
        <main className="min-h-screen text-stone-800 selection:bg-amber-200/50">
            <div className="relative max-w-7xl mx-auto px-6 py-12 pb-32">
                {/* Header */}
                <header className="flex justify-between items-center mb-20">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-stone-800 rounded-[1.25rem] flex items-center justify-center font-black text-2xl text-amber-50 shadow-xl transform hover:-rotate-6 transition-transform cursor-pointer">
                            FT
                        </div>
                        <div>
                            <h1 className="text-3xl font-black tracking-tight text-gradient">
                                עץ המשפחה שלנו
                            </h1>
                            <p className="text-[11px] uppercase tracking-[0.2em] text-amber-700/70 font-black">תיעוד ומורשת דיגיטלית</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 bg-white/60 backdrop-blur-xl p-2 pr-6 rounded-full border border-stone-200 shadow-sm">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-400 to-stone-400 p-0.5 shadow-sm">
                            <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                                {user.user_metadata.avatar_url ? (
                                    <img src={user.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <User size={20} className="text-stone-300" />
                                )}
                            </div>
                        </div>
                        <span className="text-sm font-black text-stone-700">{user.email?.split('@')[0]}</span>
                    </div>
                </header>

                {/* Hero Section */}
                <section className="mb-24">
                    <div className="relative overflow-hidden rounded-[4rem] hero-gradient border border-stone-200/60 p-12 md:p-24 romantic-shadow">
                        <div className="relative z-10 max-w-3xl">
                            <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-white/80 border border-stone-200 rounded-full text-stone-600 text-xs font-black uppercase tracking-widest mb-10 shadow-sm">
                                <Heart size={14} className="text-rose-400 fill-rose-400" />
                                מורשת חיה ונושמת
                            </div>
                            <h2 className="text-6xl md:text-[5.5rem] font-black mb-10 leading-[0.9] tracking-tighter text-stone-900">
                                הסיפור <span className="text-amber-700/80">שלנו</span><br />
                                מתחיל <span className="text-stone-400">כאן.</span>
                            </h2>
                            <p className="text-stone-500 text-xl md:text-3xl mb-14 leading-relaxed font-medium max-w-2xl">
                                שלום {user.user_metadata.full_name || 'אורח'}. התיעוד המשפחתי שלך כולל כעת {familyMembers?.length || 0} נפשות יקרות. בואו נשמור על הזיכרון.
                            </p>
                            <div className="flex flex-wrap gap-6">
                                <button className="bg-stone-800 hover:bg-stone-700 text-white font-black py-6 px-14 rounded-[2rem] shadow-2xl shadow-stone-900/10 transition-all flex items-center gap-4 group active:scale-95">
                                    <Plus size={24} className="group-hover:rotate-90 transition-transform duration-500" />
                                    הוספת בן משפחה
                                </button>
                                <button className="bg-white hover:bg-stone-50 text-stone-800 font-extrabold py-6 px-14 rounded-[2rem] border-2 border-stone-100 shadow-sm transition-all active:scale-95">
                                    צפייה בעץ מלא
                                </button>
                            </div>
                        </div>

                        <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#d4af37 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
                    </div>
                </section>

                {/* Dynamic Grid Section */}
                <section className="space-y-16">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-white rounded-[1.5rem] flex items-center justify-center border border-stone-200 shadow-sm">
                            <Users className="text-amber-700" size={32} />
                        </div>
                        <div>
                            <h3 className="text-4xl font-black tracking-tight text-stone-900">ספריית המורשת</h3>
                            <p className="text-stone-400 text-base font-bold">גלו את הסיפורים של הקרובים לכם</p>
                        </div>
                    </div>

                    <FamilyGrid members={familyMembers || []} />
                </section>

                {/* Global Navigation Bottom */}
                <nav className="fixed bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-2 p-2.5 bg-white/90 backdrop-blur-3xl rounded-[2.5rem] border border-stone-200 shadow-[0_20px_50px_rgba(45,36,30,0.1)] z-50 ring-1 ring-black/5">
                    <button className="p-5.5 bg-stone-800 rounded-[1.75rem] text-amber-50 shadow-xl hover:scale-110 active:scale-90 transition-all">
                        <Users size={24} strokeWidth={2.5} />
                    </button>
                    <button className="p-5.5 hover:bg-stone-50 rounded-[1.75rem] transition-all text-stone-400 hover:text-amber-700">
                        <Heart size={24} />
                    </button>
                    <button className="p-5.5 hover:bg-stone-50 rounded-[1.75rem] transition-all text-stone-400 hover:text-amber-700">
                        <ImageIcon size={24} />
                    </button>
                </nav>
            </div>
        </main>
    )
}
