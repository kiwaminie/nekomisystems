<script setup lang="ts">
import { onMounted, ref } from 'vue'
import NavBar from './components/NavBar.vue'
import HeroSection from './components/HeroSection.vue'
import StatsSection from './components/StatsSection.vue'
import AboutSection from './components/AboutSection.vue'
import TechSection from './components/TechSection.vue'
import ExperienceSection from './components/ExperienceSection.vue'
import ProjectsSection from './components/ProjectsSection.vue'
import ContactSection from './components/ContactSection.vue'

const sections = [
  { id: 'inicio',      label: 'Inicio' },
  { id: 'sobre-mi',   label: 'Sobre mí' },
  { id: 'tecnologias', label: 'Tecnologías' },
  { id: 'experiencia', label: 'Experiencia' },
  { id: 'proyectos',  label: 'Proyectos' },
  //{ id: 'contacto',   label: 'Contacto' },
]

const activeSectionId = ref('inicio')

onMounted(() => {
  // Track which section is currently in view for the navbar highlight.
  const navObs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => { if (e.isIntersecting) activeSectionId.value = e.target.id })
    },
    { threshold: 0.4 },
  )
  sections.forEach((s) => {
    const el = document.getElementById(s.id)
    if (el) navObs.observe(el)
  })

  // Animate every `.reveal` element when it enters the viewport.
  const revealObs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible')
          revealObs.unobserve(e.target)
        }
      })
    },
    { threshold: 0.12 },
  )
  document.querySelectorAll('.reveal').forEach((el) => revealObs.observe(el))
})
</script>

<template>
  <div class="bg-background-dark font-display text-gray-200 antialiased">
    <!-- Animated gradient blobs -->
    <div class="bg-decor">
      <div class="blob blob-1" />
      <div class="blob blob-2" />
      <div class="blob blob-3" />
    </div>

    <NavBar :sections="sections" :active-section-id="activeSectionId" />

    <main class="relative z-10">
      <HeroSection />
      <StatsSection />
      <AboutSection />
      <TechSection />
      <ExperienceSection />
      <ProjectsSection />
      <ContactSection />
    </main>
  </div>
</template>
