<script setup lang="ts">

import { ref, onMounted } from 'vue'
import Taskbar from './taskbar.vue'
import Desktop from './dekstop.vue'

import { apps } from '../data/apps'

const installedApps = ref(apps)

let cascadeOffset = 0;

const taskbarIconClicked = (appId: string) => {
    console.log('Attempting to launch: ', appId);

    desktopComponent.value?.setTransition('minimize');

    const app = installedApps.value.find(app => app.id === appId)
    if(!app) return;

    if(!app.isOpen){
        desktopComponent.value?.setTransition('open');
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
    else if(app.isMinimized){
        app.isMinimized = false;
        bringToFront(appId);
    }
    else if(app.isFocused){
        app.isMinimized = true;
    }
    else{
        bringToFront(appId);
        app.isMinimized = false;
    }

    /*if(app){

        if(app.isOpen){
            console.warn('App already open');

            bringToFront(appId);
            app.isMinimized = false;
            return;            
        }
        else{
            const screenWidth = window.innerWidth;
            const screenHeight = window.innerHeight;

            bringToFront(appId);

            app.position = {
                x: (screenWidth - app.size.width) / 2,
                y: (screenHeight - app.size.height) / 2
            };
            
            app.isOpen = true;
            bringToFront(appId);
        }*/

    /*}
    else{
        console.error('App not found');
    }*/
}

/*const taskbarIconClicked = (appId: string) => {
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

const desktopComponent = ref<InstanceType<typeof Desktop> | null>(null);

const bringToFront = (appId: string) => {
    const app = installedApps.value.find(a => a.id === appId);
    if (app) {

        installedApps.value.forEach(a => a.isFocused = false);
        app.isFocused = true;

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
    const app = installedApps.value.find(app => app.id === id)

    if(app){
        desktopComponent.value?.setTransition('open');
        app.isOpen = false
    }
}

onMounted(() => {
   window.addEventListener('resize', () => {
        installedApps.value.forEach(app => {
            if (app.isOpen) {
                const maxX = window.innerWidth - app.size.width;
                const maxY = window.innerHeight - app.size.height - 40;
                
                app.position.x = Math.max(0, Math.min(app.position.x, maxX));
                app.position.y = Math.max(0, Math.min(app.position.y, maxY));
            }
        });
    });     
})

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

        <Desktop ref="desktopComponent"
            :installed-apps="installedApps"
            @focus-app="bringToFront"      
            @closeApp="closeApp"
        />

        <Taskbar 
            :pinnedApps="installedApps"
            @taskbar-icon-clicked="taskbarIconClicked"
        />
    </div>
</template>

