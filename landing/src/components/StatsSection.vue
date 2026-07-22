<script setup lang="ts">
import { CONFIG } from '../config'
const { stats } = CONFIG
</script>

<template>
  <section class="mx-auto max-w-5xl px-4 pb-20">
    <div class="reveal glass grid grid-cols-2 gap-4 rounded-2xl p-6 sm:grid-cols-4">
      <div v-for="stat in stats" :key="stat.label" class="text-center">
        <p class="text-gradient text-3xl font-bold sm:text-4xl">{{ stat.value }}</p>
        <p class="mt-1 text-xs font-medium uppercase tracking-wide text-white/50">{{ stat.label }}</p>
      </div>
    </div>
  </section>
</template>
