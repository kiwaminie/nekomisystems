import { createApp } from 'vue'
import Computer from './components/computer.vue'
import { createPinia } from "pinia"
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community'

import "bootstrap-icons/font/bootstrap-icons.css"
import "bootstrap/dist/js/bootstrap.bundle.min.js"

import "./components/styles/global.css"
import "./components/styles/libraries/bootstrap-custom.scss"

ModuleRegistry.registerModules([AllCommunityModule])

const app = createApp(Computer)
const pinia = createPinia()

app.use(pinia)
app.mount('#app')