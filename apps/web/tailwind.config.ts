import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Light theme backgrounds
        "breakloop-bg": "#F9FAFB",
        "breakloop-surface": "#FFFFFF",
        "breakloop-card": "#FFFFFF",
        "breakloop-border": "#E5E7EB",

        // Text colors
        "breakloop-text": "#111827",
        "breakloop-text-sub": "#4B5563",
        "breakloop-text-dim": "#9CA3AF",
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "'Segoe UI'",
          "'Roboto'",
          "'Helvetica Neue'",
          "sans-serif",
        ],
        mono: ["'JetBrains Mono'", "'Courier New'", "monospace"],
      },
      typography: {
        DEFAULT: {
          css: {
            color: "#111827",
            a: {
              color: "#2563EB",
              "&:hover": {
                color: "#1d4ed8",
              },
            },
            code: {
              color: "#111827",
              backgroundColor: "#F3F4F6",
              padding: "0.2em 0.4em",
              borderRadius: "0.25em",
            },
          },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
