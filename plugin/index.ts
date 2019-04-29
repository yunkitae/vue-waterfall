import Vue from 'vue'
import Waterfall from './Waterfall.vue'
import WaterfallSlot from './WaterfallSlot.vue'

const plugin = {
  install(Vue: any, options: any) {
    Vue.component("Waterfall", Waterfall)
    Vue.component("WaterfallSlot", WaterfallSlot)
  }
}

export default plugin
