<template>
  <main>
    <div class="report-wrap">
      <p id="time"></p>
      <p id="memory"></p>
    </div>
    <div class="waterfall-wrap">
      <waterfall
        :containerWidth="containerWidth"
        :containerHeight="containerHeight"
        :scrollTop="scrollTop"
        :itemPadding="itemPadding"
        @reflowed="reflowed"
        ref="waterfall"
        :startGrid="startGrid"
        :list="list"
      >
        <item slot="cell"  slot-scope="props" :item="props.item"  :itemWidth="props.itemWidth"></item>
      </waterfall>
    </div>
  </main>
</template>
<script>
import TEST_DATA from './data.json'
import Item from './components/Item.vue'
window.app_init_time = Date.now()

export default {
  provide () {
    return {
      waterfallState: this.$store.state.waterfall.test
    }
  },
  data () {
    return {
      json: TEST_DATA,
      containerHeight: 0,
      containerWidth: 0,
      itemPadding: 6,
      startGrid: 3,
      scrollTop: 0,
      stateKey: 'test',
      list: []
    }
  },
  created () {
    if (process.browser) {
      this.containerHeight = window.innerHeight
      this.containerWidth = window.innerWidth
      for (let i = 0; i < 100;  i++) {
          this.list.push(...this.json.list)
      }
    }
  },
  mounted () {
    window.addEventListener('scroll', this.updateScrollTop)
    this.reportPerformance();
  },
  beforeDestroy () {
    window.removeEventListener('scroll', this.updateScrollTop)
  },
  methods: {
    reflowed () {
    },
    updateScrollTop () {
      this.scrollTop = window.scrollY
    },
    reportPerformance() {
      const initTime = window.app_init_time
      const timeElement = document.getElementById('time')
      if (timeElement && initTime) {
          const timeWaste = Date.now() - initTime
          timeElement.textContent = 'Build waste: ' + timeWaste + ' ms.'
      }

      const memoryElement = document.getElementById('memory')
      const performance = window.performance || window.webkitPerformance
      if (memoryElement && performance && performance.memory && performance.memory.usedJSHeapSize) {
          const memoryUsed = parseInt(performance.memory.usedJSHeapSize / (1024 * 1024))
          memoryElement.textContent = 'Memory used: ' + memoryUsed + ' MB.'
      }
    }
  },
  computed: {
  },
  components: {
      Item
  }
}
</script>

<style lang="scss" scoped>
  body {
    margin:0;
  }
  main {
    position: relative;
  }
  .report-wrap {
    position: fixed;
    top: 10px;
    right: 10px;
    z-index: 10000;
    background: yellow;
    padding: 5px;
  }
</style>
