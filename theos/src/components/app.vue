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

let cascadeOffset = 0;

const launchApp = (appId: string) => {
    console.log('Attempting to launch: ', appId);

    const app = installedApps.value.find(app => app.id === appId)
    
    if(app){
        if(app.isOpen){
            console.warn('App already open');

            bringToFront(appId);
            app.isMinimized = false;
            return;            
        }

        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;

        bringToFront(appId);

        app.position = {
            x: (screenWidth - app.size.width) / 2,
            y: (screenHeight - app.size.height) / 2
        };
        
        app.isOpen = true;
        bringToFront(appId);
    }
    else{
        console.error('App not found');
    }
}

/*const launchApp = (appId: string) => {
    const app = installedApps.value.find(a => a.id === appId);
    if (app && !app.isOpen) {
        const basePoint = {
            x: (window.innerWidth - app.size.width) / 2,
            y: (window.innerHeight - app.size.height) / 2
        };

        // Añadimos el offset y lo aumentamos para la siguiente ventana
        app.position = {
            x: basePoint.x + cascadeOffset,
            y: basePoint.y + cascadeOffset
        };

        cascadeOffset = (cascadeOffset + 20) % 100; // Reinicia tras 5 ventanas
        app.isOpen = true;
        bringToFront(appId);
    }
}*/

const topZ = ref(100);

const bringToFront = (appId: string) => {
    const app = installedApps.value.find(a => a.id === appId);
    if (app) {
        const maxZ = Math.max(...installedApps.value.map(a => a.zIndex));
        
        if (app.zIndex < maxZ || app.zIndex === 0) {
            topZ.value++;
            app.zIndex = topZ.value;
        }
        
        app.isMinimized = false;
        app.isOpen = true;
    }
}

const closeApp = (id: string) => {
    console.log('Closing window...');
    const app = installedApps.value.find(app => app.id === id)

    if(app){
        app.isOpen = false
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
            @focus-app="bringToFront"      
            @closeApp="closeApp"
        />

        <Taskbar 
            :pinnedApps="installedApps"
            @launchApp="launchApp"
        />
    </div>
</template>

