<script setup lang="ts">
import { computed } from 'vue'
import { CONFIG } from '../config'

const props = defineProps<{
  sections: { id: string; label: string }[]
  activeSectionId: string
}>()

/** "David A." → "David A." */
const brandName = computed(() => {
  const parts = CONFIG.profile.name.trim().split(/\s+/)
  return parts[0] + (parts[1] ? ' ' + parts[1][0] + '.' : '')
})
</script>

<template>
  <header class="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4">
    <nav class="glass flex w-full max-w-3xl items-center justify-between gap-2 rounded-full px-3 py-2 shadow-lg shadow-black/30">
      <!-- Brand -->
      <a href="#inicio" class="flex shrink-0 items-center gap-2 pl-2 pr-1">
        <span class="material-symbols-outlined text-primary">terminal</span>
        <span class="hidden text-sm font-bold text-white sm:block">{{ brandName }}</span>
      </a>

      <!-- Section links -->
      <div class="no-scrollbar flex items-center gap-1 overflow-x-auto">
        <a
          v-for="section in sections"
          :key="section.id"
          :href="'#' + section.id"
          class="nav-link shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors hover:text-white"
          :class="activeSectionId === section.id ? 'active' : 'text-white/60'"
        >{{ section.label }}</a>
      </div>

      <!-- CTA -->
      <a
        href="#contacto"
        class="ml-1 hidden shrink-0 items-center gap-1 rounded-full bg-primary/90 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-primary md:flex"
      >
        <span class="material-symbols-outlined text-[16px]">mail</span>
        Contacto
      </a>
    </nav>
  </header>
</template>
