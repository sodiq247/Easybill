/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./index.{js,jsx,ts,tsx}",
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        theme: {
          primary: "#FD7C0E",
          primaryDark: "#E06500",
          primaryLight: "#FFA347",
          primaryFaded: "#FEF0E4",
          secondary: "#14172A",
          secondaryLight: "#2D3250",
          accent: "#4ECDC4",
          accentDark: "#3AA99F",
          accentLight: "#7FDFD9",
          background: "#F8F8FF",
          card: "#FFFFFF",
          success: "#27AE60",
          warning: "#F39C12",
          error: "#E74C3C",
          info: "#3498DB",
          text: "#14172A",
          textLight: "#64748B",
          textFaded: "#94A3B8",
          border: "#E2E8F0",
          borderDark: "#CBD5E1",
        },
        gray: {
          50: "#F9FAFB",
          100: "#F3F4F6",
          200: "#E5E7EB",
          300: "#D1D5DB",
          400: "#9CA3AF",
          500: "#6B7280",
          600: "#4B5563",
          700: "#374151",
          800: "#1F2937",
          900: "#111827",
        },
      },
      fontFamily: {
        lufga: ["Lufga"],
        patriot: ["Patriot"],
        poppins: ["Poppins"],
        spaceGrotesk: ["SpaceGrotesk"],
        pacifico: ['Pacifico', 'cursive'],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  // ✅ No duplicate module.exports now
};
