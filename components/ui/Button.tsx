
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
  const baseStyles = "inline-flex items-center justify-center font-semibold transition-all focus-visible:outline-none disabled:opacity-50 disabled:pointer-events-none w-full duration-200 active:scale-95 rounded-xl";
  
  const sizes = {
    sm: 'h-10 px-4 text-sm',
    base: 'h-12 px-6 text-base',
    lg: 'h-14 px-8 text-lg',
  };

  const variants = {
    primary: "bg-accent-blue text-white shadow-elevation-4 hover:bg-blue-600 active:shadow-elevation-2",
    secondary: "bg-primary-100 text-primary-900 hover:bg-primary-200 shadow-elevation-2",
    outline: "border border-primary-200 bg-white hover:bg-primary-50 text-primary-900 shadow-elevation-2",
    ghost: "hover:bg-primary-100 text-primary-700",
    destructive: "bg-accent-red text-white shadow-elevation-4 hover:bg-red-500 active:shadow-elevation-2",
    success: "bg-accent-green text-white shadow-elevation-4 hover:bg-green-600 active:shadow-elevation-2",
    warning: "bg-accent-orange text-white shadow-elevation-4 hover:bg-orange-600 active:shadow-elevation-2",
  };

  const MotionButton = motion.button as any;

  return (
    <MotionButton
      whileHover={!disabled && !isLoading ? { y: -1 } : {}}
      whileTap={!disabled && !isLoading ? { scale: 0.98, y: 0 } : {}}
      className={cn(baseStyles, sizes[size], variants[variant], className)}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      {children}
    </MotionButton>
  );
};
