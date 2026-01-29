<script setup lang="ts">

import DosPlayer from '../dosplayer.vue';

const doomConfig = {
  zipPath: /*https://thedoggybrad.github.io/doom_on_js-dos/DOOM-@evilution.zip',*/ '/games/doom/doom_asset.zip',
  executable: '/DOOM/DOOM.EXE',
  conf: 'doom.conf'
};

</script>

<template>
    <DosPlayer
            :zipPath="doomConfig.zipPath"
            :executable="doomConfig.executable"
    />
</template>