
import React from 'react';
import { cn } from '../../lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  inputMode?: 'none' | 'text' | 'tel' | 'url' | 'email' | 'numeric' | 'decimal' | 'search';
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, ...props }, ref) => {
    return (
      <div className="space-y-2 w-full group">
        {label && (
          <label className="text-xs font-semibold text-primary-600 ml-0.5 uppercase tracking-wide group-focus-within:text-accent-blue transition-colors">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-400 group-focus-within:text-accent-blue transition-colors">
              {icon}
            </div>
          )}
          <input
            className={cn(
              "flex h-12 w-full rounded-xl bg-primary-50 px-4 py-3 text-base ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-primary-400 focus-visible:outline-none focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-accent-blue/30 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 shadow-elevation-2 border border-primary-200/50 focus:border-accent-blue/30 text-primary-900 font-medium",
              icon && "pl-11",
              error && "border-accent-red/50 focus:border-accent-red/30 focus:ring-accent-red/20",
              className
            )}
            ref={ref}
            {...props}
          />
        </div>
        {error && (
          <p className="text-xs font-medium text-accent-red">{error}</p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";
