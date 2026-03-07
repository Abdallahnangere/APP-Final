/**
 * Apple Design System
 * Strict adherence to apple.com design language and specifications
 */

/* ═══════════════════ COLOR PALETTE ═══════════════════ */
export const AppleColors = {
  // Core backgrounds
  bg: {
    dark: '#000000',
    light: '#F5F5F7',
    darkCard: '#1C1C1E',
    darkCard2: '#2C2C2E',
    lightCard: '#FFFFFF',
    lightCard2: '#F9F9F9',
  },
  
  // Text
  text: {
    darkPrimary: '#F5F5F7',
    darkSecondary: '#8E8E93',
    lightPrimary: '#1D1D1F',
    lightSecondary: '#6C6C70',
  },
  
  // Accents
  accent: {
    blue: '#0071E3',
    blueHover: '#0077ED',
    green: '#34C759',
    red: '#FF3B30',
    orange: '#FF9500',
  },
  
  // Borders
  border: {
    dark: 'rgba(255,255,255,0.08)',
    light: 'rgba(0,0,0,0.08)',
  },
};

/* ═══════════════════ TYPOGRAPHY ═══════════════════ */
export const AppleTypography = {
  fontFamily: {
    display: '-apple-system, "SF Pro Display", BlinkMacSystemFont, "Segoe UI", sans-serif',
    text: '-apple-system, "SF Pro Text", BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  
  scale: {
    h1: { size: 56, weight: 700, letterSpacing: -0.003, lineHeight: 1.2 }, // 56px
    h2: { size: 40, weight: 600, letterSpacing: -0.002, lineHeight: 1.2 }, // 40px
    h3: { size: 28, weight: 600, letterSpacing: 0, lineHeight: 1.3 }, // 28px
    subHeader: { size: 21, weight: 500, letterSpacing: 0, lineHeight: 1.4 },
    body: { size: 17, weight: 400, letterSpacing: 0, lineHeight: 1.6 },
    bodySmall: { size: 15, weight: 400, letterSpacing: 0, lineHeight: 1.6 },
    label: { size: 13, weight: 500, letterSpacing: 0.01, lineHeight: 1.4 },
    caption: { size: 12, weight: 400, letterSpacing: 0, lineHeight: 1.4 },
    micro: { size: 11, weight: 500, letterSpacing: 0.01, lineHeight: 1.3 },
  },
};

/* ═══════════════════ SPACING ═══════════════════ */
export const AppleSpacing = {
  xs: 4,      // 4px
  sm: 8,      // 8px
  md: 16,     // 16px
  lg: 24,     // 24px
  xl: 32,     // 32px
  xxl: 48,    // 48px
  section: 120, // Section padding (80px on mobile)
  sectionMobile: 80,
};

/* ═══════════════════ BORDER RADIUS ═══════════════════ */
export const AppleRadii = {
  none: 0,
  sm: 8,      // Input fields
  md: 12,     // Small components
  lg: 14,     // Cards
  xl: 16,     // Larger cards
  pill: 20,   // Rounded rectangles
  round: 20,  // Buttons (borderRadius 980px)
  circle: '50%',
};

/* ═══════════════════ SHADOWS ═══════════════════ */
export const AppleShadows = {
  none: 'none',
  sm: '0 2px 8px rgba(0,0,0,0.08)',
  md: '0 4px 16px rgba(0,0,0,0.12)',
  lg: '0 8px 32px rgba(0,0,0,0.16)',
  xl: '0 12px 48px rgba(0,0,0,0.20)',
  glow: '0 8px 32px rgba(0,113,227,0.3)',
};

/* ═══════════════════ MOTION ═══════════════════ */
export const AppleMotion = {
  // Easing: cubic-bezier(0.25, 0.1, 0.25, 1)
  easeInOut: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
  
  // Durations
  short: 150,     // ms - Press/quick feedback
  base: 300,      // ms - Hover / quick animations
  medium: 500,    // ms - Standard transitions
  long: 700,      // ms - Scroll reveals
  
  // Keyframe animations
  keyframes: {
    slideUp: `
      @keyframes slideUp {
        from { transform: translateY(20px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
    `,
    fadeIn: `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
    `,
    pulse: `
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.4; }
      }
    `,
  },
};

/* ═══════════════════ COMPONENT RECIPES ═══════════════════ */
export const AppleComponents = {
  // Button: Primary
  buttonPrimary: (isDark: boolean) => ({
    padding: '12px 22px',
    borderRadius: AppleRadii.round,
    background: AppleColors.accent.blue,
    color: '#fff',
    fontSize: AppleTypography.scale.body.size,
    fontWeight: 400,
    border: 'none',
    cursor: 'pointer',
    transition: `all ${AppleMotion.base}ms ${AppleMotion.easeInOut}`,
    '&:hover': {
      background: AppleColors.accent.blueHover,
      transform: 'scale(1.02)',
    },
    '&:active': {
      transform: 'scale(0.97)',
    },
  }),
  
  // Card
  card: (isDark: boolean) => ({
    borderRadius: AppleRadii.pill,
    background: isDark ? AppleColors.bg.darkCard : AppleColors.bg.lightCard,
    border: `1px solid ${isDark ? AppleColors.border.dark : AppleColors.border.light}`,
    padding: '32px',
    boxShadow: AppleShadows.sm,
    transition: `all ${AppleMotion.base}ms ${AppleMotion.easeInOut}`,
    '&:hover': {
      boxShadow: AppleShadows.md,
      transform: 'scale(1.015)',
    },
  }),
  
  // Input
  input: (isDark: boolean) => ({
    padding: '16px',
    borderRadius: AppleRadii.md,
    background: isDark ? AppleColors.bg.darkCard : AppleColors.bg.lightCard,
    border: `1.5px solid ${isDark ? AppleColors.border.dark : AppleColors.border.light}`,
    color: isDark ? AppleColors.text.darkPrimary : AppleColors.text.lightPrimary,
    fontSize: AppleTypography.scale.body.size,
    fontWeight: 400,
    transition: `all ${AppleMotion.base}ms ${AppleMotion.easeInOut}`,
    '&:focus': {
      outline: 'none',
      borderColor: AppleColors.accent.blue,
      boxShadow: `0 0 0 3px rgba(0, 113, 227, 0.1)`,
    },
  }),
};

/* ═══════════════════ UTILITY FUNCTIONS ═══════════════════ */
export const getColorMode = (isDark: boolean) => ({
  bg: isDark ? AppleColors.bg.dark : AppleColors.bg.light,
  bgCard: isDark ? AppleColors.bg.darkCard : AppleColors.bg.lightCard,
  bgCard2: isDark ? AppleColors.bg.darkCard2 : AppleColors.bg.lightCard2,
  textPrimary: isDark ? AppleColors.text.darkPrimary : AppleColors.text.lightPrimary,
  textSecondary: isDark ? AppleColors.text.darkSecondary : AppleColors.text.lightSecondary,
  border: isDark ? AppleColors.border.dark : AppleColors.border.light,
});

export const createInitialGradient = (name: string): string => {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toLowerCase();
  
  const gradients = [
    'linear-gradient(135deg, #0071E3, #0040FF)',
    'linear-gradient(135deg, #34C759, #30B500)',
    'linear-gradient(135deg, #FF3B30, #FF6B5A)',
    'linear-gradient(135deg, #FF9500, #FFB84D)',
    'linear-gradient(135deg, #A2845D, #8B6F47)',
    'linear-gradient(135deg, #007AFF, #5AC8FA)',
  ];
  
  const hash = initials.charCodeAt(0) + initials.charCodeAt(1) || 0;
  return gradients[hash % gradients.length];
};
