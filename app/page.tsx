import { createClient } from '@/lib/supabase-server'
import { Book, Users, Plus, Ghost, Heart, ShieldCheck, User, LogOut, ArrowLeft, Sparkles, History, Camera } from 'lucide-react'
import Link from 'next/link'

export default async function HomePage() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    // Fetch account role if logged in
    let isAdmin = false
    let isApproved = false
    let profileName = ''
    if (user) {
        let { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()

        // SELF-HEALING: If no profile exists, create it now
        if (!profile) {
            const { count: totalProfiles } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true })

            const isFirst = totalProfiles === 0

            const { data: newProfile } = await supabase
                .from('profiles')
                .insert({
                    id: user.id,
                    full_name: user.user_metadata?.full_name || user.user_metadata?.name || 'משתמש חדש',
                    email: user.email,
                    role: isFirst ? 'admin' : 'member',
                    is_approved: isFirst ? true : false
                })
                .select()
                .single()

            if (newProfile) profile = newProfile
        }

        isAdmin = profile?.role === 'admin'
        isApproved = profile?.is_approved || isAdmin
        profileName = profile?.full_name || ''
    }

    // Fetch approved members count and random snippets for "Story Carousel"
    const { data: members, count: membersCount } = await supabase
        .from('family_members')
        .select('*', { count: 'exact' })
        .eq('status', 'approved')

    // Get members with life stories for the carousel
    const stripHtml = (html: string) => {
        return html.replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, ' ');
    };

    const membersWithStories = members?.filter(m => m.life_story && m.life_story.length > 50) || []
    const randomStories = membersWithStories.sort(() => 0.5 - Math.random()).slice(0, 3).map(m => ({
        ...m,
        life_story: stripHtml(m.life_story)
    }))

    return (
        <main className="min-h-screen bg-[#fdfcfb] selection:bg-primary/10 overflow-x-hidden">
            {/* Elegant Header */}
            <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-stone-200/60">
                <div className="max-w-7xl mx-auto px-6 h-24 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/20 transform -rotate-3">
                            <History size={24} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-2xl font-serif font-black tracking-tight text-primary leading-none">שורשים</span>
                            <span className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] mt-1">Family Archive</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-8">
                        {user ? (
                            <div className="flex items-center gap-8">
                                <div className="hidden md:flex items-center gap-6">
                                    {isAdmin && (
                                        <Link
                                            href="/admin"
                                            className="text-stone-500 hover:text-primary font-black text-sm transition-colors flex items-center gap-2"
                                        >
                                            <ShieldCheck size={18} />
                                            ניהול
                                        </Link>
                                    )}
                                    <Link
                                        href="/family"
                                        className="text-stone-500 hover:text-primary font-black text-sm transition-colors"
                                    >
                                        ספר המשפחה
                                    </Link>
                                </div>
                                <div className="h-8 w-px bg-stone-200 hidden md:block" />
                                <div className="flex items-center gap-4">
                                    <div className="text-left hidden sm:block">
                                        <p className="text-[10px] font-black text-stone-400 uppercase tracking-wider">שלום,</p>
                                        <p className="text-sm font-bold text-primary">{profileName}</p>
                                    </div>
                                    <form action="/api/auth/signout" method="POST">
                                        <button className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center text-stone-500 hover:bg-rose-50 hover:text-rose-600 transition-all border border-transparent hover:border-rose-100">
                                            <LogOut size={18} />
                                        </button>
                                    </form>
                                </div>
                            </div>
                        ) : (
                            <Link
                                href="/login"
                                className="bg-primary text-white px-8 py-3 rounded-2xl font-black hover:shadow-xl hover:shadow-primary/20 transition-all transform hover:-translate-y-0.5"
                            >
                                התחברות למערכת
                            </Link>
                        )}
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-20 pb-40">
                {/* Decorative Background Elements */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 overflow-hidden">
                    <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-primary/5 rounded-full blur-[120px]" />
                    <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-secondary/5 rounded-full blur-[100px]" />
                </div>

                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid lg:grid-cols-12 gap-20 items-center">
                        <div className="lg:col-span-7 space-y-10">
                            <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-white shadow-sm border border-stone-100 text-secondary rounded-2xl text-sm font-black">
                                <Sparkles size={18} className="text-amber-400" />
                                שימור המורשת והסיפור המשפחתי
                            </div>

                            <h1 className="text-6xl md:text-8xl font-serif font-black leading-[1.05] text-primary tracking-tight">
                                כל דור הוא <br />
                                <span className="text-stone-300 italic">סיפור חדש.</span>
                            </h1>

                            <p className="text-xl md:text-2xl text-stone-500 leading-relaxed font-medium max-w-2xl">
                                ברוכים הבאים ל"שורשים" - המקום בו העבר פוגש את העתיד. אנחנו מזמינים אתכם לתעד, לשתף ולשמר את הזיכרונות היקרים ביותר של המשפחה שלנו לדורות הבאים.
                            </p>

                            <div className="flex flex-wrap gap-6 pt-4">
                                {user ? (
                                    <>
                                        <Link
                                            href="/family"
                                            className="bg-primary text-white px-12 py-6 rounded-[2rem] font-black shadow-2xl shadow-primary/30 hover:translate-y-[-4px] hover:shadow-primary/40 transition-all flex items-center gap-3 text-lg"
                                        >
                                            <Users size={24} />
                                            לספר המשפחה
                                        </Link>
                                        <Link
                                            href="/family/add"
                                            className="bg-white text-primary border-2 border-stone-100 px-12 py-6 rounded-[2rem] font-black shadow-xl shadow-stone-200/50 hover:bg-stone-50 hover:translate-y-[-4px] transition-all flex items-center gap-3 text-lg"
                                        >
                                            <Plus size={24} />
                                            הוספת בן משפחה
                                        </Link>
                                    </>
                                ) : (
                                    <Link
                                        href="/login"
                                        className="bg-primary text-white px-14 py-7 rounded-[2.5rem] font-black shadow-2xl shadow-primary/30 hover:translate-y-[-4px] hover:shadow-primary/40 transition-all text-xl flex items-center gap-4"
                                    >
                                        התחילו את המסע שלכם
                                        <ArrowLeft size={24} />
                                    </Link>
                                )}
                            </div>

                            {membersCount && membersCount > 0 && (
                                <div className="pt-12 flex items-center gap-6">
                                    <div className="flex -space-x-4 space-x-reverse">
                                        {members?.slice(0, 4).map((m) => (
                                            <div key={m.id} className="w-14 h-14 rounded-2xl border-4 border-white bg-stone-100 overflow-hidden shadow-lg transform hover:scale-110 transition-transform cursor-pointer">
                                                {m.image_url ? <img src={m.image_url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-stone-300"><User size={20} /></div>}
                                            </div>
                                        ))}
                                        <div className="w-14 h-14 rounded-2xl border-4 border-white bg-secondary flex items-center justify-center text-white font-black text-sm shadow-lg">
                                            +{membersCount}
                                        </div>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-primary font-black text-lg leading-none">{membersCount} בני משפחה</span>
                                        <span className="text-stone-400 font-bold text-sm mt-1">כבר הצטרפו למסע התיעוד</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="lg:col-span-5 relative">
                            {randomStories.length > 0 ? (
                                <div className="relative group">
                                    <div className="absolute inset-0 bg-primary/10 rounded-[4rem] blur-3xl group-hover:bg-primary/20 transition-colors" />
                                    <div className="relative aspect-[4/5] bg-white rounded-[3.5rem] p-12 shadow-2xl shadow-stone-200 border border-stone-100 transform rotate-2 group-hover:rotate-0 transition-all duration-700 flex flex-col justify-between overflow-hidden">
                                        {/* Decorative Quote Mark */}
                                        <div className="absolute top-[-20px] right-[-10px] text-[200px] font-serif text-stone-50 leading-none -z-0 select-none">"</div>
                                        
                                        <div className="space-y-8 relative z-10">
                                            <div className="w-20 h-20 bg-secondary/10 text-secondary rounded-[2rem] flex items-center justify-center shadow-inner">
                                                <Book size={40} />
                                            </div>
                                            <p className="font-serif text-2xl md:text-3xl text-primary font-black leading-relaxed line-clamp-6 italic">
                                                "{randomStories[0].life_story}"
                                            </p>
                                        </div>
                                        
                                        <Link href={`/family/${randomStories[0].id}`} className="flex items-center gap-5 mt-10 group/btn relative z-10 p-4 bg-stone-50 rounded-3xl border border-stone-100 hover:bg-white hover:shadow-xl transition-all">
                                            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white border-2 border-white shadow-md flex-shrink-0">
                                                {randomStories[0].image_url ? <img src={randomStories[0].image_url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-stone-200"><User size={32} /></div>}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-lg font-black text-primary group-hover/btn:text-secondary transition-colors">
                                                    {randomStories[0].name}
                                                </p>
                                                <p className="text-xs text-stone-400 font-bold uppercase tracking-wider">לקריאת הסיפור המלא</p>
                                            </div>
                                            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-primary shadow-sm group-hover/btn:translate-x-[-4px] transition-transform">
                                                <ArrowLeft size={20} />
                                            </div>
                                        </Link>
                                    </div>
                                </div>
                            ) : (
                                <div className="aspect-[4/5] bg-stone-100 rounded-[4rem] overflow-hidden shadow-2xl border-[12px] border-white transform rotate-3 relative group hover:rotate-0 transition-all duration-700">
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                                    <div className="absolute bottom-16 inset-x-12 text-white space-y-4">
                                        <div className="w-12 h-1 bg-secondary rounded-full" />
                                        <p className="font-serif text-3xl font-black italic leading-tight">"הזיכרון הוא הגשר בין העבר לעתיד"</p>
                                        <p className="text-sm font-black opacity-60 uppercase tracking-[0.2em]">Heritage & Legacy</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Feature Highlights */}
            <section className="bg-white py-40 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="text-center max-w-3xl mx-auto mb-24 space-y-6">
                        <h2 className="text-4xl md:text-5xl font-serif font-black text-primary">מה תמצאו ב"שורשים"?</h2>
                        <p className="text-lg text-stone-500 font-medium">הפלטפורמה שלנו נבנתה במיוחד כדי להקל על תהליך התיעוד והשימור של ההיסטוריה המשפחתית שלכם.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-10">
                        {[
                            {
                                icon: <Book size={32} />,
                                title: "סיפורי חיים",
                                desc: "תיעוד מעמיק של קורות החיים, מהילדות ועד הבגרות, כולל סיפורים אישיים, חוויות וזיכרונות מרגשים.",
                                color: "bg-blue-50 text-blue-600"
                            },
                            {
                                icon: <Users size={32} />,
                                title: "קשרים משפחתיים",
                                desc: "מיפוי ויזואלי ודינמי של עץ המשפחה, המאפשר לראות את הקשרים בין הדורות ולגלות קרובים חדשים.",
                                color: "bg-amber-50 text-amber-600"
                            },
                            {
                                icon: <Camera size={32} />,
                                title: "ארכיון תמונות",
                                desc: "שימור תמונות ישנות וחדשות בגלריה דיגיטלית איכותית המאורגנת לפי בני המשפחה ותקופות זמן.",
                                color: "bg-rose-50 text-rose-600"
                            }
                        ].map((feature, i) => (
                            <div key={i} className="group p-10 bg-stone-50 rounded-[3rem] border border-stone-100 hover:bg-white hover:shadow-2xl hover:shadow-stone-200/50 transition-all duration-500">
                                <div className={`w-20 h-20 ${feature.color} rounded-[2rem] flex items-center justify-center mb-8 shadow-inner group-hover:scale-110 transition-transform duration-500`}>
                                    {feature.icon}
                                </div>
                                <h3 className="text-2xl font-serif font-black text-primary mb-4">{feature.title}</h3>
                                <p className="text-stone-500 font-medium leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-stone-900 text-white py-20">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-10">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white">
                            <History size={20} />
                        </div>
                        <span className="text-xl font-serif font-black tracking-tight">שורשים</span>
                    </div>
                    <p className="text-stone-500 font-bold text-sm">© 2025 שורשים - ארכיון משפחתי דיגיטלי. כל הזכויות שמורות.</p>
                    <div className="flex gap-8 text-stone-400 font-black text-xs uppercase tracking-widest">
                        <Link href="/family" className="hover:text-white transition-colors">ספר המשפחה</Link>
                        <Link href="/login" className="hover:text-white transition-colors">התחברות</Link>
                    </div>
                </div>
            </footer>
        </main>
    )
}
