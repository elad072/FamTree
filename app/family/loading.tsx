import { FamilyCardSkeleton } from '@/components/Skeleton'

export default function FamilyLoading() {
    return (
        <main className="min-h-screen bg-stone-50 pb-32">
            <div className="bg-white border-b border-stone-200 pt-12 pb-20 mb-12">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="h-4 w-24 bg-stone-100 rounded animate-pulse mb-4" />
                    <div className="h-16 w-64 bg-stone-100 rounded animate-pulse mb-4" />
                    <div className="h-6 w-96 bg-stone-100 rounded animate-pulse" />
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {[...Array(8)].map((_, i) => (
                        <FamilyCardSkeleton key={i} />
                    ))}
                </div>
            </div>
        </main>
    )
}
