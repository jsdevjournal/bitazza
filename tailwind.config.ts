import type { Config } from 'tailwindcss'

const config: Config = {
  daisyui: {
    themes: ["night"],
  },
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  plugins: [require("daisyui")],
}
export default config
