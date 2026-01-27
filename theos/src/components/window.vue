<script setup lang="ts">

import type { AppConfig } from '../types'
import { computed, ref } from 'vue'

const props = defineProps<{
    appData: AppConfig,
    component: any
}>()

const emit = defineEmits<{
    (e: 'close', id: string): void
    (e: 'minimize', id: string): void
    (e: 'maximize', id: string): void
    (e: 'focus', id: string): void
}>()

const isDragging = ref(false);

const startDrag = (event: MouseEvent) => {
    isDragging.value = true;
    emit('focus', props.appData.id);

    let startX = event.clientX - props.appData.position.x;
    let startY = event.clientY - props.appData.position.y;

    const onMouseMove = (e: MouseEvent) => {
        if(props.appData.isMaximized){
            const mouseXRatio = event.clientX / window.innerWidth;

            const restoredWidth = props.appData.tempSettings?.size.width || 600;
            const newX = event.clientX - (restoredWidth * mouseXRatio);

            props.appData.isMaximized = false;
            props.appData.position.x = newX;
            props.appData.position.y = 0;

            startX = event.clientX - props.appData.position.x;
            startY = event.clientY - props.appData.position.y;
            
            return;
        }
                        
        props.appData.position.x = e.clientX - startX;
        props.appData.position.y = e.clientY - startY;

        let newX = e.clientX - startX;
        let newY = e.clientY - startY;

        //# # # # LA VENTANA NO SE PUEDE MOVER FUERA DE LA PANTALLA
        /*const maxX = window.innerWidth - props.appData.size.width;
        const maxY = window.innerHeight - props.appData.size.height - 48;

        newX = Math.max(0, Math.min(newX, maxX));
        newY = Math.max(0, Math.min(newY, maxY));*/
        // # # # # # # #

        // # # # # LA VENTANA NO SE PUEDE MOVER FUERA DE LA PANTALLA VERTICALMENTE
        const minVisibleWidth = 100;
        const minX = -(props.appData.size.width - minVisibleWidth);
        const maxX = window.innerWidth - minVisibleWidth;

        newX = Math.max(minX, Math.min(newX, maxX));

        const taskbarHeight = 48; 
        const maxY = window.innerHeight - taskbarHeight - 26;
        newY = Math.max(0, Math.min(newY, maxY));
        // # # # # # # #   

        props.appData.position.x = newX;
        props.appData.position.y = newY;        
    };

    const onMouseUp = () => {
        isDragging.value = false;
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
}

const windowStyles = computed(() => {
    const taskbarHeight = '48px';

    if (props.appData.isMaximized) {
        return {
            zIndex: props.appData.zIndex,
            top: '0px',
            left: '0px',
            width: '100%',
            //height: '100%' // O 
            height: `calc(100% - ${taskbarHeight})`
        };
    }

    return {
        zIndex: props.appData.zIndex,
        left: props.appData.position.x + 'px',
        top: props.appData.position.y + 'px',
        width: props.appData.size.width + 'px',
        height: props.appData.size.height + 'px'
    };
})

</script>

<style scoped>
    @import '../styles/window.css';
</style>

<template>
    <div class="window-frame"
        :class="{
            'focused' : appData.isFocused,
            'maximized' : appData.isMaximized,
            'dragging' : isDragging
        }"        

        :style="windowStyles"
        @mousedown="$emit('focus', appData.id)"
    >
        
        <div class="window-header"@mousedown="startDrag" @dblclick="$emit('maximize', appData.id)">
            <div class="window-header-titles">
                <i :class="appData.icon"></i>
                <div>{{ appData.name }}</div>
            </div>

            <div></div>

            <div class="window-header-btns">
                <button class="minimize-btn" @click.stop="emit('minimize', appData.id)"><i class="bi bi-dash-lg"></i></button>
                <button class="maximize-btn" @click.stop="emit('maximize', appData.id)"><i class="bi bi-arrows-fullscreen"></i></button>
                <button class="close-btn" @click.stop="emit('close', appData.id)"><i class="bi bi-x-lg"></i></button>
            </div>
        </div>

        <div class="window-content">
            <component :is="component" v-if="component" />
            <div v-else>El componente no se encuentra</div>
        </div>
    </div>
</template>