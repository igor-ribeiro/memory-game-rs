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
      },
      animation: {
        wiggle: "wiggle .2s ease-in-out 3",
        success: "success .5s ease-in 1",
      },
    },
  },
  plugins: [],
};
