'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Send, MessageSquare, Clock, User, ChevronDown, ChevronUp } from 'lucide-react'

export default function AdminMessageManager({ initialMessages }: { initialMessages: any[] }) {
    const supabase = createClient()
    const [messages, setMessages] = useState(initialMessages)
    const [replyContent, setReplyContent] = useState<{ [key: string]: string }>({})
    const [loading, setLoading] = useState<{ [key: string]: boolean }>({})
    const [expandedUser, setExpandedUser] = useState<string | null>(null)

    // Group messages by user
    const groupedMessages = messages.reduce((acc: any, msg: any) => {
        const userId = msg.user_id
        if (!acc[userId]) {
            acc[userId] = {
                userId,
                userName: msg.profiles?.full_name || msg.profiles?.email || `משתמש (${userId.substring(0,5)})`,
                userEmail: msg.profiles?.email || 'אין אימייל',
                msgs: []
            }
        }
        acc[userId].msgs.push(msg)
        return acc
    }, {})

    const handleSendReply = async (userId: string) => {
        const content = replyContent[userId]
        if (!content?.trim()) return

        setLoading({ ...loading, [userId]: true })
        try {
            const { data, error } = await supabase
                .from('messages')
                .insert({
                    user_id: userId,
                    content: content,
                    is_from_admin: true
                })
                .select()
                .single()

            if (error) throw error

            if (data) {
                // Find the user info from existing messages to keep the profile data
                const userMsg = messages.find(m => m.user_id === userId)
                const newMessage = {
                    ...data,
                    profiles: userMsg?.profiles
                }
                setMessages([newMessage, ...messages])
                setReplyContent({ ...replyContent, [userId]: '' })
            }
        } catch (err) {
            console.error('Error sending reply:', err)
            alert('שגיאה בשליחת התגובה. אנא נסו שוב.')
        } finally {
            setLoading({ ...loading, [userId]: false })
        }
    }

    return (
        <div className="bg-white rounded-[2.5rem] p-8 border border-stone-100 shadow-xl shadow-stone-200/40">
            <h2 className="text-2xl font-serif font-black text-primary mb-8 flex items-center gap-3">
                <MessageSquare className="text-secondary" size={24} />
                פניות משתמשים
            </h2>

            <div className="space-y-4">
                {Object.values(groupedMessages).length > 0 ? (
                    Object.values(groupedMessages).map((group: any) => (
                        <div key={group.userId} className="border border-stone-100 rounded-[2rem] overflow-hidden transition-all">
                            <button 
                                onClick={() => setExpandedUser(expandedUser === group.userId ? null : group.userId)}
                                className="w-full flex items-center justify-between p-6 bg-stone-50 hover:bg-stone-100 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-primary shadow-sm">
                                        <User size={20} />
                                    </div>
                                    <div className="text-right">
                                        <h3 className="font-black text-primary">{group.userName}</h3>
                                        <p className="text-xs text-stone-400 font-bold">{group.userEmail}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-black uppercase">
                                        {group.msgs.length} הודעות
                                    </span>
                                    {expandedUser === group.userId ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                </div>
                            </button>

                            {expandedUser === group.userId && (
                                <div className="p-6 space-y-6 animate-in slide-in-from-top-2 duration-300">
                                    <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                                        {group.msgs.sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()).map((msg: any) => (
                                            <div 
                                                key={msg.id} 
                                                className={`p-4 rounded-2xl max-w-[85%] ${
                                                    msg.is_from_admin 
                                                        ? 'bg-primary text-white mr-auto' 
                                                        : 'bg-stone-100 text-stone-800'
                                                }`}
                                            >
                                                <p className="text-sm font-medium leading-relaxed">{msg.content}</p>
                                                <p className={`text-[10px] mt-2 opacity-50 ${msg.is_from_admin ? 'text-white' : 'text-stone-400'}`}>
                                                    {new Date(msg.created_at).toLocaleString('he-IL')}
                                                </p>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="relative pt-4 border-t border-stone-100">
                                        <textarea 
                                            value={replyContent[group.userId] || ''}
                                            onChange={(e) => setReplyContent({ ...replyContent, [group.userId]: e.target.value })}
                                            placeholder="כתבו תשובה למשתמש..."
                                            className="w-full bg-stone-50 border-none rounded-2xl py-4 pr-4 pl-16 focus:ring-2 focus:ring-primary/20 transition-all font-bold text-sm resize-none"
                                            rows={2}
                                        />
                                        <button 
                                            onClick={() => handleSendReply(group.userId)}
                                            disabled={loading[group.userId] || !replyContent[group.userId]?.trim()}
                                            className="absolute left-3 bottom-3 w-12 h-12 bg-secondary text-white rounded-xl flex items-center justify-center hover:bg-secondary/90 transition-colors disabled:opacity-50 shadow-lg shadow-secondary/20"
                                        >
                                            <Send size={20} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12 bg-stone-50 rounded-[2rem] border border-dashed border-stone-200">
                        <p className="text-stone-400 font-medium">אין פניות חדשות ממשתמשים</p>
                    </div>
                )}
            </div>
        </div>
    )
}
