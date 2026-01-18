'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { LogIn, Loader2 } from 'lucide-react'

export default function LoginPage() {
    const [isLoading, setIsLoading] = useState(false)
    const supabase = createClient()

    const handleGoogleLogin = async () => {
        setIsLoading(true)
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        })
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-stone-50 text-stone-900 p-6">
            <div className="w-full max-w-md space-y-8 bg-white p-10 rounded-2xl heritage-shadow border border-stone-100 text-center">
                <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center text-primary-foreground shadow-lg mb-6">
                    <LogIn size={32} />
                </div>

                <div className="space-y-3">
                    <h1 className="text-4xl font-serif font-black tracking-tight text-primary">
                        שורשים
                    </h1>
                    <p className="text-stone-500 font-medium">
                        התחברו כדי לצפות בארכיון המשפחתי ולשמר את המורשת
                    </p>
                </div>

                <div className="pt-6">
                    <button
                        onClick={handleGoogleLogin}
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-3 bg-white text-stone-700 font-bold py-4 px-6 rounded-xl border-2 border-stone-100 hover:bg-stone-50 hover:border-stone-200 transition-all duration-300 shadow-sm group active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100"
                    >
                        {isLoading ? (
                            <Loader2 className="w-6 h-6 animate-spin text-primary" />
                        ) : (
                            <svg className="w-6 h-6 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                            <path
                                fill="#4285F4"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                                fill="#34A853"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                                fill="#FBBC05"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                            />
                            <path
                                fill="#EA4335"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                            </svg>
                        )}
                        {isLoading ? 'מתחבר...' : 'התחברות באמצעות Google'}
                    </button>
                </div>

                <p className="text-xs text-stone-400 pt-4">
                    על ידי התחברות, אתם מסכימים לתנאי השימוש ומדיניות הפרטיות של "שורשים"
                </p>
            </div>
        </div>
    )
}
