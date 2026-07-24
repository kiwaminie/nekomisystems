<script setup lang="ts">
import { onMounted } from 'vue'
import { CONFIG } from '../config'
import type { Project } from '../config'

const props = defineProps<{ project: Project }>()
defineEmits<{ back: [] }>()

const isImage = (icon: string) =>
  /^(https?:|\.|\/)/.test(icon) || /\.(png|svg|jpg|jpeg|webp|gif)$/i.test(icon)

const statusColor: Record<Project['status'], string> = {
  live:     'bg-green-500/20 text-green-400',
  wip:      'bg-yellow-500/20 text-yellow-400',
  archived: 'bg-white/10 text-white/40',
}

// Trigger scroll-reveal for content sections
onMounted(() => {
  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible')
          obs.unobserve(e.target)
        }
      })
    },
    { threshold: 0.1 },
  )
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el))
})
</script>

<template>
  <article class="relative z-10 min-h-screen pb-24 pt-20">

    <!-- ══════════════════════════════════════════════════════
         HERO BANNER — cinematic image with gradient overlay
         and title/category card anchored at the bottom.
         ══════════════════════════════════════════════════════ -->
    <div class="relative h-[58vh] max-h-[540px] w-full overflow-hidden">
      <img
        :src="project.image"
        :alt="project.title"
        class="h-full w-full object-cover"
      />

      <!-- Dark vignette: top-left darkening + strong bottom fade to bg -->
      <div class="hero-overlay absolute inset-0" />

      <!-- Title overlay — anchored bottom-left inside a max-width container -->
      <div class="absolute inset-x-0 bottom-0 px-4 pb-6 sm:px-8">
        <div class="mx-auto flex max-w-5xl items-end justify-between gap-4">
          <div class="min-w-0">
            <!-- Category chip -->
            <span class="mb-2.5 inline-flex items-center rounded-full bg-primary/75 px-3 py-0.5 text-xs font-semibold text-white backdrop-blur-sm">
              {{ project.category }}
            </span>
            <!-- Title -->
            <h1 class="text-3xl font-bold leading-tight text-white drop-shadow-lg sm:text-4xl lg:text-5xl">
              {{ project.title }}
            </h1>
          </div>
          <!-- Status badge -->
          <span
            class="shrink-0 rounded-full px-3 py-1 text-xs font-semibold backdrop-blur-sm"
            :class="statusColor[project.status]"
          >
            {{ CONFIG.statusLabels[project.status] }}
          </span>
        </div>
      </div>
    </div>

    <!-- ══════════════════════════════════════════════════════
         PRIMARY CTA — the most prominent element.
         Large gradient button, centered, right after the hero.
         ══════════════════════════════════════════════════════ -->
    <div class="px-4 sm:px-8">
      <div class="mx-auto max-w-5xl">

        <div class="mt-8 flex flex-col items-center gap-3">
          <!-- Main CTA -->
          <a
            :href="project.cta.url"
            class="cta-btn group relative inline-flex items-center gap-3 overflow-hidden rounded-full
                   bg-gradient-to-r from-primary to-accent
                   px-10 py-4 text-xl font-bold text-white
                   shadow-2xl shadow-primary/45
                   transition-all duration-300
                   hover:scale-[1.05] hover:shadow-[0_0_55px_rgba(75,43,238,0.70)]"
          >
            <!-- Shimmer sweep on hover -->
            <span class="cta-shimmer" />
            <!-- Icon -->
            <span class="material-symbols-outlined relative text-[26px]">{{ project.cta.icon }}</span>
            <!-- Label -->
            <span class="relative">{{ project.cta.label }}</span>
            <!-- Arrow -->
            <span class="material-symbols-outlined relative text-[20px] transition-transform duration-300 group-hover:translate-x-1">
              arrow_forward
            </span>
          </a>
          <p class="text-xs text-white/30">Abre el proyecto en una nueva vista</p>
        </div>

        <!-- ── Description ── -->
        <section class="reveal mt-14">
          <h2 class="mb-4 flex items-center gap-2 text-xl font-bold text-white">
            <span class="material-symbols-outlined text-[20px] text-accent">description</span>
            Descripción
          </h2>
          <p class="max-w-3xl text-base leading-relaxed text-white/65">
            {{ project.description }}
          </p>
        </section>

        <!-- ── Technologies ── -->
        <section v-if="project.technologies.length" class="reveal mt-10">
          <h2 class="mb-4 flex items-center gap-2 text-xl font-bold text-white">
            <span class="material-symbols-outlined text-[20px] text-accent">code</span>
            Tecnologías
          </h2>
          <div class="flex flex-wrap gap-3">
            <div
              v-for="tech in project.technologies"
              :key="tech.name"
              class="glass flex items-center gap-2.5 rounded-xl px-4 py-2.5 transition-colors hover:border-primary/40"
            >
              <img
                v-if="isImage(tech.icon)"
                :src="tech.icon"
                :alt="tech.name"
                class="h-5 w-5 object-contain"
                loading="lazy"
              />
              <span v-else class="material-symbols-outlined text-[18px] text-accent">{{ tech.icon }}</span>
              <span class="text-sm font-medium text-white/80">{{ tech.name }}</span>
            </div>
          </div>
        </section>

        <!-- ── Preview gallery ── -->
        <section v-if="project.previews.length" class="reveal mt-10">
          <h2 class="mb-4 flex items-center gap-2 text-xl font-bold text-white">
            <span class="material-symbols-outlined text-[20px] text-accent">photo_library</span>
            Vistas previas
          </h2>
          <div class="preview-gallery flex gap-4 overflow-x-auto pb-3">
            <img
              v-for="(src, i) in project.previews"
              :key="i"
              :src="src"
              :alt="project.title + ' — vista previa ' + (i + 1)"
              class="h-52 w-80 shrink-0 rounded-2xl object-cover ring-1 ring-white/10 transition-transform hover:scale-[1.02]"
              loading="lazy"
            />
          </div>
        </section>

        <!-- ── Secondary CTA at bottom — for users who scroll ── -->
        <div class="reveal mt-16 flex flex-col items-center gap-3 text-center">
          <div class="glass mb-2 rounded-2xl px-6 py-4">
            <p class="text-sm text-white/50">¿Listo para explorar <span class="font-semibold text-white">{{ project.title }}</span>?</p>
          </div>
          <a
            :href="project.cta.url"
            class="cta-btn group relative inline-flex items-center gap-2.5 overflow-hidden rounded-full
                   bg-gradient-to-r from-primary to-accent
                   px-8 py-3.5 text-base font-bold text-white
                   shadow-xl shadow-primary/35
                   transition-all duration-300
                   hover:scale-[1.04] hover:shadow-[0_0_40px_rgba(75,43,238,0.60)]"
          >
            <span class="cta-shimmer" />
            <span class="material-symbols-outlined relative text-[20px]">{{ project.cta.icon }}</span>
            <span class="relative">{{ project.cta.label }}</span>
          </a>
        </div>

      </div>
    </div>
  </article>
</template>
