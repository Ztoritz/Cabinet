import { defineConfig } from 'vite'

export default defineConfig({
    // Use relative base path so it works on both GitHub Pages and VPS root
    base: './',
    build: {
        outDir: 'dist'
    }
})
