<script setup lang="ts">

import DosPlayer from '../dosplayer.vue';

const doomConfig = {
  zipPath: '/games/doom/doom.jsdos',
  executable: '/DOOM.EXE',
  conf: 'doom.conf'
};

</script>

<template>
    <DosPlayer
            :zipPath="doomConfig.zipPath"
            :executable="doomConfig.executable"
    />
</template>