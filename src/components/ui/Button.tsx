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
          'inline-flex items-center justify-center font-sans font-medium tracking-wider transition-all duration-300 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 disabled:opacity-40 disabled:cursor-not-allowed',
          {
            // sizes
            'text-xs px-4 py-2 gap-1.5': size === 'sm',
            'text-sm px-6 py-3 gap-2': size === 'md',
            'text-base px-8 py-4 gap-2.5': size === 'lg',
            // variants
            'bg-gold-gradient text-coffee-900 shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]':
              variant === 'gold',
            'bg-transparent text-coffee-500 hover:text-coffee-700 hover:bg-cream-100':
              variant === 'ghost',
            'border border-coffee-400 text-coffee-600 bg-transparent hover:bg-coffee-50 hover:border-coffee-600':
              variant === 'outline',
            'bg-coffee-700 text-cream-50 hover:bg-coffee-800 shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]':
              variant === 'dark',
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
