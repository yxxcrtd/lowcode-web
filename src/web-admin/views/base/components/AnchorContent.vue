<script setup lang="ts">
import {ref, watch} from 'vue'
import type {anchorItemType} from '../baseUseType'

const props = defineProps({
  anchorList: Array<anchorItemType>
})
const rightRef = ref()
const currentId = ref('')
const isScroll = ref(true);
watch(() => props.anchorList, (newValue) => {
  if (newValue && newValue.length > 0) {
    currentId.value = newValue[0].id
  }
}, {
  immediate: true,
})
const jumpArea = (id: string) => {
  isScroll.value = false
  const elements: HTMLElement[] = Array.from(rightRef.value.children)
  const element: HTMLElement | undefined = elements.find(elem => elem.id === id)
  if (element) {
    // element.scrollIntoView({behavior: "smooth", block: "start", inline: 'start'})
    currentId.value = id
    nextTick(() => {
      rightRef.value.scrollTo({
        top: element.offsetTop-40,
        behavior: 'smooth'
      });
      let timeId;
      if (timeId) clearTimeout(timeId);
      timeId = setTimeout(() => {
        isScroll.value = true;
      }, 500);
    })
  }
}
const handleScroll = () => {
  if (!isScroll.value) return
  const scrollTop = rightRef.value.scrollTop
  const scrollHeight = rightRef.value.scrollHeight
  const clientHeight = rightRef.value.clientHeight
  if (scrollTop + clientHeight === scrollHeight) {
    const currentItem = props.anchorList && props.anchorList[props.anchorList.length - 1]
    currentId.value = currentItem ? currentItem.id : currentId.value
    return
  }
  const childrenList = rightRef.value.children
  for (let i = 0; i < childrenList.length; i++) {
    const item = childrenList[i]
    const elOffsetTop = item.offsetTop
    const elClientHeight = item.clientHeight
    if (scrollTop >= elOffsetTop - (clientHeight/3)
      && scrollTop <= elClientHeight + elOffsetTop - (clientHeight/3)) {
      currentId.value = item.id
    }
  }
}
onMounted(() => {
  rightRef.value.addEventListener('scroll', handleScroll)
})
onBeforeUnmount(() => {
  rightRef.value.removeEventListener('scroll', handleScroll)
})


</script>

<template>
  <div class="anchor">
    <div class="left">
      <div class="anchor-item" :class="currentId ===anchorItem.id?'active':''" @click="jumpArea(anchorItem.id)" v-for="anchorItem in anchorList" :key="anchorItem.id">
        <div class="anchor-title">
          <Icon class="icon" :icon="`ep:${anchorItem.icon}`"/>
          <span class="title">{{ anchorItem.title }}</span>
        </div>
      </div>
    </div>
    <div class="right" ref="rightRef">
      <div class="slot-right" :id="anchorItemSlot.id" v-for="anchorItemSlot in anchorList" :key="anchorItemSlot.id">
        <div class="header">
          {{ anchorItemSlot.title }}:
        </div>
        <div class="down-slot">
          <slot :name="anchorItemSlot.id"></slot>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.anchor {
  display: flex;
  height: 100%;

  .left {
    width: 200px;
    padding: 5px;
    background-color: #EEEEEE;
    //margin-right: 20px;
    .anchor-item {
      padding: 5px;
      box-sizing: border-box;
      font-size: 12px;
      cursor: pointer;
      //text-align: center;
      .anchor-title {
        height: 35px;
        display: flex;
        align-items: center;

        .icon {
          margin-right: 5px;
        }
      }
    }

    .active {
      color: #FFF;
      background-color: var(--el-color-primary);
      border-radius: 3px;
      //background-color: #1e83e9;
    }
  }

  .right {
    height: 800px;
    max-height: 1000px;
    background-color: #fff;
    flex: 1;
    overflow-y: auto;

    .slot-right {
      .header {
        padding: 20px;
        font-size: 16px;
        font-weight: 500;
      }

      .down-slot {
        margin: 10px;
      }
    }
  }

  ::-webkit-scrollbar {
    width: 8px;
    border-radius: 10px;
  }

  ::-webkit-scrollbar-thumb {
    width: 8px;
    border-radius: 10px;
    background-color: #888;
  }

  ::-webkit-scrollbar-track {
    border-radius: 10px;
    background-color: #f2f2f2;
  }
}
</style>
