// ─────────────────────────────────────────────────────────────────────────────
//  TYPES
// ─────────────────────────────────────────────────────────────────────────────
export interface Technology {
  name: string
  /** Devicon CDN URL, local asset URL, or Material Symbols icon name */
  icon?: string
  class?: string
}

export interface Project {
  id: string
  title: string
  /** Shown as filter chip and badge (e.g. "Web App", "Juego", "Herramienta") */
  category: string
  /** One-line teaser for the catalog card */
  summary: string
  /** Full text shown in the detail view */
  description: string
  /** Hero / main image — import as Vite module or use a /public URL */
  image: string
  /** Additional screenshots shown in the horizontal preview gallery */
  previews: string[]
  technologies: Technology[]
  cta: {
    /** Button label: "Ver", "Jugar", "Leer", "Iniciar", … */
    label: string
    /** Material Symbols icon name rendered next to the label */
    icon: string
    url: string
  }
  /** Controls the colored status badge on each card */
  status: 'live' | 'wip' | 'archived'
}

// ─────────────────────────────────────────────────────────────────────────────
//  IMAGES  (imported as Vite modules → hashed in production builds)
// ─────────────────────────────────────────────────────────────────────────────

import mikurigImg  from '@/index/previews/mikurig_preview.png'
import mangaImg    from '@/index/previews/1 izq.jpg'
import bibooImg    from '../../bibootaxgame/src/characters/biboo.png'
import nekodriveImg from '/wallpapers/nekodrive-bg.png'

// Frost OS wallpaper lives in /public — referenced as a static URL.
const frostImg = '/wallpapers/default-wallpaper.jpg'

// ─────────────────────────────────────────────────────────────────────────────
//  PROJECTS  — Edit freely. Order = display order in catalog.
// ─────────────────────────────────────────────────────────────────────────────
export const PROJECTS: Project[] = [
  {
    id: 'frost-os',
    title: 'Frost OS',
    category: 'Web App',
    summary: 'Sistema operativo ficticio que corre completamente en el navegador.',
    description:
      'Frost OS es una simulación de sistema operativo de escritorio construida completamente en Vue 3. Cuenta con gestión de ventanas arrastrables, un sistema de archivos virtual persistido con IndexedDB/Dexie, aplicaciones integradas, personalización de escritorio y más. Un proyecto ambicioso que explora los límites de las tecnologías web modernas.',
    image: frostImg,
    previews: [],
    technologies: [
      { name: 'Vue.js',      icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vuejs/vuejs-original.svg' },
      { name: 'TypeScript',  icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg' },
      { name: 'Pinia',       icon: 'storage' },
      { name: 'Bootstrap',   icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/bootstrap/bootstrap-original.svg' },
      { name: 'IndexedDB',   icon: 'database' },
    ],
    cta: { label: 'Iniciar', icon: 'power_settings_new', url: '/frost-os/' },
    status: 'live',
  },
  {
    id: 'mikurig',
    title: 'Hatsune Miku Rigging',
    category: 'Web App',
    summary: 'Sistema de rigging 3D interactivo de Miku construido sobre Three.js.',
    description:
      'Un experimento de animación 3D en el navegador usando Three.js. Permite interactuar con el modelo de Hatsune Miku, manipular sus articulaciones y explorar la física del rigging en tiempo real. Un proyecto de pasión que fusiona cultura pop y programación gráfica avanzada.',
    image: mikurigImg,
    previews: [],
    technologies: [
      { name: 'Three.js',    class: 'devicon-threejs-original' },
      { name: 'JavaScript',  icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg' },
      { name: 'WebGL',       icon: 'texture' },
    ],
    cta: { label: 'Ver', icon: 'open_in_new', url: '/mikurig/' },
    status: 'wip',
  },
  {
    id: 'manga-reader',
    title: 'Katana of Hell',
    category: 'Web App',
    summary: 'Lector interactivo del manga original "Katana of Hell".',
    description:
      'Un lector de manga construido con Vue 3 para explorar el manga original "Katana of Hell". Cuenta con navegación por tomos, visor de páginas, índice de personajes y enciclopedia del lore del universo. Diseñado para una experiencia de lectura inmersiva y moderna.',
    image: mangaImg,
    previews: [],
    technologies: [
      { name: 'Vue.js',      icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vuejs/vuejs-original.svg' },
      { name: 'TypeScript',  icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg' },
      { name: 'Vite',        icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/vitejs/vitejs-original.svg' },
    ],
    cta: { label: 'Leer', icon: 'menu_book', url: '/manga_reader/' },
    status: 'live',
  },
  {
    id: 'biboo-tax',
    title: 'Biboo Tax Game',
    category: 'Juego',
    summary: 'Mini-juego de recaudación de impuestos protagonizado por Biboo.',
    description:
      'Un videojuego de navegador hecho por diversión protagonizado por Biboo, la adorable VTuber de hololive. Ayúdala a cobrar impuestos a los ciudadanos del reino. Un homenaje cómico al género de gestión/clicker, lleno de humor y referencias de la cultura VTuber.',
    image: bibooImg,
    previews: [],
    technologies: [
      { name: 'JavaScript',  icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg' },
      { name: 'HTML5',       icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg' },
      { name: 'CSS3',        icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg' },
    ],
    cta: { label: 'Jugar', icon: 'sports_esports', url: '/bibootaxgame/' },
    status: 'wip',
  },
  {
    id: 'nekodrive',
    title: 'NekoDrive',
    category: 'Self-hosted Server Platform',
    summary: 'Plataforma de servidor auto-hospedada para gestionar y compartir archivos.',
    description:
      'Una plataforma de servidor auto-hospedada diseñada para facilitar la gestión y el intercambio de archivos entre usuarios. Cuenta con una interfaz intuitiva y funcionalidades avanzadas para optimizar la experiencia del usuario.',
    image: nekodriveImg,
    previews: [],
    technologies: [
      { name: "Nextcloud",   icon: 'https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/png/nextcloud-blue.png' },
      { name: 'Node.js',     icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg' },
      { name: 'MariaDB',     icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/mariadb/mariadb-original.svg' },
      { name: "Windows Server",   icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/windows11/windows11-original.svg' },
      { name: "Docker",   icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/docker/docker-plain.svg' },
    ],
    cta: { label: 'Ir', icon: 'open_in_new', url: 'https://drive.nekomisystems.com' },
    status: 'live',
  }
]

// ─────────────────────────────────────────────────────────────────────────────
//  UI CONFIG
// ─────────────────────────────────────────────────────────────────────────────
export const CONFIG = {
  /** Company/brand name shown in the navbar — links to homeUrl */
  brand:   'NekomiSystems',
  homeUrl: 'https://nekomisystems.com',

  title:    'Portafolio',
  subtitle: 'Proyectos y experimentos creados por pasión.',

  /** Labels for the status badge on each card */
  statusLabels: {
    live:     'En vivo',
    wip:      'En desarrollo',
    archived: 'Archivado',
  } as Record<Project['status'], string>,
}
