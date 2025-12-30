'use client'

import React, { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { 
    User, 
    Shield, 
    ShieldCheck, 
    Trash2, 
    Check, 
    X, 
    MoreVertical,
    Mail,
    Calendar,
    UserCircle
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'

interface UserProfile {
    id: string
    full_name: string | null
    email: string | null
    role: 'admin' | 'member'
    is_approved: boolean
    created_at: string
    avatar_url: string | null
}

interface UserManagementProps {
    initialUsers: UserProfile[]
    currentAdminId: string
}

export default function UserManagement({ initialUsers, currentAdminId }: UserManagementProps) {
    const [users, setUsers] = useState<UserProfile[]>(initialUsers)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editName, setEditName] = useState('')
    const [editRole, setEditRole] = useState<'admin' | 'member'>('member')
    const [loading, setLoading] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const supabase = createClient()
    const router = useRouter()

    const filteredUsers = users.filter(u => 
        u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    async function handleUpdateUser(id: string) {
        setLoading(id)
        const { error } = await supabase
            .from('profiles')
            .update({
                full_name: editName,
                role: editRole
            })
            .eq('id', id)

        if (!error) {
            setUsers(users.map(u => u.id === id ? { ...u, full_name: editName, role: editRole } : u))
            setEditingId(null)
            router.refresh()
        }
        setLoading(null)
    }

    async function toggleApproval(id: string, currentStatus: boolean) {
        setLoading(id)
        const { error } = await supabase
            .from('profiles')
            .update({ is_approved: !currentStatus })
            .eq('id', id)

        if (!error) {
            setUsers(users.map(u => u.id === id ? { ...u, is_approved: !currentStatus } : u))
            router.refresh()
        }
        setLoading(null)
    }

    async function deleteUser(id: string) {
        if (!confirm('האם למחוק משתמש זה לצמיתות?')) return
        setLoading(id)
        
        const { error } = await supabase.from('profiles').delete().eq('id', id)

        if (!error) {
            setUsers(users.filter(u => u.id !== id))
            router.refresh()
        }
        setLoading(null)
    }

    const startEditing = (user: UserProfile) => {
        setEditingId(user.id)
        setEditName(user.full_name || '')
        setEditRole(user.role)
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                    <input
                        type="text"
                        placeholder="חיפוש משתמש לפי שם או אימייל..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white border border-stone-200 rounded-2xl py-3 pr-12 pl-6 focus:ring-2 focus:ring-primary/20 outline-none font-bold text-sm transition-all shadow-sm"
                    />
                </div>
                <div className="text-stone-400 text-sm font-bold">
                    מציג {filteredUsers.length} מתוך {users.length} משתמשים
                </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block bg-white rounded-[3rem] shadow-2xl shadow-stone-200/40 border border-stone-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-right border-collapse">
                        <thead>
                            <tr className="bg-stone-50/50 border-b border-stone-100">
                                <th className="py-6 px-8 text-sm font-black text-stone-400 uppercase tracking-wider">משתמש</th>
                                <th className="py-6 px-8 text-sm font-black text-stone-400 uppercase tracking-wider">תפקיד וסטטוס</th>
                                <th className="py-6 px-8 text-sm font-black text-stone-400 uppercase tracking-wider">תאריך הצטרפות</th>
                                <th className="py-6 px-8 text-sm font-black text-stone-400 uppercase tracking-wider text-center">פעולות</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-50">
                            {filteredUsers.map((u) => (
                            <tr key={u.id} className={`hover:bg-stone-50/30 transition-colors group ${editingId === u.id ? 'bg-primary/5' : ''}`}>
                                <td className="py-6 px-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-2xl bg-stone-100 flex-shrink-0 overflow-hidden border-2 border-white shadow-sm group-hover:scale-105 transition-transform">
                                            {u.avatar_url ? (
                                                <img src={u.avatar_url} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-stone-300">
                                                    <UserCircle size={32} />
                                                </div>
                                            )}
                                        </div>
                                        {editingId === u.id ? (
                                            <div className="flex flex-col gap-1">
                                                <input
                                                    value={editName}
                                                    onChange={(e) => setEditName(e.target.value)}
                                                    className="bg-white border border-stone-200 rounded-lg px-3 py-1.5 font-bold text-primary focus:ring-2 focus:ring-primary/20 outline-none"
                                                    placeholder="שם מלא"
                                                />
                                                <span className="text-xs text-stone-400 font-bold px-1">{u.email}</span>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col">
                                                <span className="font-black text-primary text-lg leading-tight">{u.full_name || 'ללא שם'}</span>
                                                <span className="text-xs text-stone-400 font-bold flex items-center gap-1 mt-1">
                                                    <Mail size={12} />
                                                    {u.email}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="py-6 px-8">
                                    <div className="flex flex-col gap-2">
                                        {editingId === u.id ? (
                                            <select
                                                value={editRole}
                                                onChange={(e) => setEditRole(e.target.value as any)}
                                                className="bg-white border border-stone-200 rounded-lg px-3 py-1.5 text-xs font-black uppercase tracking-wider outline-none focus:ring-2 focus:ring-primary/20"
                                            >
                                                <option value="member">משתמש (Member)</option>
                                                <option value="admin">מנהל (Admin)</option>
                                            </select>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                {u.role === 'admin' ? (
                                                    <span className="bg-primary text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-lg shadow-primary/20">
                                                        <ShieldCheck size={12} />
                                                        מנהל
                                                    </span>
                                                ) : (
                                                    <span className="bg-stone-100 text-stone-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                                                        <Shield size={12} />
                                                        משתמש
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                        <button
                                            onClick={() => toggleApproval(u.id, u.is_approved)}
                                            disabled={loading === u.id}
                                            className={`self-start px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${u.is_approved
                                                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                : 'bg-amber-100 text-amber-700 hover:bg-amber-200 animate-pulse'
                                                }`}
                                        >
                                            {u.is_approved ? 'מאושר' : 'ממתין לאישור'}
                                        </button>
                                    </div>
                                </td>
                                <td className="py-6 px-8">
                                    <div className="flex items-center gap-2 text-stone-500 font-bold text-sm">
                                        <Calendar size={14} className="text-stone-300" />
                                        {new Date(u.created_at).toLocaleDateString('he-IL', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </div>
                                </td>
                                <td className="py-6 px-8">
                                    <div className="flex justify-center gap-2">
                                        {editingId === u.id ? (
                                            <>
                                                <button
                                                    onClick={() => handleUpdateUser(u.id)}
                                                    disabled={loading === u.id}
                                                    className="p-3 bg-primary text-white rounded-xl hover:opacity-90 transition-all shadow-lg shadow-primary/20"
                                                    title="שמור"
                                                >
                                                    <Check size={18} />
                                                </button>
                                                <button
                                                    onClick={() => setEditingId(null)}
                                                    className="p-3 bg-stone-100 text-stone-500 rounded-xl hover:bg-stone-200 transition-all"
                                                    title="ביטול"
                                                >
                                                    <X size={18} />
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => startEditing(u)}
                                                    className="p-3 text-stone-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
                                                    title="עריכה"
                                                >
                                                    <MoreVertical size={18} />
                                                </button>
                                                {u.id !== currentAdminId && (
                                                    <button
                                                        onClick={() => deleteUser(u.id)}
                                                        disabled={loading === u.id}
                                                        className="p-3 text-stone-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                                                        title="מחיקה"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden space-y-4">
                {filteredUsers.map((u) => (
                    <div key={u.id} className={`bg-white rounded-3xl p-6 shadow-xl shadow-stone-200/40 border border-stone-100 space-y-4 ${editingId === u.id ? 'ring-2 ring-primary/20 bg-primary/5' : ''}`}>
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-stone-100 flex-shrink-0 overflow-hidden border-2 border-white shadow-sm">
                                {u.avatar_url ? (
                                    <img src={u.avatar_url} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-stone-300">
                                        <UserCircle size={32} />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                {editingId === u.id ? (
                                    <input
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        className="w-full bg-white border border-stone-200 rounded-lg px-3 py-1.5 font-bold text-primary focus:ring-2 focus:ring-primary/20 outline-none"
                                        placeholder="שם מלא"
                                    />
                                ) : (
                                    <h3 className="font-black text-primary text-lg truncate">{u.full_name || 'ללא שם'}</h3>
                                )}
                                <p className="text-xs text-stone-400 font-bold flex items-center gap-1 mt-1 truncate">
                                    <Mail size={12} />
                                    {u.email}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-stone-50">
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-stone-400 uppercase tracking-wider">תפקיד</p>
                                {editingId === u.id ? (
                                    <select
                                        value={editRole}
                                        onChange={(e) => setEditRole(e.target.value as any)}
                                        className="w-full bg-white border border-stone-200 rounded-lg px-2 py-1 text-xs font-black outline-none"
                                    >
                                        <option value="member">משתמש</option>
                                        <option value="admin">מנהל</option>
                                    </select>
                                ) : (
                                    <div className="flex items-center gap-1.5">
                                        {u.role === 'admin' ? (
                                            <span className="text-primary text-[10px] font-black uppercase flex items-center gap-1">
                                                <ShieldCheck size={12} />
                                                מנהל
                                            </span>
                                        ) : (
                                            <span className="text-stone-500 text-[10px] font-black uppercase flex items-center gap-1">
                                                <Shield size={12} />
                                                משתמש
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-stone-400 uppercase tracking-wider">סטטוס</p>
                                <button
                                    onClick={() => toggleApproval(u.id, u.is_approved)}
                                    disabled={loading === u.id}
                                    className={`px-3 py-1 rounded-full text-[10px] font-black uppercase transition-all ${u.is_approved
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-amber-100 text-amber-700 animate-pulse'
                                        }`}
                                >
                                    {u.is_approved ? 'מאושר' : 'ממתין'}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-stone-50">
                            <div className="flex items-center gap-2 text-stone-400 font-bold text-[10px]">
                                <Calendar size={12} />
                                {new Date(u.created_at).toLocaleDateString('he-IL')}
                            </div>
                            <div className="flex gap-2">
                                {editingId === u.id ? (
                                    <>
                                        <button
                                            onClick={() => handleUpdateUser(u.id)}
                                            disabled={loading === u.id}
                                            className="p-2.5 bg-primary text-white rounded-xl shadow-lg shadow-primary/20"
                                        >
                                            <Check size={16} />
                                        </button>
                                        <button
                                            onClick={() => setEditingId(null)}
                                            className="p-2.5 bg-stone-100 text-stone-500 rounded-xl"
                                        >
                                            <X size={16} />
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => startEditing(u)}
                                            className="p-2.5 text-stone-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
                                        >
                                            <MoreVertical size={16} />
                                        </button>
                                        {u.id !== currentAdminId && (
                                            <button
                                                onClick={() => deleteUser(u.id)}
                                                disabled={loading === u.id}
                                                className="p-2.5 text-stone-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
