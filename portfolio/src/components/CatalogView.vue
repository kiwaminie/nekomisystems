<script setup lang="ts">
import { ref, computed } from 'vue'
import { CONFIG } from '../config'
import type { Project } from '../config'
import ProjectCard from './ProjectCard.vue'

const props = defineProps<{ projects: Project[] }>()
const emit  = defineEmits<{ select: [project: Project] }>()

const searchQuery     = ref('')
const activeCategory  = ref('Todos')

const categories = computed(() =>
  ['Todos', ...new Set(props.projects.map(p => p.category))],
)

const filtered = computed(() =>
  props.projects.filter(p => {
    const matchCat    = activeCategory.value === 'Todos' || p.category === activeCategory.value
    const q           = searchQuery.value.toLowerCase().trim()
    const matchSearch = !q || p.title.toLowerCase().includes(q) || p.summary.toLowerCase().includes(q)
    return matchCat && matchSearch
  }),
)

const setCategory = (cat: string) => {
  activeCategory.value = cat
}
</script>

<template>
  <main class="relative z-10 min-h-screen px-4 pb-20 pt-24">
    <div class="mx-auto max-w-6xl">

      <!-- ── Page header ── -->
      <header class="mb-10 text-center">
        <p class="mb-2 text-sm font-semibold uppercase tracking-widest text-accent">
          {{ CONFIG.brand }}
        </p>
        <h1 class="text-gradient text-4xl font-bold sm:text-5xl">{{ CONFIG.title }}</h1>
        <p class="mx-auto mt-3 max-w-lg text-base text-white/50">{{ CONFIG.subtitle }}</p>
      </header>

      <!-- ── Search + category filters ── -->
      <div class="mb-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">

        <!-- Search input -->
        <div class="relative w-full max-w-xs">
          <span class="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px] text-white/35 pointer-events-none">
            search
          </span>
          <input
            v-model="searchQuery"
            type="search"
            placeholder="Buscar proyectos…"
            class="glass w-full rounded-full py-2.5 pl-10 pr-4 text-sm text-white placeholder-white/30 outline-none transition-colors focus:border-primary/40"
          />
        </div>

        <!-- Category chips -->
        <div class="flex flex-wrap justify-center gap-2">
          <button
            v-for="cat in categories"
            :key="cat"
            class="rounded-full px-4 py-1.5 text-xs font-semibold transition-all"
            :class="activeCategory === cat
              ? 'bg-primary text-white shadow-lg shadow-primary/30'
              : 'glass text-white/55 hover:text-white hover:bg-white/8'"
            @click="setCategory(cat)"
          >
            {{ cat }}
          </button>
        </div>
      </div>

      <!-- ── Project grid ── -->
      <!--
        The :key on the wrapper forces a re-mount (and stagger replay)
        every time the filter or search changes.
      -->
      <div
        :key="activeCategory + searchQuery"
        class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
      >
        <ProjectCard
          v-for="(project, i) in filtered"
          :key="project.id"
          :project="project"
          :style="{ animationDelay: `${i * 0.08}s` }"
          class="card-appear"
          @select="emit('select', project)"
        />
      </div>

      <!-- ── Empty state ── -->
      <div
        v-if="!filtered.length"
        class="mt-24 flex flex-col items-center gap-3 text-center"
      >
        <span class="material-symbols-outlined text-5xl text-white/15">search_off</span>
        <p class="text-sm text-white/35">No se encontraron proyectos.</p>
        <button
          class="mt-2 text-xs text-accent underline-offset-2 hover:underline"
          @click="searchQuery = ''; activeCategory = 'Todos'"
        >
          Limpiar filtros
        </button>
      </div>

    </div>
  </main>
</template>
