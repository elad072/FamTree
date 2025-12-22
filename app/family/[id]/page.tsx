import { createClient } from '@/lib/supabase-server'
import { notFound, redirect } from 'next/navigation'
import { ArrowRight, Calendar, MapPin, Phone, Mail, Heart, User, Users, Clock, Home, ChevronLeft, Image as ImageIcon } from 'lucide-react'
import Link from 'next/link'

export default async function MemberPage({ params }: { params: { id: string } }) {
    const supabase = await createClient()
    const { id } = await params

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    // Fetch member data
    const { data: member } = await supabase
        .from('family_members')
        .select('*')
        .eq('id', id)
        .single()

    if (!member) notFound()

    // Fetch children (where parent matches this ID)
    const { data: children } = await supabase
        .from('family_members')
        .select('id, name, nickname, birth_year')
        .or(`father_id.eq.${member.id},mother_id.eq.${member.id}`)

    // Fetch primary relatives
    const relatedIds = [member.father_id, member.mother_id, member.spouse_id].filter(Boolean) as string[]
    const { data: relatives } = await supabase
        .from('family_members')
        .select('id, name, nickname')
        .in('id', relatedIds)

    const findRelative = (rid: string | null) => relatives?.find(r => r.id === rid)

    return (
        <div className="min-h-screen text-stone-800 selection:bg-amber-200/50">
            <div className="relative max-w-6xl mx-auto px-6 py-14 pb-40">
                {/* Back Button */}
                <Link
                    href="/"
                    className="inline-flex items-center gap-3 px-8 py-4 bg-white/80 rounded-[1.5rem] border border-stone-200 text-stone-500 hover:text-stone-900 hover:bg-white transition-all mb-16 shadow-sm group"
                >
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    <span className="font-black text-sm tracking-widest uppercase">חזרה לספרייה</span>
                </Link>

                <div className="grid lg:grid-cols-[1fr_1.8fr] gap-16 items-start">
                    {/* Profile Card */}
                    <aside className="sticky top-12 space-y-10">
                        <div className="glass-card rounded-[4rem] overflow-hidden p-4 ring-1 ring-stone-200">
                            <div className="relative aspect-[4/5] rounded-[3rem] overflow-hidden border border-stone-100 shadow-inner">
                                {member.image_url ? (
                                    <img src={member.image_url} alt={member.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-stone-50 flex items-center justify-center text-stone-200">
                                        <User size={140} strokeWidth={1} />
                                    </div>
                                )}

                                <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 via-transparent to-transparent flex flex-col justify-end p-10">
                                    <h2 className="text-5xl font-black tracking-tighter text-white leading-none mb-3">
                                        {member.name}
                                    </h2>
                                    {member.nickname && (
                                        <p className="text-sm font-bold text-amber-200 italic">
                                            {member.nickname}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="p-10 space-y-8">
                                <div className="grid grid-cols-2 gap-5">
                                    <div className="p-6 bg-stone-50 rounded-[2rem] border border-stone-100">
                                        <p className="text-[11px] font-black uppercase tracking-widest text-stone-400 mb-2">שנת לידה</p>
                                        <p className="text-xl font-black text-stone-800">{member.birth_year || '????'}</p>
                                    </div>
                                    <div className="p-6 bg-stone-50 rounded-[2rem] border border-stone-100">
                                        <p className="text-[11px] font-black uppercase tracking-widest text-stone-400 mb-2">סטטוס</p>
                                        <p className="text-xl font-black text-amber-700">{member.status || 'פעיל'}</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {member.phone && (
                                        <div className="flex items-center gap-5 text-stone-600 font-bold p-4 bg-white/40 rounded-2xl border border-stone-50">
                                            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-700"><Phone size={18} /></div>
                                            <span className="text-sm tracking-wider ltr">{member.phone}</span>
                                        </div>
                                    )}
                                    {member.email && (
                                        <div className="flex items-center gap-5 text-stone-600 font-bold p-4 bg-white/40 rounded-2xl border border-stone-50">
                                            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-700"><Mail size={18} /></div>
                                            <span className="text-sm ltr">{member.email}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Relationships */}
                        <div className="glass-card rounded-[3rem] p-10 space-y-10 bg-white/40 ring-1 ring-stone-200">
                            <h3 className="text-2xl font-black flex items-center gap-4 text-stone-900">
                                <Heart size={24} className="text-rose-400" />
                                מעגלים קרובים
                            </h3>
                            <div className="space-y-5">
                                {[
                                    { key: 'father_id', label: 'אבא' },
                                    { key: 'mother_id', label: 'אמא' },
                                    { key: 'spouse_id', label: 'בן/בת זוג' }
                                ].map((rel) => {
                                    const rid = member[rel.key]
                                    const record = findRelative(rid)
                                    return rid ? (
                                        <Link
                                            key={rel.key}
                                            href={`/family/${rid}`}
                                            className="group flex items-center justify-between p-5 bg-white rounded-2xl border border-stone-100 hover:border-amber-500/30 transition-all shadow-sm active:scale-95"
                                        >
                                            <div>
                                                <p className="text-[11px] font-black uppercase tracking-widest text-stone-400 mb-1">{rel.label}</p>
                                                <p className="font-black text-stone-800 group-hover:text-amber-700 transition-colors uppercase">{record?.name || 'צפייה בפרופיל'}</p>
                                            </div>
                                            <Users size={20} className="text-stone-200 group-hover:text-amber-500 transition-colors" />
                                        </Link>
                                    ) : null
                                })}
                            </div>
                        </div>
                    </aside>

                    {/* Life Story & Children */}
                    <main className="space-y-16">
                        <section className="glass-card rounded-[4rem] p-12 md:p-16 space-y-12 bg-white/60 ring-1 ring-stone-200">
                            <div className="flex items-center gap-5">
                                <div className="w-16 h-16 bg-amber-50 rounded-[1.5rem] flex items-center justify-center text-amber-700 border border-amber-200/50 shadow-inner">
                                    <Home size={32} />
                                </div>
                                <div>
                                    <h3 className="text-4xl font-black tracking-tight text-stone-900">סיפור החיים</h3>
                                    <p className="text-stone-400 text-base font-bold">פרקי היסטוריה משפחתית</p>
                                </div>
                            </div>

                            <div
                                className="prose prose-stone max-w-none text-stone-700 text-xl leading-[2] font-medium tracking-tight"
                                dangerouslySetInnerHTML={{ __html: member.life_story || '<p class="text-stone-400 italic font-bold">הסיפור טרם נכתב בארכיון...</p>' }}
                            />

                            {member.birth_place_notes && (
                                <div className="p-10 bg-amber-50/40 rounded-[2.5rem] border border-amber-200/30 flex gap-8 italic romantic-shadow">
                                    <MapPin size={28} className="text-amber-600 shrink-0 mt-2" />
                                    <p className="text-stone-600 text-xl leading-relaxed font-semibold">
                                        "{member.birth_place_notes}"
                                    </p>
                                </div>
                            )}
                        </section>

                        {/* Children Section */}
                        {children && children.length > 0 && (
                            <section className="space-y-10">
                                <div className="flex items-center gap-5">
                                    <div className="w-14 h-14 bg-stone-800 rounded-[1.5rem] flex items-center justify-center text-white shadow-xl">
                                        <Users size={28} />
                                    </div>
                                    <h3 className="text-4xl font-black tracking-tight text-stone-900">הדור הבא ({children.length})</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {children.map(child => (
                                        <Link
                                            key={child.id}
                                            href={`/family/${child.id}`}
                                            className="group flex items-center justify-between p-8 bg-white/80 rounded-[2.5rem] border border-stone-200 hover:border-amber-400 transition-all romantic-shadow"
                                        >
                                            <div className="flex items-center gap-6">
                                                <div className="w-14 h-14 bg-stone-50 rounded-2xl flex items-center justify-center text-stone-300 border border-stone-100 group-hover:bg-amber-50 transition-colors">
                                                    <User size={24} />
                                                </div>
                                                <div>
                                                    <h4 className="text-xl font-black text-stone-800 group-hover:text-amber-800 transition-colors">{child.name}</h4>
                                                    <p className="text-xs font-bold text-stone-400 mt-1 uppercase tracking-widest">{child.birth_year || '????'}</p>
                                                </div>
                                            </div>
                                            <ChevronLeft size={22} className="text-stone-300 group-hover:text-amber-600 group-hover:-translate-x-2 transition-all" />
                                        </Link>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Gallery */}
                        {member.story_images && Array.isArray(member.story_images) && member.story_images.length > 0 && (
                            <section className="space-y-10">
                                <div className="flex items-center gap-5">
                                    <div className="w-14 h-14 bg-white rounded-[1.5rem] flex items-center justify-center text-stone-400 border border-stone-200 shadow-sm">
                                        <ImageIcon size={28} />
                                    </div>
                                    <h3 className="text-4xl font-black tracking-tight text-stone-900">אלבום משפחתי</h3>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                                    {member.story_images.map((img: any, idx: number) => (
                                        <div key={idx} className="group relative aspect-square rounded-[3rem] overflow-hidden border-4 border-white shadow-lg p-1.5 bg-stone-50">
                                            <img
                                                src={typeof img === 'string' ? img : img.url}
                                                alt="Archive"
                                                className="w-full h-full object-cover rounded-[2.5rem] group-hover:scale-110 group-hover:rotate-1 transition-transform duration-1000"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Metadata */}
                        <div className="grid sm:grid-cols-2 gap-8">
                            <div className="glass-card rounded-[2.5rem] p-10 flex items-center gap-8 ring-1 ring-stone-200 bg-white/40">
                                <Clock size={28} className="text-stone-300" />
                                <div>
                                    <h4 className="text-[11px] font-black uppercase tracking-widest text-stone-400 mb-1">עדכון אחרון</h4>
                                    <p className="font-black text-stone-800 text-lg">{new Date(member.updated_date || Date.now()).toLocaleDateString('he-IL')}</p>
                                </div>
                            </div>
                            <div className="glass-card rounded-[2.5rem] p-10 flex items-center gap-8 ring-1 ring-stone-200 bg-white/40">
                                <MapPin size={28} className="text-amber-600/50" />
                                <div>
                                    <h4 className="text-[11px] font-black uppercase tracking-widest text-stone-400 mb-1">מקום לידה</h4>
                                    <p className="font-black text-stone-800 text-lg">{member.birth_place || 'לא צוין'}</p>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    )
}
