<template>
  <transition name="fade">
    <div class="v-images-wrap" ref="vImagesWrap" v-if="visible">
      <!--   载入loading     -->
      <Icon v-show="imgState === 'loading'" class="view-icon img-loading rotate-animation" icon="yt-icon-loading"></Icon>
      <div ref="imgContainer" :style="dragStyle" class="img-container">
        <!--<editor-fold desc="图片加载成功">-->
        <img
          class="img-content"
          v-show="imgState === 'success'"
          @dragstart.prevent
          :src="src"
          :style="`transform: scale(${imgScale}) rotate(${imgRotate}deg);`"
          alt=""
        />
        <!--</editor-fold>-->

        <!--   图片加载失败     -->
        <svg
          class="icon img-content img-error"
          v-show="imgState === 'error'"
          @dragstart.prevent
          aria-hidden="true"
          :style="`transform: scale(${imgScale}) rotate(${imgRotate}deg);`"
        >
          <use xlink:href="#v3-img-img-error"></use>
        </svg>
        <Icon
          icon="yt-icon-img-Error"
          class="icon img-content img-error"
          v-show="imgState === 'error'"
          @dragstart.prevent
          aria-hidden="true"
          :style="`transform: scale(${imgScale}) rotate(${imgRotate}deg);`"></Icon>
      </div>

      <!--    关闭按钮    -->
      <Icon icon="yt-icon-img-close" class="view-icon close-btn" @click.stop="handleClose"
            v-if="showCloseBtn"></Icon>

      <!--    左箭头    -->
      <div
        v-if="visibleArrowBtn"
        class="arrow arrow-left"
        @click="toggleImg(false)"
      >
        <Icon icon="yt-icon-xiangzuo" class="icon"></Icon>
      </div>
      <!--    右箭头    -->
      <div
        v-if="visibleArrowBtn"
        class="arrow arrow-right"
        @click="toggleImg(true)"
      >
        <Icon icon="yt-icon-xuanzeqixiayige" class="icon"></Icon>
      </div>
      <!--    工具栏    -->
      <div class="v3-img-preview-toolbar" v-if="showToolbar">
        <section>
          <Icon icon="yt-icon-img-zoom-out" class="view-icon" @click="handleScale(-0.1, false)" :size="25"></Icon>
          
          <Icon icon="yt-icon-img-zoom-out1" class="view-icon" @click="handleScale(0.1, false)" :size="28"></Icon>
          
          <Icon icon="yt-icon-yuanshidaxiao" class="view-icon" @click="initImgSize" :size="26"></Icon>
          <Icon icon="yt-icon-zuoxuanzhuan90" class="view-icon" @click="handleRotate(false)" :size="26"></Icon>
          <Icon icon="yt-icon-youxuanzhuan90" class="view-icon" @click="handleRotate(true)" :size="26"></Icon>
        </section>
      </div>
    </div>
  </transition>
</template>

<script lang="ts">
import {
  defineComponent,
  reactive,
  ref,
  toRefs,
  onMounted,
  nextTick,
  PropType,
  computed
} from 'vue'
import {
  onKeyStroke,
  useDebounceFn,
  useDraggable,
  useEventListener
} from '@vueuse/core'
import {isURL} from "@/utils";
import {isArray} from "@/utils/is";
// import { loadIcon } from '@/iconfont/iconfont'
type imgState = 'loading' | 'error' | 'success'

const keys = [
  'a',
  's',
  'd',
  'w',
  'q',
  'e',
  'A',
  'S',
  'D',
  'W',
  'Q',
  'E',
  'ArrowUp',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'Escape',
  ' '
]

const loadImage = (url: string) => {
  const img = new Image()
  img.src = url
  return new Promise((resolve, reject) => {
    img.onload = () => {
      resolve(url)
    }
    img.onerror = () => {
      reject(url)
    }
  })
}
export default defineComponent({
  name: 'ImgPreview',
  props: {
    showToolbar: {
      type: Boolean,
      default: true
    },
    showArrowBtn: {
      type: Boolean,
      default: true
    },
    keyboard: {
      type: Boolean,
      default: true
    },
    url: {
      type: String,
      default: undefined
    },
    escClose: {
      type: Boolean,
      default: true
    },
    showCloseBtn: {
      type: Boolean,
      default: true
    },
    index: {
      type: Number,
      default: 0
    },
  },
  setup(props, { emit }) {
    const vImagesWrap = ref<HTMLElement | null>(null)
    const imgContainer = ref<HTMLElement | null>(null)
    const { style: dragStyle } = useDraggable(imgContainer)
    const images=ref([])
    const state = reactive({
      visible: true,
      imgState: 'loading' as imgState,
      src: null,
      imgIndex: props.index
    })

    const visibleArrowBtn = computed(() => {
      return images.value?.length > 1 && props.showArrowBtn
    })
    const style = reactive({
      imgScale: 1,
      imgRotate: 0
    })
    const isMultiple = computed(() => images.value?.length > 1)
    /**
     * 键盘事件
     * @type {(e: KeyboardEvent) => void}
     */
    const handleKeyStroke = useDebounceFn((e: KeyboardEvent) => {
      if (!props.keyboard) return false
      e.preventDefault()
      const { key } = e
      if (['s', 'S', 'ArrowDown'].includes(key)) return handleScale(-0.1, false)
      if (['w', 'W', 'ArrowUp'].includes(key)) return handleScale(0.1, false)
      if (key === ' ') return initImgSize()
      if (key === 'Escape' && props.escClose) return handleClose()
      if (['E', 'e'].includes(key)) return handleRotate(true)
      if (['Q', 'q'].includes(key)) return handleRotate(false)
      if (['a', 'A', 'ArrowLeft'].includes(key)) return toggleImg(false)
      if (['d', 'D', 'ArrowRight'].includes(key)) return toggleImg(true)
    }, 200)
    onKeyStroke(keys, handleKeyStroke)

    /**
     * 初始化图片，绑定事件
     */
    function initImg() {
      nextTick(() => {
        // 判断是否多图
        if (Array.isArray(images.value) && images.value.length > 0) {
          return changeUrl(images.value[state.imgIndex])
        } else {
          return console.error('images is not Array or Array length is 0')
        }
      })
    }
    /**
     * 初始化图片位置及尺寸
     */
    const initImgSize = () => {
      style.imgScale = 1
      style.imgRotate = 0
      imgContainer.value!.style.top = '0'
      imgContainer.value!.style.left = '0'
    }

    /**
     * 图片旋转
     * @param {boolean} flag
     */
    function handleRotate(flag: boolean) {
      style.imgRotate += 90 * (flag ? 1 : -1)
      // if ([360, -360].includes(style.imgRotate)) style.imgRotate = 0
    }
    /**
     * 图片缩放
     * @param {number} num 缩放比例
     * @param {boolean} flag 为true时，固定为num比例，为false时，num为增量
     */
    function handleScale(num: number, flag = false) {
      if (style.imgScale <= 0.2 && num < 0) return
      if (flag) {
        style.imgScale = num
      } else {
        style.imgScale += num
      }
    }

    /**
     * 监听鼠标滚轮事件，触发图片缩放
     * @param {WheelEvent} e
     */
    function handleScroll(e: WheelEvent) {
      e.preventDefault()
      handleScale(e.deltaY < 0 ? 0.05 : -0.05)
    }

    /**
     * 切换图片url
     * @param {string} url 图片地址
     */
    function changeUrl(url) {
      state.imgState = 'loading'
      if(isURL(url)){
        loadImage(url)
          .then(() => {
            state.imgState = 'success'
            state.src = url
            initImgSize()
          })
          .catch(() => {
            state.imgState = 'error'
          })
      }else{

        state.imgState = 'success'
        state.src = window.URL.createObjectURL(url)
        initImgSize()
      }
      
    }

    /**
     * 初始化
     */
    function init() {
      nextTick(() => {
        useEventListener(vImagesWrap.value, 'mousewheel', handleScroll, false)
        initImgSize()
        initImg()
      })
    }
    onMounted(() => {
      //if (!window.__V3__IMG__PREVIEW__LOAD__ICON__SVG__) loadIcon()
      //init()
    })
    function preview(imgs){
      if(!isArray(imgs)){
        imgs=[imgs]
      }
      images.value=imgs
      console.log(images)
      init()
    }

    /**
     * 关闭图片预览
     */
    function handleClose() {
      state.visible = false
      emit('close')
    }

    /**
     * 切换图片
     * @param {boolean} flag 为true时，切换到下一张，为false时，切换到上一张
     */
    function toggleImg(flag: boolean) {
      if (!isMultiple.value) return
      if (flag) {
        state.imgIndex++
        if (state.imgIndex > images.value.length - 1) state.imgIndex = 0
      } else {
        state.imgIndex--
        if (state.imgIndex < 0) state.imgIndex = images.value.length - 1
      }
      changeUrl(images.value[state.imgIndex])
    }
    return {
      vImagesWrap,
      imgContainer,
      ...toRefs(state),
      ...toRefs(style),
      handleClose,
      toggleImg,
      initImgSize,
      dragStyle,
      handleScale,
      handleRotate,
      visibleArrowBtn,
      isMultiple,
      preview
    }
  }
})
</script>
<style lang="scss" scoped>
.view-icon {
  width: 1em;
  height: 1em;
  vertical-align: -0.15em;
  fill: #ffffff;
  overflow: hidden;
  //font-size: 26px !important;
  padding: 0 10px;
  transition: all 0.2s;
  &:hover{
    transform: scale(1.2);
  }
}

.v-images-wrap {
  z-index: 200;
  user-select: none;
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(3px);
  color: #fff;
  .img-loading,
  .img-content {
    font-size: 50px;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    margin: auto;
    transition: all 0.2s;
    cursor: move;
  }

  .img-container {
    z-index: 201;
    position: absolute;
    height: 100vh;
    width: 100vw;
    top: 0;
    left: 0;
    text-align: center;
    .img-content {
      max-width: 100%;
      max-height: 100%;
    }
    .img-error {
      font-size: 300px;
      color: #d8d8d8;
    }
  }

  .rotate-animation {
    animation: rotate 1.5s linear infinite;
  }
  .arrow {
    width: 42px;
    height: 42px;
    text-align: center;
    line-height: 42px;
    position: absolute;
    top: 50%;
    border-radius: 50%;
    transform: translateY(-50%);
    -ms-transform: translateY(-50%);
    font-size: 24px;
    cursor: pointer;
    transition: all 0.2s;
    z-index: 280;
    background: rgba(0, 0, 0, 0.3);
    &:hover {
      opacity: 0.8;
      transform: translateY(-50%) scale(1.2);
    }
  }
  .arrow-left {
    left: 50px;
  }
  .arrow-right {
    right: 50px;
  }
  .close-btn {
    z-index: 205;
    position: absolute;
    right: 50px;
    top: 50px;
    width: 18Px;
    height: 36Px;
    font-size: 22px;
    line-height: 36Px;
    text-align: center;
    border-radius: 100%;
    cursor: pointer;
    transition: all 0.2s;
    color: #e7e5e5;
    background: rgba(0, 0, 0, 0.3);
    &:hover {
      opacity: 0.8;
      transform: scale(1.2);
    }
  }
  .v3-img-preview-toolbar {
    z-index: 205;
    position: absolute;
    bottom: 10%;
    font-size: 26px;
    width: 100%;
    display: flex;
    justify-content: center;
    cursor: pointer;
    section {
      height: 44px;
      bottom: 10%;
      padding: 0 22px;
      display: flex;
      align-items: center;
      border-radius: 22px;
      background: rgba(0, 0, 0, 0.3);
      color: #c3c3c3;
      svg {
        box-sizing: content-box;
        padding: 0 10px;
        transition: all 0.2s;
        &:hover {
          transform: scale(1.2);
        }
      }
    }
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
