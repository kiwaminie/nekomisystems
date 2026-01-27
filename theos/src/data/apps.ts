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
        }
]
    