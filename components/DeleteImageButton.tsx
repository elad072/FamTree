'use client'

import { Trash2 } from 'lucide-react'

interface DeleteImageButtonProps {
    memberId: string
    type: 'profile' | 'gallery'
    imageUrl?: string
    confirmMessage: string
    className?: string
}

export default function DeleteImageButton({
    memberId,
    type,
    imageUrl,
    confirmMessage,
    className
}: DeleteImageButtonProps) {
    return (
        <form action="/api/admin/delete-image" method="POST">
            <input type="hidden" name="memberId" value={memberId} />
            {imageUrl && <input type="hidden" name="imageUrl" value={imageUrl} />}
            <input type="hidden" name="type" value={type} />
            <button
                type="submit"
                className={className}
                onClick={(e) => {
                    if (!confirm(confirmMessage)) e.preventDefault();
                }}
            >
                <Trash2 size={type === 'profile' ? 24 : 20} />
            </button>
        </form>
    )
}
