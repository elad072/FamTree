import { createClient } from '@/lib/supabase-server'
import FamilyGrid from '@/components/FamilyGrid'
import Link from 'next/link'
import { ChevronRight, Home, Plus } from 'lucide-react'

export const dynamic = 'force-dynamic'

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
            {/* Header / Breadcrumb */}
            <div className="bg-white border-b border-stone-200 py-10 mb-12">
                <div className="max-w-7xl mx-auto px-6">
                    <nav className="flex items-center gap-2 text-stone-400 text-sm font-bold mb-4">
                        <Link href="/" className="hover:text-primary flex items-center gap-1">
                            <Home size={14} />
                            בית
                        </Link>
                        <ChevronRight size={14} />
                        <span className="text-primary">ספר המשפחה</span>
                    </nav>

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-serif font-black text-primary">
                                ספר המשפחה
                            </h1>
                            <p className="text-stone-500 mt-2 font-medium">
                                מגלים את השורשים והסיפורים של הדורות הקודמים
                            </p>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="bg-secondary/10 text-secondary px-6 py-3 rounded-2xl font-black border border-secondary/20">
                                {familyMembers.length} נפשות מתועדות
                            </div>

                            {canAddMembers && (
                                <Link
                                    href="/family/add"
                                    className="bg-primary text-primary-foreground px-6 py-3 rounded-2xl font-black shadow-lg hover:translate-y-[-2px] transition-all flex items-center gap-2"
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
                <FamilyGrid members={familyMembers} canEdit={isAdmin} />
            </div>
        </main>
    )
}
