import { AppStorage } from '../../database/app_storage';
import { MenuItemDescriptor, AppMenuContext } from '../data/types'

type SnippetKind = "flyout" | "widget"

export interface App{
    manifest: Manifest,
    views: Record<string, any>,
    runtime: Runtime,
    user: UserSettings
}

export interface Manifest{
    id: string;
    name: string;
    icon?: string;

    snippet?:{
        kind: SnippetKind;
        mount: "boot" | "onDemand" | "user";
    }

    window?:{
        defaultSize: { 
            width: number 
            height: number 
        }
        minSize?: {
            width: number
            height: number 
        }
        maxSize?: { 
            width: number 
            height: number 
        }
        startMaximized?: boolean
        frameBg?: string
        frameBlur?: string
        surface?: WindowSurface
    }

    capabilities?: {
        tray?: {
            canUse?: boolean
            defaultAction?: string
        }
        background?: boolean
        notifications?: boolean
    }

    preferences?:{
        minimizeToTray?: boolean
        closeToTray?: boolean
        startInTray?: boolean
        startupWindow?: "maximized" | "minimized" | "stealth"
    }

    transition?: string

    menus?: Partial<Record<AppMenuContext, MenuItemDescriptor[]>>
}

export interface Runtime{
    isRunning: boolean;
    isMounted?: boolean,
    isVisible?: boolean,

    isWindowOpen: boolean;
    tempSettings?: {
        position: { x:number; y:number; };    
        size: { width: number; height: number; };
    };

    isInTray: boolean;
    trayBadge?: number | boolean;
    trayStatus?: 'normal' | 'active' | 'warning' | 'error'

    previewImg? : string,

    stats?: RuntimeStats,

    storage?: IAppStorage
}

export interface IAppStorage {
  get: (key: string, defaultValue?: any) => Promise<any>;
  set: (key: string, value: any) => Promise<void>;
  delete: (key: string) => Promise<void>;
  getAll: () => Promise<any[]>;
}

export interface WindowInstance {
    id: string;
    pid: string;
    appId: string;
    isMain: boolean;
    parentWinId?: string;
    view?: string;
    title: string;
    
    hideFromTaskbar?: boolean;
    isMinimized: boolean;
    isMaximized: boolean;
    isFocused: boolean;
    zIndex: number;  
    
    // --- ESTADO ACTIVO (Lo que se renderiza siempre) ---
    position: { x: number; y: number };
    size: { width: number; height: number };

    // --- RESPALDO (Solo existe cuando isMaximized es true) ---
    tempSettings?: {
        position: { x: number; y: number };
        size: { width: number; height: number };
    };

    previewImg?: string;
    params?: any;
}

export interface RuntimeStats{
    startedAt: number
    cpuMsWindow: number
    cpuMsLast5s: number
    cpuWindowStartedAt: number
    memScore: number
    lastMemSampleAt: number
}

export interface UserSettings{
    isPinned: boolean,
    isPinnedStart: boolean,
    isPinnedDesktop: boolean,

    overrides?:{
        minimizeToTray?: boolean
        closeToTray?: boolean
        startInTray?: boolean
    }
}

export type WindowSurfaceMode = 
    | 'os-glass'      // Frost OS pinta fondo (blur/glass)
    | 'app-solid'     // App pinta su fondo (opaco)
    | 'app-transparent'; // App pinta pero transparente (overlay)

export interface WindowSurface{
    mode: WindowSurfaceMode,

    os?: {
        frameBg?: string
        frameBlur?: string
        contentBg?: string
    }

    app?: {
        contentBg?: string
        textColor?: string
    }
}