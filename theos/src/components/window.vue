<script setup lang="ts">

import type { AppConfig } from '../types'

const props = defineProps<{
    appData: AppConfig
}>()

const emit = defineEmits<{
    (e: 'close', id: string): void
    (e: 'minimize', id: string): void
    (e: 'maximize', id: string): void
    (e: 'focus', id: string): void
}>()

const startDrag = (event: MouseEvent) => {
    emit('focus', props.appData.id);

    const startX = event.clientX - props.appData.position.x;
    const startY = event.clientY - props.appData.position.y;

    const onMouseMove = (e: MouseEvent) => {
        props.appData.position.x = e.clientX - startX;
        props.appData.position.y = e.clientY - startY;
    };

    const onMouseUp = () => {
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
}

</script>

<style scoped>
    @import '../styles/window.css';
</style>

<template>
    <div class="window-frame"
        :style="{
            zIndex: appData.zIndex,
            left: appData.position.x + 'px',
            top: appData.position.y + 'px',
            width: appData.size.width + 'px',
            height: appData.size.height + 'px'
        }"
        @mousedown="$emit('focus', appData.id)"
    >
        
        <div class="window-header"@mousedown="startDrag">
            <div>
                {{ appData.name }}
            </div>

            <div></div>

            <div>
                <button @click.stop="emit('minimize', appData.id)"><i class="bi bi-dash-lg"></i></button>
                <button @click.stop="emit('maximize', appData.id)"><i class="bi bi-arrows-fullscreen"></i></button>
                <button @click.stop="emit('close', appData.id)"><i class="bi bi-x-lg"></i></button>
            </div>
        </div>
        <div class="window-content"></div>
    </div>
</template>