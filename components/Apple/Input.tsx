/**
 * Apple-Style Input Component
 */
import React from 'react';
import { AppleColors, AppleTypography, AppleMotion } from '@/lib/appleDesignSystem';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helpText?: string;
  isDark?: boolean;
  icon?: React.ReactNode;
  suffix?: React.ReactNode;
}

export const AppleInput = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helpText, isDark = false, icon, suffix, className = '', ...props }, ref) => {
    return (
      <div style={{ width: '100%' }}>
        {label && (
          <label style={{
            display: 'block',
            fontSize: 13,
            fontWeight: 600,
            color: isDark ? AppleColors.text.darkSecondary : AppleColors.text.lightSecondary,
            marginBottom: 8,
            fontFamily: AppleTypography.fontFamily.text,
          }}>
            {label}
          </label>
        )}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          {icon && (
            <div style={{ position: 'absolute', left: 12, color: isDark ? AppleColors.text.darkSecondary : AppleColors.text.lightSecondary }}>
              {icon}
            </div>
          )}
          <input
            ref={ref}
            style={{
              width: '100%',
              padding: icon ? '16px 16px 16px 44px' : '16px',
              borderRadius: 12,
              background: isDark ? AppleColors.bg.darkCard : AppleColors.bg.lightCard,
              border: `1.5px solid ${error ? AppleColors.accent.red : isDark ? AppleColors.border.dark : AppleColors.border.light}`,
              color: isDark ? AppleColors.text.darkPrimary : AppleColors.text.lightPrimary,
              fontSize: 16,
              fontWeight: 400,
              fontFamily: AppleTypography.fontFamily.text,
              transition: `all ${AppleMotion.base}ms ${AppleMotion.easeInOut}`,
              boxSizing: 'border-box',
              outline: 'none',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = AppleColors.accent.blue;
              e.currentTarget.style.boxShadow = `0 0 0 3px rgba(0, 113, 227, 0.1)`;
            }}
            onBlur={(e) => {
              e.currentTarget.style.boxShadow = 'none';
            }}
            className={className}
            {...props}
          />
          {suffix && (
            <div style={{ position: 'absolute', right: 12, color: isDark ? AppleColors.text.darkSecondary : AppleColors.text.lightSecondary }}>
              {suffix}
            </div>
          )}
        </div>
        {error && (
          <p style={{
            fontSize: 12,
            color: AppleColors.accent.red,
            marginTop: 6,
            fontFamily: AppleTypography.fontFamily.text,
          }}>
            {error}
          </p>
        )}
        {helpText && !error && (
          <p style={{
            fontSize: 12,
            color: isDark ? AppleColors.text.darkSecondary : AppleColors.text.lightSecondary,
            marginTop: 6,
            fontFamily: AppleTypography.fontFamily.text,
          }}>
            {helpText}
          </p>
        )}
      </div>
    );
  }
);

AppleInput.displayName = 'AppleInput';
