<script setup lang="ts">

import type { AppConfig } from '../types'
import { computed, ref,  } from 'vue'
import Window from './window.vue'
import { appComponents } from './apps/index.ts'

const props = defineProps<{
    installedApps: AppConfig[]
}>()

const emits = defineEmits<{
    (e: 'focus-app', id: string): void,
    (e: 'close-app', id: string): void,
    (e: 'maximize-app', id: string): void
}>()

const openedApps = computed(() => {
  return props.installedApps.filter(app => app.isOpen)
})

const transitionName = ref('window-open');

const setTransition = (type: 'open' | 'minimize') => {
    transitionName.value = type === 'open' ? 'window-spawn' : 'window-minimize';
}

const minimizeWindow = (id: string) => {
    const app = props.installedApps.find(app => app.id === id);
    if (app) {
        setTransition('minimize');
        app.isMinimized = true;
        app.isFocused = false;
    }
}

const maximizeWindow = (id: string) => {
    const app = props.installedApps.find(a => a.id === id);
    if (!app) return;

    if (!app.isMaximized) {
        app.tempSettings = {
            position: { ...app.position },
            size: { ...app.size }
        };

        app.position = { x: 0, y: 0 };
        app.isMaximized = true;
    }
    else{
        if (app.tempSettings) {
            app.position = { ...app.tempSettings.position };
            app.size = { ...app.tempSettings.size };
        }

        app.isMaximized = false;
    }
}

defineExpose({ setTransition })

</script>

<style scoped>
    @import '../styles/desktop.css';
</style>

<template>
    <div class="desktop">
        <TransitionGroup :name="transitionName">
            <Window
                v-for="app in openedApps"
                v-show="!app.isMinimized"
                :key="app.id"
                :app-data="app"
                :component="appComponents[app.id]"
                @close="$emit('close-app', $event)"
                @minimize="minimizeWindow"
                @maximize="maximizeWindow"
                @focus="$emit('focus-app', $event)"
            />
        </TransitionGroup>
    </div>
</template>