'use client'

import { useState, useMemo } from 'react'
import { Search, MapPin, ChevronLeft, User, Heart, Users } from 'lucide-react'
import Link from 'next/link'

interface FamilyMember {
    id: string
    name: string
    nickname: string | null
    image_url: string | null
    birth_year: number | null
    birth_place: string | null
    life_story: string | null
    children_count?: number
}

export default function FamilyGrid({ members }: { members: FamilyMember[] }) {
    const [searchQuery, setSearchQuery] = useState('')
    const [activeFilter, setActiveFilter] = useState<'all' | 'has_story' | 'has_photo'>('all')

    const filteredMembers = useMemo(() => {
        return members.filter(member => {
            const matchesSearch =
                member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (member.nickname?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
                (member.birth_place?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)

            const matchesFilter =
                activeFilter === 'all' ||
                (activeFilter === 'has_story' && member.life_story) ||
                (activeFilter === 'has_photo' && member.image_url)

            return matchesSearch && matchesFilter
        })
    }, [members, searchQuery, activeFilter])

    return (
        <div className="space-y-8 md:space-y-12 px-2 md:px-0" dir="rtl">
            {/* Search & Filter Bar */}
            <div className="flex flex-col gap-4 md:gap-6">
                <div className="relative group w-full">
                    <Search size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-amber-600 transition-colors" />
                    <input
                        type="text"
                        placeholder="חיפוש לפי שם או מקום..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white/70 backdrop-blur-md border border-stone-200 rounded-2xl md:rounded-3xl py-4 md:py-5 pr-12 pl-4 focus:outline-none focus:ring-4 focus:ring-amber-500/5 focus:border-amber-500/30 transition-all text-base md:text-lg text-stone-800 placeholder:text-stone-400 shadow-sm"
                    />
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar scroll-smooth">
                    {(['all', 'has_photo', 'has_story'] as const).map((filter) => (
                        <button
                            key={filter}
                            onClick={() => setActiveFilter(filter)}
                            className={`px-4 md:px-6 py-2 md:py-2.5 rounded-xl md:rounded-2xl text-xs md:text-sm font-bold transition-all whitespace-nowrap border ${activeFilter === filter
                                ? 'bg-stone-800 text-white border-stone-800 shadow-md'
                                : 'bg-white/50 text-stone-500 border-stone-200 hover:text-stone-800 hover:bg-white'
                                }`}
                        >
                            {filter === 'all' && 'כולם'}
                            {filter === 'has_photo' && 'עם תמונה'}
                            {filter === 'has_story' && 'עם סיפור'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid - 1 column on mobile, 2 on small tablets, 3+ on desktop */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
                {filteredMembers.length > 0 ? (
                    filteredMembers.map((member) => (
                        <Link
                            href={`/family/${member.id}`}
                            key={member.id}
                            className="group relative flex flex-col bg-white/60 rounded-[2rem] md:rounded-[3rem] border border-stone-100 p-6 md:p-8 hover:border-amber-500/40 hover:bg-white/90 transition-all duration-500 shadow-sm hover:shadow-xl active:scale-98"
                        >
                            {/* שנת לידה - צף מעל התמונה */}
                            <div className="absolute top-4 left-4 z-10 bg-amber-50/90 backdrop-blur-sm text-amber-800 text-[10px] md:text-[11px] font-black px-2.5 py-1 rounded-full border border-amber-200/50">
                                {member.birth_year || '????'}
                            </div>

                            <div className="flex flex-col items-center">
                                {/* תמונת פרופיל */}
                                <div className="mb-4 md:mb-6">
                                    <div className="w-20 h-20 md:w-28 md:h-28 rounded-2xl md:rounded-[2.5rem] bg-stone-50 p-1 ring-1 ring-stone-200 group-hover:scale-105 transition-transform duration-500">
                                        <div className="w-full h-full rounded-[1.2rem] md:rounded-[2rem] overflow-hidden bg-stone-100 flex items-center justify-center">
                                            {member.image_url ? (
                                                <img src={member.image_url} alt={member.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <User size={30} className="text-stone-300" />
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* תוכן טקסטואלי */}
                                <div className="text-center w-full">
                                    <h4 className="text-xl md:text-2xl font-black mb-1 text-stone-800 group-hover:text-amber-700 transition-colors line-clamp-1">
                                        {member.name}
                                    </h4>

                                    <div className="h-4 md:h-5 mb-4">
                                        {member.nickname && (
                                            <p className="text-[11px] md:text-xs font-bold text-stone-400 italic line-clamp-1">
                                                "{member.nickname}"
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex flex-col gap-2 mb-6">
                                        {member.birth_place && (
                                            <div className="flex items-center justify-center gap-1.5 text-stone-500">
                                                <MapPin size={12} className="text-amber-600/60" />
                                                <span className="text-xs md:text-sm font-medium line-clamp-1">{member.birth_place}</span>
                                            </div>
                                        )}
                                        {member.children_count !== undefined && member.children_count > 0 && (
                                            <div className="flex items-center justify-center gap-1.5 text-amber-700/60">
                                                <Users size={12} />
                                                <span className="text-[11px] md:text-xs font-bold">{member.children_count} צאצאים</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* פס תחתון */}
                                    <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                                        <div className="flex gap-1">
                                            {member.life_story && (
                                                <Heart size={14} className="text-rose-400 fill-rose-400/20" />
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1 text-amber-700 font-black text-[11px] md:text-xs uppercase tracking-wider">
                                            <span>לפרופיל</span>
                                            <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))
                ) : (
                    <div className="col-span-full py-20 md:py-32 text-center bg-stone-50/50 rounded-3xl border-2 border-dashed border-stone-200">
                        <h4 className="text-xl md:text-2xl font-black mb-2 text-stone-400">לא נמצאו תוצאות</h4>
                        <p className="text-stone-400 px-6 text-sm font-medium">
                            נסו לחפש שוב במילים אחרות...
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}