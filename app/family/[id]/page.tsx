import { createClient } from '@/lib/supabase-server'
import { notFound, redirect } from 'next/navigation'
import { ArrowRight, MapPin, Phone, Mail, Heart, User, Users, Clock, Home, ChevronLeft, Image as ImageIcon } from 'lucide-react'
import Link from 'next/link'

export default async function MemberPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: member } = await supabase
        .from('family_members')
        .select('*')
        .eq('id', id)
        .single()

    if (!member) notFound()

    const { data: children } = await supabase
        .from('family_members')
        .select('id, name, nickname, birth_year')
        .or(`father_id.eq.${member.id},mother_id.eq.${member.id}`)

    const relatedIds = [member.father_id, member.mother_id, member.spouse_id].filter(Boolean) as string[]
    const { data: relatives } = await supabase
        .from('family_members')
        .select('id, name, nickname')
        .in('id', relatedIds)

    const findRelative = (rid: string | null) => relatives?.find(r => r.id === rid)

    return (
        <div className="min-h-screen bg-[#FDFCFB] text-stone-800 pb-20" dir="rtl">

            {/* --- HEADER --- */}
            <div className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-stone-200">
                <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 text-stone-500 hover:text-stone-900 transition-colors font-bold text-sm">
                        <ArrowRight className="w-5 h-5" />
                        <span>חזרה לספרייה</span>
                    </Link>
                    <div className="text-stone-400 font-serif italic text-sm">Family Archive</div>
                </div>
            </div>

            <main className="max-w-6xl mx-auto px-4 pt-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* --- COLUMN 1: PROFILE INFO --- */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-white rounded-[2.5rem] shadow-sm border border-stone-100 overflow-hidden">
                            <div className="relative aspect-[4/5] bg-stone-100">
                                {member.image_url ? (
                                    <img src={member.image_url} alt={member.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-stone-200">
                                        <User className="w-32 h-32" strokeWidth={1} />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                                <div className="absolute bottom-8 right-8 text-white">
                                    <h1 className="text-4xl font-black tracking-tight">{member.name}</h1>
                                    {member.nickname && <p className="text-amber-200 font-bold italic mt-1 opacity-90">"{member.nickname}"</p>}
                                </div>
                            </div>

                            <div className="p-8 space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-stone-50 rounded-2xl text-center">
                                        <div className="text-[10px] font-black text-stone-400 uppercase mb-1">שנת לידה</div>
                                        <div className="text-xl font-black text-stone-800">{member.birth_year || '????'}</div>
                                    </div>
                                    <div className="p-4 bg-stone-50 rounded-2xl text-center">
                                        <div className="text-[10px] font-black text-stone-400 uppercase mb-1">סטטוס</div>
                                        <div className="text-xl font-black text-amber-700">{member.status || 'פעיל'}</div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {member.phone && (
                                        <div className="flex items-center gap-4 p-4 bg-stone-50 rounded-xl">
                                            <Phone className="w-5 h-5 text-amber-600" />
                                            <span className="font-bold text-sm ltr">{member.phone}</span>
                                        </div>
                                    )}
                                    {member.email && (
                                        <div className="flex items-center gap-4 p-4 bg-stone-50 rounded-xl">
                                            <Mail className="w-5 h-5 text-amber-600" />
                                            <span className="font-bold text-sm truncate ltr">{member.email}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Relatives Card */}
                        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-stone-100">
                            <h3 className="text-lg font-black mb-6 flex items-center gap-3">
                                <Heart className="w-5 h-5 text-rose-400" />
                                מעגלים קרובים
                            </h3>
                            <div className="space-y-3">
                                {[
                                    { key: 'father_id', label: 'אבא' },
                                    { key: 'mother_id', label: 'אמא' },
                                    { key: 'spouse_id', label: 'בן/בת זוג' }
                                ].map((rel) => {
                                    const rid = member[rel.key]
                                    const record = findRelative(rid)
                                    return rid ? (
                                        <Link key={rel.key} href={`/family/${rid}`} className="flex items-center justify-between p-4 bg-stone-50 rounded-xl hover:bg-amber-50 transition-colors border border-transparent hover:border-amber-200">
                                            <div className="overflow-hidden">
                                                <p className="text-[10px] font-bold text-stone-400 uppercase">{rel.label}</p>
                                                <p className="font-black text-stone-800 truncate">{record?.name || 'צפייה בפרופיל'}</p>
                                            </div>
                                            <ChevronLeft className="w-5 h-5 text-stone-300" />
                                        </Link>
                                    ) : null
                                })}
                            </div>
                        </div>
                    </div>

                    {/* --- COLUMN 2: STORY, GALLERY & CHILDREN --- */}
                    <div className="lg:col-span-8 space-y-8">

                        {/* Life Story */}
                        <section className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-stone-100">
                            <div className="flex items-center gap-4 mb-10">
                                <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-700">
                                    <Home className="w-7 h-7" />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-black text-stone-900">סיפור החיים</h2>
                                    <p className="text-stone-400 font-bold text-xs uppercase tracking-wider">תיעוד היסטורי משפחתי</p>
                                </div>
                            </div>

                            <div className="prose prose-stone max-w-none">
                                <div
                                    className="text-stone-700 text-lg md:text-xl leading-relaxed font-medium whitespace-pre-wrap"
                                    dangerouslySetInnerHTML={{ __html: member.life_story || '<p class="italic text-stone-300">הסיפור טרם תועד בארכיון...</p>' }}
                                />
                            </div>

                            {member.birth_place_notes && (
                                <div className="mt-12 p-8 bg-amber-50/50 rounded-3xl border-r-4 border-amber-400 italic">
                                    <p className="text-stone-600 text-lg font-semibold leading-relaxed">"{member.birth_place_notes}"</p>
                                </div>
                            )}
                        </section>

                        {/* --- GALLERY SECTION (אלבום משפחתי) --- */}
                        {member.story_images && Array.isArray(member.story_images) && member.story_images.length > 0 && (
                            <section className="space-y-6">
                                <div className="flex items-center gap-4 px-4">
                                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-stone-400 border border-stone-200 shadow-sm">
                                        <ImageIcon className="w-5 h-5" />
                                    </div>
                                    <h2 className="text-2xl font-black">אלבום משפחתי</h2>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                                    {member.story_images.map((img: any, idx: number) => (
                                        <div key={idx} className="group relative aspect-square rounded-[2rem] overflow-hidden border-4 border-white shadow-md bg-stone-50">
                                            <img
                                                src={typeof img === 'string' ? img : img.url}
                                                alt="Family Archive"
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Next Generation */}
                        {children && children.length > 0 && (
                            <section className="space-y-6">
                                <div className="flex items-center gap-4 px-4">
                                    <div className="w-10 h-10 bg-stone-800 rounded-xl flex items-center justify-center text-white">
                                        <Users className="w-5 h-5" />
                                    </div>
                                    <h2 className="text-2xl font-black">הדור הבא ({children.length})</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {children.map(child => (
                                        <Link key={child.id} href={`/family/${child.id}`} className="flex items-center justify-between p-6 bg-white rounded-3xl shadow-sm border border-stone-100 hover:border-amber-400 transition-all group">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-stone-50 rounded-xl flex items-center justify-center text-stone-300 group-hover:bg-amber-50 group-hover:text-amber-600 transition-colors">
                                                    <User className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <h4 className="font-black text-stone-800">{child.name}</h4>
                                                    <p className="text-xs font-bold text-stone-400 uppercase">{child.birth_year || '????'}</p>
                                                </div>
                                            </div>
                                            <ChevronLeft className="w-5 h-5 text-stone-300 group-hover:text-amber-600 transition-colors" />
                                        </Link>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Technical Metadata */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-stone-100/50 p-6 rounded-2xl flex items-center gap-4">
                                <Clock className="w-5 h-5 text-stone-300" />
                                <div>
                                    <p className="text-[10px] font-black text-stone-400 uppercase">עדכון אחרון</p>
                                    <p className="text-sm font-bold text-stone-700">{new Date(member.updated_date || Date.now()).toLocaleDateString('he-IL')}</p>
                                </div>
                            </div>
                            <div className="bg-stone-100/50 p-6 rounded-2xl flex items-center gap-4">
                                <MapPin className="w-5 h-5 text-stone-300" />
                                <div>
                                    <p className="text-[10px] font-black text-stone-400 uppercase">מקום לידה</p>
                                    <p className="text-sm font-bold text-stone-700">{member.birth_place || 'לא צוין'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}