<template>
  <div class="photo">
    <img
      class="review-image"
      :style="{width: imageInfo.width + 'px', height: imageInfo.height + 'px'}"
      :src="`${item.attach[0].attachUri}360x0.jpg`"
    />
  </div>
</template>
<script>
  export default {
    props: {
      item: {
        required: true
      },
      itemWidth: {
        default: 0
      }
    },
    mounted () {
    },
    computed: {
      imageInfo () {
        let width = this.itemWidth
        let lItem = this.item
        let lImageWidth = 360
        if (lItem) {
          let lImageHeight = (() => {
            // 이벤트 타입
            if (lItem.type === 'event') {
              return lImageWidth * lItem.ratio['360x0']
              // 기본 리뷰 타입
            } else {
              if (lItem.attach && lItem.attach.length > 0) {
                return lImageWidth * lItem.attach[0].ratio['360x0']
              } else {
                return lImageWidth * 1
              }
            }
          })()
          let inImageHeight = Math.round((width * lImageHeight) / lImageWidth) // 이미지 사이즈는 좀 양 패딩값 적용해야함
          return {
            width: width,
            height: inImageHeight
          }
        }
      }
    }

  }
</script>
<style scoped lang="scss">
  .photo {
    margin-bottom: 6px;
  }

</style>
