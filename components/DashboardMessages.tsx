'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Send, MessageSquare, Clock, User } from 'lucide-react'

export default function DashboardMessages({ initialMessages, userId }: { initialMessages: any[], userId: string }) {
    const supabase = createClient()
    const [messages, setMessages] = useState(initialMessages)
    const [newContent, setNewContent] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newContent.trim()) return

        setLoading(true)
        const { data, error } = await supabase
            .from('messages')
            .insert({
                user_id: userId,
                content: newContent,
                is_from_admin: false
            })
            .select()
            .single()

        if (data) {
            setMessages([...messages, data])
            setNewContent('')
        }
        setLoading(false)
    }

    return (
        <div className="bg-white rounded-[2.5rem] p-8 border border-stone-100 shadow-sm h-[500px] flex flex-col">
            <h2 className="text-xl font-serif font-black text-primary mb-6 flex items-center gap-2">
                <MessageSquare className="text-primary" size={20} />
                צ'אט עם המנהל
            </h2>

            <div className="flex-1 overflow-y-auto space-y-4 mb-6 pr-2 scroll-smooth">
                {messages.length > 0 ? (
                    messages.map((msg) => (
                        <div 
                            key={msg.id} 
                            className={`flex flex-col ${msg.is_from_admin ? 'items-start' : 'items-end'}`}
                        >
                            <div 
                                className={`p-4 rounded-2xl max-w-[85%] shadow-sm ${
                                    msg.is_from_admin 
                                        ? 'bg-white border border-stone-100 text-stone-800 rounded-tr-none' 
                                        : 'bg-primary text-white rounded-tl-none'
                                }`}
                            >
                                <p className="text-sm font-medium leading-relaxed">{msg.content}</p>
                            </div>
                            <span className="text-[9px] font-black text-stone-400 uppercase tracking-wider mt-1 px-1">
                                {new Date(msg.created_at).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    ))
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center px-6">
                        <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center mb-4 text-stone-200">
                            <MessageSquare size={32} />
                        </div>
                        <p className="text-stone-400 text-sm font-medium">אין הודעות עדיין. צריכים עזרה? שלחו הודעה למנהל.</p>
                    </div>
                )}
            </div>

            <form onSubmit={handleSendMessage} className="relative">
                <input 
                    type="text" 
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    placeholder="כתבו הודעה למנהל..."
                    className="w-full bg-stone-50 border-none rounded-xl py-4 pr-4 pl-12 focus:ring-2 focus:ring-primary/20 transition-all font-bold text-sm"
                />
                <button 
                    disabled={loading || !newContent.trim()}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-primary text-white rounded-lg flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                    <Send size={18} />
                </button>
            </form>
        </div>
    )
}
