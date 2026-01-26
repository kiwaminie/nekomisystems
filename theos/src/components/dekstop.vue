<script setup lang="ts">

import type { AppConfig } from '../types'
import { computed, ref,  } from 'vue'
import Window from './window.vue'

const props = defineProps<{
    installedApps: AppConfig[]
}>()

let topZ = 100;

const bringToFront = (appId: string) => {
    const app = props.installedApps.find(app => app.id === appId)
    if(app){
        topZ++;
        app.zIndex = topZ
    }
}

const openedApps = computed(() => {
  return props.installedApps.filter(app => app.isOpen)
})

</script>

<style scoped>
    @import '../styles/desktop.css';
</style>

<template>
    <div class="desktop">
        <Window
            v-for="app in openedApps"
            :key="app.id"
            :app-data="app"
        />
    </div>
</template>