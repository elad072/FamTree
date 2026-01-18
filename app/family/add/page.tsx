'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import {
    ChevronRight,
    ChevronLeft,
    User,
    Calendar,
    MapPin,
    Heart,
    BookOpen,
    Camera,
    CheckCircle2,
    AlertCircle
} from 'lucide-react'
import Link from 'next/link'
import RichTextEditor from '@/components/RichTextEditor'
import SearchableSelect from '@/components/SearchableSelect'
import GalleryUpload from '@/components/GalleryUpload'
import Button from '@/components/Button'

export default function AddMemberPage() {
    const supabase = createClient()
    const router = useRouter()

    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [members, setMembers] = useState<any[]>([])

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
        story_images: [] as string[],
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

    // Fetch members for parent/spouse selection and check for existing profile
    useEffect(() => {
        async function init() {
            const { data: { user } } = await supabase.auth.getUser()
            
            const { data } = await supabase
                .from('family_members')
                .select('id, name, email')
                .eq('status', 'approved')
                .order('name')
            if (data) {
                setMembers(data)
                
                // If user is logged in, check if they already have a family member entry
                if (user?.email) {
                    const existing = data.find(m => m.email === user.email)
                    if (existing) {
                        // We could pre-fill or suggest linking here
                        console.log('Found existing family member for user:', existing.name)
                    }
                }
            }
        }
        init()
    }, [supabase])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target

        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked
            setFormData(prev => ({ ...prev, [name]: checked }))
        } else {
            setFormData(prev => ({ ...prev, [name]: value }))
        }
    }

    const handleSubmit = async () => {
        setLoading(true)
        setError(null)

        try {
            const { data: { user } } = await supabase.auth.getUser()

            const newId = Math.random().toString(36).substring(2, 15)

            const { error: submitError } = await supabase
                .from('family_members')
                .insert({
                    id: newId,
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
                    story_images: formData.story_images,
                    life_story: formData.life_story,
                    childhood_stories: formData.childhood_stories ? [formData.childhood_stories] : [],
                    father_id: formData.father_id || null,
                    mother_id: formData.mother_id || null,
                    spouse_id: formData.spouse_id || null,
                    unlinked_spouse_name: formData.unlinked_spouse_name || null,
                    marital_status: formData.marital_status,
                    phone: formData.phone,
                    email: formData.email,
                    status: 'pending',
                    created_by_id: user?.id,
                    created_by: user?.email
                })

            if (submitError) throw submitError

            // Redirect to admin page for approval
            router.push('/admin')
        } catch (err: any) {
            setError(err.message)
            setLoading(false)
        }
    }

    const nextStep = () => setStep(prev => prev + 1)
    const prevStep = () => setStep(prev => prev - 1)

    return (
        <main className="min-h-screen bg-stone-50 pb-20">
            {/* Header */}
            <div className="bg-white border-b border-stone-200 py-8 mb-12">
                <div className="max-w-3xl mx-auto px-6">
                    <h1 className="text-3xl font-serif font-black text-primary text-center">
                        הוספת בן משפחה חדש
                    </h1>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-6">
                {/* Progress Steps */}
                {step < 4 && (
                    <div className="flex justify-between mb-12 relative">
                        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-stone-200 -z-0 -translate-y-1/2"></div>
                        {[1, 2, 3].map((s) => (
                            <div
                                key={s}
                                className={`w-10 h-10 rounded-full flex items-center justify-center font-black z-10 border-4 ${step >= s ? 'bg-primary text-white border-primary-foreground/20' : 'bg-white text-stone-300 border-stone-100'
                                    } transition-all duration-500`}
                            >
                                {s}
                            </div>
                        ))}
                    </div>
                )}

                <div className="bg-white rounded-[2.5rem] p-10 heritage-shadow border border-stone-100">
                    {step === 1 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-500">
                            <h2 className="text-xl font-serif font-black text-primary mb-6 flex items-center gap-2">
                                <User size={20} className="text-secondary" />
                                פרטים אישיים
                            </h2>

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
                                        placeholder="למשל: ישראל ישראלי"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-black text-stone-500 mb-2">כינוי (אם יש)</label>
                                    <input
                                        type="text"
                                        name="nickname"
                                        value={formData.nickname}
                                        onChange={handleInputChange}
                                        className="w-full bg-stone-50 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                                        placeholder='למשל: "שרוליק"'
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
                                            placeholder="YYYY"
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

                                <div>
                                    <label className="block text-sm font-black text-stone-500 mb-2">תמונת פרופיל</label>
                                    <div className="relative">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0]
                                                if (file) {
                                                    setFormData(prev => ({ ...prev, image_url: URL.createObjectURL(file) }))
                                                }
                                            }}
                                            className="hidden"
                                            id="image-upload"
                                        />
                                        <label
                                            htmlFor="image-upload"
                                            className="w-full bg-stone-50 border-2 border-dashed border-stone-200 rounded-2xl py-8 px-6 hover:border-primary/40 transition-all cursor-pointer flex flex-col items-center gap-3 group"
                                        >
                                            <Camera size={32} className="text-stone-300 group-hover:text-primary transition-colors" />
                                            <span className="text-sm font-black text-stone-400 group-hover:text-primary transition-colors">
                                                לחצו להעלאת תמונה
                                            </span>
                                            {formData.image_url && (
                                                <div className="mt-2 w-24 h-24 rounded-xl overflow-hidden border-2 border-white shadow-lg">
                                                    <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                                                </div>
                                            )}
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <Button
                                onClick={nextStep}
                                disabled={!formData.name}
                                className="w-full py-5 rounded-2xl shadow-xl"
                            >
                                המשך לשלב הבא
                                <ChevronLeft size={20} className="mr-2" />
                            </Button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-500">
                            <h2 className="text-xl font-serif font-black text-primary mb-6 flex items-center gap-2">
                                <Calendar size={20} className="text-secondary" />
                                קשרים וסיפור
                            </h2>

                            <div className="space-y-4">
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

                                <GalleryUpload
                                    images={formData.story_images}
                                    onChange={(urls) => setFormData(prev => ({ ...prev, story_images: urls }))}
                                />
                            </div>

                            <div className="flex gap-4 pt-4">
                                <Button
                                    variant="outline"
                                    onClick={prevStep}
                                    className="flex-1 py-5 rounded-2xl"
                                >
                                    <ChevronRight size={20} className="ml-2" />
                                    חזרה
                                </Button>
                                <Button
                                    onClick={nextStep}
                                    className="flex-[2] py-5 rounded-2xl shadow-xl"
                                >
                                    המשך לשלב הבא
                                    <ChevronLeft size={20} className="mr-2" />
                                </Button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-500">
                            <h2 className="text-xl font-serif font-black text-primary mb-6 flex items-center gap-2">
                                <BookOpen size={20} className="text-secondary" />
                                פרטי קשר ואישור
                            </h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-black text-stone-500 mb-2">מספר טלפון</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        className="w-full bg-stone-50 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                                        placeholder="למשל: 050-1234567"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-black text-stone-500 mb-2">כתובת אימייל</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="w-full bg-stone-50 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-primary/20 transition-all font-bold font-sans"
                                        placeholder="email@example.com"
                                    />
                                </div>
                                <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 flex gap-3 text-amber-800 text-sm">
                                    <AlertCircle className="flex-shrink-0" size={18} />
                                    <p className="font-bold">שימו לב: בן המשפחה יתווסף במצב "ממתין לאישור" ויוצג בספר המשפחה לאחר אישור מנהל המערכת.</p>
                                </div>
                            </div>

                            {error && (
                                <div className="text-red-500 text-sm font-black text-center p-2 bg-red-50 rounded-xl border border-red-100">
                                    שגיאה: {error}
                                </div>
                            )}

                            <div className="flex gap-4 pt-4">
                                <Button
                                    variant="outline"
                                    onClick={prevStep}
                                    className="flex-1 py-5 rounded-2xl"
                                >
                                    <ChevronRight size={20} className="ml-2" />
                                    חזרה
                                </Button>
                                <Button
                                    onClick={handleSubmit}
                                    isLoading={loading}
                                    className="flex-[2] py-5 rounded-2xl shadow-xl"
                                >
                                    {loading ? 'שומר נתונים...' : 'שליחה לאישור המערכת'}
                                    {!loading && <CheckCircle2 size={20} className="mr-2" />}
                                </Button>
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="text-center space-y-8 animate-in zoom-in duration-500">
                            <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto heritage-shadow">
                                <CheckCircle2 size={48} />
                            </div>
                            <div>
                                <h2 className="text-3xl font-serif font-black text-primary mb-3">הבקשה נשלחה בהצלחה!</h2>
                                <p className="text-stone-500 font-bold text-lg">
                                    תודה על העדכון. בן המשפחה יועבר לאישור המנהל ויתווסף לספר המשפחה בקרוב.
                                </p>
                            </div>
                            <div className="flex flex-col gap-3 pt-4">
                                <Link
                                    href="/family"
                                    className="bg-primary text-primary-foreground py-5 rounded-2xl font-black shadow-xl hover:opacity-95 transition-all"
                                >
                                    חזרה לספר המשפחה
                                </Link>
                                <button
                                    onClick={() => {
                                        setFormData({
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
                                            story_images: [],
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
                                        setStep(1)
                                    }}
                                    className="text-stone-400 font-black hover:text-primary transition-colors py-2"
                                >
                                    הוספת אדם נוסף
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </main >
    )
}
