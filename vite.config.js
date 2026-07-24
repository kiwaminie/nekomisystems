import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
    base: "./",
    plugins:[
        tailwindcss(),
        vue()
    ],
    resolve: {
        alias: {
            '@': resolve(__dirname, './src'),
        },
    },
    build: {
        cssCodeSplit: true,
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                dev: resolve(__dirname, 'dev/index.html'),
                portfolio: resolve(__dirname, 'portfolio/index.html'),
                mikurig: resolve(__dirname, 'mikurig/index.html'),
                bibootaxgame: resolve(__dirname, 'bibootaxgame/index.html'),
                frost_os: resolve(__dirname, 'frost-os/index.html'),
                doomgame: resolve(__dirname, 'doomgame/index.html'),
                manga_reader: resolve(__dirname, 'manga_reader/index.html'),
            }
        }
    },
    preview: {
		allowedHosts: true
    },
	server: {
        allowedHosts: true
    }
});