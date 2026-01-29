<script setup lang="ts">

import { onMounted, onUnmounted, ref, computed } from 'vue'
import type { AppConfig } from '../types';
import Startmenu from './startmenu.vue';

defineProps<{ 
    pinnedApps: AppConfig[]
}>()

const emit = defineEmits<{
    (e: 'taskbar-icon-clicked', id: string): void
}>()

const currentTime = ref('')
const currentDate = ref('')
const showingStartMenu = ref(false)

const toggleStartMenu = () => {
    showingStartMenu.value = !showingStartMenu.value
}

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

    window.addEventListener('mousedown', (e) => {
        const isClickInsideMenu = (e.target as HTMLElement).closest('.start-menu');    
        const isClickOnOrb = (e.target as HTMLElement).closest('.orb');

        if (!isClickInsideMenu && !isClickOnOrb) {
            showingStartMenu.value = false;
        }
    })
})

onUnmounted(() => {
    clearInterval(timer)
})

const isImage = (iconString: string) => {
    return /\.(jpg|jpeg|png|webp|avif|svg)$/.test(iconString) || iconString.startsWith('/');
}
    
</script>

<style scoped>
    @import '../styles/taskbar.css';
</style>

<template>
    <div class="taskbar">

        <Teleport to="body">
            <Transition name="start-menu-fade">
                <Startmenu 
                    v-show="showingStartMenu"
                />
            </Transition>
        </Teleport>

        <div class="taskbar-elements">
            <div class="start-container">
                <div class="orb taskbar-btn"
                @click="toggleStartMenu"
            >
                    <i class="bi bi-house-door-fill"></i>
                </div>
            </div>

            <div class="apps-container" >
                <div class="app" v-for="app in pinnedApps" :key="app.id" @click="emit('taskbar-icon-clicked', app.id)">
                    <div class="taskbar-btn app-icon" 
                    :class="{ 'running-app': app.isOpen, 'focused-app': app.isFocused }">  

                    <img
                        v-if="isImage(app.icon)"
                        :src="app.icon"
                        class="taskbar-icon-element"
                    >
                    
                    <i
                        v-else 
                        :class="app.icon"
                        class="taskbar-icon-element"
                    >
                    </i>
                    
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