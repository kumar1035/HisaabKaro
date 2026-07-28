import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: { extend: { colors: { forest: "#1B4D3E", amber: "#F59E0B", canvas: "#FAFAF8" } } },
  plugins: [],
};
export default config;
