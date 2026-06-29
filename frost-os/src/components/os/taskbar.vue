<script setup lang="ts">

import { inject, onMounted, onUnmounted, ref, computed } from 'vue'
import Startmenu from './startmenu.vue'
import Tray from './taskbar_tray/taskbar_tray.vue'
import IconManager from './iconmanager.vue'
import AppFinder from './apps_finder.vue'
import { useContextMenu } from './context_menu/context_menu.ts'
import { OS_KEY } from '../api/os_api'
import { buildAppContextMenu } from './context_menu/context_menu.ts'
import type { App } from '../data/app'
import { AppActionHandlers } from '../data/app_actions_registry.ts'
import { SnippetActionHandlers } from '../data/snippet_actions_registry.ts'

const os = inject(OS_KEY)
if(!os) throw new Error('OS API not found')

const { openMenu } = useContextMenu()

const taskBarApps = computed(() => {
    return os.state.apps.filter(app => {
        // 1. Si está anclada, SIEMPRE se muestra (esté abierta o no)
        if (app.user.isPinned) return true;

        // 2. Si NO está anclada, solo se muestra si tiene ventanas "públicas"
        const hasVisibleWindows = os.state.windows.some(win => 
            win.appId === app.manifest.id && !win.hideFromTaskbar
        );

        return hasVisibleWindows;
    });
});

const pinnedStartApps = computed(() => {
    return os.state.apps.filter(app => app.user.isPinnedStart)
})

const traySnippets = computed(() => os.state.snippets.filter(snippet => snippet.runtime.isInTray || snippet.manifest.preferences?.startInTray))

// Primero, obtenemos la ventana principal de la app para el preview
const activeWindowForPreview = computed(() => {
    if (!hoveredAppId.value) return null
    // Buscamos la última ventana enfocada o la primera que encontremos
    return os.state.windows
        .filter(w => w.appId === hoveredAppId.value)
        .sort((a, b) => b.zIndex - a.zIndex)[0]
})

const trayApps = computed(() => os.state.apps.filter(app => 
    app.runtime.isRunning && 
    app.runtime.isInTray
))

const emit = defineEmits<{
    (e: 'shutdown'): void
}>()

const currentTime = ref('')
const currentDate = ref('')
const showingStartMenu = ref(false)
const showingAppFinder = ref(false)
const hoveredAppId = ref<string | null>(null)

// Reemplaza activeAppForPreview con esto:
const hoveredAppWindows = computed(() => {
    if (!hoveredAppId.value) return []
    return os.state.windows.filter(w => w.appId === hoveredAppId.value)
})

let showTimeout: number | null = null
let hideTimeout: number | null = null

const contextMenuApps = (e: MouseEvent) => {
    openMenu(e, [
        { 
            label: 'Supervisor de tareas',
            icon: 'bi-list-task', 
            action: () => os.launchApp('task_supervisor') 
        },
    ])
}

const onIconRightCLick = (e: MouseEvent, app: App) => {
    openMenu(e, buildAppContextMenu(app, 'taskbar', os))
}

const previewPositionStyle = ref({ left: '0px' })

// En Taskbar.vue
const handleMouseEnter = (appId: string, event: MouseEvent) => {
    // 1. Calculamos la posición inmediatamente (Sincrónico)
    // Esto es seguro porque el evento está ocurriendo en este milisegundo
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const centerLeft = rect.left + rect.width / 2;

    // 2. Ejecutamos la lógica de previews
    const appWindows = os.state.windows.filter(w => w.appId === appId);
    appWindows.forEach(win => {
        os.updatePreviewImage(win.id);
    });

    // 3. Limpieza de timouts previos
    if (hideTimeout) {
        clearTimeout(hideTimeout);
        hideTimeout = null;
    }

    // 4. Lógica de selección
    if (hoveredAppId.value !== null) {
        // Si ya hay uno abierto, cambiamos al instante
        if (showTimeout) clearTimeout(showTimeout);
        
        previewPositionStyle.value = { left: `${centerLeft}px` };
        hoveredAppId.value = appId;
    } else {
        // Si no hay nada abierto, iniciamos el delay
        if (showTimeout) clearTimeout(showTimeout);
        
        showTimeout = window.setTimeout(() => {
            // Usamos la variable capturada arriba (centerLeft)
            // Ya no dependemos de 'event' aquí adentro
            previewPositionStyle.value = { left: `${centerLeft}px` };
            hoveredAppId.value = appId;
        }, 500);
    }
}

const handleMouseLeave = () => {
    if (showTimeout) {
        clearTimeout(showTimeout)
        showTimeout = null;
    }

    hideTimeout = window.setTimeout(() => {
        hoveredAppId.value = null;
    }, 150)
}

const toggleStartMenu = () => {
    console.log(showingStartMenu.value)
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
    window.addEventListener('mousedown', onGlobalMouseDown)
})

const onGlobalMouseDown = (e: MouseEvent) => {
    const isClickInsideMenu = (e.target as HTMLElement).closest('.start-menu')
    const isClickInsideAppFinder = (e.target as HTMLElement).closest('.app-finder')
    const isClickOnOrb = (e.target as HTMLElement).closest('.orb')

    if (!isClickInsideMenu && !isClickOnOrb) showingStartMenu.value = false
    if (!isClickInsideAppFinder) showingAppFinder.value = false
}

onUnmounted(() => {
    clearInterval(timer)
    window.removeEventListener('mousedown', onGlobalMouseDown)
})

const viewAppFinder = () => {
    toggleStartMenu();
    showingAppFinder.value = !showingAppFinder.value
}

const handleIconClick = (id: string) => {
    if (showTimeout) clearTimeout(showTimeout)
    hoveredAppId.value = null

    // Buscamos todas las ventanas de esta app
    const appWindows = os.state.windows.filter(w => w.appId === id)

    if (appWindows.length > 0) {
        // Si ya hay ventanas, enfocamos la que tenga el mayor zIndex (la que está arriba)
        const topWindow = appWindows.sort((a, b) => b.zIndex - a.zIndex)[0]
        
        // Si ya estaba enfocada y no estaba minimizada, quizás quieras minimizarla
        if (topWindow.isFocused && !topWindow.isMinimized) {
            os.minimizeWindow(topWindow.id)
        } else {
            os.bringToFront(topWindow.id)
        }
    } else {
        // Si no hay ventanas, lanzamos la app
        os.launchApp(id)
    }
}

const taskbarAppClosed = (id: string) => {
    if (hoveredAppId.value === id) {
        hoveredAppId.value = null
    }

    os.closeApp(id)
}

const onRightClickTrayIcon = (e: MouseEvent, id: string) => {
    const app = os.state.apps.find(app => app.manifest.id === id)
    if (!app) return

    openMenu(e, buildAppContextMenu(app, 'tray', os))
}

const onLeftClickTrayIcon = (e: MouseEvent, id: string, isSnippet: boolean) => {
    
    console.log('onLeftClickTrayIcon', id)

    const repo = 
        isSnippet == true ? 
        os.state.snippets :
        os.state.apps

    const app = repo.find(app => app.manifest.id === id)
    if (!app) return

    const actionId = app.manifest.capabilities?.tray?.defaultAction ?? 'open'

    const handler = 
        isSnippet ? 
        SnippetActionHandlers[app.manifest.id]?.[actionId] : 
        AppActionHandlers[app.manifest.id]?.[actionId]

    if(handler){
        handler({ app, context: 'tray', os })
    }
    else{
        isSnippet == true ? os.showSnippet(id) : os.launchApp(id)
    }
}

const isAppRunning = (appId: string) => {
    return os.state.windows.some(win => win.appId === appId);
}

const isAppFocused = (appId: string) => {
    return os.state.windows.some(win => win.appId === appId && win.isFocused);
}

</script>

<style scoped>
    @import '../styles/taskbar.css';
</style>

<template>
    <!--START MENU-->
    <Transition name="start-menu-fade">
        <Startmenu 
            v-show="showingStartMenu"
            :pinned-apps="pinnedStartApps"
            @shutdown="$emit('shutdown')"
            @close-startmenu="toggleStartMenu"
            @view-app-finder="viewAppFinder"
        />
    </Transition>

    <!--APP FINDER-->
    <Transition name="app-finder-fade">
        <AppFinder 
            v-show="showingAppFinder"
            @close-app-finder="showingAppFinder = false"
        />
    </Transition>

    <!--PREVIEW-->
    <Transition name="preview-fade">
        <div
            v-if="hoveredAppId && hoveredAppWindows.length > 0"
            class="window-preview-container"
            @mouseenter="handleMouseEnter(hoveredAppId, $event)"
            @mouseleave="handleMouseLeave"
            :style="previewPositionStyle"
        >
            <div 
                v-for="win in hoveredAppWindows" 
                :key="win.id" 
                class="window-preview-item"
            >
                <div class="preview-title">
                    <span>{{ win.title }}</span>
                    <i class="close-icon bi-x-lg" @click.stop="os.closeWindow(win.id)"></i>
                </div>
                
                <div class="preview-image" @click="os.bringToFront(win.id)">
                    <img :src="win.previewImg" v-if="win.previewImg" />
                    <div v-else class="preview-placeholder">No content</div>
                </div>
            </div>
        </div>
    </Transition>  

    <div class="taskbar">
        <div class="taskbar-elements" @contextmenu.self="contextMenuApps($event)">
            <div class="start-container">
                <div class="orb taskbar-btn"
                @click="toggleStartMenu"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-snow" viewBox="0 0 16 16">
                <path d="M8 16a.5.5 0 0 1-.5-.5v-1.293l-.646.647a.5.5 0 0 1-.707-.708L7.5 12.793V8.866l-3.4 1.963-.496 1.85a.5.5 0 1 1-.966-.26l.237-.882-1.12.646a.5.5 0 0 1-.5-.866l1.12-.646-.884-.237a.5.5 0 1 1 .26-.966l1.848.495L7 8 3.6 6.037l-1.85.495a.5.5 0 0 1-.258-.966l.883-.237-1.12-.646a.5.5 0 1 1 .5-.866l1.12.646-.237-.883a.5.5 0 1 1 .966-.258l.495 1.849L7.5 7.134V3.207L6.147 1.854a.5.5 0 1 1 .707-.708l.646.647V.5a.5.5 0 1 1 1 0v1.293l.647-.647a.5.5 0 1 1 .707.708L8.5 3.207v3.927l3.4-1.963.496-1.85a.5.5 0 1 1 .966.26l-.236.882 1.12-.646a.5.5 0 0 1 .5.866l-1.12.646.883.237a.5.5 0 1 1-.26.966l-1.848-.495L9 8l3.4 1.963 1.849-.495a.5.5 0 0 1 .259.966l-.883.237 1.12.646a.5.5 0 0 1-.5.866l-1.12-.646.236.883a.5.5 0 1 1-.966.258l-.495-1.849-3.4-1.963v3.927l1.353 1.353a.5.5 0 0 1-.707.708l-.647-.647V15.5a.5.5 0 0 1-.5.5z"/>
                </svg>               
                </div>
            </div>

            <div class="apps-container" @contextmenu.self="contextMenuApps($event)">
                <div 
                    :id="`taskbar-app-${app.manifest.id}`" 
                    class="app" 
                    v-for="app in taskBarApps" 
                    :key="app.manifest.id" 
                    @click="handleIconClick(app.manifest.id)"
                    @contextmenu.stop.prevent="onIconRightCLick($event, app)"
                >
                    <div 
                        class="taskbar-btn app-icon" 
                        :class="{ 
                            'running-app': isAppRunning(app.manifest.id), 
                            'focused-app': isAppFocused(app.manifest.id) 
                        }"
                        @mouseenter="handleMouseEnter(app.manifest.id, $event)"
                        @mouseleave="handleMouseLeave"
                    >
                        <IconManager                        
                            :id="app.manifest.id"
                            class="taskbar-icon-element"
                        />
                    </div>
                </div>
            </div>
            
            <div class="info-container">
                <Tray
                    :tray-apps="trayApps"
                    @left-click="({ e, id }) => onLeftClickTrayIcon(e, id, false)"
                    @right-click="({ e, id }) => onRightClickTrayIcon(e, id)"
                />

                <Tray
                    :tray-apps="traySnippets"
                    @left-click="({ e, id }) => onLeftClickTrayIcon(e, id, true)"
                    @right-click="({ e, id }) => onRightClickTrayIcon(e, id)"
                />

                <div class="taskbar-btn time-container">
                    <div>{{ currentTime }}</div>
                    <div>{{ currentDate }}</div>
                </div>
            </div>
        </div>
    </div>
</template>