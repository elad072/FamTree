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
        birth_year: '',
        birth_place: '',
        life_story: '',
        father_id: '',
        mother_id: '',
        spouse_id: '',
        phone: '',
        email: ''
    })

    // Fetch members for parent/spouse selection
    useEffect(() => {
        async function fetchMembers() {
            const { data } = await supabase
                .from('family_members')
                .select('id, name')
                .eq('status', 'approved')
                .order('name')
            if (data) setMembers(data)
        }
        fetchMembers()
    }, [supabase])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
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
                    birth_place: formData.birth_place,
                    life_story: formData.life_story,
                    father_id: formData.father_id || null,
                    mother_id: formData.mother_id || null,
                    spouse_id: formData.spouse_id || null,
                    phone: formData.phone,
                    email: formData.email,
                    status: 'pending',
                    created_by_id: user?.id,
                    created_by: user?.email
                })

            if (submitError) throw submitError

            setStep(4) // Success step
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
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-black text-stone-500 mb-2">שנת לידה</label>
                                        <input
                                            type="number"
                                            name="birth_year"
                                            value={formData.birth_year}
                                            onChange={handleInputChange}
                                            className="w-full bg-stone-50 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                                            placeholder="1950"
                                        />
                                    </div>
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
                                </div>
                            </div>

                            <button
                                onClick={nextStep}
                                disabled={!formData.name}
                                className="w-full bg-primary text-primary-foreground py-5 rounded-2xl font-black shadow-xl hover:opacity-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                המשך לשלב הבא
                                <ChevronLeft size={20} />
                            </button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-500">
                            <h2 className="text-xl font-serif font-black text-primary mb-6 flex items-center gap-2">
                                <Calendar size={20} className="text-secondary" />
                                קשרים וסיפור
                            </h2>

                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-black text-stone-500 mb-2">אבא</label>
                                        <select
                                            name="father_id"
                                            value={formData.father_id}
                                            onChange={handleInputChange}
                                            className="w-full bg-stone-50 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                                        >
                                            <option value="">בחר/י מהרשימה</option>
                                            {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-black text-stone-500 mb-2">אמא</label>
                                        <select
                                            name="mother_id"
                                            value={formData.mother_id}
                                            onChange={handleInputChange}
                                            className="w-full bg-stone-50 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                                        >
                                            <option value="">בחר/י מהרשימה</option>
                                            {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-black text-stone-500 mb-2">סיפור חיים</label>
                                    <textarea
                                        name="life_story"
                                        value={formData.life_story}
                                        onChange={handleInputChange}
                                        rows={6}
                                        className="w-full bg-stone-50 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-primary/20 transition-all font-bold resize-none"
                                        placeholder="כתבו כאן את סיפור החיים של בן המשפחה..."
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button onClick={prevStep} className="flex-1 bg-stone-100 text-stone-600 py-5 rounded-2xl font-black hover:bg-stone-200 transition-all flex items-center justify-center gap-2">
                                    <ChevronRight size={20} />
                                    חזרה
                                </button>
                                <button onClick={nextStep} className="flex-[2] bg-primary text-primary-foreground py-5 rounded-2xl font-black shadow-xl hover:opacity-95 transition-all flex items-center justify-center gap-2">
                                    המשך לשלב הבא
                                    <ChevronLeft size={20} />
                                </button>
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
                                <button onClick={prevStep} className="flex-1 bg-stone-100 text-stone-600 py-5 rounded-2xl font-black hover:bg-stone-200 transition-all flex items-center justify-center gap-2">
                                    <ChevronRight size={20} />
                                    חזרה
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className="flex-[2] bg-primary text-primary-foreground py-5 rounded-2xl font-black shadow-xl hover:opacity-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {loading ? 'שומר נתונים...' : 'שליחה לאישור המערכת'}
                                    <CheckCircle2 size={20} />
                                </button>
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
                                            birth_year: '',
                                            birth_place: '',
                                            life_story: '',
                                            father_id: '',
                                            mother_id: '',
                                            spouse_id: '',
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
        </main>
    )
}
