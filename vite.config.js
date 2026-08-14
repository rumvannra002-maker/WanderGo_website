import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from "@tailwindcss/vite"

export default defineConfig({
  base: '/WanderGo_website/', // ដាក់ទីនេះត្រឹមត្រូវ (កម្រិតស្មើនឹង plugins)
  plugins: [
    tailwindcss(),
    react()
  ],
})