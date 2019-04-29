<template>
  <div class="vue-waterfall-slot" :style="[style ? {...style, transition: transitionCss} : {'width': width + 'px', transition: transitionCss}]">
    <slot />
  </div>
</template>
<style scoped="scoped" lang="scss">
  .vue-waterfall-slot {
    position: absolute;
    top: 0;
    left: 0;
    margin: 0;
    padding: 0;
    opacity: 0;
    box-sizing: border-box;
    transform: translate(0, 0);
  }
</style>
<script lang="ts">
import { Component, Vue, Prop, Inject, Watch } from 'vue-property-decorator';

@Component
export default class WaterfallSlot extends Vue {
  @Prop({type: Number, default: 0}) readonly keeperCount!: number;
  @Prop({type: Number, default: 0}) readonly itemWidth!: number;
  @Prop({type: Boolean, default: false}) readonly isWholeGrid!: Boolean;
  @Prop({type: Number, default: 0}) readonly order!: number;
  @Prop({type: Number, default: 300}) readonly slotFadeTime!: number;

  width = 0
  height = 0
  style = null

  get transitionCss() {
    return `opacity ${this.slotFadeTime}ms`;
  }

  mounted() {
    if (this.keeperCount - 1 > this.order) {
      this.notify();
      return;
    }

    this.width = this.isWholeGrid ? window.innerWidth : this.itemWidth;
    // this.$nextTick(() => {
      this.height = this.$el.clientHeight;
      this.notify();
    // });
  }

  notify() {
    this.$emit('reflow', this);
  }

  getMeta() {
    return {
      vm: this,
      node: this.$el,
      order: this.order,
      width: this.width,
      isWholeGrid: this.isWholeGrid,
      height: this.height
    };
  }
};
</script>
