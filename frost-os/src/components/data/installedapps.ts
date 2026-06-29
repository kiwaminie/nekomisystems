import type { Manifest } from './app'

export const InstalledApps: Manifest[] = [
    {
            id: 'notepad',
            name: 'Notepad',
    },
    {
        id: 'calculator',
        name: 'Calculadora'
    },
    {
        id: 'explorer',
        name: 'Archivos',
    },
    {
        id: 'music',
        name: 'Musica',
    },
    {
        id: 'spotify',
        name: 'Spotify',
        window: {
            defaultSize: { width: 1200, height: 800 },
        }
    },
    {
        id: 'bibootaxgame',
        name: 'Biboo Tax Game',
    },
    {
        id: 'doomgame',
        name: 'Doom Game',
    },
    {
        id: 'discord',
        name: 'Discord',
        preferences: {
            startInTray: true
        },
        capabilities: {
            tray:{ 
                canUse: true,
                defaultAction: 'open'
            }
        },
        menus:{
            taskbar: [
                { type: 'item', id: 'open', label: 'Abrir' },
                { type: 'item', id: 'new-window', label: 'Nueva Ventana' },
            ],
            tray:[
                { type: 'item', id: 'toggle-mute', label: 'Silenciar' }
            ]
        },
        window: {
            defaultSize: { width: 1500, height: 850 },
            surface: {
                mode: 'app-solid',
                app: { contentBg: '#0b0d12' }
            }
        }
    },
    {
        id: "mspaint",
        name: "Microsoft Paint",
        preferences: {
            startInTray: true
        },
        capabilities: {
            tray:{ 
                canUse: true,
                defaultAction: 'open'
            }
        },
        window: {
            defaultSize: { width: 1500, height: 850 },
            surface: {
                mode: 'app-solid',
                app: { contentBg: '#0b0d12' }
            }
        }
    },
    {
        id: 'desktopmiku',
        name: 'Desktop Miku',    
        snippet: {
            kind: "flyout",
            mount: "user"
        },
        window: {
            defaultSize: { width: 1500, height: 850 },
            startMaximized: true
        },
        capabilities: {
            tray:{ 
                canUse: true,
                defaultAction: 'open'
            },
            background: true
        },
        menus:{
            tray: [
                { type: 'item', id: 'view-config', label: 'Configuración' },
                { type: 'item', id: 'close', label: 'Cerrar' },
            ]            
        },
        preferences: {
            startInTray: false,
            minimizeToTray: true,
            closeToTray: true,
            startupWindow: "stealth"
        }
    },
    {
        id: "tetris",
        name: "Tetris",
        window: {
            defaultSize: { width: 520, height: 719 },
            minSize: { width: 520, height: 719 },
        }
    }
]
    