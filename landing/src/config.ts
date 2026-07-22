// ─────────────────────────────────────────────────────────────────────────────
//  TIPOS
// ─────────────────────────────────────────────────────────────────────────────
export interface TechItem {
  /** URL a una imagen/logo (png/svg) o nombre de un ícono de Material Symbols */
  icon: string
  title: string
  description: string
}

export interface ExperienceItem {
  role: string
  company: string
  period: string
  description: string
  tags?: string[]
}

export interface ProjectItem {
  title: string
  /** Imagen importada como módulo Vite o URL absoluta desde /public */
  image: string
  url: string
  label?: string
}

export interface SocialItem {
  name: string
  /** Nombre de un ícono de Material Symbols */
  icon: string
  url: string
}

export interface StatItem {
  value: string
  label: string
}

// ─────────────────────────────────────────────────────────────────────────────
//  IMÁGENES  (importadas como módulos para que Vite las procese correctamente)
// ─────────────────────────────────────────────────────────────────────────────

// ⚠️ Reemplaza por tu PNG con fondo transparente para el efecto portrait limpio.
import profileImage from '@/index/modernherobrine.png'

// Previews de proyectos
import mikurigPreview from '@/index/previews/mikurig_preview.png'
import mangaPreview from '@/index/previews/1 izq.jpg'
import bibooPreview from '../../bibootaxgame/src/characters/biboo.png'
// Frost OS usa imagen de /public — se referencia como URL estática.
const frostOsPreview = '/wallpapers/default-wallpaper.jpg'

// ─────────────────────────────────────────────────────────────────────────────
//  CONFIGURACIÓN  — edita libremente todo este objeto.
// ─────────────────────────────────────────────────────────────────────────────
export const CONFIG = {
  profile: {
    name: 'David A. Zepeda',
    role: 'Desarrollador Fullstack',
    /** Frase corta que aparece bajo el rol en el hero. */
    tagline:
      'Construyo aplicaciones web modernas de extremo a extremo, del diseño de la interfaz a la arquitectura del backend.',
    /** Badge verde de disponibilidad. Déjalo vacío "" para ocultarlo. */
    availability: 'Disponible para nuevos proyectos',
    image: profileImage,
    /** URL de tu futura página de portafolio. */
    portfolioUrl: '#',
    /** Enlace a tu CV en PDF. Déjalo "#" si aún no lo tienes. */
    resumeUrl: '#',
    email: 'hola@nekomisystems.dev',
  },

  about: {
    heading: 'Mi trayectoria',
    /** Cada string se renderiza como un párrafo. */
    paragraphs: [
      'Soy desarrollador fullstack apasionado por crear productos digitales que combinan un diseño cuidado con una ingeniería sólida. Disfruto llevar una idea desde el boceto hasta producción.',
      'A lo largo de mi carrera he trabajado en interfaces interactivas, APIs escalables y experiencias que ponen al usuario en el centro. Siempre busco aprender la siguiente herramienta que me permita construir mejor.',
    ],
  },

  /** Métricas destacadas en el hero. Agrega o elimina libremente. */
  stats: [
    { value: '5+', label: 'Años de experiencia' },
    { value: '30+', label: 'Proyectos completados' },
    { value: '15+', label: 'Tecnologías' },
    { value: '100%', label: 'Compromiso' },
  ] satisfies StatItem[],

  /**
   * Tecnologías — agrega objetos con { icon, title, description }.
   * `icon` puede ser:
   *   - Una URL a una imagen/logo (png/svg), idealmente con fondo transparente.
   *   - El nombre de un ícono de Material Symbols (ej. "code", "database").
   * Los logos de ejemplo vienen de Devicon (CDN público, sin instalación).
   */
  technologies: [
    {
      icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vuejs/vuejs-original.svg',
      title: 'Vue.js',
      description: 'Interfaces reactivas y componentes reutilizables.',
    },
    {
      icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg',
      title: 'JavaScript',
      description: 'Base de mis desarrollos en el frontend y backend.',
    },
    {
      icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg',
      title: 'TypeScript',
      description: 'Código robusto y tipado para proyectos escalables.',
    },
    {
      icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg',
      title: 'Node.js',
      description: 'APIs y servicios backend rápidos y eficientes.',
    },
    {
      icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg',
      title: 'Tailwind CSS',
      description: 'Diseño de UI moderno y consistente a gran velocidad.',
    },
    {
      icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg',
      title: 'PostgreSQL',
      description: 'Bases de datos relacionales confiables.',
    },
  ] satisfies TechItem[],

  /** Experiencia laboral — de más reciente a más antigua. */
  experience: [
    {
      role: 'Fundador & Desarrollador Fullstack',
      company: 'NekomiSystems LTD',
      period: '2022 — Presente',
      description:
        'Diseño y desarrollo de herramientas y experiencias web interactivas, desde juegos hasta lectores de manga y sistemas operativos web.',
      tags: ['Vue', 'Three.js', 'Vite'],
    },
    {
      role: 'Desarrollador Frontend',
      company: 'Empresa Ejemplo',
      period: '2020 — 2022',
      description:
        'Implementación de interfaces de usuario responsivas y componentes reutilizables en colaboración con equipos de diseño y backend.',
      tags: ['JavaScript', 'CSS', 'REST'],
    },
  ] satisfies ExperienceItem[],

  /** Proyectos — enlazan a los submódulos del portafolio. */
  projects: [
    { title: 'Hatsune Miku Rigging', image: mikurigPreview, url: '/mikurig/', label: 'Ver' },
    { title: 'Katana Of Hell — Manga Reader', image: mangaPreview, url: '/manga_reader/', label: 'Ver' },
    { title: 'Biboo Tax Game', image: bibooPreview, url: '/bibootaxgame/', label: 'Jugar' },
    { title: 'Frost OS', image: frostOsPreview, url: '/frost-os/', label: 'Iniciar' },
  ] satisfies ProjectItem[],

  /** Redes sociales — `icon` usa nombres de Material Symbols. */
  social: [
    { name: 'GitHub', icon: 'code', url: 'https://github.com/nekominie' },
    { name: 'DeviantArt', icon: 'design_services', url: 'https://www.deviantart.com/modernherobrine' },
    { name: 'LinkedIn', icon: 'group', url: '#' },
  ] satisfies SocialItem[],

  contactText:
    'Estoy abierto a colaboraciones, trabajo freelance y nuevas oportunidades. ¡Hablemos!',
}
