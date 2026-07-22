<script setup lang="ts">
import { CONFIG } from '../config'
const { about } = CONFIG
</script>

<template>
  <section id="sobre-mi" class="mx-auto max-w-4xl px-4 py-16">
    <div class="reveal">
      <p class="mb-2 text-sm font-semibold uppercase tracking-widest text-accent">Sobre mí</p>
      <h2 class="text-3xl font-bold text-white sm:text-4xl">{{ about.heading }}</h2>
      <div class="mt-6 space-y-4 text-lg leading-relaxed text-white/70">
        <p v-for="(para, i) in about.paragraphs" :key="i">{{ para }}</p>
      </div>
    </div>
  </section>
</template>
