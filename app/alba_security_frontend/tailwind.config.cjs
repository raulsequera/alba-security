/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        gradientFrom: "#6366F1",
        gradientTo: "#0EA5E9",  
        background: "#0F172A", 
        card: "#1E293B",
        lightText: "#F1F5F9",
      },
      backgroundImage: {
        'devices-gradient': "radial-gradient(circle at center, #0EA5E9 0%, #0F172A 100%)",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
