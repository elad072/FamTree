'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Search, ChevronDown, X, User } from 'lucide-react'

interface Option {
    id: string
    name: string
}

interface SearchableSelectProps {
    options: Option[]
    value: string
    onChange: (value: string) => void
    placeholder: string
    label?: string
}

export default function SearchableSelect({ options, value, onChange, placeholder, label }: SearchableSelectProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [search, setSearch] = useState('')
    const containerRef = useRef<HTMLDivElement>(null)

    const selectedOption = options.find(opt => opt.id === value)

    const filteredOptions = options.filter(opt =>
        opt.name.toLowerCase().includes(search.toLowerCase())
    )

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    return (
        <div className="relative" ref={containerRef}>
            {label && <label className="block text-sm font-black text-stone-500 mb-2">{label}</label>}
            
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="w-full bg-stone-50 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-primary/20 transition-all font-bold cursor-pointer flex items-center justify-between group"
            >
                <span className={selectedOption ? 'text-primary' : 'text-stone-400'}>
                    {selectedOption ? selectedOption.name : placeholder}
                </span>
                <div className="flex items-center gap-2">
                    {value && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                onChange('')
                                setSearch('')
                            }}
                            className="p-1 hover:bg-stone-200 rounded-full text-stone-400 transition-colors"
                        >
                            <X size={14} />
                        </button>
                    )}
                    <ChevronDown size={18} className={`text-stone-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </div>
            </div>

            {isOpen && (
                <div className="absolute z-[100] w-full mt-2 bg-white rounded-2xl shadow-2xl border border-stone-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-3 border-b border-stone-50">
                        <div className="relative">
                            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                            <input
                                autoFocus
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full bg-stone-50 border-none rounded-xl py-2 pr-10 pl-4 focus:ring-2 focus:ring-primary/10 transition-all font-bold text-sm"
                                placeholder="חיפוש..."
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((option) => (
                                <div
                                    key={option.id}
                                    onClick={() => {
                                        onChange(option.id)
                                        setIsOpen(false)
                                        setSearch('')
                                    }}
                                    className={`px-6 py-3 hover:bg-primary/5 cursor-pointer transition-colors flex items-center gap-3 ${
                                        value === option.id ? 'bg-primary/5 text-primary' : 'text-stone-600'
                                    }`}
                                >
                                    <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center text-stone-400">
                                        <User size={16} />
                                    </div>
                                    <span className="font-bold">{option.name}</span>
                                </div>
                            ))
                        ) : (
                            <div className="px-6 py-8 text-center text-stone-400 font-bold text-sm">
                                לא נמצאו תוצאות
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
