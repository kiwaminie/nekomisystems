<script setup lang="ts">
import { CONFIG } from '../config'
import type { Project } from '../config'

defineProps<{ selected: Project | null }>()
defineEmits<{ back: [] }>()
</script>

<template>
  <header class="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4">
    <nav class="glass pointer-events-auto flex w-full max-w-5xl items-center gap-2 rounded-full px-4 py-2.5 shadow-lg shadow-black/30">

      <!-- Brand -->
      <a :href="CONFIG.homeUrl" class="flex shrink-0 items-center gap-2">
        <span class="material-symbols-outlined text-[20px] text-primary">terminal</span>
        <span class="hidden text-sm font-bold text-white sm:block">{{ CONFIG.brand }}</span>
      </a>

      <!-- Breadcrumb separator -->
      <span class="text-white/25 select-none">/</span>

      <!-- Portafolio — clickable when in detail view to return to catalog -->
      <button
        v-if="selected"
        class="text-sm font-medium text-white/55 transition-colors hover:text-white"
        @click="$emit('back')"
      >
        {{ CONFIG.title }}
      </button>
      <span v-else class="text-sm font-medium text-white/55">{{ CONFIG.title }}</span>

      <!-- Title + spacer + Volver — only visible in detail mode -->
      <Transition name="view">
        <div v-if="selected" class="flex min-w-0 flex-1 items-center gap-2">
          <span class="text-white/25 select-none">/</span>
          <span class="truncate text-sm font-semibold text-white/80">{{ selected.title }}</span>
          <div class="flex-1" />
          <button
            class="glass flex shrink-0 items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold text-white/70 transition-all hover:bg-white/10 hover:text-white"
            @click="$emit('back')"
          >
            <span class="material-symbols-outlined text-[16px]">arrow_back</span>
            Volver
          </button>
        </div>
      </Transition>
    </nav>
  </header>
</template>
