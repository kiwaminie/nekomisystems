<script setup>

import { ref } from 'vue'
import WelcomeMenu from './welcomemenu.vue';

const titulo = ref("Biboo-Tax: The Game")

</script>

<template>
    <div style="height: 100%; width: 100%;">
        <img id="GameCharacter" src="../characters/biboo.png" style="position: fixed; top: 100px; left: 100px; width: 180px; object-fit: cover;" />

        <WelcomeMenu/>
    </div>
</template>