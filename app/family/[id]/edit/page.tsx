'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter, useParams } from 'next/navigation'
import {
    ChevronRight,
    User,
    Calendar,
    Camera,
    Save,
    AlertCircle
} from 'lucide-react'
import Link from 'next/link'
import RichTextEditor from '@/components/RichTextEditor'
import SearchableSelect from '@/components/SearchableSelect'

export default function EditMemberPage() {
    const supabase = createClient()
    const router = useRouter()
    const params = useParams()
    const id = params.id as string

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [members, setMembers] = useState<any[]>([])
    const [isAdmin, setIsAdmin] = useState(false)

    const [formData, setFormData] = useState({
        name: '',
        nickname: '',
        birth_day: '',
        birth_month: '',
        birth_year: '',
        birth_place: '',
        birth_place_notes: '',
        death_day: '',
        death_month: '',
        death_year: '',
        is_alive: true,
        image_url: '',
        life_story: '',
        childhood_stories: '',
        father_id: '',
        mother_id: '',
        spouse_id: '',
        unlinked_spouse_name: '',
        marital_status: 'single',
        phone: '',
        email: ''
    })

    // Check admin and fetch member data
    useEffect(() => {
        async function init() {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push('/login')
                return
            }

            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single()

            if (profile?.role !== 'admin') {
                router.push('/')
                return
            }

            setIsAdmin(true)

            // Fetch member data
            const { data: member } = await supabase
                .from('family_members')
                .select('*')
                .eq('id', id)
                .single()

            if (member) {
                setFormData({
                    name: member.name || '',
                    nickname: member.nickname || '',
                    birth_day: member.birth_day?.toString() || '',
                    birth_month: member.birth_month?.toString() || '',
                    birth_year: member.birth_year?.toString() || '',
                    birth_place: member.birth_place || '',
                    birth_place_notes: member.birth_place_notes || '',
                    death_day: member.death_day?.toString() || '',
                    death_month: member.death_month?.toString() || '',
                    death_year: member.death_year?.toString() || '',
                    is_alive: !member.death_year && !member.death_date,
                    image_url: member.image_url || '',
                    life_story: member.life_story || '',
                    childhood_stories: member.childhood_stories?.[0] || '',
                    father_id: member.father_id || '',
                    mother_id: member.mother_id || '',
                    spouse_id: member.spouse_id || '',
                    unlinked_spouse_name: member.unlinked_spouse_name || '',
                    marital_status: member.marital_status || 'single',
                    phone: member.phone || '',
                    email: member.email || ''
                })
            }

            // Fetch all members for parent/spouse selection
            const { data: allMembers } = await supabase
                .from('family_members')
                .select('id, name')
                .eq('status', 'approved')
                .order('name')
            if (allMembers) setMembers(allMembers)
        }
        init()
    }, [id, supabase, router])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target

        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked
            setFormData(prev => ({ ...prev, [name]: checked }))
        } else {
            setFormData(prev => ({ ...prev, [name]: value }))
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const { error: updateError } = await supabase
                .from('family_members')
                .update({
                    name: formData.name,
                    nickname: formData.nickname,
                    birth_year: formData.birth_year ? parseInt(formData.birth_year) : null,
                    birth_month: formData.birth_month ? parseInt(formData.birth_month) : null,
                    birth_day: formData.birth_day ? parseInt(formData.birth_day) : null,
                    birth_date: formData.birth_year ? `${formData.birth_year}-${formData.birth_month?.padStart(2, '0') || '01'}-${formData.birth_day?.padStart(2, '0') || '01'}` : null,
                    birth_place: formData.birth_place,
                    birth_place_notes: formData.birth_place_notes,
                    death_year: !formData.is_alive && formData.death_year ? parseInt(formData.death_year) : null,
                    death_month: !formData.is_alive && formData.death_month ? parseInt(formData.death_month) : null,
                    death_day: !formData.is_alive && formData.death_day ? parseInt(formData.death_day) : null,
                    death_date: !formData.is_alive && formData.death_year ? `${formData.death_year}-${formData.death_month?.padStart(2, '0') || '01'}-${formData.death_day?.padStart(2, '0') || '01'}` : null,
                    image_url: formData.image_url || null,
                    life_story: formData.life_story,
                    childhood_stories: formData.childhood_stories ? [formData.childhood_stories] : [],
                    father_id: formData.father_id || null,
                    mother_id: formData.mother_id || null,
                    spouse_id: formData.spouse_id || null,
                    unlinked_spouse_name: formData.unlinked_spouse_name || null,
                    marital_status: formData.marital_status,
                    phone: formData.phone,
                    email: formData.email
                })
                .eq('id', id)

            if (updateError) throw updateError

            // If the member was pending, redirect back to admin page
            const { data: member } = await supabase
                .from('family_members')
                .select('status')
                .eq('id', id)
                .single()

            if (member?.status === 'pending') {
                router.push('/admin')
            } else {
                router.push('/family')
            }
        } catch (err: any) {
            setError(err.message)
            setLoading(false)
        }
    }

    if (!isAdmin) return null

    return (
        <main className="min-h-screen bg-stone-50 pb-20">
            <div className="bg-white border-b border-stone-200 py-8 mb-12">
                <div className="max-w-3xl mx-auto px-6">
                    <Link href="/family" className="text-stone-400 hover:text-primary text-sm font-bold mb-4 inline-flex items-center gap-1">
                        <ChevronRight size={14} />
                        חזרה לספר המשפחה
                    </Link>
                    <h1 className="text-3xl font-serif font-black text-primary text-center mt-4">
                        עריכת בן משפחה
                    </h1>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-6">
                <form onSubmit={handleSubmit} className="bg-white rounded-[2.5rem] p-10 heritage-shadow border border-stone-100 space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-black text-stone-500 mb-2">שם מלא *</label>
                            <input
                                type="text"
                                name="name"
                                required
                                value={formData.name}
                                onChange={handleInputChange}
                                className="w-full bg-stone-50 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-black text-stone-500 mb-2">כינוי</label>
                            <input
                                type="text"
                                name="nickname"
                                value={formData.nickname}
                                onChange={handleInputChange}
                                className="w-full bg-stone-50 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                            />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-black text-stone-500 mb-2">יום לידה</label>
                                <input
                                    type="number"
                                    name="birth_day"
                                    min="1" max="31"
                                    value={formData.birth_day}
                                    onChange={handleInputChange}
                                    className="w-full bg-stone-50 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                                    placeholder="DD"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-black text-stone-500 mb-2">חודש לידה</label>
                                <input
                                    type="number"
                                    name="birth_month"
                                    min="1" max="12"
                                    value={formData.birth_month}
                                    onChange={handleInputChange}
                                    className="w-full bg-stone-50 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                                    placeholder="MM"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-black text-stone-500 mb-2">שנת לידה</label>
                                <input
                                    type="number"
                                    name="birth_year"
                                    value={formData.birth_year}
                                    onChange={handleInputChange}
                                    className="w-full bg-stone-50 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-black text-stone-500 mb-2">מקום לידה</label>
                                <input
                                    type="text"
                                    name="birth_place"
                                    value={formData.birth_place}
                                    onChange={handleInputChange}
                                    className="w-full bg-stone-50 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                                    placeholder="עיר/מדינה"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-black text-stone-500 mb-2">הערות ללידה</label>
                                <input
                                    type="text"
                                    name="birth_place_notes"
                                    value={formData.birth_place_notes}
                                    onChange={handleInputChange}
                                    className="w-full bg-stone-50 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                                    placeholder="למשל: בבית החולים הישן..."
                                />
                            </div>
                        </div>

                        <div className="p-4 bg-stone-50 rounded-2xl border border-stone-100">
                            <label className="flex items-center gap-3 cursor-pointer mb-4">
                                <input
                                    type="checkbox"
                                    name="is_alive"
                                    checked={formData.is_alive}
                                    onChange={handleInputChange}
                                    className="w-5 h-5 rounded-md text-primary focus:ring-primary bg-white border-stone-300"
                                />
                                <span className="font-bold text-stone-600">בן המשפחה בחיים</span>
                            </label>

                            {!formData.is_alive && (
                                <div className="grid grid-cols-3 gap-4 animate-in fade-in slide-in-from-top-2">
                                    <div>
                                        <label className="block text-sm font-black text-stone-500 mb-2">יום פטירה</label>
                                        <input
                                            type="number"
                                            name="death_day"
                                            min="1" max="31"
                                            value={formData.death_day}
                                            onChange={handleInputChange}
                                            className="w-full bg-white border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                                            placeholder="DD"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-black text-stone-500 mb-2">חודש פטירה</label>
                                        <input
                                            type="number"
                                            name="death_month"
                                            min="1" max="12"
                                            value={formData.death_month}
                                            onChange={handleInputChange}
                                            className="w-full bg-white border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                                            placeholder="MM"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-black text-stone-500 mb-2">שנת פטירה</label>
                                        <input
                                            type="number"
                                            name="death_year"
                                            value={formData.death_year}
                                            onChange={handleInputChange}
                                            className="w-full bg-white border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                                            placeholder="YYYY"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <SearchableSelect
                                label="אבא"
                                options={members}
                                value={formData.father_id}
                                onChange={(val) => setFormData(prev => ({ ...prev, father_id: val }))}
                                placeholder="בחר/י מהרשימה"
                            />
                            <SearchableSelect
                                label="אמא"
                                options={members}
                                value={formData.mother_id}
                                onChange={(val) => setFormData(prev => ({ ...prev, mother_id: val }))}
                                placeholder="בחר/י מהרשימה"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <SearchableSelect
                                label="בן/בת זוג (מתוך המערכת)"
                                options={members}
                                value={formData.spouse_id}
                                onChange={(val) => setFormData(prev => ({ ...prev, spouse_id: val }))}
                                placeholder="ללא / לא ברשימה"
                            />
                            <div>
                                <label className="block text-sm font-black text-stone-500 mb-2">שם בן/בת זוג (אם לא ברשימה)</label>
                                <input
                                    type="text"
                                    name="unlinked_spouse_name"
                                    value={formData.unlinked_spouse_name}
                                    onChange={handleInputChange}
                                    disabled={!!formData.spouse_id}
                                    className="w-full bg-stone-50 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-primary/20 transition-all font-bold disabled:opacity-50"
                                    placeholder="ישראל ישראלי"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-black text-stone-500 mb-2">סטטוס משפחתי</label>
                            <select
                                name="marital_status"
                                value={formData.marital_status}
                                onChange={handleInputChange}
                                className="w-full bg-stone-50 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                            >
                                <option value="single">רווק/ה</option>
                                <option value="married">נשוי/אה</option>
                                <option value="divorced">גרוש/ה</option>
                                <option value="widowed">אלמן/ה</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-black text-stone-500 mb-2">זיכרונות ילדות (אופציונלי)</label>
                            <textarea
                                name="childhood_stories"
                                value={formData.childhood_stories}
                                onChange={handleInputChange}
                                rows={4}
                                className="w-full bg-stone-50 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-primary/20 transition-all font-bold resize-none"
                                placeholder="סיפור קצר מהילדות..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-black text-stone-500 mb-2">סיפור חיים</label>
                            <RichTextEditor
                                value={formData.life_story}
                                onChange={(content) => setFormData(prev => ({ ...prev, life_story: content }))}
                                placeholder="כתבו כאן את סיפור החיים של בן המשפחה..."
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-black text-stone-500 mb-2">טלפון</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    className="w-full bg-stone-50 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-black text-stone-500 mb-2">אימייל</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="w-full bg-stone-50 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                                />
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="text-red-500 text-sm font-black text-center p-2 bg-red-50 rounded-xl border border-red-100">
                            שגיאה: {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary text-primary-foreground py-5 rounded-2xl font-black shadow-xl hover:opacity-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {loading ? 'שומר שינויים...' : 'שמירת שינויים'}
                        <Save size={20} />
                    </button>
                </form>
            </div>
        </main>
    )
}
