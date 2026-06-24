// Powered by OnSpace.AI
// EtlobAdmin-style: Yellow #FFD700 + Dark Charcoal Design System

export const Colors = {
  // Brand
  primary: '#FFD700',
  primaryLight: '#FFE44D',
  primaryDark: '#E6C200',
  primaryText: '#1A1A1A',    // Text on yellow backgrounds

  // Charcoal Scale
  charcoal900: '#0D0D0D',
  charcoal800: '#1A1A1A',
  charcoal700: '#252525',
  charcoal600: '#2F2F2F',
  charcoal500: '#3A3A3A',
  charcoal400: '#4A4A4A',
  charcoal300: '#6B6B6B',
  charcoal200: '#8C8C8C',
  charcoal100: '#B0B0B0',

  // Surfaces
  background: '#111111',
  surface: '#1E1E1E',
  surfaceRaised: '#252525',
  surfaceHover: '#2A2A2A',
  surfaceCard: '#1E1E1E',

  // Borders
  border: '#2F2F2F',
  borderLight: '#333333',
  borderFocus: '#FFD700',

  // Text
  text: '#F0F0F0',
  textSecondary: '#B0B0B0',
  textMuted: '#707070',
  textInverse: '#1A1A1A',

  // Semantic
  success: '#22C55E',
  successBg: 'rgba(34,197,94,0.12)',
  warning: '#F59E0B',
  warningBg: 'rgba(245,158,11,0.12)',
  danger: '#EF4444',
  dangerBg: 'rgba(239,68,68,0.12)',
  info: '#3B82F6',
  infoBg: 'rgba(59,130,246,0.12)',

  // Restaurant Status
  statusOpen: '#22C55E',
  statusOpenBg: 'rgba(34,197,94,0.15)',
  statusClosed: '#EF4444',
  statusClosedBg: 'rgba(239,68,68,0.15)',
  statusBusy: '#F59E0B',
  statusBusyBg: 'rgba(245,158,11,0.15)',

  // Navigation
  sidebarBg: '#141414',
  sidebarBorder: '#2A2A2A',
  tabBar: '#1A1A1A',
  tabBarBorder: '#2F2F2F',
  tabActive: '#FFD700',
  tabInactive: '#6B6B6B',

  // Misc
  shadow: 'rgba(0,0,0,0.5)',
  shadowGold: 'rgba(255,215,0,0.15)',
  overlay: 'rgba(0,0,0,0.7)',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const Radius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  full: 999,
};

export const Typography = {
  h1: { fontSize: 28, fontWeight: '700' as const, lineHeight: 36 },
  h2: { fontSize: 22, fontWeight: '700' as const, lineHeight: 30 },
  h3: { fontSize: 18, fontWeight: '600' as const, lineHeight: 26 },
  h4: { fontSize: 15, fontWeight: '600' as const, lineHeight: 22 },
  body: { fontSize: 15, fontWeight: '400' as const, lineHeight: 22 },
  bodySmall: { fontSize: 13, fontWeight: '400' as const, lineHeight: 18 },
  caption: { fontSize: 11, fontWeight: '400' as const, lineHeight: 16 },
  button: { fontSize: 14, fontWeight: '600' as const, lineHeight: 20 },
  label: { fontSize: 12, fontWeight: '500' as const, lineHeight: 16 },
  mono: { fontSize: 13, fontWeight: '500' as const, lineHeight: 18, fontFamily: 'monospace' as const },
};

export const Shadow = {
  sm: {
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 3,
  },
  md: {
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 6,
  },
  lg: {
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 12,
  },
  gold: {
    shadowColor: Colors.shadowGold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 6,
  },
};
