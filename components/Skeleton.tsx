export default function Skeleton({ className }: { className?: string }) {
    return (
        <div className={`animate-pulse bg-stone-200 rounded-xl ${className}`} />
    )
}

export function FamilyCardSkeleton() {
    return (
        <div className="bg-white rounded-[2.5rem] border border-stone-100 p-8 heritage-shadow">
            <div className="flex flex-col items-center text-center">
                <Skeleton className="w-32 h-32 rounded-[2.5rem] mb-6" />
                <Skeleton className="h-8 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-4" />
                <div className="space-y-2 w-full flex flex-col items-center mb-6">
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-4 w-1/2" />
                </div>
                <div className="w-full pt-6 border-t border-stone-50 flex justify-between">
                    <Skeleton className="h-4 w-8" />
                    <Skeleton className="h-4 w-20" />
                </div>
            </div>
        </div>
    )
}
