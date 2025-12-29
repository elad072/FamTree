import { createClient } from '@/lib/supabase-server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
    ChevronRight,
    Home,
    MapPin,
    Calendar,
    User as UserIcon,
    Heart,
    BookOpen,
    Camera,
    Users as UsersIcon,
    Phone,
    Mail
} from 'lucide-react'

export default async function MemberProfilePage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const supabase = await createClient()

    // Fetch the member
    const { data: member } = await supabase
        .from('family_members')
        .select('*')
        .eq('id', id)
        .single()

    if (!member) {
        notFound()
    }

    // Fetch relatives
    // Parents
    const { data: parents } = await supabase
        .from('family_members')
        .select('id, name, image_url')
        .in('id', [member.father_id, member.mother_id].filter(Boolean))

    // Spouse
    let spouse = null
    if (member.spouse_id) {
        const { data: spouseData } = await supabase
            .from('family_members')
            .select('id, name, image_url')
            .eq('id', member.spouse_id)
            .single()
        spouse = spouseData
    }

    // Children
    const { data: children } = await supabase
        .from('family_members')
        .select('id, name, image_url')
        .or(`father_id.eq.${id},mother_id.eq.${id}`)

    const father = parents?.find(p => p.id === member.father_id)
    const mother = parents?.find(p => p.id === member.mother_id)

    return (
        <main className="min-h-screen bg-stone-50 pb-32">
            {/* Header / Breadcrumb */}
            <div className="bg-white border-b border-stone-200 py-8 mb-12">
                <div className="max-w-5xl mx-auto px-6">
                    <nav className="flex items-center gap-2 text-stone-400 text-sm font-bold">
                        <Link href="/" className="hover:text-primary flex items-center gap-1 text-stone-400">
                            <Home size={14} />
                            בית
                        </Link>
                        <ChevronRight size={14} />
                        <Link href="/family" className="hover:text-primary text-stone-400">ספר המשפחה</Link>
                        <ChevronRight size={14} />
                        <span className="text-primary">{member.name}</span>
                    </nav>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-6">
                <div className="grid md:grid-cols-3 gap-12">
                    {/* Sidebar: Profile Card & Quick Info */}
                    <div className="md:col-span-1 space-y-8">
                        <div className="bg-white rounded-[2.5rem] p-8 heritage-shadow border border-stone-100 text-center">
                            <div className="relative mb-6 mx-auto">
                                <div className="w-48 h-48 rounded-[3.5rem] overflow-hidden bg-stone-100 border-8 border-stone-50 heritage-shadow mx-auto">
                                    {member.image_url ? (
                                        <img src={member.image_url} alt={member.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-stone-300">
                                            <UserIcon size={64} />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <h1 className="text-3xl font-serif font-black text-primary mb-2">
                                {member.name}
                            </h1>
                            {member.nickname && (
                                <p className="text-stone-400 font-bold italic mb-6">"{member.nickname}"</p>
                            )}

                            <div className="space-y-4 text-right">
                                {(member.birth_year || member.birth_date) && (
                                    <div className="flex items-center gap-3 text-stone-600 bg-stone-50 p-4 rounded-2xl border border-stone-100/50 text-right" dir="rtl">
                                        <Calendar size={18} className="text-secondary" />
                                        <div className="text-right">
                                            <p className="text-[10px] font-black uppercase tracking-wider text-stone-400">תאריך לידה</p>
                                            <p className="font-bold">{member.birth_date || member.birth_year}</p>
                                        </div>
                                    </div>
                                )}

                                {member.birth_place && (
                                    <div className="flex items-center gap-3 text-stone-600 bg-stone-50 p-4 rounded-2xl border border-stone-100/50 text-right" dir="rtl">
                                        <MapPin size={18} className="text-secondary" />
                                        <div className="text-right">
                                            <p className="text-[10px] font-black uppercase tracking-wider text-stone-400">מקום לידה</p>
                                            <p className="font-bold">{member.birth_place}</p>
                                        </div>
                                    </div>
                                )}

                                {(member.death_year || member.death_date) && (
                                    <div className="flex items-center gap-3 text-stone-600 bg-stone-50 p-4 rounded-2xl border border-stone-100/50 text-right" dir="rtl">
                                        <div className="w-5 h-5 flex items-center justify-center">🕯️</div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black uppercase tracking-wider text-stone-400">פטירה</p>
                                            <p className="font-bold">{member.death_date || member.death_year}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Contact Info if available */}
                        {(member.phone || member.email) && (
                            <div className="bg-white rounded-[2.5rem] p-8 heritage-shadow border border-stone-100">
                                <h3 className="text-lg font-serif font-black text-primary mb-4 flex items-center gap-2">
                                    <Phone size={18} className="text-secondary" />
                                    יצירת קשר
                                </h3>
                                <div className="space-y-3">
                                    {member.phone && (
                                        <a href={`tel:${member.phone}`} className="flex items-center gap-3 text-stone-600 hover:text-primary transition-colors font-bold">
                                            <Phone size={16} />
                                            {member.phone}
                                        </a>
                                    )}
                                    {member.email && (
                                        <a href={`mailto:${member.email}`} className="flex items-center gap-3 text-stone-600 hover:text-primary transition-colors font-bold truncate">
                                            <Mail size={16} />
                                            {member.email}
                                        </a>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Main Content: Story & Relationships */}
                    <div className="md:col-span-2 space-y-12">
                        {/* Life Story */}
                        <div className="bg-white rounded-[2.5rem] p-10 heritage-shadow border border-stone-100">
                            <h2 className="text-2xl font-serif font-black text-primary mb-6 flex items-center gap-3">
                                <BookOpen size={24} className="text-secondary" />
                                סיפור חיים
                            </h2>
                            <div className="prose prose-stone max-w-none">
                                {member.life_story ? (
                                    <p className="text-stone-600 leading-relaxed font-medium whitespace-pre-wrap text-lg">
                                        {member.life_story}
                                    </p>
                                ) : (
                                    <p className="text-stone-400 italic font-bold">טרם הוזן סיפור חיים עבור {member.name}.</p>
                                )}
                            </div>
                        </div>

                        {/* Relationships */}
                        <div className="space-y-6">
                            <h2 className="text-2xl font-serif font-black text-primary flex items-center gap-3">
                                <UsersIcon size={24} className="text-secondary" />
                                קשרים משפחתיים
                            </h2>

                            <div className="grid sm:grid-cols-2 gap-6">
                                {/* Parents Section */}
                                <div className="bg-stone-100/50 p-6 rounded-[2rem] border border-stone-200/50">
                                    <h3 className="text-sm font-black uppercase tracking-widest text-stone-400 mb-4">הורים</h3>
                                    <div className="space-y-4">
                                        {father ? (
                                            <Link href={`/family/${father.id}`} className="flex items-center gap-3 p-2 bg-white rounded-2xl hover:bg-stone-50 transition-colors heritage-shadow shadow-sm">
                                                <div className="w-12 h-12 rounded-xl overflow-hidden bg-stone-100 flex-shrink-0">
                                                    {father.image_url ? <img src={father.image_url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-stone-300 font-bold">א</div>}
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-stone-400 uppercase">אבא</p>
                                                    <p className="font-bold text-stone-800">{father.name}</p>
                                                </div>
                                            </Link>
                                        ) : (
                                            <div className="text-stone-400 text-sm italic py-2 font-bold text-right">לא צוין אבא</div>
                                        )}
                                        {mother ? (
                                            <Link href={`/family/${mother.id}`} className="flex items-center gap-3 p-2 bg-white rounded-2xl hover:bg-stone-50 transition-colors heritage-shadow shadow-sm">
                                                <div className="w-12 h-12 rounded-xl overflow-hidden bg-stone-100 flex-shrink-0">
                                                    {mother.image_url ? <img src={mother.image_url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-stone-300 font-bold">א</div>}
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-stone-400 uppercase">אמא</p>
                                                    <p className="font-bold text-stone-800">{mother.name}</p>
                                                </div>
                                            </Link>
                                        ) : (
                                            <div className="text-stone-400 text-sm italic py-2 font-bold text-right">לא צוינה אמא</div>
                                        )}
                                    </div>
                                </div>

                                {/* Spouse Section */}
                                <div className="bg-stone-100/50 p-6 rounded-[2rem] border border-stone-200/50">
                                    <h3 className="text-sm font-black uppercase tracking-widest text-stone-400 mb-4">בן/בת זוג</h3>
                                    {spouse ? (
                                        <Link href={`/family/${spouse.id}`} className="flex items-center gap-3 p-2 bg-white rounded-2xl hover:bg-stone-50 transition-colors heritage-shadow shadow-sm">
                                            <div className="w-12 h-12 rounded-xl overflow-hidden bg-stone-100 flex-shrink-0">
                                                {spouse.image_url ? <img src={spouse.image_url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-stone-300 font-bold">ב</div>}
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-stone-400 uppercase">בן/בת זוג</p>
                                                <p className="font-bold text-stone-800">{spouse.name}</p>
                                            </div>
                                        </Link>
                                    ) : member.unlinked_spouse_name ? (
                                        <div className="bg-white p-4 rounded-2xl font-bold text-stone-600 border border-stone-100 italic">
                                            {member.unlinked_spouse_name}
                                        </div>
                                    ) : (
                                        <div className="text-stone-400 text-sm italic py-2 font-bold text-right">לא צוין בן/בת זוג</div>
                                    )}
                                </div>
                            </div>

                            {/* Children Section */}
                            {children && children.length > 0 && (
                                <div className="bg-stone-100/50 p-8 rounded-[2.5rem] border border-stone-200/50">
                                    <h3 className="text-sm font-black uppercase tracking-widest text-stone-400 mb-6">ילדים</h3>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                        {children.map(child => (
                                            <Link key={child.id} href={`/family/${child.id}`} className="flex flex-col items-center gap-3 p-4 bg-white rounded-3xl hover:bg-stone-50 transition-all heritage-shadow shadow-sm group">
                                                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-stone-100 border-2 border-white group-hover:scale-105 transition-transform">
                                                    {child.image_url ? <img src={child.image_url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-stone-300"><UserIcon size={24} /></div>}
                                                </div>
                                                <span className="font-bold text-stone-800 text-sm text-center line-clamp-1">{child.name}</span>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Media Gallery / Story Images */}
                        {member.story_images && Array.isArray(member.story_images) && member.story_images.length > 0 && (
                            <div className="bg-white rounded-[2.5rem] p-10 heritage-shadow border border-stone-100">
                                <h2 className="text-2xl font-serif font-black text-primary mb-8 flex items-center gap-3">
                                    <Camera size={24} className="text-secondary" />
                                    גלריית זכרונות
                                </h2>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                                    {member.story_images.map((img: any, idx: number) => (
                                        <div key={idx} className="aspect-square rounded-2xl overflow-hidden bg-stone-100 group cursor-pointer relative">
                                            <img
                                                src={typeof img === 'string' ? img : img.url}
                                                alt={`זכרון ${idx + 1}`}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors"></div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    )
}