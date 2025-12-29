import { createClient } from '@/lib/supabase-server'
import { Book, Users, Plus, Ghost, Play, Heart, ShieldCheck, User } from 'lucide-react'
import Link from 'next/link'

export default async function HomePage() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    // Fetch account role if logged in
    let isAdmin = false
    let isApproved = false
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

            const { data: newProfile, error } = await supabase
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
    }

    // Fetch approved members count and random snippets for "Story Carousel"
    const { data: members, count: membersCount } = await supabase
        .from('family_members')
        .select('*', { count: 'exact' })
        .eq('status', 'approved')

    // Get members with life stories for the carousel
    const membersWithStories = members?.filter(m => m.life_story && m.life_story.length > 50) || []
    const randomStories = membersWithStories.sort(() => 0.5 - Math.random()).slice(0, 3)

    return (
        <main className="min-h-screen bg-stone-50 selection:bg-primary/10">
            {/* Elegant Header */}
            <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-stone-200">
                <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-serif text-xl font-bold">
                            ש
                        </div>
                        <span className="text-2xl font-serif font-black tracking-tight text-primary">שורשים</span>
                    </div>

                    <div className="flex items-center gap-6">
                        {user ? (
                            <div className="flex items-center gap-6">
                                {isAdmin && (
                                    <Link
                                        href="/admin"
                                        className="text-stone-600 hover:text-primary font-bold transition-colors flex items-center gap-1.5"
                                    >
                                        <ShieldCheck size={18} />
                                        ניהול
                                    </Link>
                                )}
                                <Link
                                    href="/family"
                                    className="text-stone-600 hover:text-primary font-bold transition-colors"
                                >
                                    ספר המשפחה
                                </Link>
                            </div>
                        ) : (
                            <Link
                                href="/login"
                                className="bg-primary text-primary-foreground px-6 py-2.5 rounded-full font-bold hover:opacity-90 transition-opacity"
                            >
                                התחברות
                            </Link>
                        )}
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-20 pb-32 overflow-hidden">
                <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
                    <div className="space-y-8 relative z-10">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary/10 text-secondary rounded-full text-sm font-bold border border-secondary/20">
                            <Heart size={16} className="fill-current" />
                            שימור המורשת המשפחתית
                        </div>

                        <h1 className="text-5xl md:text-7xl font-serif font-black leading-[1.1] text-primary">
                            הסיפור שלנו <br />
                            <span className="text-stone-400">מתחיל כאן.</span>
                        </h1>

                        <p className="text-xl md:text-2xl text-stone-600 leading-relaxed font-medium max-w-xl">
                            ברוכים הבאים ל"שורשים" - הבית הדיגיטלי של המשפחה שלנו. כאן אנחנו נוצרים את הסיפורים, התמונות והמסורות שהופכות אותנו למי שאנחנו.
                        </p>

                        <div className="flex flex-wrap gap-4 pt-4">
                            {user ? (
                                <>
                                    <Link
                                        href="/family"
                                        className="bg-primary text-primary-foreground px-10 py-5 rounded-2xl font-black shadow-xl hover:translate-y-[-2px] transition-all flex items-center gap-2"
                                    >
                                        <Users size={20} />
                                        לצפייה בעץ המשפחה
                                    </Link>
                                    <Link
                                        href="/family/add"
                                        className="bg-white text-stone-800 border-2 border-stone-100 px-10 py-5 rounded-2xl font-black shadow-sm hover:bg-stone-50 transition-all flex items-center gap-2"
                                    >
                                        <Plus size={20} />
                                        הוספת בן משפחה
                                    </Link>
                                </>
                            ) : (
                                <Link
                                    href="/login"
                                    className="bg-primary text-primary-foreground px-10 py-5 rounded-2xl font-black shadow-xl hover:translate-y-[-2px] transition-all"
                                >
                                    התחילו את המסע
                                </Link>
                            )}
                        </div>

                        {membersCount && membersCount > 0 && (
                            <div className="pt-8 flex items-center gap-4 text-stone-400 font-bold">
                                <div className="flex -space-x-2 space-x-reverse">
                                    {members?.slice(0, 3).map((m, i) => (
                                        <div key={m.id} className="w-10 h-10 rounded-full border-2 border-white bg-stone-200 overflow-hidden">
                                            {m.image_url ? <img src={m.image_url} className="w-full h-full object-cover" /> : null}
                                        </div>
                                    ))}
                                </div>
                                <span className="text-sm">{membersCount} בני משפחה כבר מתועדים</span>
                            </div>
                        )}
                    </div>

                    <div className="relative order-first md:order-last">
                        {randomStories.length > 0 ? (
                            <div className="aspect-[4/5] bg-white rounded-[3rem] p-10 heritage-shadow border border-stone-100 transform rotate-2 relative z-10 transition-transform hover:rotate-0 duration-700 flex flex-col justify-between">
                                <div className="space-y-6">
                                    <div className="w-16 h-16 bg-secondary/10 text-secondary rounded-2xl flex items-center justify-center">
                                        <Book size={32} />
                                    </div>
                                    <p className="font-serif text-2xl md:text-3xl text-primary font-black leading-relaxed line-clamp-6 italic">
                                        "{randomStories[0].life_story}"
                                    </p>
                                </div>
                                <Link href={`/family/${randomStories[0].id}`} className="flex items-center gap-4 mt-8 group">
                                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-stone-100 border-2 border-white shadow-sm">
                                        {randomStories[0].image_url ? <img src={randomStories[0].image_url} className="w-full h-full object-cover" /> : <User size={24} className="m-auto mt-2 text-stone-300" />}
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-primary group-hover:text-secondary transition-colors underline-offset-4 group-hover:underline">
                                            {randomStories[0].name}
                                        </p>
                                        <p className="text-xs text-stone-400 font-bold">לקריאת הסיפור המלא</p>
                                    </div>
                                </Link>
                            </div>
                        ) : (
                            <div className="aspect-[4/5] bg-stone-200 rounded-[3rem] overflow-hidden heritage-shadow border-8 border-white transform rotate-3 relative z-10 transition-transform hover:rotate-0 duration-700">
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                <div className="absolute bottom-10 inset-x-10 text-white">
                                    <p className="font-serif text-2xl mb-2 italic">"הזיכרון הוא הגשר בין העבר לעתיד"</p>
                                    <span className="text-sm font-bold opacity-80">- פתגם עתיק</span>
                                </div>
                            </div>
                        )}
                        {/* Decorative elements */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-secondary/5 rounded-full -z-0 opacity-50 blur-3xl"></div>
                    </div>
                </div>
            </section>

            {/* Feature Highlights */}
            <section className="bg-white py-32 border-y border-stone-100">
                <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-12 text-center">
                    <div className="space-y-6">
                        <div className="w-16 h-16 bg-stone-50 rounded-2xl flex items-center justify-center text-primary mx-auto border border-stone-100">
                            <Book size={32} />
                        </div>
                        <h3 className="text-2xl font-serif font-bold">סיפורי חיים</h3>
                        <p className="text-stone-500 font-medium leading-relaxed">תיעוד מעמיק של קורות החיים, מהילדות ועד הבגרות, כולל סיפורים אישיים וחוויות.</p>
                    </div>
                    <div className="space-y-6">
                        <div className="w-16 h-16 bg-stone-50 rounded-2xl flex items-center justify-center text-primary mx-auto border border-stone-100">
                            <Users size={32} />
                        </div>
                        <h3 className="text-2xl font-serif font-bold">קשרים משפחתיים</h3>
                        <p className="text-stone-500 font-medium leading-relaxed">מיפוי ויזואלי ודינמי של עץ המשפחה, המאפשר לראות את הקשרים בין הדורות.</p>
                    </div>
                    <div className="space-y-6">
                        <div className="w-16 h-16 bg-stone-50 rounded-2xl flex items-center justify-center text-primary mx-auto border border-stone-100">
                            <Ghost size={32} />
                        </div>
                        <h3 className="text-2xl font-serif font-bold">ארכיון תמונות</h3>
                        <p className="text-stone-500 font-medium leading-relaxed">שימור תמונות ישנות וחדשות בגלריה דיגיטלית המאורגנת לפי בני המשפחה.</p>
                    </div>
                </div>
            </section>
        </main>
    )
}
