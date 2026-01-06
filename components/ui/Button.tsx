
import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  isLoading?: boolean;
  children?: React.ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

export const Button: React.FC<ButtonProps> = ({ 
  className, 
  variant = 'primary', 
  isLoading, 
  children, 
  disabled,
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center rounded-2xl font-bold transition-all focus-visible:outline-none disabled:opacity-50 disabled:pointer-events-none h-14 px-8 text-base w-full active:scale-95 duration-200";
  
  const variants = {
    primary: "bg-slate-900 text-white shadow-lg shadow-slate-900/20 hover:bg-slate-800",
    secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200",
    outline: "border-2 border-slate-200 bg-transparent hover:bg-slate-50 text-slate-900",
    ghost: "hover:bg-slate-50 hover:text-slate-900 text-slate-500",
    destructive: "bg-red-50 text-red-600 hover:bg-red-100",
  };

  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      className={cn(baseStyles, variants[variant], className)}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : children}
    </motion.button>
  );
};
