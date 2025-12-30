'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { MessageSquare, Send, User as UserIcon, Trash2, Smile, CheckSquare, Square } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { he } from 'date-fns/locale'

interface Comment {
    id: string
    content: string
    created_at: string
    user_id: string
    profiles: {
        full_name: string
        avatar_url: string
    }
}

interface CommentsSectionProps {
    memberId: string
    currentUserId: string | undefined
    isAdmin: boolean
}

export default function CommentsSection({ memberId, currentUserId, isAdmin }: CommentsSectionProps) {
    const supabase = createClient()
    const [comments, setComments] = useState<Comment[]>([])
    const [newComment, setNewComment] = useState('')
    const [loading, setLoading] = useState(false)
    const [selectedComments, setSelectedComments] = useState<Set<string>>(new Set())
    const [showEmojiPicker, setShowEmojiPicker] = useState(false)

    const emojis = ['❤️', '🕯️', '🌹', '🙏', '✨', '😢', '🤍', '🌳']

    useEffect(() => {
        fetchComments()
    }, [memberId])

    async function fetchComments() {
        const { data, error } = await supabase
            .from('comments')
            .select('*, profiles(full_name, avatar_url)')
            .eq('member_id', memberId)
            .order('created_at', { ascending: true })
        
        if (error) {
            console.error('Error fetching comments:', error)
            return
        }
        if (data) setComments(data as any)
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!newComment.trim() || !currentUserId) return

        setLoading(true)
        const { error } = await supabase
            .from('comments')
            .insert({
                member_id: memberId,
                user_id: currentUserId,
                content: newComment.trim()
            })

        if (!error) {
            setNewComment('')
            fetchComments()
        }
        setLoading(false)
    }

    async function deleteComment(id: string) {
        if (!confirm('האם למחוק תגובה זו?')) return
        const { error } = await supabase.from('comments').delete().eq('id', id)
        if (!error) fetchComments()
    }

    async function deleteSelectedComments() {
        if (selectedComments.size === 0) return
        if (!confirm(`האם למחוק ${selectedComments.size} תגובות?`)) return

        setLoading(true)
        const { error } = await supabase
            .from('comments')
            .delete()
            .in('id', Array.from(selectedComments))

        if (!error) {
            setSelectedComments(new Set())
            fetchComments()
        }
        setLoading(false)
    }

    const toggleCommentSelection = (id: string) => {
        const newSelection = new Set(selectedComments)
        if (newSelection.has(id)) {
            newSelection.delete(id)
        } else {
            newSelection.add(id)
        }
        setSelectedComments(newSelection)
    }

    const addEmoji = (emoji: string) => {
        setNewComment(prev => prev + emoji)
        setShowEmojiPicker(false)
    }

    return (
        <div className="bg-white rounded-[2.5rem] p-10 heritage-shadow border border-stone-100">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-serif font-black text-primary flex items-center gap-3">
                    <MessageSquare size={24} className="text-secondary" />
                    תגובות וזכרונות
                </h2>
                {isAdmin && selectedComments.size > 0 && (
                    <button
                        onClick={deleteSelectedComments}
                        className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition-colors font-bold text-sm"
                    >
                        <Trash2 size={16} />
                        מחק {selectedComments.size} תגובות
                    </button>
                )}
            </div>

            <div className="space-y-6 mb-10">
                {comments.length > 0 ? (
                    comments.map((comment) => (
                        <div key={comment.id} className="flex gap-4 group">
                            {isAdmin && (
                                <button
                                    onClick={() => toggleCommentSelection(comment.id)}
                                    className={`mt-3 flex-shrink-0 transition-colors ${selectedComments.has(comment.id) ? 'text-primary' : 'text-stone-300 hover:text-stone-400'}`}
                                >
                                    {selectedComments.has(comment.id) ? <CheckSquare size={20} /> : <Square size={20} />}
                                </button>
                            )}
                            <div className="w-10 h-10 rounded-full bg-stone-100 flex-shrink-0 overflow-hidden border border-stone-200">
                                {comment.profiles?.avatar_url ? (
                                    <img src={comment.profiles.avatar_url} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-stone-400">
                                        <UserIcon size={20} />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 bg-stone-50 p-4 rounded-2xl relative">
                                <div className="flex justify-between items-start mb-1">
                                    <span className="font-black text-stone-800 text-sm">{comment.profiles?.full_name || 'משתמש'}</span>
                                    <span className="text-[10px] text-stone-400 font-bold">
                                        {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: he })}
                                    </span>
                                </div>
                                <p className="text-stone-600 text-sm leading-relaxed whitespace-pre-wrap">{comment.content}</p>
                                
                                {(isAdmin || currentUserId === comment.user_id) && (
                                    <button 
                                        onClick={() => deleteComment(comment.id)}
                                        className="absolute top-2 left-2 p-1 text-stone-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-stone-400 italic text-center py-4 font-bold">אין עדיין תגובות. היו הראשונים לשתף זיכרון!</p>
                )}
            </div>

            {currentUserId ? (
                <form onSubmit={handleSubmit} className="relative">
                    <div className="relative">
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="שתפו זיכרון או תגובה..."
                            className="w-full bg-stone-50 border-none rounded-2xl py-4 px-6 pr-14 pl-24 focus:ring-2 focus:ring-primary/20 transition-all font-bold resize-none text-sm"
                            rows={2}
                        />
                        <div className="absolute left-4 bottom-4 flex items-center gap-2">
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                    className="p-2 text-stone-400 hover:text-primary transition-colors"
                                >
                                    <Smile size={20} />
                                </button>
                                {showEmojiPicker && (
                                    <div className="absolute bottom-full left-0 mb-2 p-3 bg-white rounded-2xl shadow-2xl border border-stone-100 grid grid-cols-4 gap-2 z-50 min-w-[160px]">
                                        {emojis.map(emoji => (
                                            <button
                                                key={emoji}
                                                type="button"
                                                onClick={() => addEmoji(emoji)}
                                                className="w-10 h-10 flex items-center justify-center hover:bg-stone-50 rounded-xl transition-colors text-xl"
                                            >
                                                {emoji}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <button
                                type="submit"
                                disabled={loading || !newComment.trim()}
                                className="p-2 bg-primary text-white rounded-xl hover:opacity-90 transition-all disabled:opacity-50"
                            >
                                <Send size={18} />
                            </button>
                        </div>
                    </div>
                </form>
            ) : (
                <div className="text-center p-6 bg-stone-50 rounded-2xl border border-dashed border-stone-200">
                    <p className="text-stone-500 font-bold text-sm">התחברו כדי להוסיף תגובה</p>
                </div>
            )}
        </div>
    )
}
