'use client'

import React from 'react'
import dynamic from 'next/dynamic'
import 'react-quill-new/dist/quill.snow.css'

const ReactQuill = dynamic(() => import('react-quill-new'), { 
    ssr: false,
    loading: () => <div className="h-64 bg-stone-50 animate-pulse rounded-2xl" />
})

interface RichTextEditorProps {
    value: string
    onChange: (content: string) => void
    placeholder?: string
}

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
    const modules = {
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            [{ 'direction': 'rtl' }],
            [{ 'align': [] }],
            ['clean']
        ],
    }

    const formats = [
        'header',
        'bold', 'italic', 'underline', 'strike',
        'list', 'direction', 'align'
    ]

    return (
        <div className="bg-white rounded-2xl overflow-hidden border border-stone-200 quill-rtl">
            <ReactQuill
                theme="snow"
                value={value}
                onChange={onChange}
                modules={modules}
                formats={formats}
                placeholder={placeholder}
                className="h-64"
            />
            <style jsx global>{`
                .quill-rtl .ql-editor {
                    text-align: right;
                    direction: rtl;
                    font-family: inherit;
                    font-size: 1.125rem;
                }
                .quill-rtl .ql-container {
                    border-bottom-left-radius: 1rem;
                    border-bottom-right-radius: 1rem;
                    font-family: inherit;
                }
                .quill-rtl .ql-toolbar {
                    border-top-left-radius: 1rem;
                    border-top-right-radius: 1rem;
                    background: #f9f8f6;
                    border-color: #e7e5e4;
                }
                .quill-rtl .ql-container.ql-snow {
                    border-color: #e7e5e4;
                }
            `}</style>
        </div>
    )
}
