<script setup lang="ts">

import type { AppConfig } from '../types'
import { ref,  } from 'vue'
import Window from './window.vue'

const props = defineProps<{
    installedApps: AppConfig[]
}>()

//const openApps = computed(() => installedApps.value.filter(app => app.isOpen))

const openApp = (appId: string) =>{
    const app = props.installedApps.find(app => app.id === appId)
    
    if(app){
        if(app.isOpen && app.isMinimized){
            app.isMinimized = false
        }
        else{
            app.isOpen = true
        }

        bringToFront(appId);

        app.position = {
            x: 0,
            y: 0
        }
    }
}

let topZ = 100;

const bringToFront = (appId: string) => {
    const app = props.installedApps.find(app => app.id === appId)
    if(app){
        topZ++;
        app.zIndex = topZ
    }
}

</script>

<style scoped>
    @import '../styles/desktop.css';
</style>

<template>
    <div class="desktop">
    </div>
</template>