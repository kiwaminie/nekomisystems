<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Boot from './os/boot.vue'
import Kernel from './os/kernel.vue'
import { useSettingsStore } from "../components/apps/coreapps/settings/store"

const pcOn = ref(false);
const loadedOs = ref(false);
const startUp = ref(false);

const buttonPressed = ref(false);
const iconGlowing = ref(false);
const powerOnLed = ref(false);
const hideHardware = ref(false);

const shrink = ref(false);
const slideUp = ref(false);

onMounted(async () => {
    const savedStatus = localStorage.getItem('pc_power_state');

    if(savedStatus === 'on') {
        hideHardware.value = true;
        loadedOs.value = true;
        pcOn.value = true;
    }
    else{
        pcOn.value = false;
    }

    const settings = useSettingsStore();
    await settings.loadSettings();
})

const powerButtonClick = () => {
  const savedStatus = localStorage.getItem('pc_power_state');

  if(savedStatus === 'on') {
    //APAGAR
    pcOn.value = false
    hideHardware.value = false
    powerOnLed.value = false
    buttonPressed.value = false
    iconGlowing.value = false
    slideUp.value = true

    localStorage.setItem('pc_power_state', 'off');    

    setTimeout(() => {
      shrink.value = true

      setTimeout(() => {
        slideUp.value = false;
      }, 200)

      setTimeout(() => {
        shrink.value = false
      }, 700)
    }, 1000);

    setTimeout(() => {
      loadedOs.value = false;
    }, 2000);
  }
  else{
    //ENCENDER
    buttonPressed.value = true;
    powerOnLed.value = true;

    setTimeout(() => {
      buttonPressed.value = false;
    }, 500);

    setTimeout(() => {
      iconGlowing.value = true;
    }, 1200);

    setTimeout(() => {
      shrink.value = true;

      setTimeout(() => {
        slideUp.value = true;
      }, 200);

      setTimeout(() => {
        shrink.value = false;
      }, 700);
    }, 3000);

    setTimeout(() => {
      pcOn.value = true;
      localStorage.setItem('pc_power_state', 'on');
      hideHardware.value = true;
    }, 5000 );
  }
}

const bootSuccess = () => {
    loadedOs.value = true;
    startUp.value = true;
}

</script>

<template>
  <div class="main-font-pc" style="height: 100%; width: 100%;" :class="pcOn, { 'off-screen-container': !pcOn}">

    <div 
      v-if="!pcOn"
      class="d-flex-center monitor" 
      style="top: -100%;"
      :class="{
        'slide-up': slideUp,
        'hide-hardware': hideHardware,
      }"
    >
      <div :class="{ 'shrink': shrink }" class="monitor-child" style="background-color: black; height: 100%; width: 100%;"></div>
    </div>
    
    <div 
      v-if="!pcOn" 
      class="d-flex-center monitor"
      style="top: 0%;"
      :class="{
        'slide-up': slideUp, 
        'hide-hardware': hideHardware 
      }"
    >
      <div class="d-flex-center monitor-child" :class="{ 'shrink': shrink }">
        <div class="d-flex-center">
        
          <div class="message-container" style="padding-bottom: 70px;">
            Nada que ver aqui
          </div>

          <!--
          <div class="case-frame" style="margin-bottom: 12px; display: flex; flex-direction: row; align-items: center; justify-content: center;">
            <div></div>
            
            <div class="btn-frame d-flex-center">
              <button @click="powerButtonClick" class="btn-power-on d-flex-center">
                <i class="bi-power d-flex"></i>
                <div class="btn-shine"></div>
              </button>
            </div>
            
            <div>
              <div>
                <div></div>
                <div>POWER</div>
              </div>
            </div>
          </div>
          -->

          <div style="padding-bottom: 70px; width: 100%; ;display: flex; flex-direction: row; align-items: center; justify-content: center;">
            <div style="flex: 1;"></div>
            
            <button class="new-btn" ref="powerButton"
              @click="powerButtonClick"
              :class="{ 'new-btn-clicked': buttonPressed }"
            >
              <i class="bi-power icon-power"
                :class="{ 'booting': iconGlowing }"

              ></i>
            </button>
            
            <div class="d-flex-center" style="flex: 1;">
              <div 
                class="status-led"
                :class="{ 'status-led-on': powerOnLed }"
              ></div>
              <div style="color: #ffffffbf;">POWER</div>
            </div>
          </div>

          <div class="message-container d-flex-center">
            <div style="padding-bottom: 77px;">Apagaste tu computadora</div>
            <div style="font-size: 40px;">
              ¡Prendela de nuevo!
            </div>
            <div class="message-subtitle" style="font-size: 27px;">
              Presiona el boton...
            </div>
          </div>
        </div>      
      </div>
    </div>

    <Boot v-if="pcOn && !loadedOs"
        @boot-success="bootSuccess"
    />

    <Kernel v-if="loadedOs"
        :start-up="startUp"
        @shutdown="powerButtonClick"
    />
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Oxanium:wght@200..800&display=swap');

.hide-hardware{
  display: none !important;
}

.monitor{
  width: 100%;
  height: 100%;
  position: absolute;
  transition: transform 0.5s ease;
}

.monitor-child{
  transform-origin: center;
  transition: scale 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-up{
  transform: translateY(100%) !important;
}

.shrink {
  scale: 90% !important; 
  pointer-events: none;
}

.status-led{
  margin-bottom: 10px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: #000000;
  margin-right: 5px;
  transition: background-color 0.5s, box-shadow 0.5s;
}

.status-led-on{
  background-color: #b7ffb5;
  box-shadow: 0px 0px 16px 6px #51ff00;
}

.new-btn{
  flex: 1;
  position: relative;
  width: 14rem;
  height: 14rem;
  border-radius: 50%;
  outline: none;
  border: 10px #090909 solid;
  background: linear-gradient(15deg, #171717, #444245);
  box-shadow: inset 6px 2px 0px #7d7c7e, inset -6px -2px 0px #1c1c1c;
  color: #a6a6a64d;
  cursor: pointer;
  transition: transform 0.1s, box-shadow 0.1s;
  transform: translateY(0);
}

.new-btn::before{
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: inherit;
  /*background: linear-gradient(145deg, #363636, #606060);*/
  width: 14rem;
  height: 14rem;
  /*z-index: -1;*/
  box-shadow: 11px 11px 22px #141414, -11px -11px 22px #525252;
}

.new-btn-clicked{
  background: linear-gradient(-185deg, #131313, #444245);
  box-shadow: inset -6px -2px 0px #5e5e5e, inset 6px 2px 0px #1c1c1c;
  transform: translateY(4px);
}

/*.icon-clicked{
  color: #00ff00 !important;
  text-shadow: 0 0 20px #00ff00;
  transition: color 0.1s ease;
}*/

.icon-power{
  transition: color 2s ease;
  position: relative;
}

.icon-power.booting {
  animation: power-on-glow 1s forwards ease-in-out;
}

@keyframes power-on-glow {
  /*0% {
    color: #1a293a;
    filter: drop-shadow(0 0 0px rgba(0, 255, 0, 0));
  }*/
  /*30% {
    color: #2e9fcc;
    filter: drop-shadow(0 0 5px rgba(46, 146, 204, 0.5));
  }
  50% {
    color: #1a2d3a;
    filter: drop-shadow(0 0 2px rgba(0, 140, 255, 0.2));
  }*/
  100% {
    /* Estado encendido final: Luz sólida y resplandor amplio */
    color: #ffffff;
    filter: drop-shadow(0 0 8px rgba(44, 223, 255, 0.8)) 
            drop-shadow(0 0 20px rgba(53, 174, 255, 0.4));
  }
}

.new-btn i{
  font-size: 100px;
}

.main-font-pc{
  font-family: "Oxanium", sans-serif;
  font-optical-sizing: auto;
  font-weight: 400;
  font-style: normal;
}

.off-screen-container {
  background: linear-gradient(90deg, rgba(46,44,45,1) 0%, rgba(66,64,67,1) 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.message-container{
  color: #ffffff6e;  
  font-size: 50px;
}

.d-flex-center{
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.case-frame{
  background: linear-gradient(186deg, #fbd298, #a58352);
  width: 46rem;
  height: 30rem;
  box-shadow: inset 0px 0px 64px 76px #000000;
  background-clip: padding-box;
  /*filter: brightness(55%);*/
  /*border-radius: 24%;*/
  opacity: 60%;
}

.btn-power-on{
  background-color: #797979;
  border: 0;
  border-radius: 50%;
  width: 9rem;
  height: 9rem;
  box-shadow: inset 0px 0px 11px 6px #00000085;
  cursor: pointer;
}

.btn-shine{
  background: linear-gradient(180deg, #ffffff, #ffffff00);
  width: 7.5rem;
  height: 7.5rem;
  position: relative;
  border-radius: 50%;
  opacity: 50%;
}

.btn-power-on i{
  position: absolute;
  font-size: 4rem;
  color: #00000080;
}

.btn-frame{
    background: linear-gradient(127deg, #d5d5d5, #6d6d6d);
    border-radius: 50%;
    width: 12rem;
    height: 12rem;
    border: solid 4px #898989;
    box-shadow: 0px 0px 15px 2px #0000008c;
}

.screen {
  width: 95%;
  height: 90%;
  background: #000;
  transition: background 0.5s;
}

.screen-off {
  display: flex;
  align-items: center;
  justify-content: center;
}

/*.btn-power-on {
  background: none;
  border: 2px solid #333;
  color: #333;
  font-size: 3rem;
  border-radius: 50%;
  cursor: pointer;
  transition: 0.3s;
}

.btn-power-on:hover {
  color: #0f0;
  border-color: #0f0;
  text-shadow: 0 0 10px #0f0;
}*/

.led-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: red; /* Apagado */
}

.led-indicator.on, .led-indicator.booting {
  background: #0f0;
  box-shadow: 0 0 5px #0f0;
}

</style>