import { db } from './db'; // Tu TheOSDatabase principal

export class AppStorage {
  private appId: string;

  constructor(appId: string) {
    this.appId = appId;
  }

  // Guardar un ajuste simple (Key-Value)
  async set(key: string, value: any) {
    // Usamos un prefijo para evitar que una app pise a otra
    const internalKey = `app:${this.appId}:${key}`;
    await db.systemSettings.put({ key: internalKey, value });
  }

  // Obtener un ajuste
  async get(key: string, defaultValue: any = null) {
    const internalKey = `app:${this.appId}:${key}`;
    const result = await db.systemSettings.get(internalKey);
    return result ? result.value : defaultValue;
  }

  // Eliminar un ajuste
  async delete(key: string) {
    const internalKey = `app:${this.appId}:${key}`;
    await db.systemSettings.delete(internalKey);
  }

  // Obtener todos los ajustes de ESTA app (útil para el inicio)
  async getAll() {
    return await db.systemSettings
      .where('key')
      .startsWith(`app:${this.appId}:`)
      .toArray();
  }
}