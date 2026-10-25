'use client';

import { forwardRef } from 'react';
import { clsx } from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'gold' | 'ghost' | 'outline' | 'dark';
  size?: 'sm' | 'md' | 'lg';
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'gold', size = 'md', className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={clsx(
          'inline-flex items-center justify-center font-sans font-medium uppercase tracking-[0.18em] transition-all duration-300 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-100 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]',
          {
            // sizes
            'text-[13px] px-4 py-2 gap-1.5': size === 'sm',
            'text-[13px] px-6 py-3 gap-2': size === 'md',
            'text-[13px] px-8 py-4 gap-2.5': size === 'lg',
            // variants
            'bg-gold-400 text-coffee-900 shadow-sm hover:bg-gold-300 hover:shadow-md': variant === 'gold',
            'bg-transparent text-coffee-500 hover:text-coffee-700 hover:bg-coffee-50': variant === 'ghost',
            'border border-coffee-600 text-coffee-600 bg-transparent hover:bg-coffee-600 hover:text-cream-50': variant === 'outline',
            'bg-coffee-600 text-cream-50 hover:bg-coffee-700 shadow-sm hover:shadow-md': variant === 'dark',
          },
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
export default Button;
