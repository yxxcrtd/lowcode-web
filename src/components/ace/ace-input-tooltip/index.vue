<template>
  <el-tooltip ref="tooltipRef" :content="value" :disabled="!isTip">
    <slot></slot>
  </el-tooltip>
</template>

<script setup lang="ts">
import { propTypes } from '@/utils/propTypes'

defineOptions({ name: 'AceInputTooltip' })

const props = defineProps({
  value: propTypes.string.def('')
})
const isTip=ref(true)
</script>
