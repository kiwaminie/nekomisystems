<script lang="ts" setup>
import { computed, ref } from "vue";
import { useSettingsStore } from "../../store";

const settings = useSettingsStore();

const handleWallpaperChange = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;

  try {
    await settings.updateWallpaper(file);
    console.log("Wallpaper actualizado con éxito");
  } catch (err) {
    console.error("Error al guardar el wallpaper:", err);
  }
};

type SettingsSection =
  | "system"
  | "bluetooth"
  | "network"
  | "personalization"
  | "apps"
  | "accounts"
  | "update";

const activeSection = ref<SettingsSection>("system");
const searchQuery = ref("");
const selectedWallpaper = ref("aurora");

const sections = [
  { id: "system", label: "Sistema", icon: "bi-display" },
  { id: "bluetooth", label: "Bluetooth y Dispositivos", icon: "bi-bluetooth" },
  { id: "network", label: "Red e Internet", icon: "bi-wifi" },
  { id: "personalization", label: "Personalización", icon: "bi-palette2" },
  { id: "apps", label: "Apps", icon: "bi-grid" },
  { id: "accounts", label: "Cuentas", icon: "bi-person-circle" },
  { id: "update", label: "Actualización", icon: "bi-arrow-repeat" },
] as const;

const wallpapers = [
  { id: "aurora", name: "Aurora Lake", className: "wall-aurora" },
  { id: "dusk", name: "Dusk Horizon", className: "wall-dusk" },
  { id: "nord", name: "Nord Summit", className: "wall-nord" },
  { id: "sunset", name: "Sunset Flow", className: "wall-sunset" },
  { id: "matrix", name: "Neon Grid", className: "wall-matrix" },
  { id: "clouds", name: "Cloud Drift", className: "wall-clouds" },
];

const activeMeta = computed(() => sections.find((s) => s.id === activeSection.value) ?? sections[0]);

const filteredSections = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  if (!query) return sections;
  return sections.filter((s) => s.label.toLowerCase().includes(query));
});
</script>

<template>
  <div class="settings-shell frst-bg-dark">
    <aside class="sidebar">
      <div class="profile-card glass-card">
        <div class="avatar">
          <i class="bi bi-person-fill"></i>
        </div>
        <div class="profile-meta">
          <strong>Nekomi User</strong>
          <small>Local account</small>
        </div>
      </div>

      <label class="search-box glass-card">
        <i class="bi bi-search"></i>
        <input class="" v-model="searchQuery" type="text" placeholder="Buscar ajustes..." />
      </label>

      <nav class="section-list">
        <button
          v-for="section in filteredSections"
          :key="section.id"
          class="section-btn"
          :class="{ active: activeSection === section.id }"
          @click="activeSection = section.id"
        >
          <i class="bi" :class="section.icon"></i>
          <span>{{ section.label }}</span>
          <i class="bi bi-chevron-right"></i>
        </button>
      </nav>
    </aside>

    <main class="main-area">
      <header class="main-header glass-card">
        <div>
          <h1>{{ activeMeta.label }}</h1>
          <p>Manage your mini OS preferences.</p>
        </div>
        <button class="quick-action">
          <i class="bi bi-magic"></i>
          <span>Quick assist</span>
        </button>
      </header>

      <section v-if="activeSection === 'system'" class="section-content">
        <div class="grid two">
          <article class="setting-card glass-card">
            <h3><i class="bi bi-cpu"></i> Device Specs</h3>
            <ul>
              <li>CPU: FrostCore v4</li>
              <li>RAM: 8 GB</li>
              <li>Storage: 256 GB SSD</li>
              <li>System type: 64-bit</li>
            </ul>
          </article>
          <article class="setting-card glass-card">
            <h3><i class="bi bi-battery-charging"></i> Power</h3>
            <div class="option-row"><span>Battery saver</span><div class="fake-switch on"></div></div>
            <div class="option-row"><span>Sleep after 15 minutes</span><i class="bi bi-chevron-right"></i></div>
            <div class="option-row"><span>Performance mode: Balanced</span><i class="bi bi-chevron-right"></i></div>
          </article>
        </div>
      </section>

      <section v-else-if="activeSection === 'bluetooth'" class="section-content">
        <div class="grid one">
          <article class="setting-card glass-card">
            <h3><i class="bi bi-bluetooth"></i> Bluetooth & devices</h3>
            <div class="option-row"><span>Bluetooth</span><div class="fake-switch on"></div></div>
            <div class="option-row"><span>Mouse - Connected</span><span class="state-pill ok">Connected</span></div>
            <div class="option-row"><span>Keyboard - Connected</span><span class="state-pill ok">Connected</span></div>
            <div class="option-row"><span>Add device</span><i class="bi bi-plus-circle"></i></div>
          </article>
        </div>
      </section>

      <section v-else-if="activeSection === 'network'" class="section-content">
        <div class="grid two">
          <article class="setting-card glass-card">
            <h3><i class="bi bi-wifi"></i> Wi-Fi</h3>
            <div class="option-row"><span>Wi-Fi</span><div class="fake-switch on"></div></div>
            <div class="option-row"><span>Connected network: NekomiNet</span><span class="state-pill ok">Secured</span></div>
            <div class="option-row"><span>Show available networks</span><i class="bi bi-chevron-right"></i></div>
          </article>
          <article class="setting-card glass-card">
            <h3><i class="bi bi-shield-lock"></i> VPN & Proxy</h3>
            <div class="option-row"><span>VPN</span><span class="state-pill">Off</span></div>
            <div class="option-row"><span>Manual proxy setup</span><span class="state-pill">Off</span></div>
            <div class="option-row"><span>Metered connection</span><div class="fake-switch"></div></div>
          </article>
        </div>
      </section>

      <section v-else-if="activeSection === 'personalization'" class="section-content">
        <div class="grid one">
          <article class="setting-card glass-card" style="gap: 10px;">
            
            <h3><i class="bi bi-image"></i>Wallpaper</h3>
            <p class="sub">Selecciona una imagen para el fondo del escritorio</p>

            <div v-if="settings.wallpaperUrl" class="preview">
              <img :src="settings.wallpaperUrl" alt="Preview" />
            </div>

            <div class="wallpaper-grid" style="display: none;">
              <button
                v-for="wall in wallpapers"
                :key="wall.id"
                class="wallpaper-item"
                :class="[wall.className, { selected: selectedWallpaper === wall.id }]"
                @click="selectedWallpaper = wall.id"
              >
                <span>{{ wall.name }}</span>
                <i v-if="selectedWallpaper === wall.id" class="bi bi-check-circle-fill"></i>
              </button>
            </div>

            <input 
              style="display: none;"
              id="wallpaper-upload"
              type="file" 
              accept="image/*" 
              @change="handleWallpaperChange"
            />

            <label for="wallpaper-upload" class="frst-file-input">
                <i class="icon-upload"></i> <!-- O el icono que uses -->
                Seleccionar imagen
            </label>

          </article>

          <article class="setting-card glass-card">
            <h3><i class="bi bi-palette"></i>Tema</h3>
            <div class="theme-swatches">
              <button class="swatch sw1"></button>
              <button class="swatch sw2"></button>
              <button class="swatch sw3"></button>
              <button class="swatch sw4"></button>
              <button class="swatch sw5"></button>
            </div>

            <p class="sub">Color de interfaz</p>

            <input type="color" v-model="settings.themeColor">

            <p class="sub">Intensidad del difuminado</p>

            <input type="range" v-model="settings.accentColor">


          </article>
        </div>
      </section>

      <section v-else-if="activeSection === 'apps'" class="section-content">
        <div class="grid two">
          <article class="setting-card glass-card">
            <h3><i class="bi bi-grid"></i> Installed apps</h3>
            <div class="option-row"><span>Default apps</span><i class="bi bi-chevron-right"></i></div>
            <div class="option-row"><span>Startup apps</span><i class="bi bi-chevron-right"></i></div>
            <div class="option-row"><span>Optional features</span><i class="bi bi-chevron-right"></i></div>
          </article>
          <article class="setting-card glass-card">
            <h3><i class="bi bi-bell"></i> App permissions</h3>
            <div class="option-row"><span>Notifications</span><div class="fake-switch on"></div></div>
            <div class="option-row"><span>Background apps</span><div class="fake-switch"></div></div>
            <div class="option-row"><span>File system access</span><div class="fake-switch on"></div></div>
          </article>
        </div>
      </section>

      <section v-else-if="activeSection === 'accounts'" class="section-content">
        <div class="grid two">
          <article class="setting-card glass-card">
            <h3><i class="bi bi-person-badge"></i> Your info</h3>
            <div class="option-row"><span>Name: Nekomi User</span><i class="bi bi-pencil-square"></i></div>
            <div class="option-row"><span>Password</span><i class="bi bi-chevron-right"></i></div>
            <div class="option-row"><span>Security options</span><i class="bi bi-chevron-right"></i></div>
          </article>
          <article class="setting-card glass-card">
            <h3><i class="bi bi-people"></i> Family & other users</h3>
            <div class="option-row"><span>Add account</span><i class="bi bi-plus-circle"></i></div>
            <div class="option-row"><span>Sync settings</span><div class="fake-switch on"></div></div>
          </article>
        </div>
      </section>

      <section v-else class="section-content">
        <div class="grid one">
          <article class="setting-card glass-card">
            <h3><i class="bi bi-arrow-repeat"></i> Updates</h3>
            <div class="option-row"><span>Last checked: Today, 10:24 AM</span><span class="state-pill ok">Up to date</span></div>
            <div class="option-row"><span>Pause updates</span><div class="fake-switch"></div></div>
            <div class="option-row"><span>Advanced options</span><i class="bi bi-chevron-right"></i></div>
            <button class="cta">
              <i class="bi bi-download"></i>
              <span>Check for updates</span>
            </button>
          </article>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.preview img {
  width: 200px;
  height: auto;
  border-radius: 8px;
  margin-top: 10px;
  border: 1px solid rgba(255,255,255,0.2);
}

.settings-shell {
  height: 100%;
  width: 100%;
  display: grid;
  grid-template-columns: 300px 1fr;
  /*background:
    radial-gradient(120% 100% at 0% 0%, rgba(255, 255, 255, 0.11), transparent 60%),
    linear-gradient(155deg, rgba(33, 36, 46, 0.52), rgba(18, 20, 28, 0.72));*/
  color: rgba(255, 255, 255, 0.92);
}

.glass-card {
  background: var(--frst-bg-light) /*rgba(255, 255, 255, 0.08)*/;
  backdrop-filter: var(--frst-blur-normal);
  -webkit-backdrop-filter: blur(18px);
  border-radius: 6px;
}

.sidebar {
  padding: 12px;
  border-right: 1px solid rgba(255, 255, 255, 0.12);
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 0;
}

.profile-card {
  padding: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.avatar {
  width: 38px;
  height: 38px;
  border-radius: 999px;
  background: linear-gradient(140deg, rgba(102, 189, 255, 0.65), rgba(132, 109, 255, 0.72));
  display: grid;
  place-items: center;
}

.profile-meta {
  display: flex;
  flex-direction: column;
}

.profile-meta strong {
  font-size: 13px;
}

.profile-meta small {
  color: rgba(255, 255, 255, 0.7);
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
  padding: 0 10px;
  height: 38px;
}

.search-box i {
  color: rgba(255, 255, 255, 0.72);
}

.search-box input {
  flex: 1;
  margin-left: 8px;
  border: 0;
  background: transparent;
  color: inherit;
  outline: none;
}

.section-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  overflow: auto;
  min-height: 0;
  padding-right: 2px;
}

.section-btn {
  border: 1px solid transparent;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 10px;
  color: inherit;
  display: grid;
  grid-template-columns: 18px 1fr 12px;
  gap: 10px;
  align-items: center;
  height: 40px;
  text-align: left;
  padding: 0 12px;
  cursor: pointer;
}

.section-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.section-btn.active {
  background: linear-gradient(140deg, rgba(118, 193, 255, 0.28), rgba(144, 123, 255, 0.28));
  border-color: rgba(149, 205, 255, 0.6);
}

.main-area {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 0;
}

.main-header {
  padding: 14px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.main-header h1 {
  margin: 0;
  font-size: 24px;
}

.main-header p {
  margin: 4px 0 0;
  color: rgba(255, 255, 255, 0.72);
  font-size: 13px;
}

.quick-action {
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.12);
  color: inherit;
  border-radius: 10px;
  height: 34px;
  padding: 0 12px;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  cursor: pointer;
}

.section-content {
  flex: 1;
  min-height: 0;
  overflow: auto;
}

.grid {
  display: grid;
  gap: 10px;
}

.grid.one {
  grid-template-columns: 1fr;
}

.grid.two {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.setting-card {
  padding: 14px;
}

.setting-card h3 {
  margin: 0 0 10px;
  font-size: 15px;
  display: inline-flex;
  gap: 8px;
  align-items: center;
}

.setting-card .sub {
  margin: -3px 0 10px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.72);
}

.option-row {
  min-height: 40px;
  padding: 0 10px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  margin-bottom: 8px;
}

.option-row:last-child {
  margin-bottom: 0;
}

.fake-switch {
  width: 40px;
  height: 22px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.28);
  background: rgba(255, 255, 255, 0.14);
  position: relative;
}

.fake-switch::before {
  content: "";
  position: absolute;
  width: 16px;
  height: 16px;
  left: 2px;
  top: 2px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.92);
}

.fake-switch.on {
  background: rgba(97, 179, 255, 0.45);
  border-color: rgba(159, 213, 255, 0.8);
}

.fake-switch.on::before {
  left: 20px;
}

.state-pill {
  font-size: 11px;
  border-radius: 999px;
  padding: 3px 8px;
  background: rgba(255, 255, 255, 0.12);
}

.state-pill.ok {
  background: rgba(56, 201, 138, 0.3);
  border: 1px solid rgba(96, 228, 166, 0.4);
}

.wallpaper-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.wallpaper-item {
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 11px;
  height: 88px;
  position: relative;
  color: white;
  text-align: left;
  padding: 8px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  cursor: pointer;
  overflow: hidden;
}

.wallpaper-item span {
  font-size: 12px;
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.5);
}

.wallpaper-item i {
  font-size: 15px;
}

.wallpaper-item.selected {
  border-color: rgba(156, 214, 255, 0.95);
  box-shadow: inset 0 0 0 1px rgba(156, 214, 255, 0.95);
}

.wall-aurora {
  background: linear-gradient(140deg, #0e345f, #1d6fb1 40%, #3bc7a3);
}

.wall-dusk {
  background: linear-gradient(145deg, #2c1f54, #7446b8 45%, #ff8199);
}

.wall-nord {
  background: linear-gradient(140deg, #27303f, #5b6f87 42%, #9ec3d6);
}

.wall-sunset {
  background: linear-gradient(145deg, #3e1f12, #b45f2e 46%, #ffcf67);
}

.wall-matrix {
  background:
    radial-gradient(circle at 20% 20%, rgba(89, 255, 186, 0.4), transparent 35%),
    linear-gradient(145deg, #0e1b23, #0f2d2e 50%, #12413f);
}

.wall-clouds {
  background: linear-gradient(145deg, #5d79a3, #8ab0d2 48%, #d4e7f5);
}

.theme-swatches {
  display: flex;
  gap: 8px;
}

.swatch {
  width: 30px;
  height: 30px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  cursor: pointer;
}

.sw1 {
  background: #4ca5ff;
}

.sw2 {
  background: #8f63ff;
}

.sw3 {
  background: #08b08d;
}

.sw4 {
  background: #ff9b41;
}

.sw5 {
  background: #ec5d86;
}

.cta {
  margin-top: 10px;
  height: 36px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 10px;
  background: linear-gradient(140deg, rgba(91, 170, 255, 0.4), rgba(125, 109, 255, 0.45));
  color: inherit;
  padding: 0 12px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

@media (max-width: 1100px) {
  .settings-shell {
    grid-template-columns: 250px 1fr;
  }

  .grid.two {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 780px) {
  .settings-shell {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
  }

  .sidebar {
    border-right: 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.12);
  }

  .section-list {
    max-height: 200px;
  }

  .wallpaper-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
