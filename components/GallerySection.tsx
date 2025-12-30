'use client'

import { useState } from 'react'
import ImageLightbox from './ImageLightbox'
import DeleteImageButton from './DeleteImageButton'

interface GallerySectionProps {
    images: string[]
    isAdmin: boolean
    memberId: string
}

export default function GallerySection({ images, isAdmin, memberId }: GallerySectionProps) {
    const [lightboxOpen, setLightboxOpen] = useState(false)
    const [initialIndex, setInitialIndex] = useState(0)

    const openLightbox = (index: number) => {
        setInitialIndex(index)
        setLightboxOpen(true)
    }

    return (
        <>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                {images.map((imageUrl, idx) => (
                    <div 
                        key={idx} 
                        className="aspect-square rounded-2xl overflow-hidden bg-stone-100 group cursor-pointer relative shadow-sm hover:shadow-md transition-shadow"
                        onClick={() => openLightbox(idx)}
                    >
                        <img
                            src={imageUrl}
                            alt={`זכרון ${idx + 1}`}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                            {isAdmin && (
                                <div onClick={(e) => e.stopPropagation()}>
                                    <DeleteImageButton
                                        memberId={memberId}
                                        type="gallery"
                                        imageUrl={imageUrl}
                                        confirmMessage="האם למחוק תמונה זו?"
                                        className="p-3 bg-white/90 text-rose-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <ImageLightbox
                images={images}
                initialIndex={initialIndex}
                isOpen={lightboxOpen}
                onClose={() => setLightboxOpen(false)}
            />
        </>
    )
}
