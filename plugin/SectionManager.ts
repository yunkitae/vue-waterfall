export interface SectionManagerOptions {
  state?: State | null;
  containerWidth: number;
  itemPadding: number;
  containerHeight: number;
  scrollPosition: number;
  offsetTop: number;
  isUseContainerPadding: boolean;
  startGrid: number;
}

export interface Rect {
  top?: number,
  left?: number,
  width?: number,
  height?: number
};

export interface State {
  tops: Array<number>,
  style: any,
  scrollPosition: number,
  beforeScrollTop: number,
  grow: Array<number>,
  isFirst: boolean,
  itemWidth: number,
  delta: any,
  isUseContainerPadding: boolean,
  containerWidth: number,
  containerHeight: number,
  itemPadding: number,
  offsetTop: number,
  startGrid: number
};
export interface Metas {
  vm: any,
  node: HTMLElement,
  order: number,
  width: number,
  isWholeGrid: boolean,
  height: number
}

export default class SectionManager {
  private _state: State = {
    tops: [],
    style: {
      height: 0,
      overflow: ''
    },
    scrollPosition: 0,
    beforeScrollTop: 0,
    grow: [],
    isFirst: true,
    itemWidth: 0,
    delta: {
      keeper: [],
      viewPort: {
        start: 0,
        end: 1
      }
    },
    isUseContainerPadding: false,
    containerWidth: 0,
    containerHeight: 0,
    itemPadding: 0,
    offsetTop: 0,
    startGrid: 2
  };
  private _containerBuffer = 200;

  constructor(options: Required<SectionManagerOptions>) {
    this._init(options);
  }

  get state() {
    return this._state;
  }

  get itemWidth() {
    return this._state.itemWidth;
  }

  set state(state: State) {
    this._state = state;
  }
  set isFirst(is) {
    this._state.isFirst = is;
  }

  get isFirst() {
    return this._state.isFirst;
  }

  get start() {
    return this._state.delta.viewPort.start;
  }

  get end() {
    return this._state.delta.viewPort.end;
  }

  set end(count) {
    this._state.delta.viewPort.end = count;
  }

  public initFlushDisplayItems(total: number) {
    if (this.isFirst) {
      if (parseInt(this._state.style.height) >= this._state.containerHeight * 1.5 ||
        total === this.end) {
        this.isFirst = false;
      } else {
        this.end++;
      }
    }
  }

  public viewPortFromTo(pIsToTop: boolean, pScrollY: number, total: number) {
    if (total === 0) return;
    // 스크롤을 변경 하였으면 state에 상태값을 저장하자
    const state = this._state;
    const lDelta = state.delta;
    let lOffTopTemp;
    if (pScrollY < 0) { // 바운스시 -값에 대한 보정을 0으로 처리한다.
      pScrollY = 0;
    }
    lOffTopTemp = pScrollY - state.offsetTop;
    if (lOffTopTemp < 0) {
      lOffTopTemp = 0;
    }
    const lViewTop = lOffTopTemp;
    const lViewBottom = lViewTop + state.containerHeight + this._containerBuffer;
    const lGrow = state.grow;
    const lItemList = state.delta.keeper;
    const lTargetList = [];
    let lGridLoopCount = 0;
    let inItemTop;
    let inItemBottom;
    let inCondition1;
    let inCondition2;
    let inCondition;
    if (lViewTop <= -1) return null;

    // console.clear()
    if (pIsToTop) {
      const end = lDelta.viewPort.end;
      for (let i = end; i >= 0; --i) {
        // console.log(i)
        inItemTop = lItemList[i].top;
        inItemBottom = inItemTop + lItemList[i].height;

        inCondition1 = (inItemBottom >= lViewTop);
        inCondition2 = (inItemTop <= lViewBottom);
        inCondition = (inCondition1 && inCondition2);

        // console.log('serViewPort', lViewTop, inItemBottom, inCondition)
        if (inItemBottom < lViewTop) {
          break;
        }
        if (inCondition) {
          lTargetList.push(i);
        }
      }
    } else {
      const start = lDelta.viewPort.start;
      for (let i = start, endi = lItemList.length; i < endi; ++i) {
        // console.log(i)
        inItemTop = lItemList[i].top;
        inItemBottom = inItemTop + lItemList[i].height;

        inCondition1 = (inItemBottom >= lViewTop);
        inCondition2 = (inItemTop <= lViewBottom);
        inCondition = (inCondition1 && inCondition2);

        // console.log('serViewPort', lViewTop, inItemBottom, inCondition)
        if (inItemBottom < lViewTop) {
          continue;
        }
        if (inCondition) {
          lTargetList.push(i);
        } else {
          lGridLoopCount++;
          if (lGridLoopCount >= lGrow.length) {
            break;
          }
        }
      }
    }
    // console.log(lTargetList)
    if (lTargetList.length > 0) {
      const start = Math.min(...lTargetList);
      const end = Math.max(...lTargetList);
      lDelta.viewPort.start = Math.max(0, start - state.startGrid - 1);
      lDelta.viewPort.end = Math.min(total - 1, end + (state.startGrid * 2) + 3);
      return { start: lDelta.viewPort.start, end: lDelta.viewPort.end };
    }
    return null;
  }

  public calculate(metas: Array<Metas>) {
    const state = this._state;
    const isUseContainerPadding = state.isUseContainerPadding;
    const width = state.itemWidth;
    const strategy = SectionManager._rowStrategyWithGrow(width, state.grow);
    const keeper = state.delta.keeper;
    let tops: Array<number> = state.tops;

    metas.forEach((meta: Metas, index: number) => {
      const rect: Rect = {};
      if (!keeper[meta.vm.order]) {
        let offset;
        if (meta.isWholeGrid) {
          offset = tops.reduce((last: number, top: number, i: number) => top > tops[last] ? i : last, 0);
          rect.top = tops[offset];
          rect.left = 0;
          tops = tops.fill(rect.top + meta.height)
        } else {
          offset = tops.reduce((last, top, i) => top < tops[last] ? i : last, 0);
          rect.top = tops[offset];
          tops[offset] = rect.top + meta.height;
          rect.left = (() => {
            let inRet;
            if (isUseContainerPadding) {
              if (offset === 0) {
                inRet = strategy.left + state.itemPadding;
              } else {
                inRet = strategy.left + (offset ? SectionManager.sum(strategy.width.slice(0, offset)) : 0) + (state.itemPadding * (offset + 1));
              }
            } else {
              // 양 옆에 패딩을 사용안한다면
              if (offset === 0) {
                inRet = strategy.left;
              } else {
                inRet = strategy.left + (offset ? SectionManager.sum(strategy.width.slice(0, offset)) : 0) + (state.itemPadding * (offset));
              }
            }
            return inRet;
          })();
        }
        rect.width = meta.width;
        rect.height = meta.height;
        Object.assign(meta.node.style, SectionManager._buildStyle(rect));

        keeper.push(rect);
        state.tops = tops;
      } else {
        meta.vm.style = SectionManager._buildStyle(keeper[meta.vm.order]);
      }
    });

    // console.error(keeper.length)
    state.style.height = Math.max.apply(Math, state.tops);
  }

  /** initData **/
  private _init(options: SectionManagerOptions): void {
    if (options.state) {
      this._state = options.state;
      return;
    }
    const {scrollPosition, itemPadding, startGrid, isUseContainerPadding, containerHeight, offsetTop, containerWidth} = options
    // 고정 그리드를 설정여부
    const grow: Array<number> = ((pSize: number) => {
      const inArray = [];
      for (let i = 0, endi = pSize; i < endi; ++i) {
        inArray.push(1);
      }
      return inArray;
    })(startGrid);


    let itemWidth: number;
    if (isUseContainerPadding) {
      itemWidth = (containerWidth / startGrid) - (itemPadding * 1.5);
    } else {
      itemWidth = ((containerWidth - (itemPadding * (startGrid - 1))) / startGrid);
    }
    const strategy = SectionManager._rowStrategyWithGrow(itemWidth, grow);
  
    this._state.grow = grow
    this._state.scrollPosition = scrollPosition;
    this._state.itemWidth = itemWidth;
    this._state.isUseContainerPadding = isUseContainerPadding;
    this._state.containerWidth = containerWidth;
    this._state.containerHeight = containerHeight;
    this._state.itemPadding = itemPadding;
    this._state.offsetTop = offsetTop;
    this._state.startGrid = startGrid;
    this._state.tops = SectionManager.arrayFillWith(0, strategy.count);

  }

  private static arrayFillWith(item: any, count: number) {
    const arr = [];
    for (let i = 0; i < count; i++) {
      arr[i] = (typeof item === 'function') ? item() : item;
    }
    return arr;
  }

  private static sum(arr: Array<number>) {
    return arr.reduce((sum, val) => sum + val);
  }

  private static _buildStyle(rect: Rect) {
    return {
      top: 0,
      left: 0,
      width: rect.width + 'px',
      height: rect.height + 'px',
      transform: `translateX(${rect.left}px) translateY(${rect.top}px)`,
      WebkitTransform: `translateX(${rect.left}px) translateY(${rect.top}px)`,
      opacity: 1
    };
  }

  private static _rowStrategyWithGrow(width: number, grow: Array<number>) {
    return {
      width: grow.map(val => width),
      count: grow.length,
      left: 0
    };
  }
}
