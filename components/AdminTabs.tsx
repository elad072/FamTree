'use client'

import React, { useState } from 'react'
import { 
    LayoutDashboard, 
    UserPlus, 
    FileText, 
    MessageSquare, 
    Users as UsersIcon,
    ChevronDown,
    ChevronUp,
    Check,
    X,
    User,
    Edit
} from 'lucide-react'
import Link from 'next/link'
import AdminMessageManager from './AdminMessageManager'
import UserManagement from './UserManagement'

interface AdminTabsProps {
    pendingUsers: any[]
    pendingMembers: any[]
    allUsers: any[]
    recentComments: any[]
    messagesWithProfiles: any[]
    currentAdminId: string
    stats: {
        totalMembers: number
        pendingMembersCount: number
        totalUsers: number
        totalComments: number
    }
}

export default function AdminTabs({
    pendingUsers,
    pendingMembers,
    allUsers,
    recentComments,
    messagesWithProfiles,
    currentAdminId,
    stats
}: AdminTabsProps) {
    const [activeTab, setActiveTab] = useState<'overview' | 'approvals' | 'messages' | 'management'>('overview')
    const [isApprovalsExpanded, setIsApprovalsExpanded] = useState(true)

    const tabs = [
        { id: 'overview', label: 'סקירה כללית', icon: <LayoutDashboard size={20} /> },
        { id: 'approvals', label: 'אישורים', icon: <UserPlus size={20} />, badge: (pendingUsers?.length || 0) + (pendingMembers?.length || 0) },
        { id: 'messages', label: 'הודעות', icon: <MessageSquare size={20} /> },
        { id: 'management', label: 'ניהול משתמשים', icon: <UsersIcon size={20} /> },
    ]

    return (
        <div className="space-y-12">
            {/* Tab Navigation */}
            <div className="flex flex-wrap gap-2 p-2 bg-stone-100 rounded-[2rem] sticky top-4 z-10 shadow-sm border border-stone-200/50 backdrop-blur-md bg-white/80">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-3 px-6 py-3 rounded-2xl text-sm font-black transition-all ${
                            activeTab === tab.id
                                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                : 'text-stone-500 hover:bg-stone-200/50'
                        }`}
                    >
                        {tab.icon}
                        <span>{tab.label}</span>
                        {tab.badge ? (
                            <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                                activeTab === tab.id ? 'bg-white text-primary' : 'bg-primary text-white'
                            }`}>
                                {tab.badge}
                            </span>
                        ) : null}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {activeTab === 'overview' && (
                    <div className="grid lg:grid-cols-12 gap-12">
                        <div className="lg:col-span-8 space-y-12">
                            <section className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-stone-200/40 border border-stone-100">
                                <h2 className="text-2xl font-serif font-black text-primary mb-6">סטטיסטיקה מהירה</h2>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {[
                                        { label: 'בני משפחה', value: stats.totalMembers, color: 'text-primary', bg: 'bg-primary/5' },
                                        { label: 'ממתינים', value: stats.pendingMembersCount, color: 'text-secondary', bg: 'bg-secondary/5' },
                                        { label: 'משתמשים', value: stats.totalUsers, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                                        { label: 'תגובות', value: stats.totalComments, color: 'text-amber-600', bg: 'bg-amber-50' },
                                    ].map((stat, i) => (
                                        <div key={i} className={`${stat.bg} p-6 rounded-3xl flex flex-col items-center text-center`}>
                                            <span className={`text-3xl font-black ${stat.color}`}>{stat.value || 0}</span>
                                            <span className="text-[10px] font-black text-stone-400 uppercase tracking-wider mt-1">{stat.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            <section className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-2xl font-serif font-black text-primary">פעילות אחרונה</h2>
                                    <div className="h-px flex-1 bg-gradient-to-l from-stone-200 to-transparent mx-6" />
                                </div>
                                <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-stone-200/40 border border-stone-100 space-y-8">
                                    {recentComments && recentComments.length > 0 ? (
                                        recentComments.map((comment: any) => (
                                            <div key={comment.id} className="relative pr-6 group">
                                                <div className="absolute right-0 top-0 bottom-0 w-1 bg-primary/10 rounded-full group-hover:bg-primary transition-colors" />
                                                <p className="text-[10px] font-black text-stone-400 uppercase tracking-wider mb-1">
                                                    {new Date(comment.created_at).toLocaleDateString('he-IL')}
                                                </p>
                                                <p className="text-sm font-bold text-primary">
                                                    {comment.profiles?.full_name || 'משתמש'} הגיב על {comment.family_members?.name}
                                                </p>
                                                <p className="text-stone-500 text-sm mt-2 line-clamp-2 italic leading-relaxed">
                                                    "{comment.content}"
                                                </p>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-stone-400 text-sm italic text-center py-8">אין פעילות לאחרונה</p>
                                    )}
                                </div>
                            </section>
                        </div>
                        <div className="lg:col-span-4">
                            <div className="bg-primary/5 rounded-[2.5rem] p-8 border border-primary/10">
                                <h3 className="text-xl font-serif font-black text-primary mb-4">טיפ למנהל</h3>
                                <p className="text-stone-600 text-sm leading-relaxed font-medium">
                                    מומלץ לעבור על בקשות אישור חדשות לפחות פעם ביום כדי לשמור על האתר מעודכן ופעיל.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'approvals' && (
                    <div className="space-y-12">
                        {/* Pending Users */}
                        {pendingUsers && pendingUsers.length > 0 && (
                            <section className="space-y-8">
                                <div className="flex items-center gap-6">
                                    <h2 className="text-3xl font-serif font-black text-primary">משתמשים חדשים</h2>
                                    <span className="bg-secondary text-white px-3 py-1 rounded-full text-xs font-black">{pendingUsers.length}</span>
                                    <div className="h-px flex-1 bg-gradient-to-l from-stone-200 to-transparent" />
                                </div>
                                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {pendingUsers.map((userProfile: any) => (
                                        <div key={userProfile.id} className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-stone-200/40 border border-stone-100 hover:border-primary/20 transition-all group">
                                            <div className="flex items-start justify-between mb-6">
                                                <div className="w-16 h-16 rounded-2xl bg-stone-50 flex items-center justify-center text-stone-400 group-hover:bg-primary/5 group-hover:text-primary transition-colors overflow-hidden border-2 border-white shadow-inner">
                                                    {userProfile.avatar_url ? (
                                                        <img src={userProfile.avatar_url} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <User size={28} />
                                                    )}
                                                </div>
                                                <div className="flex gap-2">
                                                    <form action={`/api/admin/approve-user?id=${userProfile.id}`} method="POST">
                                                        <button className="bg-green-500 text-white p-3 rounded-xl hover:bg-green-600 transition-all shadow-lg shadow-green-200">
                                                            <Check size={20} />
                                                        </button>
                                                    </form>
                                                    <form action={`/api/admin/reject-user?id=${userProfile.id}`} method="POST">
                                                        <button className="bg-white text-rose-500 border border-rose-100 p-3 rounded-xl hover:bg-rose-50 transition-all">
                                                            <X size={20} />
                                                        </button>
                                                    </form>
                                                </div>
                                            </div>
                                            <div>
                                                <h3 className="font-black text-xl text-primary mb-1">{userProfile.full_name || 'ללא שם'}</h3>
                                                <p className="text-stone-400 font-bold text-sm truncate">{userProfile.email}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Pending Content */}
                        <section className="space-y-8">
                            <div className="flex items-center gap-6">
                                <h2 className="text-3xl font-serif font-black text-primary">בקשות לתוכן חדש</h2>
                                {pendingMembers && pendingMembers.length > 0 && (
                                    <span className="bg-secondary text-white px-3 py-1 rounded-full text-xs font-black">{pendingMembers.length}</span>
                                )}
                                <div className="h-px flex-1 bg-gradient-to-l from-stone-200 to-transparent" />
                            </div>
                            
                            {!pendingMembers || pendingMembers.length === 0 ? (
                                <div className="bg-white rounded-[3rem] p-20 text-center border border-dashed border-stone-200">
                                    <div className="w-20 h-20 bg-stone-50 text-stone-200 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <Check size={40} />
                                    </div>
                                    <h3 className="text-2xl font-serif font-black text-stone-400">כל הבקשות טופלו</h3>
                                </div>
                            ) : (
                                <div className="grid gap-6">
                                    {pendingMembers.map((member: any) => (
                                        <div key={member.id} className="bg-white rounded-[2.5rem] p-6 shadow-xl shadow-stone-200/40 border border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-6 hover:shadow-2xl transition-all group">
                                            <div className="flex items-center gap-6 flex-1 w-full sm:w-auto">
                                                <div className="w-24 h-24 rounded-3xl overflow-hidden bg-stone-100 border-4 border-white shadow-inner flex-shrink-0 group-hover:scale-105 transition-transform">
                                                    {member.image_url ? (
                                                        <img src={member.image_url} alt={member.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-stone-300">
                                                            <User size={32} />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <h3 className="text-2xl font-serif font-black text-primary truncate">{member.name}</h3>
                                                    <p className="text-stone-400 text-xs font-bold mt-1 truncate">נוסף על ידי: {member.created_by || 'אנונימי'}</p>
                                                </div>
                                            </div>

                                            <div className="flex gap-3 w-full sm:w-auto justify-end">
                                                <Link
                                                    href={`/family/${member.id}/edit`}
                                                    className="p-4 bg-stone-100 text-stone-600 rounded-2xl hover:bg-stone-200 transition-all"
                                                >
                                                    <Edit size={20} />
                                                </Link>
                                                <form action={`/api/admin/approve?id=${member.id}`} method="POST">
                                                    <button className="p-4 bg-green-500 text-white rounded-2xl shadow-lg shadow-green-200 hover:bg-green-600 transition-all">
                                                        <Check size={20} />
                                                    </button>
                                                </form>
                                                <form action={`/api/admin/reject?id=${member.id}`} method="POST">
                                                    <button className="p-4 bg-white text-rose-500 border border-rose-100 rounded-2xl hover:bg-rose-50 transition-all">
                                                        <X size={20} />
                                                    </button>
                                                </form>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    </div>
                )}

                {activeTab === 'messages' && (
                    <AdminMessageManager initialMessages={messagesWithProfiles || []} />
                )}

                {activeTab === 'management' && (
                    <section className="space-y-8">
                        <div className="flex items-center gap-6">
                            <h2 className="text-3xl font-serif font-black text-primary">ניהול משתמשים</h2>
                            <div className="h-px flex-1 bg-gradient-to-l from-stone-200 to-transparent" />
                        </div>
                        <div className="bg-white rounded-[3rem] p-8 shadow-xl shadow-stone-200/40 border border-stone-100">
                            <UserManagement 
                                initialUsers={allUsers || []} 
                                currentAdminId={currentAdminId} 
                            />
                        </div>
                    </section>
                )}
            </div>
        </div>
    )
}
