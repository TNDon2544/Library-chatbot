/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      backgroundImage: {
        gradientCard:
          "linear-gradient(180deg, #FFFFFF 25.52%, rgba(255, 255, 255, 0.1) 111.38%)",
      },
    },
  },
  plugins: [],
};
