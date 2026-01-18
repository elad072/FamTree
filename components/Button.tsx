import React from 'react';
import { Loader2 } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    isLoading?: boolean;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
}

export default function Button({
    isLoading,
    variant = 'primary',
    size = 'md',
    children,
    className = '',
    disabled,
    ...props
}: ButtonProps) {
    const baseStyles = "inline-flex items-center justify-center rounded-xl font-black transition-all transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100";
    
    const variants = {
        primary: "bg-primary text-white hover:shadow-lg hover:shadow-primary/20",
        secondary: "bg-secondary text-secondary-foreground hover:shadow-lg hover:shadow-secondary/20",
        outline: "bg-white border border-stone-200 text-stone-600 hover:border-primary/30 hover:text-primary shadow-sm",
        ghost: "bg-transparent text-stone-500 hover:bg-stone-100 hover:text-primary",
        danger: "bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-100"
    };

    const sizes = {
        sm: "px-4 py-2 text-xs",
        md: "px-6 py-2.5 text-sm",
        lg: "px-8 py-3 text-base"
    };

    return (
        <button
            disabled={isLoading || disabled}
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            {...props}
        >
            {isLoading && <Loader2 className="w-4 h-4 ml-2 animate-spin" />}
            {children}
        </button>
    );
}
