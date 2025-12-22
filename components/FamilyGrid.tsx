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
        <div className="space-y-12">
            {/* Search & Filter Bar */}
            <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
                <div className="relative group w-full md:max-w-xl">
                    <Search size={22} className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-amber-600 transition-colors" />
                    <input
                        type="text"
                        placeholder="חפשו לפי שם, מקום לידה או כינוי..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white/60 backdrop-blur-md border border-stone-200 rounded-3xl py-5 pr-13 pl-6 focus:outline-none focus:ring-8 focus:ring-amber-500/5 focus:border-amber-500/30 transition-all font-medium text-stone-800 placeholder:text-stone-400 shadow-sm"
                    />
                </div>

                <div className="flex items-center gap-2 p-1.5 bg-white/40 backdrop-blur-md border border-stone-200 rounded-3xl shadow-sm w-full md:w-auto overflow-x-auto no-scrollbar">
                    {(['all', 'has_photo', 'has_story'] as const).map((filter) => (
                        <button
                            key={filter}
                            onClick={() => setActiveFilter(filter)}
                            className={`px-6 py-2.5 rounded-2xl text-sm font-bold transition-all whitespace-nowrap ${activeFilter === filter
                                ? 'bg-stone-800 text-white shadow-lg px-8'
                                : 'text-stone-500 hover:text-stone-800 hover:bg-black/5'
                                }`}
                        >
                            {filter === 'all' && 'כולם'}
                            {filter === 'has_photo' && 'עם תמונה'}
                            {filter === 'has_story' && 'עם סיפור'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
                {filteredMembers.length > 0 ? (
                    filteredMembers.map((member) => (
                        <Link
                            href={`/family/${member.id}`}
                            key={member.id}
                            className="group relative flex flex-col bg-white/60 rounded-[3rem] border border-stone-100 p-8 hover:border-amber-500/40 hover:bg-white/80 transition-all duration-700 romantic-shadow active:scale-95 overflow-hidden ltr:text-left"
                        >
                            <div className="relative mb-8 self-center">
                                <div className="w-28 h-28 rounded-[2.5rem] bg-stone-50 p-1.5 ring-1 ring-stone-200 group-hover:scale-105 group-hover:-rotate-3 transition-transform duration-700 aspect-square">
                                    <div className="w-full h-full rounded-[2rem] overflow-hidden bg-stone-100 flex items-center justify-center">
                                        {member.image_url ? (
                                            <img src={member.image_url} alt={member.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <User size={40} className="text-stone-300" />
                                        )}
                                    </div>
                                </div>
                                <div className="absolute -top-2 -left-2 bg-amber-50 text-amber-700 text-[11px] font-black px-3 py-1.5 rounded-full border border-amber-200/50 shadow-sm">
                                    {member.birth_year || '????'}
                                </div>
                            </div>

                            <div className="text-center">
                                <h4 className="text-2xl font-black mb-1 tracking-tight text-stone-800 group-hover:text-amber-700 transition-colors">
                                    {member.name}
                                </h4>
                                {member.nickname && (
                                    <p className="text-xs font-bold text-stone-400 mb-6 italic">
                                        {member.nickname}
                                    </p>
                                )}

                                <div className="flex flex-col gap-3 mb-8 justify-center">
                                    {member.birth_place && (
                                        <div className="flex items-center justify-center gap-2 text-stone-500 font-semibold">
                                            <MapPin size={14} className="text-amber-600/60" />
                                            <span className="text-sm">{member.birth_place}</span>
                                        </div>
                                    )}
                                    {member.children_count !== undefined && member.children_count > 0 && (
                                        <div className="flex items-center justify-center gap-2 text-amber-700/60 font-bold mt-2">
                                            <Users size={14} />
                                            <span className="text-xs">{member.children_count} ילדים</span>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-auto flex items-center justify-between pt-6 border-t border-stone-100">
                                    <div className="flex gap-1">
                                        {member.life_story && <Heart size={14} className="text-rose-300 fill-rose-300" />}
                                    </div>
                                    <div className="flex items-center gap-2 text-amber-700 font-bold text-sm">
                                        <span>לתיעוד המלא</span>
                                        <ChevronLeft size={16} />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))
                ) : (
                    <div className="col-span-full py-32 text-center bg-stone-50/50 rounded-[4rem] border-2 border-dashed border-stone-200">
                        <h4 className="text-2xl font-black mb-3 text-stone-400">לא נמצאו תוצאות</h4>
                        <p className="text-stone-400 max-w-sm mx-auto font-medium">
                            לא מצאנו אף פריט שתואם ל-" {searchQuery} ". נסו לחפש שוב במילים אחרות.
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
