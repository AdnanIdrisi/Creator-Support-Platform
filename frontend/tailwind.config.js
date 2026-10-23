/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#101828",
        navy: "#153B6D",
        sky: "#EAF3FF",
        line: "#D9E2F0",
        muted: "#667085",
        amber: "#F4B740",
      },
      fontFamily: {
        display: ["Manrope", "sans-serif"],
        body: ["DM Sans", "sans-serif"],
      },
      boxShadow: {
        soft: "0 18px 50px rgba(21, 59, 109, 0.10)",
      },
    },
  },
  plugins: [],
};
