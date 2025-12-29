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
            <div className="flex flex-col md:flex-row gap-6 items-center justify-between bg-white p-6 rounded-3xl heritage-shadow border border-stone-100">
                <div className="relative group w-full md:max-w-md">
                    <Search size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="חיפוש לפי שם או מקום..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-stone-50 border-none rounded-2xl py-4 pr-12 pl-4 focus:ring-2 focus:ring-primary/20 transition-all text-stone-800 placeholder:text-stone-400 font-bold"
                    />
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                    {(['all', 'has_photo', 'has_story'] as const).map((filter) => (
                        <button
                            key={filter}
                            onClick={() => setActiveFilter(filter)}
                            className={`px-6 py-3 rounded-xl text-sm font-black transition-all whitespace-nowrap ${activeFilter === filter
                                ? 'bg-primary text-primary-foreground shadow-lg'
                                : 'bg-stone-50 text-stone-500 hover:text-primary hover:bg-stone-100'
                                }`}
                        >
                            {filter === 'all' && 'כל המשפחה'}
                            {filter === 'has_photo' && 'עם תמונה'}
                            {filter === 'has_story' && 'עם סיפור'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {filteredMembers.length > 0 ? (
                    filteredMembers.map((member) => (
                        <Link
                            href={`/family/${member.id}`}
                            key={member.id}
                            className="group bg-white rounded-[2.5rem] border border-stone-100 p-8 hover:border-primary/20 transition-all duration-500 heritage-shadow hover:translate-y-[-4px]"
                        >
                            <div className="flex flex-col items-center text-center">
                                <div className="relative mb-6">
                                    <div className="w-32 h-32 rounded-[2.5rem] overflow-hidden bg-stone-100 border-4 border-white heritage-shadow group-hover:scale-105 transition-transform duration-500">
                                        {member.image_url ? (
                                            <img src={member.image_url} alt={member.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-stone-300">
                                                <User size={48} />
                                            </div>
                                        )}
                                    </div>
                                    {member.birth_year && (
                                        <div className="absolute -bottom-2 -right-2 bg-secondary text-secondary-foreground text-xs font-black px-3 py-1.5 rounded-full shadow-lg border-2 border-white">
                                            {member.birth_year}
                                        </div>
                                    )}
                                </div>

                                <h4 className="text-2xl font-serif font-black text-primary mb-1 group-hover:text-secondary transition-colors">
                                    {member.name}
                                </h4>

                                {member.nickname && (
                                    <p className="text-sm font-bold text-stone-400 mb-4 italic">
                                        "{member.nickname}"
                                    </p>
                                )}

                                <div className="space-y-2 mb-6">
                                    {member.birth_place && (
                                        <div className="flex items-center justify-center gap-1.5 text-stone-500">
                                            <MapPin size={14} className="text-secondary" />
                                            <span className="text-sm font-bold">{member.birth_place}</span>
                                        </div>
                                    )}
                                    {member.children_count !== undefined && member.children_count > 0 && (
                                        <div className="flex items-center justify-center gap-1.5 text-stone-400">
                                            <Users size={14} />
                                            <span className="text-xs font-bold">{member.children_count} צאצאים</span>
                                        </div>
                                    )}
                                </div>

                                <div className="w-full pt-6 border-t border-stone-50 flex items-center justify-between">
                                    <div className="flex gap-1.5">
                                        {member.life_story && (
                                            <Heart size={16} className="text-rose-400 fill-rose-400/20" />
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1 text-primary font-black text-sm uppercase tracking-wider">
                                        <span>לפרופיל</span>
                                        <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))
                ) : (
                    <div className="col-span-full py-32 text-center bg-stone-50/50 rounded-[3rem] border-2 border-dashed border-stone-200">
                        <Users size={48} className="mx-auto text-stone-300 mb-6" />
                        <h4 className="text-2xl font-serif font-black text-stone-400 mb-2">לא נמצאו תוצאות</h4>
                        <p className="text-stone-400 font-bold">נסו לחפש שוב במילים אחרות</p>
                    </div>
                )}
            </div>
        </div>
    )
}
