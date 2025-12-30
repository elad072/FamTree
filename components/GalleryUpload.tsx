'use client'

import React, { useState } from 'react'
import { Camera, X, Image as ImageIcon, Plus } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

interface GalleryUploadProps {
    images: string[]
    onChange: (images: string[]) => void
    memberId?: string
}

export default function GalleryUpload({ images, onChange, memberId }: GalleryUploadProps) {
    const [uploading, setUploading] = useState(false)
    const supabase = createClient()

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files || files.length === 0) return

        setUploading(true)
        const newImages = [...images]

        for (let i = 0; i < files.length; i++) {
            const file = files[i]
            const fileExt = file.name.split('.').pop()
            const fileName = `${memberId || 'temp'}-${Math.random().toString(36).substring(2)}.${fileExt}`
            const filePath = `gallery/${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('family-images')
                .upload(filePath, file)

            if (uploadError) {
                console.error('Upload error:', uploadError)
                alert(`שגיאה בהעלאת תמונה: ${uploadError.message}`)
                continue
            }

            const { data: { publicUrl } } = supabase.storage
                .from('family-images')
                .getPublicUrl(filePath)
            
            newImages.push(publicUrl)
        }

        onChange(newImages)
        setUploading(false)
    }

    const removeImage = (index: number) => {
        const newImages = images.filter((_, i) => i !== index)
        onChange(newImages)
    }

    return (
        <div className="space-y-4">
            <label className="block text-sm font-black text-stone-500 mb-2">גלריית תמונות</label>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {images.map((url, index) => (
                    <div key={index} className="relative aspect-square rounded-2xl overflow-hidden border-2 border-stone-100 group shadow-sm">
                        <img src={url} alt={`Gallery ${index}`} className="w-full h-full object-cover" />
                        <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-2 right-2 p-1.5 bg-white/90 text-rose-500 rounded-lg shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-50"
                        >
                            <X size={14} />
                        </button>
                    </div>
                ))}
                
                <label className={`relative aspect-square rounded-2xl border-2 border-dashed border-stone-200 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary/40 hover:bg-stone-50 transition-all group ${uploading ? 'animate-pulse pointer-events-none' : ''}`}>
                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleUpload}
                        className="hidden"
                    />
                    <div className="w-10 h-10 bg-stone-100 rounded-xl flex items-center justify-center text-stone-400 group-hover:text-primary group-hover:bg-primary/5 transition-colors">
                        {uploading ? <Plus size={24} className="animate-spin" /> : <Camera size={24} />}
                    </div>
                    <span className="text-[10px] font-black text-stone-400 group-hover:text-primary uppercase tracking-wider">
                        {uploading ? 'מעלה...' : 'הוספת תמונות'}
                    </span>
                </label>
            </div>
        </div>
    )
}
