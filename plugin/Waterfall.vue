<template>
  <div class="vue-waterfall" :style="outerStyle">
    <template v-if="isShow">
      <waterfall-slot
        v-for="(item, index) in displayItems"
        :key="start + index"
        :item-width="state.itemWidth"
        :keeper-count="keeperCount"
        :is-whole-grid="item.isWholeGrid"
        :order="start + index"
        @reflow="reflow"
      >
        <slot
          name="cell"
          :item-width="state.itemWidth"
          :order="start + index"
          :item="item"
          :index="start + index"
          :slot-fade-time="slotFadeTime"
        />
      </waterfall-slot>
    </template>
  </div>
</template>

<script lang="ts">
import SectionManager from "./SectionManager";
import { Component, Vue, Prop, Inject, Watch } from "vue-property-decorator";

@Component
export default class Waterfall extends Vue {
  @Prop() private msg!: string;
  @Prop({ type: Number, default: 0 }) private containerWidth!: number;
  @Prop({ type: Number, default: 0 }) readonly containerHeight!: number;
  @Prop({ type: Number, default: 0 }) readonly startGrid!: number;
  @Prop({ type: Number, default: 0 }) readonly scrollTop!: number;
  @Prop({ type: Number, default: 0 }) readonly itemPadding!: number;
  @Prop({ type: Number, default: 300 }) readonly slotFadeTime!: number;
  @Prop({ type: Array, default: 0 }) readonly list!: Array<object>;
  @Prop({ type: Boolean, default: true }) readonly isUseContainerPadding!: boolean;
  @Inject({ default: {} }) readonly waterfallState!: object;

  isShow = false;
  itemWidth = 0;
  createdSlots: any[] = [];
  offsetTop = 0;
  height = 0;
  state: any = this.waterfallState;
  scrollBuffer = 0; // scrollTop buffer
  scrollBufferRange = 100; // scrollTop buffer range

  private _sectionManager: any;

  get displayItems() {
    return this.list.filter((item, index) => {
      return index >= this.start && index <= this.end;
    });
  }

  get start() {
    return this._sectionManager.start;
  }

   get end() {
    return this._sectionManager.end;
  }

  get outerStyle() {
    if (!this.state) {
      return {
        width: 0,
        height: 0
      };
    } else {
      return {
        height: this.state.style.height + "px",
        width: this.containerWidth + "px"
      };
    }
  }
  get keeperCount() {
    return this.state.delta.keeper.length;
  }

  mounted() {
    this.init();
    this.$nextTick(() => {
      if (this.state.tops !== null) {
        window.scroll({
          top: this.state.scrollPosition,
          left: 0
        });
        this._sectionManager.viewPortFromTo(false, this.state.scrollPosition, this.list.length);
      }
      this.isShow = true;
    });
  }

  beforeDestroy() {
    this._sectionManager = null;
  }

  @Watch("list")
  onListChange(val: Array<object>, oldVal: Array<object>) {
    this._sectionManager.viewPortFromTo(false, this.scrollTop, val.length);
  }

  @Watch("scrollTop")
  onScrollTopChange(val: number, oldVal: number) {
    this.flushDisplayItems(val);
  }

  init() {
    this.offsetTop = this.$el.getBoundingClientRect().top + window.scrollY;
    // console.log('init::::::::::::::: ', this.offsetTop, this.$el.offsetTop, window.scrollY)
    this._sectionManager = new SectionManager({
      state: this.state,
      offsetTop: this.offsetTop,
      isUseContainerPadding: this.isUseContainerPadding,
      containerWidth: this.containerWidth,
      containerHeight: this.containerHeight,
      scrollPosition: window.scrollY,
      itemPadding: this.itemPadding,
      startGrid: this.startGrid
    });
    this.state = this._sectionManager.state;
  }

  reflow(meta: any) {
    this.createdSlots.push(meta);
    setTimeout(() => {
      const $items= this.createdSlots;
      const metas: any[] = $items.map((slot: any) => slot.getMeta());
      metas.sort((a, b) => a.order - b.order);

      this._sectionManager.calculate(metas);
      this.createdSlots = [];
      this._sectionManager.initFlushDisplayItems(this.list.length);

      if (this.end === this.list.length - 1) {
        this.$emit("reflowed", this);
      }
    })
  }

  flushDisplayItems(scrollTop: number) {
    this.$set(this.state, "scrollPosition", scrollTop);
    const yVal = this.scrollBuffer - scrollTop;
    let isToTop: boolean;
    if (this.state.beforeScrollTop > scrollTop || scrollTop <= 0) {
      isToTop = true;
    } else {
      isToTop = false;
    }
    this.$set(this.state, "beforeScrollTop", scrollTop);
    if (Math.abs(yVal) < this.scrollBufferRange) {
      return;
    }
    this.scrollBuffer = scrollTop;
    const total = this.list.length;
    if (window.requestAnimationFrame) {
      window.requestAnimationFrame(() => {
        this._sectionManager.viewPortFromTo(isToTop, scrollTop, total);
      });
    }
  }
}
</script>
<style scoped="scoped" lang="scss">
.vue-waterfall {
  position: relative;
}
</style>
