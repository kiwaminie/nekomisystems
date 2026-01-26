<script setup lang="ts">
    import { ref, onMounted } from 'vue'
    import Taskbar from './taskbar.vue'
    import Desktop from './dekstop.vue'
    import type { AppConfig } from '../types'

    const installedApps = ref<AppConfig[]>([
        {
            id: 'notepad',
            name: 'Notepad',
            icon: 'bi-journals',
            isOpen: false,
            isMinimized: false,
            zIndex: 0,
            position: {
                x: 0,
                y: 0
            },
            size: {
                width: 600,
                height: 400
            }
        },
        {
            id: 'calculator',
            name: 'Calculadora',
            icon: 'bi-calculator-fill',
            isOpen: false,
            isMinimized: false,
            zIndex: 0,
            position: {
                x: 0,
                y: 0
            },
            size: {
                width: 600,
                height: 400
            }
        },
        {
            id: 'explorer',
            name: 'Archivos',
            icon: 'bi-folder-fill',
            isOpen: false,
            isMinimized: false,
            zIndex: 0,
            position: {
                x: 0,
                y: 0
            },
            size: {
                width: 600,
                height: 400
            }
        },
        {
            id: 'music',
            name: 'Musica',
            icon: 'bi-music-note-beamed',
            isOpen: false,
            isMinimized: false,
            zIndex: 0,
            position: {
                x: 0,
                y: 0
            },
            size: {
                width: 600,
                height: 400
            }
        }
    ])

    const launchApp = (appId: string) => {
        const app = installedApps.value.find(app => app.id === appId)
    
        if(app){
            if(app.isOpen && app.isMinimized){
                app.isMinimized = false
            }
            else{
                app.isOpen = true
            }

            //bringToFront(appId);

            app.position = {
                x: 0,
                y: 0
            }
        }
    }
</script>

<style scoped>
  @import "../styles/display.css";
</style>

<style>
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans:ital,wght@0,100..900;1,100..900&family=Raleway:ital,wght@0,100..900;1,100..900&display=swap');    
    .main-font {
        font-family: "Noto Sans", sans-serif;
        font-optical-sizing: auto;
        font-weight: 500;
        font-style: normal;
        font-variation-settings: "wdth" 100;
        font-size: 13px;
    }
</style>

<template>
    <div class="display main-font" style="height: 100%; width: 100%;">

        <Desktop 
            :installed-apps="installedApps"            
        />

        <Taskbar 
            :pinnedApps="installedApps"
            @launchApp="launchApp"
        />
    </div>
</template>

