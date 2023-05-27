/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{rs,html}", "./index.html"],
  theme: {
    extend: {
      boxShadow: {
        cartoon: "2px 2px 0 0",
      },
      keyframes: {
        success: {
          "30%": { transform: "scale(.8) rotateY(0deg)" },
          "100%": { transform: "scale(1) rotateY(360deg)" },
        },
        wiggle: {
          "0%, 100%": { transform: "rotate(-6deg)" },
          "50%": { transform: "rotate(6deg)" },
        },
        "start-old": {
          "0%": { transform: "translateY(-80%)", opacity: 0 },
          "70%": { opacity: 1 },
          "100%": { transform: "translateY(0)", opacity: 1 },
        },
        start: {
          "0%": {
            transform: "scale(0.2)",
            opacity: 0,
          },
          "100%": { transform: "scale(1) translateY(0)", opacity: 1 },
        },
      },
      animation: {
        wiggle: "wiggle .2s ease-in-out 3",
        success: "success .5s ease-in 1",
        start: "start .4s ease-out var(--animation-column-delay, 0) 1 forwards",
      },
    },
  },
  plugins: [],
};
