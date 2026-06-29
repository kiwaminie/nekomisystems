import { reactive, nextTick } from 'vue'

import type { App, Manifest, UserSettings, RuntimeStats, WindowInstance } from '../data/app'
import { createApp } from '../data/create_app'

import { InstalledApps } from '../data/installedapps'
import { CoreApps } from '../data/core_apps.ts'

import { CoreSnippets } from '../data/core_snippets.ts'
import { InstalledSnippets } from '../data/installed_snippets.ts'

import { AppStorage } from "../../database/app_storage.ts"

import { startStatsSampler, measureCpu } from './process_stats'

import { db } from '../../database/db.ts'
import html2canvas from 'html2canvas';

import { useSettingsStore } from '../apps/coreapps/settings/store.ts'

export const state = reactive({
    apps: [] as App[],
    windows: [] as WindowInstance[],
    snippets: [] as App[],
    topZ: 100,
    lastAction: 'window-spawn'
})

let initialized = false

async function init() {
    if (initialized) return
    initialized = true

    const manifests: Manifest[] = [...CoreApps, ...InstalledApps]
    const snippets: Manifest[] = [...CoreSnippets, ...InstalledSnippets]

    const userMap = await loadUserSettingsMap()
    const snippetsMap = await loadUserSettingsMap()

    state.snippets = snippets.map(m => createApp(m, snippetsMap.get(m.id)))
    state.apps = manifests.map(m => createApp(m, userMap.get(m.id)))

    startStatsSampler(state)

    // Inicialización de tray apps
    for (const app of state.apps) {
            const canUseTray = app.manifest.capabilities?.tray?.canUse;
            const shouldStartInTray = app.user.overrides?.startInTray ?? app.manifest.preferences?.startInTray;

            if (shouldStartInTray && canUseTray) {

                app.runtime.isRunning = true;
                app.runtime.isInTray = true;
                
                app.runtime.storage = new AppStorage(app.manifest.id);
                
                app.runtime.stats = initStats();
                
                const startupMode = app.manifest.preferences?.startupWindow;

                // CASO 1: Tray + Minimizada en Taskbar
                if (startupMode === 'minimized') {
                    createWindow(app.manifest.id, { 
                        isMinimized: true 
                    });
                }
                // CASO 2: Tray + Abierta (Sin Taskbar) - Útil para Widgets/Miku
                else if (startupMode === 'stealth') {
                    createWindow(app.manifest.id,{ 
                        hideFromTaskbar: true, 
                        isMinimized: true 
                    });
                }
            }
    }

    for (const snippet of state.snippets) {
        if (snippet.manifest.snippet?.mount === "boot") {
            snippet.runtime.isRunning = true;
            snippet.runtime.isMounted = true;

            snippet.runtime.storage = new AppStorage(snippet.manifest.id);
        }
    }

    async function loadUserSettingsMap() {
        const rows = await db.appSettings.toArray()
        const map = new Map<string, Partial<UserSettings>>()
        for (const r of rows) {
            map.set(r.id, {
                isPinned: r.isPinned,
                isPinnedStart: r.isPinnedStart,
                isPinnedDesktop: r.isPinnedDesktop,
            })
        }
        return map
    }

    useSettingsStore().loadSettings()
}

const createWindow = (appId: string, options: any = {}, parentWinId?: string) => {
        const app = state.apps.find(a => a.manifest.id === appId);
        if (!app) return null;

        // 1. Determinar el PID
        let pid: string;
        if (parentWinId) {
            const parentWin = state.windows.find(w => w.id === parentWinId);
            pid = parentWin ? parentWin.pid : `proc-${Math.random().toString(36).slice(2, 9)}`;
        } else {
            pid = `proc-${Math.random().toString(36).slice(2, 9)}`;
        }

        const winId = `win-${Math.random().toString(36).slice(2, 9)}`;

        // --- NUEVA LÓGICA DE TAMAÑO ---
        // Extraemos width/height de options.params si existen, si no, del manifest, si no, default
        const finalWidth = options.params?.width ?? app.manifest.window?.defaultSize?.width ?? 600;
        const finalHeight = options.params?.height ?? app.manifest.window?.defaultSize?.height ?? 400;
        
        const finalSize = { width: finalWidth, height: finalHeight };

        // --- NUEVA LÓGICA DE POSICIÓN ---
        const offset = state.windows.length * 25;
        const initialPosition = {
            x: options.params?.x ?? ((window.innerWidth - finalSize.width) / 2 + offset),
            y: options.params?.y ?? ((window.innerHeight - finalSize.height) / 2 + offset)
        };

        const newWindow: WindowInstance = {
            id: winId,
            pid: pid,
            appId: appId,
            parentWinId: parentWinId,
            // Usamos options.title si existe, si no options.view, si no el nombre de la app
            title: options.title || (options.view === 'Config' ? 'Configuración' : app.manifest.name),
            view: options.view || 'Main', 
            isMain: !parentWinId,
            isMinimized: options.isMinimized || false,
            hideFromTaskbar: options.params?.hideFromTaskbar || false,
            isMaximized: false,
            isFocused: true,
            zIndex: ++state.topZ,
            position: initialPosition,
            size: finalSize, // <--- Ahora sí usa el tamaño procesado
            params: options.params || {}, // <--- Guardamos los params limpios
            tempSettings: undefined
        };

        state.windows.push(newWindow);
        bringToFront(winId);
        
        return newWindow;
}

const togglePinApp = async (id: string) => {
        const app = state.apps.find(a => a.manifest.id === id)
        if(app){
            app.user.isPinned = !app.user.isPinned
            await db.appSettings.put({ 
                id: id, 
                isPinnedStart: app.user.isPinnedStart,
                isPinned: app.user.isPinned,
                isPinnedDesktop: app.user.isPinnedDesktop 
            })
        }
}

const togglePinAppStart = async (id: string) => {
        const app = state.apps.find(a => a.manifest.id === id)
        if(app){
            app.user.isPinnedStart = !app.user.isPinnedStart
            await db.appSettings.put({ 
                id: id,
                isPinned: app.user.isPinned,
                isPinnedStart: app.user.isPinnedStart,
                isPinnedDesktop: app.user.isPinnedDesktop 
            })
        }
}

const launchApp = async (appId: string, params = {}, parentWinId?: string) => {
        const app = state.apps.find(a => a.manifest.id === appId);
        if (!app) return;

        if (!app.runtime.isRunning) {

            //INICIAR PROCESO
            app.runtime.isRunning = true;

            app.runtime.storage = new AppStorage(appId);

            //ensureStats(app)
        }

        return createWindow(appId, params, parentWinId);
}

const closeWindow = (winId: string) => {
        const win = state.windows.find(w => w.id === winId);
        if (!win) return;

        const children = state.windows.filter(w => w.parentWinId === winId);
        children.forEach(child => closeWindow(child.id));

        state.windows = state.windows.filter(w => w.id !== winId);

        if (win.isMain) {
            const siblingWindows = state.windows.filter(w => w.pid === win.pid);
            siblingWindows.forEach(s => closeWindow(s.id));
            checkProcessTermination(win.appId);
        }
}

const checkProcessTermination = (appId: string) => {
        const stillHasWindows = state.windows.some(w => w.appId === appId);
        if (!stillHasWindows) {
            const app = state.apps.find(a => a.manifest.id === appId);
            if (app) app.runtime.isRunning = false;
        }
}

const closeApp = (appId: string) => {
        state.windows = state.windows.filter(w => w.appId !== appId)
        const app = state.apps.find(a => a.manifest.id === appId)
        if (app) app.runtime.isRunning = false
}

const bringToFront = (winId: string) => {
        const win = state.windows.find(w => w.id === winId)
        if (!win) return

        state.windows.forEach(w => w.isFocused = false)
        state.topZ++
        win.zIndex = state.topZ
        win.isFocused = true
        win.isMinimized = false
}

const minimizeWindow = async (winId: string) => {
        const win = state.windows.find(w => w.id === winId)
        if (win) {
            state.lastAction = 'window-minimize'
            await nextTick()
            win.isMinimized = true
            win.isFocused = false
            
            const nextWin = [...state.windows]
                .filter(w => !w.isMinimized && w.id !== winId)
                .sort((a, b) => b.zIndex - a.zIndex)[0]
            if (nextWin) bringToFront(nextWin.id)
        }
}

const maximizeWindow = (winId: string) => {
        const win = state.windows.find(w => w.id === winId);
        if (!win) return;

        if (!win.isMaximized) {
            // 1. GUARDAR: Copiamos el estado ACTIVO al respaldo (tempSettings)
            win.tempSettings = {
                position: { ...win.position },
                size: { ...win.size }
            };

            // 2. MAXIMIZAR: Forzamos el estado activo a "pantalla completa"
            win.position = { x: 0, y: 0 };
            // Ajusta el '48' a la altura real de tu taskbar
            win.size = { width: window.innerWidth, height: window.innerHeight - 48 }; 
            
            win.isMaximized = true;
        } else {
            // 1. RESTAURAR: Devolvemos los valores guardados al estado ACTIVO
            if (win.tempSettings) {
                win.position = { ...win.tempSettings.position };
                win.size = { ...win.tempSettings.size };
            }

            // 2. LIMPIAR: Marcamos como no maximizado y borramos el respaldo
            win.isMaximized = false;
            win.tempSettings = undefined; 
        }
}

// Esta función es para cuando arrastras el header estando maximizado
const unmaximizeAtPosition = (winId: string, newX: number) => {
        const win = state.windows.find(w => w.id === winId);
        if (!win || !win.isMaximized || !win.tempSettings) return;

        // Calculamos el porcentaje donde el mouse estaba en la ventana maximizada
        // para que al encogerse, el mouse siga "agarrando" el mismo sitio (aprox)
        const ratio = newX / window.innerWidth;
        const restoredWidth = win.tempSettings.size.width;
        
        win.isMaximized = false;
        win.tempSettings.size = { ...win.tempSettings.size };
        
        // Reposicionamos la ventana para que el mouse quede centrado en el drag
        win.tempSettings.position = {
            x: newX - (restoredWidth * ratio), 
            y: 0 // Lo mantenemos arriba para que siga el drag
        };
}

const updatePreviewImage = async (winId: string) => {
        const win = state.windows.find(w => w.id === winId);
        if (!win) return; // Ahora winId será win-xyz, no spotify

        const el = document.getElementById(`window-content-${winId}`);
        if (!el || win.isMinimized) return;

        try {
            const canvas = await html2canvas(el, {
                backgroundColor: null,
                scale: 0.3,
                logging: false,
                useCORS: true
            });
            win.previewImg = canvas.toDataURL('image/webp', 0.1);
        } catch (err) {
            console.error("Error capturando preview:", err);
        }
}

const showSnippet = async (id: string) => {
        const s = state.snippets.find(a => a.manifest.id === id)
        if(!s) return
        s.runtime.isRunning = true
        ensureStats(s)
        if (!s.runtime.stats!.startedAt) s.runtime.stats!.startedAt = Date.now()
        s.runtime.isMounted = true
        s.runtime.isVisible = false
        await nextTick()
        requestAnimationFrame(() => { s.runtime.isVisible = true })
}

const hideSnippet = (id: string) => {
        const s = state.snippets.find(a => a.manifest.id === id)
        if(!s) return
        s.runtime.isVisible = false
}

const unmountSnippet = (id: string) => {
        const s = state.snippets.find(a => a.manifest.id === id)
        if(!s) return
        s.runtime.isMounted = false
}

const measure = <T>(id: string, fn: () => T | Promise<T>) => {
        const app = state.apps.find(a => a.manifest.id === id)
            ?? state.snippets.find(s => s.manifest.id === id)
        if (!app) return Promise.resolve(fn() as any)
        ensureStats(app)
        return measureCpu(app, fn)
}

export const processInstructions = () => {    
    init().catch(err => console.error(err))

    return { 
        state,
        launchApp: (id: string, params = {}, parentWinId?: string) => launchApp(id, params, parentWinId),
        bringToFront: (winId: string) => bringToFront(winId), 
        closeApp: (id: string) => closeApp(id), 
        closeWindow: (winId: string) => closeWindow(winId),
        createWindow: (id: string, params = {}, parentWinId?: string) => createWindow(id, params, parentWinId),
        minimizeWindow: (winId: string) => minimizeWindow(winId), 
        maximizeWindow: (winId: string) => maximizeWindow(winId), 
        togglePinApp: (id: string) => togglePinApp(id), 
        togglePinAppStart: (id: string) => togglePinAppStart(id),
        showSnippet: (id: string) => showSnippet(id),
        hideSnippet: (id: string) => hideSnippet(id),
        unmountSnippet: (id: string) => unmountSnippet(id),
        measure: <T>(id: string, fn: () => T | Promise<T>) => measure(id, fn),
        updatePreviewImage: (winId: string) => updatePreviewImage(winId)
    }
}

function ensureStats(proc: App) {
    if (!proc.runtime.stats) {
        proc.runtime.stats = initStats()
    }
}    

function initStats(): RuntimeStats {
    const now = Date.now()
    return {
        startedAt: now,
        cpuMsWindow: 0,
        cpuMsLast5s: 0,
        cpuWindowStartedAt: now,
        memScore: 0,
        lastMemSampleAt: 0,
    }
}