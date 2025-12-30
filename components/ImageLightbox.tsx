'use client'

import { useState, useEffect } from 'react'
import { X, Download, ChevronLeft, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface ImageLightboxProps {
    images: string[]
    initialIndex: number
    isOpen: boolean
    onClose: () => void
}

export default function ImageLightbox({ images, initialIndex, isOpen, onClose }: ImageLightboxProps) {
    const [currentIndex, setCurrentIndex] = useState(initialIndex)

    useEffect(() => {
        setCurrentIndex(initialIndex)
    }, [initialIndex])

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
            if (e.key === 'ArrowLeft') prevImage()
            if (e.key === 'ArrowRight') nextImage()
        }
        if (isOpen) window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isOpen, currentIndex])

    const nextImage = () => setCurrentIndex((prev) => (prev + 1) % images.length)
    const prevImage = () => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)

    const handleDownload = async () => {
        const imageUrl = images[currentIndex]
        try {
            const response = await fetch(imageUrl)
            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = `family-memory-${currentIndex + 1}.jpg`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            window.URL.revokeObjectURL(url)
        } catch (error) {
            console.error('Download failed:', error)
            // Fallback to opening in new tab if fetch fails (CORS)
            window.open(imageUrl, '_blank')
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 md:p-10"
                    onClick={onClose}
                >
                    <button 
                        className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors z-[110]"
                        onClick={onClose}
                    >
                        <X size={32} />
                    </button>

                    <div className="absolute top-6 left-6 flex gap-4 z-[110]">
                        <button 
                            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full transition-all backdrop-blur-md border border-white/10"
                            onClick={(e) => { e.stopPropagation(); handleDownload(); }}
                        >
                            <Download size={20} />
                            <span className="font-bold text-sm">הורדה</span>
                        </button>
                    </div>

                    {images.length > 1 && (
                        <>
                            <button 
                                className="absolute left-4 md:left-10 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors z-[110] bg-black/20 p-2 rounded-full"
                                onClick={(e) => { e.stopPropagation(); prevImage(); }}
                            >
                                <ChevronLeft size={48} />
                            </button>
                            <button 
                                className="absolute right-4 md:right-10 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors z-[110] bg-black/20 p-2 rounded-full"
                                onClick={(e) => { e.stopPropagation(); nextImage(); }}
                            >
                                <ChevronRight size={48} />
                            </button>
                        </>
                    )}

                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="relative max-w-full max-h-full flex items-center justify-center"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img 
                            src={images[currentIndex]} 
                            alt="Memory" 
                            className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
                        />
                        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 text-white/70 font-bold">
                            {currentIndex + 1} / {images.length}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
