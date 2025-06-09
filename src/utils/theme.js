// Import the tailwind config directly
const tailwindConfig = require("../../tailwind.config.js")

// Extract theme colors from the tailwind config
export const theme = {
  // Primary colors
  primary: tailwindConfig.theme.extend.colors.theme.primary,
  primaryDark: tailwindConfig.theme.extend.colors.theme.primaryDark,
  primaryLight: tailwindConfig.theme.extend.colors.theme.primaryLight,
  primaryFaded: tailwindConfig.theme.extend.colors.theme.primaryFaded,

  // Secondary colors
  secondary: tailwindConfig.theme.extend.colors.theme.secondary,
  secondaryLight: tailwindConfig.theme.extend.colors.theme.secondaryLight,

  // Accent colors
  accent: tailwindConfig.theme.extend.colors.theme.accent,
  accentDark: tailwindConfig.theme.extend.colors.theme.accentDark,
  accentLight: tailwindConfig.theme.extend.colors.theme.accentLight,

  // Background colors
  background: tailwindConfig.theme.extend.colors.theme.background,
  card: tailwindConfig.theme.extend.colors.theme.card,

  // Status colors
  success: tailwindConfig.theme.extend.colors.theme.success,
  warning: tailwindConfig.theme.extend.colors.theme.warning,
  error: tailwindConfig.theme.extend.colors.theme.error,
  info: tailwindConfig.theme.extend.colors.theme.info,

  // Text colors
  text: tailwindConfig.theme.extend.colors.theme.text,
  textLight: tailwindConfig.theme.extend.colors.theme.textLight,
  textFaded: tailwindConfig.theme.extend.colors.theme.textFaded,

  // Border colors
  border: tailwindConfig.theme.extend.colors.theme.border,
  borderDark: tailwindConfig.theme.extend.colors.theme.borderDark,

  // Gray scale
  gray: tailwindConfig.theme.extend.colors.gray,

  // White and black
  white: "#FFFFFF",
  black: "#000000",
}

export default theme