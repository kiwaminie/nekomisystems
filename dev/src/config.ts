// ─────────────────────────────────────────────────────────────────────────────
//  TIPOS
// ─────────────────────────────────────────────────────────────────────────────
export interface TechItem {
  /** URL a una imagen/logo (png/svg) o nombre de un ícono de Material Symbols */
  icon?: string
  title: string
  description: string
  class?: string
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
import profileImage from './images/chibi.png'

// Previews de proyectos
import mikurigPreview from '@/index/previews/mikurig_preview.png'
import mangaPreview from '@/index/previews/1 izq.jpg'
import bibooPreview from '../../bibootaxgame/src/characters/biboo.png'
import nekoDrivePreview from './images/nekodrive-bg.png'
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
      'Construyo aplicaciones utilizando una amplia variedad de tecnologías. Adaptando necesidades empresariales, adminstrativas y personales.',
    /** Badge verde de disponibilidad. Déjalo vacío "" para ocultarlo. */
    availability: 'Disponible para freelance',
    image: profileImage,
    /** URL de tu futura página de portafolio. */
    portfolioUrl: 'https://portfolio.nekomisystems.com',
    /** Enlace a tu CV en PDF. Déjalo "#" si aún no lo tienes. */
    resumeUrl: '#',
    email: 'davidzep77@hotmail.com',
  },

  about: {
    heading: 'Vistazo',
    /** Cada string se renderiza como un párrafo. */
    paragraphs: [
      'Ingeniero titulado en sistemas computaciones con 3 años de experiencia desarrollando soluciones empresariales y administrativas. Especialista en la arquitectura de portales de alto impacto y la integración de sistemas mediante C#, .NET, SAP HANA y Service Layer. Con experiencia directa en el ciclo de desarrollo: desde la ingeniería de requerimientos, hasta el despliegue en entornos de producción. Apasionado por el desarrollo moderno y el diseño con TypeScript y Vue.js.'
    ],
  },

  /** Métricas destacadas en el hero. Agrega o elimina libremente. */
  stats: [
    { value: '3+', label: 'Años de experiencia' },
    { value: '10+', label: 'Proyectos profesionales trabajados' },
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
      icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Microsoft_.NET_logo.svg/3840px-Microsoft_.NET_logo.svg.png',
      title: '.NET',
      description: '.NET Core / .NET Framework: Plataformas de desarrollo para construir aplicaciones modernas por Microsoft.',
    },
    {
      class: 'devicon-dot-net-plain',
      title: 'ASP .NET',
      description: 'Framework para construir aplicaciones web y APIs robustas y escalables.',
    },
    {
      class: 'devicon-jquery-plain',
      title: 'jQuery',
      description: 'Librería de JavaScript para facilitar la manipulación del DOM.',
    },
    {
      icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vuejs/vuejs-original.svg',
      title: 'Vue.js',
      description: 'Interfaces reactivas y componentes reutilizables.',
    },
    {
      icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg',
      title: 'JavaScript',
      description: 'Base de mis desarrollos en el frontend.',
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
      icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/bootstrap/bootstrap-original.svg',
      title: 'Bootstrap',
      description: 'Diseño de UI moderno y consistente a gran velocidad.',
    },
    {
      icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/microsoftsqlserver/microsoftsqlserver-original.svg',
      title: 'SQL Server',
      description: 'Bases de datos relacionales confiables.',
    },
    {
      class: 'devicon-laravel-original colored',
      title: 'Laravel',
      description: 'Framework de PHP para el desarrollo de aplicaciones web.',
    },
    {
      icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/livewire/livewire-original-wordmark.svg',
      title: 'Livewire',
      description: 'Componentes reutilizables para la construcción de interfaces web modernas.',
    },
    {
      icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/vitejs/vitejs-original.svg',
      title: 'Vite js',
      description: 'Un entorno de desarrollo de aplicaciones web moderno y eficiente.',
    },
    {
      icon: "https://camo.githubusercontent.com/245e3ebdc7de6cbd9f020c30d9ec72d08125b0543b9496b3296e64c39ad5d4bf/68747470733a2f2f7777772e766973696f6e33332e636f6d2f68732d66732f68756266732f41526564657369676e253230323031382f534150253230427573696e6573732532304f6e6525323050616765732f5341502d48414e412d6c6f676f5f3136303333305f3135343230372e706e673f77696474683d363030266e616d653d5341502d48414e412d6c6f676f5f3136303333305f3135343230372e706e67",
      title: 'SAP HANA',
      description: 'Base de datos de alto rendimiento y escalabilidad.',
    },
    {
      icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/SAP-Logo.svg/3840px-SAP-Logo.svg.png',
      title: 'SAP',
      description: 'Sistema de gestión empresarial. SAP Business One, Service Layer, SAP HANA.',
    },
    {
      class: 'devicon-threejs-original',
      title: 'Three.js',
      description: 'Librería de JavaScript para crear interfaces 3D interactivas y animadas.',
    },
    {
      icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/WebGL_Logo.svg/960px-WebGL_Logo.svg.png?_=20210505165026',
      title: 'WebGL',
      description: 'API de JavaScript para crear interfaces 3D interactivas y animadas.',
    },
    {
      class: 'devicon-mysql-original',
      title: 'MySQL',
      description: 'Sistema de gestión de bases de datos relacionales.',
    },
    {
      class: 'devicon-docker-plain colored',
      title: 'Docker',
      description: 'Plataforma de contenedores para desarrollar, enviar y ejecutar aplicaciones de manera consistente.',
    },
  ] satisfies TechItem[],

  /** Experiencia laboral — de más reciente a más antigua. */
  experience: [
    {
      role: 'Desarrollador Fullstack (Jefe de Departamento de Desarrollo Web)',
      company: 'Secretaria de Hacienda del Estado de Sonora - Dirección General del Sistema de Información Financiera',
      period: 'Julio 2026 — Presente',
      description:
        'Mantenimiento, actualización y seguimiento a sistemas de digitalización archivisticos.',
      tags: [".NET", 'SQL Server', 'PostgreSQL', "Docker"],
    },
    {
      role: 'Ingeniero de Desarrollado',
      company: 'Qualisys',
      period: 'Marzo 2023 — Julio 2026',
      description:
        "Diseño, desarrollo, implenetación y mantenimiento a integraciones directas o indirectas con el ERP SAP Business One. Desarrollo de multiples portales web que mejoraron la carga administrativa y la experiencia de usuario en la empresa hasta en un 70%",
      tags: ['.NET', "Bootstrap", "SAP HANA", "SAP Service Layer", "jQuery", "Windows Services" ],
    },
        {
      role: 'Desarrollador Fullstack (Practicante)',
      company: "Sonora Global EDC",
      period: 'Agosto 2022 — Enero 2023',
      description:
        'Diseño y desarrollo de un portal web para la gestión de proyectos de inversión extranjera en el estado de Sonora, permitiendo la interacción dinámica entre proveedores y clientes industriales.',
      tags: ['Laravel', "PHP", 'MySQL', "Livewire"],
    },
  ] satisfies ExperienceItem[],

  /** Proyectos — enlazan a los submódulos del portafolio. */
  projects: [
    { title: 'Hatsune Miku Rigging', image: mikurigPreview, url: '/mikurig/', label: 'Ver' },
    { title: "Hell's Katana — Manga Reader", image: mangaPreview, url: '/manga_reader/', label: 'Ver' },
    { title: 'Biboo Tax Game', image: bibooPreview, url: '/bibootaxgame/', label: 'Jugar' },
    { title: 'Frost OS', image: frostOsPreview, url: '/frost-os/', label: 'Iniciar' },
    { title: 'NekoDrive (Nube Personal)', image: nekoDrivePreview, url: 'https://drive.nekomisystems.com', label: 'Ir' },
  ] satisfies ProjectItem[],

  /** Redes sociales — `icon` usa nombres de Material Symbols. */
  social: [
    { name: 'GitHub', icon: 'devicon-github-original', url: 'https://github.com/nekominie' },
    { name: 'Twitter', icon: 'devicon-twitter-original', url: 'https://x.com/DavidZep77' },
    //{ name: 'DeviantArt', icon: 'design_services', url: 'https://www.deviantart.com/modernherobrine' },
    { name: 'LinkedIn', icon: 'devicon-linkedin-plain', url: 'https://www.linkedin.com/in/david-alejandro-zepeda-aboytes-163722401' },
  ] satisfies SocialItem[],
    contactText:
    'Estoy abierto a colaboraciones, ideas y trabajo freelance. ¡Hablemos!',

  /*contactText:
    'Estoy abierto a colaboraciones, trabajo freelance y nuevas oportunidades. ¡Hablemos!',*/
}
