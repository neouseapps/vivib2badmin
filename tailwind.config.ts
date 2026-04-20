import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      colors: {
        bg: {
          lv1: "#ffffff",
          lv2: "#f7f7f7",
          lv3: "#f2f2f2",
          lv3h: "#d7d7d7",
        },
        ink: {
          1: "#212121",
          2: "#454545",
          3: "#808080",
          4: "#a3a3a3",
        },
        line: {
          DEFAULT: "#ebebeb",
          strong: "#e3e3e3",
        },
        brand: {
          DEFAULT: "#c8102e",
          hover: "#a80d26",
        },
        info: { light: "#dbf5ff", DEFAULT: "#135b96", strong: "#0986ec" },
        warn: { light: "#ffecc7", DEFAULT: "#d65800", text: "#752d0b" },
        success: { light: "#d4f5e2", DEFAULT: "#19674f" },
        danger: { light: "#ffe1e1", DEFAULT: "#c0392b" },
        grade: {
          a: "#c8a53a",
          aBg: "#fff6dc",
          b: "#19674f",
          bBg: "#dcf3e8",
          c: "#135b96",
          cBg: "#dbf0ff",
          d: "#808080",
          dBg: "#ececec",
        },
      },
      borderRadius: {
        sm: "6px",
        DEFAULT: "8px",
        md: "10px",
        lg: "12px",
      },
      boxShadow: {
        lv1: "0 0 2px rgba(20,20,20,0.12), 0 1px 4px rgba(20,20,20,0.08)",
        lv2: "0 4px 12px rgba(20,20,20,0.10), 0 1px 2px rgba(20,20,20,0.06)",
      },
      fontSize: {
        cap: ["10px", { lineHeight: "16px", letterSpacing: "0.01em" }],
        "cap-md": ["12px", { lineHeight: "16px" }],
        body: ["14px", { lineHeight: "20px" }],
        lg: ["16px", { lineHeight: "24px" }],
        h4: ["16px", { lineHeight: "20px", letterSpacing: "-0.01em" }],
        h3: ["20px", { lineHeight: "24px", letterSpacing: "-0.02em" }],
      },
    },
  },
  plugins: [],
} satisfies Config;
