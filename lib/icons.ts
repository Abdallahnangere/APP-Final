/**
 * Icon System
 * Heroicons mappings and custom SVG icons for Apple-style interface
 * Using Heroicons as the base library (24x24 or 28x28 optimized)
 */

export type IconName = 
  | 'check-circle'
  | 'home'
  | 'clipboard-list'
  | 'banknotes'
  | 'user'
  | 'key'
  | 'signal'
  | 'box'
  | 'credit-card'
  | 'camera'
  | 'phone'
  | 'envelope'
  | 'chat-bubble'
  | 'bolt'
  | 'gift'
  | 'bell'
  | 'moon'
  | 'sun'
  | 'chevron-right'
  | 'arrow-right'
  | 'wifi'
  | 'circle'
  | 'chart-bar'
  | 'download'
  | 'share'
  | 'x-mark';

/**
 * Emoji to Heroicon mapping
 * Replace emojis throughout the app with these icon names
 */
export const emojiToIcon: Record<string, IconName> = {
  '✅': 'check-circle',
  '🏠': 'home',
  '📋': 'clipboard-list',
  '💰': 'banknotes',
  '👤': 'user',
  '🔑': 'key',
  '📶': 'signal',
  '📦': 'box',
  '💳': 'credit-card',
  '📷': 'camera',
  '📞': 'phone',
  '📧': 'envelope',
  '💬': 'chat-bubble',
  '⚡': 'bolt',
  '🎁': 'gift',
  '🔔': 'bell',
  '🌙': 'moon',
  '☀️': 'sun',
  '›': 'chevron-right',
  '→': 'arrow-right',
  '📡': 'wifi',
  '🟡': 'circle',
  '🟢': 'circle',
  '🔴': 'circle',
  '🟤': 'circle',
  '📊': 'chart-bar',
  '⬇': 'download',
  '🔄': 'share',
  '✕': 'x-mark',
};

/**
 * SVG Icon Component Library
 * Using Heroicons-compatible monoline designs (24x24 baseline)
 */
export const HeroIcon = (props: {
  name: IconName;
  size?: number;
  strokeWidth?: number;
  color?: string;
  className?: string;
}) => {
  const { name, size = 24, strokeWidth = 1.5, color = 'currentColor', className = '' } = props;
  const viewBox = '0 0 24 24';

  const iconMap: Record<IconName, string> = {
    'check-circle': `<path stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />`,
    'home': `<path stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M12 12.75h.008v.008H12v-.008z" />`,
    'clipboard-list': `<path stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m8.25-9.75H4.5a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 004.5 21h16.5a2.25 2.25 0 002.25-2.25V5.25A2.25 2.25 0 0020.25 3z" />`,
    'banknotes': `<path stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h18a.75.75 0 01-.75-.75v-.75m0 0A60.059 60.059 0 013.75 4.5m0 0h13.5m-13.5 0a8.981 8.981 0 012.087.5M3.75 15H21m-13.5-2.25h.008v.008h-.008v-.008zm5.25 0h.008v.008h-.008v-.008zm5.25 0h.008v.008h-.008v-.008zm-10.5 5.25h.008v.008h-.008v-.008zm5.25 0h.008v.008h-.008v-.008zm5.25 0h.008v.008h-.008v-.008z" />`,
    'user': `<path stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />`,
    'key': `<path stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />`,
    'signal': `<path stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5L12 8.25m0 0l3.75-3.75M12 8.25l3.75 3.75m-7.5-3.75l-3.75 3.75m7.5-10.5a9 9 0 110 18 9 9 0 010-18z" />`,
    'box': `<path stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125V4.875c0-.621-.504-1.125-1.125-1.125H2.25c-.621 0-1.125.504-1.125 1.125v1.625c0 .621.504 1.125 1.125 1.125z" />`,
    'credit-card': `<path stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" d="M2.25 8.25h19.5M2.25 15H12m-8.25 6h12a2.25 2.25 0 002.25-2.25V6a2.25 2.25 0 00-2.25-2.25H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25z" />`,
    'camera': `<path stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" d="M6.115 5.19l.75 2.25a.75.75 0 00.666.516l2.824.09c.798.025 1.35.767 1.35 1.565V12a2.25 2.25 0 11-4.5 0V6.75c0-.464.36-.855.794-.88zM12.75 20.75H3a2.25 2.25 0 01-2.25-2.25V7.75A2.25 2.25 0 013 5.5h2.25m13.5 0H21A2.25 2.25 0 0123.25 7.75v10.25A2.25 2.25 0 0121 20.75h-8.25m0-3.75a60.166 60.166 0 0115.673-7.757l.417-.417A.75.75 0 0021 12a9 9 0 01-9 9 9.006 9.006 0 01-9-9 9 9 0 019-9 8.973 8.973 0 016.157 2.407" />`,
    'phone': `<path stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" d="M2.25 6.75c0 3.317 2.692 6.75 6 6.75h2.25a2.25 2.25 0 002.25-2.25v-4.5c0-.621-.504-1.125-1.125-1.125H15m0 6.75V4.5c0-2.414-1.97-4.5-4.5-4.5S6 2.086 6 4.5m12 13.5h-3.75a2.25 2.25 0 01-2.25-2.25M7.5 10.5H4.125A1.125 1.125 0 003 11.625v7.125A1.125 1.125 0 004.125 20h3.375A1.125 1.125 0 009 18.875v-7.125A1.125 1.125 0 007.5 10.5z" />`,
    'envelope': `<path stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25H4.5a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5H4.5A2.25 2.25 0 002.25 6.75m19.5 0h-15m0 0L3 8.25m15 0L21 8.25" />`,
    'chat-bubble': `<path stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" d="M12 20.25c4.97 0 9-1.679 9-3.75 0-1.7-1.356-3.192-3.243-3.579-.529-.1-.861-.557-.861-1.063a1.852 1.852 0 11-3.626-1.062c0 .873-.215 1.691-.645 2.322-.502.92-1.278 1.761-2.205 2.28-.214.12-.558.042-.772-.066a17.994 17.994 0 01-5.forskell-4.117v-3.066a4.5 4.5 0 01.952-2.848M12 20.25c-4.97 0-9-1.679-9-3.75 0-1.7 1.356-3.192 3.243-3.579.529-.1.861-.557.861-1.063a1.852 1.852 0 113.626-1.062c0 .873.215 1.691.645 2.322.502.92 1.278 1.761 2.205 2.28.214.12.558.042.772.066A17.994 17.994 0 0121 9.75M9 12.75a3 3 0 11-6 0 3 3 0 016 0z" />`,
    'bolt': `<path stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />`,
    'gift': `<path stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" d="M21 11.25v7.125a2.25 2.25 0 01-2.25 2.25H5.25a2.25 2.25 0 01-2.25-2.25v-7.125m17.25-9.75h-7.5a2.25 2.25 0 00-2.25 2.25v2.25h-3.75a2.25 2.25 0 00-2.25 2.25v3m17.25-6.75h-3.75V5.25m0 0a2.25 2.25 0 00-2.25-2.25h-7.5a2.25 2.25 0 00-2.25 2.25m17.25 0v9.75m0 0v2.25a2.25 2.25 0 01-2.25 2.25H5.25a2.25 2.25 0 01-2.25-2.25v-2.25m17.25 0h-15" />`,
    'bell': `<path stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0M3.124 7.5A8.969 8.969 0 015.25 4.5M15 12.75a3 3 0 11-6 0 3 3 0 016 0zm6-4.125a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />`,
    'moon': `<path stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />`,
    'sun': `<path stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25v2.25m-6.364-.386l-1.591 1.591M5.25 19.5l1.591-1.591m12-12l1.591 1.591M12 9a3 3 0 100 6 3 3 0 000-6z" />`,
    'chevron-right': `<path stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5L15.75 12l-7.5 7.5" />`,
    'arrow-right': `<path stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" />`,
    'wifi': `<path stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" d="M8.288 15.038a5.25 5.25 0 017.424 0M5.72 11.577a8.998 8.998 0 0110.56 0M3.3 8.405a12.243 12.243 0 0117.4 0M21.75 21H2.25" />`,
    'circle': `<circle cx="12" cy="12" r="9" stroke="${color}" stroke-width="${strokeWidth}" fill="none" />`,
    'chart-bar': `<path stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zm9.86-2.995a.75.75 0 00-1.36.8c.361.57.58 1.487.58 2.695V19.875c0 .621.504 1.125 1.125 1.125h2.25a1.125 1.125 0 001.125-1.125v-5.25c0-1.208.219-2.125.58-2.695a.75.75 0 00-1.36-.8c-.361.57-.58 1.487-.58 2.695v5.25h-2.25v-5.25c0-1.208-.219-2.125-.58-2.695zM15.75 7.75a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />`,
    'download': `<path stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />`,
    'share': `<path stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m12.537-2.186a2.25 2.25 0 100 2.186m0 0a2.25 2.25 0 100 2.186M9.305 5.859a3 3 0 105.868 0M7.217 16.338a2.25 2.25 0 100 2.186m12.537-2.186a2.25 2.25 0 100 2.186" />`,
    'x-mark': `<path stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />`,
  };

  const svgContent = iconMap[name] || iconMap['circle'];

  return (
    <svg
      width={size}
      height={size}
      viewBox={viewBox}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  );
};
