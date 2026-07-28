<script setup lang="ts">
import type { ResumeConfig } from '../config'

const props = defineProps<{
  resume: ResumeConfig
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const safeUrl = (url: string) => url || '#'
</script>

<template>
  <div class="modal-backdrop" @click.self="emit('close')">
    <div class="modal-panel">
      <button class="modal-close" aria-label="Cerrar" @click="emit('close')">
        &times;
      </button>

      <h3 class="modal-title">{{ resume.title }}</h3>
      <p class="modal-subtitle">{{ resume.subtitle }}</p>

      <div class="modal-options">
        <div class="lang-option">
          <span class="lang-label">{{ resume.es.label }}</span>
          <a
            class="btn btn-primary"
            :href="safeUrl(resume.es.viewUrl)"
            target="_blank"
            rel="noopener"
          >
            {{ resume.es.viewLabel }}
          </a>
          <a
            v-if="resume.es.downloadUrl"
            class="btn btn-secondary"
            :href="resume.es.downloadUrl"
            download
          >
            {{ resume.es.downloadLabel }}
          </a>
        </div>

        <div class="lang-divider" />

        <div class="lang-option">
          <span class="lang-label">{{ resume.en.label }}</span>
          <a
            class="btn btn-primary"
            :href="safeUrl(resume.en.viewUrl)"
            target="_blank"
            rel="noopener"
          >
            {{ resume.en.viewLabel }}
          </a>
          <a
            v-if="resume.en.downloadUrl"
            class="btn btn-secondary"
            :href="resume.en.downloadUrl"
            download
          >
            {{ resume.en.downloadLabel }}
          </a>
        </div>
      </div>
    </div>
  </div>
</template>
