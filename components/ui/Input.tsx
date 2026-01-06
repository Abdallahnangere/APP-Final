
import React from 'react';
import { cn } from '../../lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, ...props }, ref) => {
    return (
      <div className="space-y-2 w-full group">
        {label && <label className="text-xs font-semibold text-slate-500 ml-1 uppercase tracking-wide group-focus-within:text-blue-600 transition-colors">{label}</label>}
        <input
          className={cn(
            "flex h-14 w-full rounded-2xl bg-slate-100 px-5 py-3 text-lg ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 shadow-sm border-transparent focus:border-blue-500/20 text-slate-900 font-medium",
            className
          )}
          ref={ref}
          {...props}
        />
      </div>
    );
  }
);
Input.displayName = "Input";
