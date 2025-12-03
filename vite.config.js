import { defineConfig } from 'vite'

export default defineConfig({
    // Use relative base path so it works on both GitHub Pages and VPS root
    base: './',
    build: {
        outDir: 'dist',
        rollupOptions: {
            input: {
                main: 'index.html',
                asgard: 'asgard.html',
                malte: 'Malte.html'
            }
        }
    },
    preview: {
        allowedHosts: true
    }
})
