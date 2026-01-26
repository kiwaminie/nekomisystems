<script setup lang="ts">

import { onMounted, onUnmounted, ref } from 'vue'
import type { AppConfig } from '../types';

defineProps<{ 
    pinnedApps: AppConfig[]
}>()

const emit = defineEmits<{
    (e: 'launchApp', id: string): void
}>()

const currentTime = ref('')
const currentDate = ref('')

const updateTime = () => {
    const now = new Date()
    currentTime.value = now.toLocaleTimeString([],
        { hour: '2-digit', minute: '2-digit' }
    );
    currentDate.value = now.toLocaleDateString()
}

let timer: number

onMounted(() => {
    updateTime()
    timer = window.setInterval(updateTime, 1000)
})

onUnmounted(() => {
    clearInterval(timer)
})
    
</script>

<style scoped>
    @import '../styles/taskbar.css';
    @import '../styles/start.css';
</style>

<template>
    <div class="taskbar">
        <div class="taskbar-elements">
            <div class="start-container">
                <div class="orb taskbar-btn">
                    <i class="bi bi-house-door-fill"></i>
                </div>
            </div>

            <div class="apps-container" >
                <div class="app taskbar-btn" v-for="app in pinnedApps" :key="app.id" @click="emit('launchApp', app.id)">
                    <div class="app-icon">
                        {{ app.id }}
                        <i :class="`${app.icon}`"></i>
                    </div>
                </div>
            </div>
            
            <div class="info-container taskbar-btn">
                <div>{{ currentTime }}</div>
                <div>{{ currentDate }}</div>
            </div>
        </div>
    </div>
</template>