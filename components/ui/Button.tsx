
import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'success' | 'warning';
  size?: 'sm' | 'base' | 'lg';
  isLoading?: boolean;
  children?: React.ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

export const Button: React.FC<ButtonProps> = ({ 
  className, 
  variant = 'primary',
  size = 'base',
  isLoading, 
  children, 
  disabled,
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center font-semibold transition-all focus-visible:outline-none disabled:opacity-50 disabled:pointer-events-none w-full duration-200 active:scale-95 rounded-2xl";
  
  const sizes = {
    sm: 'h-10 px-4 text-sm',
    base: 'h-12 px-6 text-base',
    lg: 'h-14 px-8 text-lg',
  };

  const variants = {
    primary: "bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-lg shadow-slate-900/30 hover:shadow-xl hover:shadow-slate-900/40 active:shadow-md dark:from-slate-100 dark:to-white dark:text-slate-900 dark:shadow-slate-400/30",
    secondary: "bg-gradient-to-br from-slate-100 to-slate-50 text-slate-900 hover:from-slate-200 hover:to-slate-100 shadow-md dark:from-slate-800 dark:to-slate-900 dark:text-white",
    outline: "border-2 border-slate-200 bg-white hover:bg-slate-50 text-slate-900 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800 dark:text-white",
    ghost: "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-slate-100",
    destructive: "bg-gradient-to-br from-red-600 to-red-500 text-white shadow-lg shadow-red-600/30 hover:shadow-xl hover:shadow-red-600/40 active:shadow-md",
    success: "bg-gradient-to-br from-green-600 to-green-500 text-white shadow-lg shadow-green-600/30 hover:shadow-xl hover:shadow-green-600/40 active:shadow-md",
    warning: "bg-gradient-to-br from-orange-600 to-orange-500 text-white shadow-lg shadow-orange-600/30 hover:shadow-xl hover:shadow-orange-600/40 active:shadow-md",
  };

  const MotionButton = motion.button as any;

  return (
    <MotionButton
      whileHover={!disabled && !isLoading ? { y: -2 } : {}}
      whileTap={!disabled && !isLoading ? { scale: 0.97, y: 0 } : {}}      className={cn(baseStyles, sizes[size], variants[variant], className)}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      {children}
    </MotionButton>
  );
};