import { createClient } from '@/lib/supabase-server'
import FamilyGrid from '@/components/FamilyGrid'
import Link from 'next/link'
import { ChevronLeft, Home, Plus, Users, Search } from 'lucide-react'

export const revalidate = 3600 // Revalidate every hour

export default async function FamilyPage() {
    const supabase = await createClient()

    // Get current user and their permissions
    const { data: { user } } = await supabase.auth.getUser()

    let canAddMembers = false
    let isAdmin = false

    if (user) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('role, is_approved')
            .eq('id', user.id)
            .single()

        isAdmin = profile?.role === 'admin'
        canAddMembers = profile?.is_approved || isAdmin
    }

    // Fetch all approved family members
    const { data: members } = await supabase
        .from('family_members')
        .select('*')
        .eq('status', 'approved')
        .order('name')

    // Calculate children count
    const familyMembers = members?.map(m => ({
        ...m,
        children_count: members.filter(child => child.father_id === m.id || child.mother_id === m.id).length
    })) || []

    return (
        <main className="min-h-screen bg-stone-50 pb-32">
            {/* Page Header */}
            <div className="bg-white border-b border-stone-200 pt-12 pb-20 mb-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 -skew-x-12 translate-x-1/2" />
                
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                        <div className="space-y-4">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-stone-100 rounded-lg text-stone-500 text-xs font-black uppercase tracking-wider">
                                <Users size={14} />
                                ארכיון דיגיטלי
                            </div>
                            <h1 className="text-5xl md:text-6xl font-serif font-black text-primary">
                                ספר המשפחה
                            </h1>
                            <p className="text-xl text-stone-500 font-medium max-w-2xl">
                                מגלים את השורשים, הסיפורים והקשרים שמעצבים את המורשת שלנו לאורך הדורות.
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-4">
                            <div className="bg-white shadow-sm border border-stone-200 px-6 py-4 rounded-2xl flex items-center gap-4">
                                <div className="text-left">
                                    <p className="text-[10px] font-black text-stone-400 uppercase tracking-wider">סה"כ מתועדים</p>
                                    <p className="text-2xl font-black text-primary leading-none">{familyMembers.length}</p>
                                </div>
                                <div className="w-10 h-10 bg-secondary/10 text-secondary rounded-xl flex items-center justify-center">
                                    <Users size={20} />
                                </div>
                            </div>

                            {canAddMembers && (
                                <Link
                                    href="/family/add"
                                    className="bg-primary text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-primary/20 hover:translate-y-[-2px] transition-all flex items-center gap-3"
                                >
                                    <Plus size={20} />
                                    הוספת בן משפחה
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6">
                {/* Search & Filter Bar */}
                <div className="bg-white p-4 rounded-[2rem] border border-stone-200 shadow-sm mb-12 flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
                        <input 
                            type="text" 
                            placeholder="חיפוש לפי שם, כינוי או עיר לידה..."
                            className="w-full bg-stone-50 border-none rounded-xl py-3 pr-12 pl-4 focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                        />
                    </div>
                    <div className="flex gap-2">
                        <select className="bg-stone-50 border-none rounded-xl py-3 px-6 focus:ring-2 focus:ring-primary/20 transition-all font-bold text-stone-600">
                            <option>כל הדורות</option>
                            <option>דור המייסדים</option>
                            <option>דור שני</option>
                        </select>
                    </div>
                </div>

                <FamilyGrid members={familyMembers} canEdit={isAdmin} />
            </div>
        </main>
    )
}
