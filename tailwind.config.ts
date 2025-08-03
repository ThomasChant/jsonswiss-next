import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
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
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      maxHeight: {
        'core': 'var(--core-area-max-height)',
        'core-min': 'var(--core-area-min-height)',
        'core-max': 'var(--core-area-max-height)',
        'core-default': 'var(--core-area-default-height)',
        'input': 'var(--input-area-max-height)',
        'json-input': 'var(--json-input-max-height)',
        'mobile-input': 'var(--mobile-input-max-height)',
        'json-table-editor': 'var(--json-table-editor-max-height)',
      },
      minHeight: {
        'core': 'var(--core-area-max-height)',
        'core-min': 'var(--core-area-min-height)',
        'core-default': 'var(--core-area-default-height)',
        'input': 'var(--input-area-max-height)',
        'json-table-editor': 'var(--json-table-editor-min-height)',
      },
      height: {
        'core-min': 'var(--core-area-min-height)',
        'core-max': 'var(--core-area-max-height)',
        'core-default': 'var(--core-area-default-height)',
        'json-table-editor': 'var(--json-table-editor-height)',
        'screen-minus-header': 'calc(100vh - var(--header-height) - var(--title-section-height))',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;