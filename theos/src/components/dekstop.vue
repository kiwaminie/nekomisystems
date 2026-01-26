<script setup lang="ts">

import type { AppConfig } from '../types'
import { computed, ref,  } from 'vue'
import Window from './window.vue'

const props = defineProps<{
    installedApps: AppConfig[]
}>()

const emits = defineEmits<{
    (e: 'focus-app', id: string): void,
    (e: 'close-app', id: string): void
}>()

const openedApps = computed(() => {
  return props.installedApps.filter(app => app.isOpen)
})


const minimizeWindow = (id: string) => {
    
}
const maximizeWindow = (id: string) => {
    
}

</script>

<style scoped>
    @import '../styles/desktop.css';
</style>

<template>
    <div class="desktop">
        <TransitionGroup name="window-spawn">
            <Window
                v-for="app in openedApps"
                :key="app.id"
                :app-data="app"
                @close="$emit('close-app', $event)"
                @minimize="minimizeWindow"
                @maximize="maximizeWindow"
                @focus="$emit('focus-app', $event)"
            />
        </TransitionGroup>
    </div>
</template>