'use client'

import { useState, useMemo } from 'react'
import { Search, MapPin, ChevronLeft, User, Heart, Users, Edit, Trash2, SortAsc, Filter } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface FamilyMember {
    id: string
    name: string
    nickname: string | null
    image_url: string | null
    birth_year: number | null
    birth_place: string | null
    life_story: string | null
    children_count?: number
    created_date?: string
}

export default function FamilyGrid({ members, canEdit = false }: { members: FamilyMember[], canEdit?: boolean }) {
    const [searchQuery, setSearchQuery] = useState('')
    const [activeFilter, setActiveFilter] = useState<'all' | 'has_story' | 'has_photo'>('all')
    const [sortBy, setSortBy] = useState<'name' | 'birth_year' | 'newest'>('name')

    const filteredMembers = useMemo(() => {
        if (!members) return []
        
        let result = members.filter(member => {
            const query = searchQuery.toLowerCase()
            const matchesSearch =
                member.name.toLowerCase().includes(query) ||
                (member.nickname?.toLowerCase().includes(query) ?? false) ||
                (member.birth_place?.toLowerCase().includes(query) ?? false)

            const matchesFilter =
                activeFilter === 'all' ||
                (activeFilter === 'has_story' && member.life_story) ||
                (activeFilter === 'has_photo' && member.image_url)

            return matchesSearch && matchesFilter
        })

        // Sorting
        result.sort((a, b) => {
            if (sortBy === 'name') return a.name.localeCompare(b.name, 'he')
            if (sortBy === 'birth_year') return (a.birth_year || 9999) - (b.birth_year || 9999)
            if (sortBy === 'newest') return new Date(b.created_date || 0).getTime() - new Date(a.created_date || 0).getTime()
            return 0
        })

        return result
    }, [members, searchQuery, activeFilter, sortBy])

    return (
        <div className="space-y-12">
            {/* Search & Filter Bar */}
            <div className="flex flex-col lg:flex-row gap-6 items-stretch lg:items-center justify-between bg-white p-8 rounded-[2.5rem] heritage-shadow border border-stone-100">
                <div className="relative group flex-1 max-w-xl">
                    <Search size={20} className="absolute right-5 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="חיפוש לפי שם, כינוי או מקום לידה..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-stone-50 border-none rounded-2xl py-5 pr-14 pl-6 focus:ring-2 focus:ring-primary/20 transition-all text-stone-800 placeholder:text-stone-400 font-bold text-lg"
                    />
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2 bg-stone-50 p-1.5 rounded-2xl border border-stone-100">
                        {(['all', 'has_photo', 'has_story'] as const).map((filter) => (
                            <button
                                key={filter}
                                onClick={() => setActiveFilter(filter)}
                                className={`px-5 py-2.5 rounded-xl text-sm font-black transition-all whitespace-nowrap ${activeFilter === filter
                                    ? 'bg-white text-primary shadow-sm border border-stone-100'
                                    : 'text-stone-400 hover:text-stone-600'
                                    }`}
                            >
                                {filter === 'all' && 'הכל'}
                                {filter === 'has_photo' && 'עם תמונה'}
                                {filter === 'has_story' && 'עם סיפור'}
                            </button>
                        ))}
                    </div>

                    <div className="h-8 w-px bg-stone-200 hidden lg:block" />

                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 text-stone-400 font-black text-xs uppercase tracking-widest">
                            <SortAsc size={14} />
                            מיון:
                        </div>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                            className="bg-stone-50 border-none rounded-xl py-2.5 pr-10 pl-4 text-sm font-black text-primary focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                        >
                            <option value="name">לפי שם (א-ת)</option>
                            <option value="birth_year">לפי שנת לידה</option>
                            <option value="newest">נוספו לאחרונה</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {filteredMembers.length > 0 ? (
                    filteredMembers.map((member) => (
                        <div
                            key={member.id}
                            onClick={() => {
                                if (!canEdit) {
                                    window.location.href = `/family/${member.id}`
                                }
                            }}
                            className={`group bg-white rounded-[2.5rem] border border-stone-100 p-8 hover:border-primary/20 transition-all duration-500 heritage-shadow hover:translate-y-[-4px] ${!canEdit ? 'cursor-pointer' : ''}`}
                        >
                            <div className="flex flex-col items-center text-center">
                                <div className="relative mb-6">
                                    <div className="w-32 h-32 rounded-[2.5rem] overflow-hidden bg-stone-100 border-4 border-white heritage-shadow group-hover:scale-105 transition-transform duration-500 relative">
                                        {member.image_url ? (
                                            <Image 
                                                src={member.image_url} 
                                                alt={member.name} 
                                                fill
                                                sizes="128px"
                                                className="object-cover"
                                                priority={false}
                                            />
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
                                    <div className="flex items-center gap-2">
                                        {canEdit && (
                                            <div className="flex gap-1">
                                                <Link
                                                    href={`/family/${member.id}/edit`}
                                                    className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                                >
                                                    <Edit size={14} />
                                                </Link>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        if (confirm(`האם אתה בטוח שברצונך למחוק את ${member.name}?`)) {
                                                            fetch(`/api/admin/delete-member?id=${member.id}`, { method: 'POST' })
                                                                .then(() => window.location.reload())
                                                        }
                                                    }}
                                                    className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        )}
                                        <Link
                                            href={`/family/${member.id}`}
                                            className="flex items-center gap-1 text-primary font-black text-sm uppercase tracking-wider hover:text-secondary transition-colors"
                                        >
                                            <span>לפרופיל</span>
                                            <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
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
