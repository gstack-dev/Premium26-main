/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    fontFamily: {
      sans: ['"Press Start 2P"', "monospace"],
      pixel: ['"Press Start 2P"', "monospace"],
    },
    extend: {
      colors: {
        primary: "#cc0000",
        primaryDark: "#880000",
        secondary: "#111111",
        gold: "#ffcc00",
        "pixel-green": "#00cc44",
        "pixel-blue": "#3399ff",
        dark: "#0a0a0a",
        dark2: "#111111",
        dark3: "#1a1a1a",
        "pixel-gray": "#333333",
        "pixel-gray2": "#555555",
      },
      backgroundImage: {
        gradient:
          "linear-gradient(to bottom, #0a0a0a 0%, #110000 100%)",
      },
      boxShadow: {
        pixel: "0 0 0 3px #0a0a0a, 0 0 0 6px #880000",
        "pixel-gold": "0 0 0 3px #0a0a0a, 0 0 0 6px #aa8800",
        "pixel-blue": "0 0 0 3px #0a0a0a, 0 0 0 6px #115599",
        "pixel-green": "0 0 0 3px #0a0a0a, 0 0 0 6px #006622",
      },
    },
  },
  plugins: [],
};
