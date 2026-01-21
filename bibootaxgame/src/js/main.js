//console.log('vue')

import { createApp } from 'vue'
import app from '../components/app.vue'

import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'

import '../styles/global.css'

createApp(app).mount('#app');