'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
    History, 
    Users, 
    LayoutDashboard, 
    ShieldCheck, 
    LogOut, 
    Search, 
    Plus,
    Menu,
    X,
    User
} from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

export default function Navbar() {
    const pathname = usePathname()
    const supabase = createClient()
    const [user, setUser] = useState<any>(null)
    const [profile, setProfile] = useState<any>(null)
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isScrolled, setIsScrolled] = useState(false)

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)
            if (user) {
                const { data } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single()
                setProfile(data)
            }
        }
        getUser()

        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [supabase])

    const navLinks = [
        { href: '/', label: 'בית', icon: History },
        { href: '/family', label: 'ספר המשפחה', icon: Users },
        { href: '/dashboard', label: 'אזור אישי', icon: LayoutDashboard, auth: true },
        { href: '/admin', label: 'ניהול', icon: ShieldCheck, admin: true },
    ]

    const filteredLinks = navLinks.filter(link => {
        if (link.auth && !user) return false
        if (link.admin && profile?.role !== 'admin') return false
        return true
    })

    const isActive = (path: string) => pathname === path

    return (
        <nav className={`sticky top-0 z-[100] transition-all duration-300 ${
            isScrolled ? 'bg-white/80 backdrop-blur-xl border-b border-stone-200/60 py-3' : 'bg-transparent py-6'
        }`}>
            <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20 transform group-hover:-rotate-6 transition-transform">
                        <History size={20} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xl font-serif font-black tracking-tight text-primary leading-none">שורשים</span>
                        <span className="text-[8px] font-black text-stone-400 uppercase tracking-[0.2em] mt-1">Family Archive</span>
                    </div>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-1 bg-stone-100/50 p-1 rounded-2xl border border-stone-200/50">
                    {filteredLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black transition-all ${
                                isActive(link.href)
                                    ? 'bg-white text-primary shadow-sm'
                                    : 'text-stone-500 hover:text-primary hover:bg-white/50'
                            }`}
                        >
                            <link.icon size={16} />
                            {link.label}
                        </Link>
                    ))}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                    <button className="w-10 h-10 rounded-xl bg-white border border-stone-200 flex items-center justify-center text-stone-500 hover:text-primary hover:border-primary/30 transition-all shadow-sm">
                        <Search size={18} />
                    </button>
                    
                    {user ? (
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-px bg-stone-200 mx-2 hidden sm:block" />
                            <div className="hidden sm:flex flex-col items-end">
                                <span className="text-[10px] font-black text-stone-400 uppercase tracking-wider">שלום,</span>
                                <span className="text-xs font-bold text-primary">{profile?.full_name || user.email}</span>
                            </div>
                            <Link href="/dashboard" className="w-10 h-10 rounded-xl bg-stone-100 overflow-hidden border-2 border-white shadow-sm hover:border-primary/30 transition-all">
                                {profile?.avatar_url ? <img src={profile.avatar_url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-stone-400"><User size={20} /></div>}
                            </Link>
                            <form action="/api/auth/signout" method="POST">
                                <button className="w-10 h-10 rounded-xl bg-stone-50 flex items-center justify-center text-stone-400 hover:bg-rose-50 hover:text-rose-600 transition-all border border-transparent hover:border-rose-100">
                                    <LogOut size={18} />
                                </button>
                            </form>
                        </div>
                    ) : (
                        <Link
                            href="/login"
                            className="bg-primary text-white px-6 py-2.5 rounded-xl font-black text-sm hover:shadow-lg hover:shadow-primary/20 transition-all transform hover:-translate-y-0.5"
                        >
                            התחברות
                        </Link>
                    )}

                    {/* Mobile Menu Toggle */}
                    <button 
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="md:hidden w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center text-stone-600"
                    >
                        {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-stone-200 p-6 animate-in slide-in-from-top duration-300">
                    <div className="flex flex-col gap-2">
                        {filteredLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setIsMenuOpen(false)}
                                className={`flex items-center gap-3 p-4 rounded-2xl text-base font-black transition-all ${
                                    isActive(link.href)
                                        ? 'bg-primary text-white'
                                        : 'bg-stone-50 text-stone-600 hover:bg-stone-100'
                                }`}
                            >
                                <link.icon size={20} />
                                {link.label}
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </nav>
    )
}
