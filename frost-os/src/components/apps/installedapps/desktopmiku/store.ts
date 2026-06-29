import { defineStore } from 'pinia';
import { reactive, ref } from 'vue';

export const useDesktopMikuStore = defineStore('app_desktopmiku', () => {
  // 1. Estado Reactivo
  const state = reactive({
    currentAnimation: 'idle',
    isHappy: true
  });

  return { state };
});