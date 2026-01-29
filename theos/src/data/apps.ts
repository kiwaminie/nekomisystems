import type { AppConfig } from '../types'

export const apps: AppConfig[] = [
        {
            id: 'notepad',
            name: 'Notepad',
            icon: 'bi-journals',
            isOpen: false,
            isMinimized: false,
            isFocused: false,
            zIndex: 0,
            position: { x: 0, y: 0 },
            size: {
                width: 600,
                height: 400
            },
            isMaximized: false,
            tempSettings: {
                position: { x: 0, y: 0, },
                size: { width: 0, height: 0 }
            }
        },
        {
            id: 'calculator',
            name: 'Calculadora',
            icon: 'bi-calculator-fill',
            isOpen: false,
            isMinimized: false,
            isFocused: false,
            zIndex: 0,
            position: {
                x: 0,
                y: 0
            },
            size: {
                width: 600,
                height: 400
            },
            isMaximized: false,
            tempSettings: {
                position: { x: 0, y: 0, },
                size: { width: 0, height: 0 }
            }
        },
        {
            id: 'explorer',
            name: 'Archivos',
            icon: 'bi-folder-fill',
            isOpen: false,
            isMinimized: false,
            isFocused: false,
            zIndex: 0,
            position: {
                x: 0,
                y: 0
            },
            size: {
                width: 600,
                height: 400
            },
            isMaximized: false,
            tempSettings: {
                position: { x: 0, y: 0, },
                size: { width: 0, height: 0 }
            }
        },
        {
            id: 'music',
            name: 'Musica',
            icon: 'bi-music-note-beamed',
            isOpen: false,
            isMinimized: false,
            isFocused: false,
            zIndex: 0,
            position: {
                x: 0,
                y: 0
            },
            size: {
                width: 600,
                height: 400
            },
            isMaximized: false,
            tempSettings: {
                position: { x: 0, y: 0, },
                size: { width: 0, height: 0 }
            }
        },
        {
            id: 'spotify',
            name: 'Spotify',
            icon: 'bi-spotify',
            isOpen: false,
            isMinimized: false,
            isFocused: false,
            zIndex: 0,
            position: {
                x: 0,
                y: 0
            },
            size: {
                width: 600,
                height: 400
            },
            isMaximized: false,
            tempSettings: {
                position: { x: 0, y: 0, },
                size: { width: 0, height: 0 }
            },
            minSize: { width: 550, height: 400 },
            maxSize: { width: 0, height: 352 }
        },
        {
            id: 'bibootaxgame',
            name: 'Biboo Tax Game',
            icon: 'bi-controller',
            isOpen: false,
            isMinimized: false,
            isFocused: false,
            zIndex: 0,
            position: {
                x: 0,
                y: 0
            },
            size: {
                width: 1000,
                height: 750
            },
            isMaximized: false,
            tempSettings: {
                position: { x: 0, y: 0, },
                size: { width: 0, height: 0 }
            },
            minSize: { width: 1000, height: 750 },
            maxSize: { width: 0, height: 352 }
        },
        {
            id: 'doomgame',
            name: 'Doom Game',
            icon: '/games/doom/doom_icon.png',
            isOpen: false,
            isMinimized: false,
            isFocused: false,
            zIndex: 0,
            position: {
                x: 0,
                y: 0
            },
            size: {
                width: 640,
                height: 426
            },
            isMaximized: false,
            tempSettings: {
                position: { x: 0, y: 0, },
                size: { width: 0, height: 0 }
            },
            minSize: { width: 640, height: 426 },
            maxSize: { width: 0, height: 352 }
        }


]
    