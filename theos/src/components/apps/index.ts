import { markRaw } from 'vue'
import Notepad from './notepad.vue'
import Spotify from './spotify.vue'
import BibooTaxGame from './bibootaxgame.vue'
import DoomGame from './doomgame.vue'

export const appComponents: Record<string, any> = {
    notepad: markRaw(Notepad),
    spotify: markRaw(Spotify),
    bibootaxgame: markRaw(BibooTaxGame),
    doomgame: markRaw(DoomGame)
}