<script setup lang="ts">
import { CONFIG } from '../config'
import type { Project } from '../config'

defineProps<{ project: Project }>()
defineEmits<{ select: [] }>()

const isImage = (icon: string) =>
  /^(https?:|\.|\/)/.test(icon) || /\.(png|svg|jpg|jpeg|webp|gif)$/i.test(icon)

const statusColor: Record<Project['status'], string> = {
  live:     'bg-green-500/20 text-green-400 ring-green-500/30',
  wip:      'bg-yellow-500/20 text-yellow-400 ring-yellow-500/30',
  archived: 'bg-white/8 text-white/40 ring-white/15',
}
</script>

<template>
  <article
    class="project-card glass group flex flex-col overflow-hidden rounded-2xl"
    role="button"
    tabindex="0"
    :aria-label="'Ver detalle de ' + project.title"
    @click="$emit('select')"
    @keydown.enter="$emit('select')"
    @keydown.space.prevent="$emit('select')"
  >
    <!-- ── Thumbnail ── -->
    <div class="project-card-img-wrap relative h-48 overflow-hidden">
      <img
        :src="project.image"
        :alt="project.title"
        class="project-card-img h-full w-full object-cover"
        loading="lazy"
      />

      <!-- Hover gradient overlay -->
      <div
        class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />

      <!-- Status badge -->
      <span
        class="absolute right-3 top-3 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ring-1 backdrop-blur-sm"
        :class="statusColor[project.status]"
      >
        {{ CONFIG.statusLabels[project.status] }}
      </span>

      <!-- "Ver →" hint on hover -->
      <span
        class="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-primary/80 px-3 py-1 text-[11px] font-bold text-white opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 translate-x-1"
      >
        Ver
        <span class="material-symbols-outlined text-[13px]">arrow_forward</span>
      </span>
    </div>

    <!-- ── Content ── -->
    <div class="flex flex-1 flex-col gap-2 p-5">
      <!-- Category -->
      <span class="self-start rounded-full bg-primary/20 px-2.5 py-0.5 text-[11px] font-semibold text-accent">
        {{ project.category }}
      </span>

      <!-- Title -->
      <h2 class="text-lg font-bold leading-snug text-white transition-colors group-hover:text-gradient">
        {{ project.title }}
      </h2>

      <!-- Summary -->
      <p class="line-clamp-2 text-sm leading-relaxed text-white/55">{{ project.summary }}</p>

      <!-- Tech icons -->
      <div class="mt-auto flex items-center gap-2 border-t border-white/5 pt-4">
        <div
          v-for="tech in project.technologies.slice(0, 4)"
          :key="tech.name"
          class="flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 ring-1 ring-white/8"
          :title="tech.name"
        >
          <img
            v-if="isImage(tech.icon)"
            :src="tech.icon"
            :alt="tech.name"
            class="h-4 w-4 object-contain"
            loading="lazy"
          />
          <!--<span v-else class="material-symbols-outlined text-[13px] text-white/50">{{ tech.icon }}</span>-->
          <i v-else :class="tech.class" class="material-symbols-outlined text-[13px] text-white/50">{{ tech.icon }}</i>
        </div>
        <span v-if="project.technologies.length > 4" class="text-[11px] text-white/30">
          +{{ project.technologies.length - 4 }}
        </span>
      </div>
    </div>
  </article>
</template>
