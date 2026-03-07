/**
 * Apple-Style Button Component
 * Primary, secondary, and ghost variants
 */
import React from 'react';
import { AppleColors, AppleTypography, AppleMotion } from '@/lib/appleDesignSystem';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isDark?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  loading?: boolean;
}

export const AppleButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    variant = 'primary',
    size = 'md',
    isDark = false,
    icon,
    iconPosition = 'right',
    fullWidth = false,
    loading = false,
    children,
    disabled,
    className = '',
    ...props
  }, ref) => {
    const sizeMap = {
      sm: { padding: '8px 14px', fontSize: 13, height: 32 },
      md: { padding: '12px 22px', fontSize: 15, height: 44 },
      lg: { padding: '17px 28px', fontSize: 17, height: 52 },
    };

    const variantStyles = {
      primary: {
        background: AppleColors.accent.blue,
        color: '#fff',
        border: 'none',
      },
      secondary: {
        background: isDark ? AppleColors.bg.darkCard : AppleColors.bg.lightCard,
        color: isDark ? AppleColors.text.darkPrimary : AppleColors.text.lightPrimary,
        border: `1.5px solid ${isDark ? AppleColors.border.dark : AppleColors.border.light}`,
      },
      ghost: {
        background: 'transparent',
        color: AppleColors.accent.blue,
        border: 'none',
      },
      danger: {
        background: AppleColors.accent.red,
        color: '#fff',
        border: 'none',
      },
    };

    const baseStyle: React.CSSProperties = {
      ...sizeMap[size],
      ...variantStyles[variant],
      borderRadius: 980,
      cursor: disabled || loading ? 'not-allowed' : 'pointer',
      opacity: disabled || loading ? 0.4 : 1,
      transition: `all ${AppleMotion.base}ms ${AppleMotion.easeInOut}`,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      fontWeight: 500,
      fontFamily: AppleTypography.fontFamily.text,
      outline: 'none',
      ...(fullWidth && { width: '100%' }),
    };

    return (
      <button
        ref={ref}
        style={baseStyle}
        disabled={disabled || loading}
        onMouseEnter={(e) => {
          if (!disabled && !loading && variant !== 'ghost') {
            (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.02)';
          }
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
        }}
        onMouseDown={(e) => {
          if (!disabled && !loading) {
            (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.97)';
          }
        }}
        onMouseUp={(e) => {
          if (!disabled && !loading && variant !== 'ghost') {
            (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.02)';
          }
        }}
        className={className}
        {...props}
      >
        {icon && iconPosition === 'left' && icon}
        {loading ? 'Loading...' : children}
        {icon && iconPosition === 'right' && icon}
      </button>
    );
  }
);

AppleButton.displayName = 'AppleButton';
