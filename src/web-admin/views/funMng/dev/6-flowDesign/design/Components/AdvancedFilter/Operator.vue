<script setup lang="ts">
import { useVModel } from '@vueuse/core'

const $props = defineProps<{
  modelValue: string
}>()
const operatorOptions = [
  {
    value: 'eq',
    label: '等于'
  },
  {
    value: 'ne',
    label: '不等于'
  },
  {
    label: '大于',
    value: 'gt'
  },
  {
    label: '大于等于',
    value: 'gte'
  },
  {
    label: '小于',
    value: 'lt'
  },
  {
    label: '小于等于',
    value: 'lte'
  },
  {
    label: '属于',
    value: 'in'
  },
  {
    label: '不属于',
    value: 'ni'
  },
  {
    label: '包含',
    value: 'co'
  },
  {
    label: '不包含',
    value: 'nco'
  }
]
const $emits = defineEmits<{
  (e: 'update:modelValue', modelValue: any): void
}>()
const data = useVModel($props, 'modelValue', $emits)
</script>

<template>
  <el-select class="operator-container" v-model="data" filterable placeholder="筛选符">
    <el-option
      v-for="item in operatorOptions"
      :key="item.value"
      :label="item.label"
      :value="item.value"
    />
  </el-select>
</template>

<style scoped lang="scss">
.operator-container {
  width: 100%;
  flex-shrink: 0;
}
</style>
