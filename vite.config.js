import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
    plugins:[
        tailwindcss(),
        vue()
    ],

    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                mikurig: resolve(__dirname, 'mikurig/index.html'),
                bibootaxgame: resolve(__dirname, 'bibootaxgame/index.html'),
            }
        }
    }
});

