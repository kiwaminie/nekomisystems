<script setup lang="ts">
import { CONFIG } from '../config'
const { experience } = CONFIG
</script>

<template>
  <section id="experiencia" class="mx-auto max-w-4xl px-4 py-16">
    <div class="reveal mb-10">
      <p class="mb-2 text-sm font-semibold uppercase tracking-widest text-accent">Carrera</p>
      <h2 class="text-3xl font-bold text-white sm:text-4xl">Experiencia laboral</h2>
    </div>

    <div class="relative border-l border-white/10 pl-6 sm:pl-8">
      <div
        v-for="(job, i) in experience"
        :key="i"
        class="reveal relative mb-10 last:mb-0"
      >
        <!-- Timeline dot -->
        <span class="absolute -left-[31px] top-1 flex h-4 w-4 items-center justify-center sm:-left-[39px]">
          <span class="h-3 w-3 rounded-full bg-primary ring-4 ring-primary/20" />
        </span>

        <div class="glass rounded-2xl p-6">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <h3 class="text-lg font-bold text-white">{{ job.role }}</h3>
            <span class="rounded-full bg-white/5 px-3 py-1 text-xs font-medium text-white/60">{{ job.period }}</span>
          </div>
          <p class="mt-1 text-sm font-semibold text-accent">{{ job.company }}</p>
          <p class="mt-3 text-sm leading-relaxed text-white/60">{{ job.description }}</p>
          <div v-if="job.tags?.length" class="mt-4 flex flex-wrap gap-2">
            <span
              v-for="tag in job.tags"
              :key="tag"
              class="rounded-full bg-primary/15 px-3 py-1 text-xs font-medium text-white/80"
            >{{ tag }}</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
