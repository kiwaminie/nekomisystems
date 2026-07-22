<script setup lang="ts">
import { CONFIG } from '../config'

const { technologies } = CONFIG

/** True when the icon string is a URL/path to an image, false when it's a Material Symbol name. */
const isImage = (icon: string) =>
  /^(https?:|\.|\/)/.test(icon) || /\.(png|svg|jpg|jpeg|webp|gif)$/i.test(icon)
</script>

<template>
  <section id="tecnologias" class="mx-auto max-w-6xl px-4 py-16">
    <!-- Header -->
    <div class="reveal mb-10 text-center">
      <p class="mb-2 text-sm font-semibold uppercase tracking-widest text-accent">Stack</p>
      <h2 class="text-3xl font-bold text-white sm:text-4xl">Tecnologías que utilizo</h2>
      <p class="mx-auto mt-3 max-w-xl text-white/60">
        Herramientas y lenguajes con los que construyo productos de principio a fin.
      </p>
    </div>

    <!-- Grid -->
    <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      <div
        v-for="tech in technologies"
        :key="tech.title"
        class="reveal glass group rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:bg-white/[0.07]"
      >
        <div class="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/15 ring-1 ring-white/10 transition-colors group-hover:bg-primary/25">
          <img
            v-if="isImage(tech.icon)"
            :src="tech.icon"
            :alt="tech.title"
            class="h-8 w-8 object-contain"
            loading="lazy"
          />
          <span v-else class="material-symbols-outlined text-3xl text-primary">{{ tech.icon }}</span>
        </div>
        <h3 class="text-lg font-bold text-white">{{ tech.title }}</h3>
        <p class="mt-2 text-sm leading-relaxed text-white/60">{{ tech.description }}</p>
      </div>
    </div>
  </section>
</template>
