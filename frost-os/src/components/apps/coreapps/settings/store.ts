import { defineStore } from 'pinia';
import { ref } from 'vue';
import { db } from '../../../../database/db'; // Tu archivo de Dexie

export const useSettingsStore = defineStore('settings', () => {
  const DEFAULT_WALLPAPER_URL = '/wallpapers/default-wallpaper.jpg';

  const wallpaperUrl = ref<string>(DEFAULT_WALLPAPER_URL);
  const isCustomWallpaper = ref(false);

  function revokeIfCustom(url: string) {
    if (url && url !== DEFAULT_WALLPAPER_URL) {
      URL.revokeObjectURL(url);
    }
  }

  // Cargar el wallpaper guardado al iniciar
  async function loadSettings() {
    const setting = await db.systemSettings.get('ui.wallpaper');
    if (setting) {
      // Si guardamos un ID de asset, buscamos el blob
      const asset = await db.assets.get(setting.value);
      if (asset) {
        revokeIfCustom(wallpaperUrl.value);
        wallpaperUrl.value = URL.createObjectURL(asset.data);
        isCustomWallpaper.value = true;
        return;
      }
      // El setting apunta a un asset que ya no existe; limpiar
      await db.systemSettings.delete('ui.wallpaper');
    }
    revokeIfCustom(wallpaperUrl.value);
    wallpaperUrl.value = DEFAULT_WALLPAPER_URL;
    isCustomWallpaper.value = false;
  }

  async function updateWallpaper(file: File) {
    const id = `wp-${Date.now()}`;

    // 1. Guardar el archivo real (Blob) en la tabla de assets
    await db.assets.put({
      id: id,
      name: file.name,
      data: file, // File es un tipo de Blob, Dexie lo guarda directo
      type: 'wallpaper'
    });

    // 2. Guardar la referencia en los ajustes del sistema
    await db.systemSettings.put({ key: 'ui.wallpaper', value: id });

    // 3. Actualizar la URL reactiva para la UI
    // Limpiamos la URL anterior para evitar fugas de memoria
    revokeIfCustom(wallpaperUrl.value);
    wallpaperUrl.value = URL.createObjectURL(file);
    isCustomWallpaper.value = true;
  }

  async function resetWallpaperToDefault() {
    const setting = await db.systemSettings.get('ui.wallpaper');
    if (setting) {
      await db.assets.delete(setting.value);
      await db.systemSettings.delete('ui.wallpaper');
    }
    revokeIfCustom(wallpaperUrl.value);
    wallpaperUrl.value = DEFAULT_WALLPAPER_URL;
    isCustomWallpaper.value = false;
  }

  return { wallpaperUrl, isCustomWallpaper, updateWallpaper, resetWallpaperToDefault, loadSettings };
});
