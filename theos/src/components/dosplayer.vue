<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue'

const props = defineProps({
    zipPath: { type: String, required: true },
    executable: { type: String, required: true }
})

const dosContainer = ref(null)
let ci = null

const loadResources = () => {
    return new Promise((resolve) => {
        if (window.Dos) return resolve()

        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = ''//'https://v8.js-dos.com/latest/js-dos.css'
        document.head.appendChild(link)

        const script = document.createElement('script')
        script.src = 'https://v8.js-dos.com/latest/js-dos.js'
        script.onload = resolve
        document.head.appendChild(script)
    })
}

onMounted(async () => {
    await loadResources()

    try {
        // 🔥 AQUÍ se ejecuta todo
        ci = window.Dos(dosContainer.value, {
            url: props.zipPath,
            executable: props.executable,
            autoStart: true
        })

        console.log('DOOM arrancado automáticamente 🚀')
    } catch (e) {
        console.error('Error iniciando js-dos v8:', e)
    }
})

onBeforeUnmount(() => {
    if (ci?.exit) {
        ci.exit()
        ci = null
    }
})
</script>

<template>
    <div class="dos-player-wrapper">
        <div ref="dosContainer" class="dosbox-container"></div>
    </div>
</template>

<style scoped>
.dos-player-wrapper {
    width: 100%;
    height: 100%;
    background: #000;
}

.dosbox-container {
    width: 100%;
    height: 100%;
}
</style>
