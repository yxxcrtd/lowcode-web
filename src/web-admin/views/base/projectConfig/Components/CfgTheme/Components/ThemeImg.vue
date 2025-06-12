<script lang="ts" setup>
import Red from '@/assets/imgs/red.png'
import Default from '@/assets/imgs/default.png'
import Dark from '@/assets/imgs/dark.png'
import Gold from '@/assets/imgs/gold.png'

defineOptions({ name: 'ThemeImg' })

const props =  defineProps(['modelValue'])
const emit = defineEmits(['update:modelValue','success'])

const themeList = ref([
  {value:'light',label:'默认',src:Default},
  {value:'red-theme',label:'红色',src:Red},
  {value:'dark',label:'夜晚',src:Dark},
  {value:'gold-theme',label:'金色',src:Gold},
])

const setTheme = (value) => {
  document.documentElement.classList.forEach(item => {
    document.documentElement.classList.remove(item)
  })
  emit('update:modelValue', value)
  emit('success', value)
  document.documentElement.classList.add(value)
}
</script>

<template>
  <div class="flex flex-wrap space-x-14px">
    <div class="theme-img" :class="modelValue === item.value?'is-acitve':''" v-for="item in themeList" :key="item.value" @click="setTheme(item.value)">
      <img style="width: 140px;height: 80px;" :src="item.src"/>
      <span class="mt-10px">{{ item.label }}</span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.theme-img{
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px;
  background: #f2f2f2;
  border-radius: var(--el-border-radius-base);
}
.is-acitve {
  border: 2px solid var(--el-color-primary);
}
</style>
