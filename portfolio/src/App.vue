<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { PROJECTS } from './config'
import type { Project } from './config'
import NavBar from './components/NavBar.vue'
import CatalogView from './components/CatalogView.vue'
import DetailView from './components/DetailView.vue'

const selected = ref<Project | null>(null)

const onSelect = (project: Project) => {
  selected.value = project
  nextTick(() => window.scrollTo({ top: 0, behavior: 'instant' }))
}

const onBack = () => {
  selected.value = null
  nextTick(() => window.scrollTo({ top: 0, behavior: 'instant' }))
}
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
