<script setup lang="ts">
import { ref } from 'vue'
import { CONFIG } from '../config'
import CvModal from './CvModal.vue'

const { profile, social } = CONFIG

const showCvModal = ref(false)
</script>

<template>
  <section
    id="inicio"
    class="mx-auto flex min-h-[92vh] max-w-6xl flex-col items-center justify-center gap-10 px-4 pb-16 pt-28 md:flex-row md:justify-between"
  >
    <!-- ── Text side ── -->
    <div class="reveal flex max-w-xl flex-col items-center text-center md:items-start md:text-left">
      <!-- Availability badge -->
      <span
        v-if="profile.availability"
        class="glass mb-5 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium text-white/80"
      >
        <span class="h-2 w-2 animate-pulse rounded-full bg-green-400" />
        {{ profile.availability }}
      </span>

      <!-- Heading -->
      <h1 class="text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
        Hola, soy <span class="text-gradient">{{ profile.name }}</span>
      </h1>
      <p class="mt-3 text-xl font-semibold text-white/90 sm:text-2xl">{{ profile.role }}</p>
      <p class="mt-4 max-w-lg text-base leading-relaxed text-white/60">{{ profile.tagline }}</p>

      <!-- CTA buttons -->
      <div class="mt-8 flex flex-wrap items-center justify-center gap-4 md:justify-start">
        <a
          :href="profile.portfolioUrl || '#'"
          class="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-primary to-accent px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-black/40 transition-transform hover:scale-[1.03]"
        >
          <span class="absolute inset-0 -translate-x-full bg-white/20 transition-transform duration-500 group-hover:translate-x-full" />
          <span class="material-symbols-outlined text-[20px]">rocket_launch</span>
          Ver Portafolio
          <span class="material-symbols-outlined text-[18px] transition-transform group-hover:translate-x-1">arrow_forward</span>
        </a>

        <button
          class="glass inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold text-white/90 transition-colors hover:bg-white/10"
          @click="showCvModal = true"
        >
          <span class="material-symbols-outlined text-[20px]">description</span>
          Descargar CV
        </button>
      </div>

      <Teleport to="body">
        <Transition name="modal">
          <CvModal v-if="showCvModal" :resume="profile.resume" @close="showCvModal = false" />
        </Transition>
      </Teleport>

      <!-- Social pills -->
      <div class="mt-8 flex items-center gap-3">
        <a
          v-for="s in social"
          :key="s.name"
          :href="s.url"
          :aria-label="s.name"
          target="_blank"
          rel="noopener"
          class="glass flex h-11 w-11 items-center justify-center rounded-full text-white/80 transition-all hover:-translate-y-0.5 hover:bg-white/10 hover:text-white"
        >
          <!--<span class="material-symbols-outlined text-[20px]">{{ s.icon }}</span>-->
          <i :class="s.icon" class="material-symbols-outlined text-[20px]"></i>
        </a>
      </div>
    </div>

    <!-- ── Portrait side ── -->
    <div class="reveal relative flex shrink-0 items-center justify-center">
      <div class="relative h-64 w-64 sm:h-80 sm:w-80 lg:h-96 lg:w-96" style="width: 32rem;">
        <div class="portrait-glow" />
        <img
          :src="profile.image"
          :alt="'Retrato de ' + profile.name"
          class="portrait animate-float h-full w-full object-contain"
          style="height: 37rem; margin-top: -6rem;"
        />
      </div>
    </div>
  </section>
</template>
