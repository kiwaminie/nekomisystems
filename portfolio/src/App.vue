<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { PROJECTS } from './config'
import type { Project } from './config'
import NavBar from './components/NavBar.vue'
import CatalogView from './components/CatalogView.vue'
import DetailView from './components/DetailView.vue'

const selected = ref<Project | null>(null)

const readHash = () => {
  const hash = window.location.hash.slice(1)
  if (!hash) {
    selected.value = null
    return
  }
  const project = PROJECTS.find(p => p.id === hash)
  selected.value = project || null
}

const onSelect = (project: Project) => {
  window.location.hash = project.id
}

const onBack = () => {
  window.location.hash = ''
}

onMounted(() => {
  readHash()
  window.addEventListener('hashchange', readHash)
})

onUnmounted(() => {
  window.removeEventListener('hashchange', readHash)
})
</script>

<template>
  <div class="bg-background-dark font-display text-gray-200 antialiased">
    <!-- Animated gradient background -->
    <div class="bg-decor">
      <div class="blob blob-1" />
      <div class="blob blob-2" />
      <div class="blob blob-3" />
    </div>

    <NavBar :selected="selected" @back="onBack" />

    <!-- Smooth cross-fade between catalog and detail -->
    <Transition name="view" mode="out-in">
      <CatalogView
        v-if="!selected"
        key="catalog"
        :projects="PROJECTS"
        @select="onSelect"
      />
      <DetailView
        v-else
        :key="'detail-' + selected.id"
        :project="selected"
        @back="onBack"
      />
    </Transition>
  </div>
</template>
