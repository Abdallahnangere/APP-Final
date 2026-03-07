/**
 * Apple-Style Card Component
 */
import React from 'react';
import { AppleColors, AppleShadows, AppleMotion, AppleRadii } from '@/lib/appleDesignSystem';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  isDark?: boolean;
  interactive?: boolean;
  variant?: 'default' | 'elevated' | 'gradient';
  gradientFrom?: string;
  gradientTo?: string;
}

export const AppleCard = React.forwardRef<HTMLDivElement, CardProps>(
  ({ isDark = false, interactive = false, variant = 'default', gradientFrom, gradientTo, children, className = '', style, ...props }, ref) => {
    const [isHovered, setIsHovered] = React.useState(false);

    const getVariantStyle = (): React.CSSProperties => {
      switch (variant) {
        case 'gradient':
          return {
            background: `linear-gradient(135deg, ${gradientFrom || AppleColors.accent.blue}, ${gradientTo || AppleColors.accent.blueHover})`,
          };
        case 'elevated':
          return {
            background: isDark ? AppleColors.bg.darkCard : AppleColors.bg.lightCard,
            boxShadow: AppleShadows.md,
          };
        default:
          return {
            background: isDark ? AppleColors.bg.darkCard : AppleColors.bg.lightCard,
            border: `1px solid ${isDark ? AppleColors.border.dark : AppleColors.border.light}`,
            boxShadow: AppleShadows.sm,
          };
      }
    };

    const baseStyle: React.CSSProperties = {
      borderRadius: AppleRadii.pill,
      padding: 32,
      ...getVariantStyle(),
      transition: `all ${AppleMotion.base}ms ${AppleMotion.easeInOut}`,
      cursor: interactive ? 'pointer' : 'default',
      ...(interactive && isHovered && {
        boxShadow: AppleShadows.lg,
        transform: 'scale(1.015)',
      }),
      ...style,
    };

    return (
      <div
        ref={ref}
        style={baseStyle}
        onMouseEnter={() => interactive && setIsHovered(true)}
        onMouseLeave={() => interactive && setIsHovered(false)}
        className={className}
        {...props}
      >
        {children}
      </div>
    );
  }
);

AppleCard.displayName = 'AppleCard';
