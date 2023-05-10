/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{rs,html}", "./index.html"],
  theme: {
    extend: {
      keyframes: {
        success: {
          "30%": { transform: "scale(.8) rotateY(0deg)" },
          "100%": { transform: "scale(1) rotateY(360deg)" },
        },
        wiggle: {
          "0%, 100%": { transform: "rotate(-6deg)" },
          "50%": { transform: "rotate(6deg)" },
        },
        start: {
          "0%": { transform: "translateY(0)", opacity: 0 },
          "50%": { transform: "translateY(-50px)" },
          "100%": { transform: "translateY(0)", opacity: 1 },
        },
      },
      animation: {
        wiggle: "wiggle .2s ease-in-out 3",
        success: "success .5s ease-in var(--animation-delay) 1",
        start: "start .5s ease-in var(--animation-delay) 1 forwards",
      },
    },
  },
  plugins: [],
};
