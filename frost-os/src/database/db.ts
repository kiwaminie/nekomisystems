import Dexie, { type Table } from 'dexie';

// --- Interfaces para los nuevos ajustes ---
export interface SystemSetting {
  key: string;   // ej: 'ui.wallpaper', 'miku.scale'
  value: any;
}

export interface Asset {
  id: string;
  name: string;
  data: Blob | File; // Para guardar imágenes reales
  type: string;
}

// --- Tus interfaces existentes ---
export interface AppState {
  id: string;
  isPinned: boolean;
  isPinnedStart: boolean;
  isPinnedDesktop: boolean;
}

export interface DesktopIconState {
  id: string;
  col: number;
  row: number;
}

export class TheOSDatabase extends Dexie {
  appSettings!: Table<AppState>;
  desktopIcons!: Table<DesktopIconState>;
  // Nuevas tablas
  systemSettings!: Table<SystemSetting>;
  assets!: Table<Asset>;

  constructor() {
    super('FROST_OS_ROOT');

    // Mantener versiones anteriores para compatibilidad
    this.version(1).stores({ appSettings: 'id' });
    this.version(2).stores({ appSettings: 'id', desktopIcons: 'id' });

    // VERSIÓN 3: Registro de sistema y Assets
    this.version(3).stores({
      appSettings: 'id',
      desktopIcons: 'id',
      systemSettings: 'key', // Clave primaria para ajustes rápidos
      assets: 'id, type'     // Indexamos por id y tipo para búsquedas rápidas
    });
  }
}

export const db = new TheOSDatabase();