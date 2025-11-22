/**
 * HackaTUM Event App Theme
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 */

import { Platform } from 'react-native';

// Event branding colors
export const BrandColors = {
  blueAccent: '#4D6FAD',
  darkBackground: '#0D111A',
  white: '#FFFFFF',
};

export const Colors = {
  light: {
    text: BrandColors.white,
    background: BrandColors.darkBackground,
    tint: BrandColors.blueAccent,
    icon: '#9BA1A6',
    tabIconDefault: '#6B7280',
    tabIconSelected: BrandColors.blueAccent,
    cardBackground: '#1A1F2E',
    border: '#2D3548',
  },
  dark: {
    text: BrandColors.white,
    background: BrandColors.darkBackground,
    tint: BrandColors.blueAccent,
    icon: '#9BA1A6',
    tabIconDefault: '#6B7280',
    tabIconSelected: BrandColors.blueAccent,
    cardBackground: '#1A1F2E',
    border: '#2D3548',
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'Orbitron',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  android: {
    sans: 'Orbitron',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  default: {
    sans: 'Orbitron',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "'Orbitron', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace",
  },
});
