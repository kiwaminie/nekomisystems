<script setup lang="ts">
import { CONFIG } from '../config'
const { projects } = CONFIG
</script>

<template>
  <section id="proyectos" class="mx-auto max-w-5xl px-4 py-16">
    <div class="reveal mb-10 text-center">
      <p class="mb-2 text-sm font-semibold uppercase tracking-widest text-accent">Proyectos personales y de ocio</p>
      <h2 class="text-3xl font-bold text-white sm:text-4xl">Algunos de mis trabajos</h2>
    </div>

    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
      <div
        v-for="project in projects"
        :key="project.title"
        class="reveal group relative overflow-hidden rounded-2xl shadow-2xl shadow-black/30"
      >
        <!-- Preview image with zoom-on-hover -->
        <div
          class="h-56 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
          :style="{ backgroundImage: `url('${project.image}')` }"
        />

        <!-- Frosted footer -->
        <div class="absolute inset-x-0 bottom-0 flex items-center justify-between gap-4 border-t border-white/10 bg-black/40 p-4 backdrop-blur-lg">
          <p class="flex-1 text-lg font-bold text-white">{{ project.title }}</p>
          <a
            :href="project.url"
            class="flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-bold text-white shadow-lg shadow-black/30 transition-colors hover:bg-primary/90"
          >{{ project.label ?? 'Ver' }}</a>
        </div>
      </div>
    </div>
  </section>
</template>
