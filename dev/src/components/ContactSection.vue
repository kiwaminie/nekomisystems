<script setup lang="ts">
import { CONFIG } from '../config'

const { profile, social, contactText } = CONFIG
const year = new Date().getFullYear()
</script>

<template>
  <section id="contacto" class="mx-auto max-w-3xl px-4 py-20">
    <div class="reveal glass rounded-2xl p-8 text-center sm:p-12">
      <h2 class="text-3xl font-bold text-white sm:text-4xl">¿Trabajamos juntos?</h2>
      <p class="mx-auto mt-3 max-w-lg text-white/60">{{ contactText }}</p>

      <div class="mt-8 flex flex-wrap items-center justify-center gap-4">
        <a
          :href="'mailto:' + profile.email"
          class="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-accent px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-black/30 transition-transform hover:scale-[1.03]"
        >
          <span class="material-symbols-outlined text-[20px]">mail</span>
          Envíame un correo
        </a>
      </div>

      <div class="mt-8 flex items-center justify-center gap-3">
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

    <p class="mt-10 text-center text-sm text-white/40">
      © {{ year }} David A. Zepeda · NekomiSystems es propiedad de NekomiWorks. Todos los derechos reservados.
    </p>
  </section>
</template>
