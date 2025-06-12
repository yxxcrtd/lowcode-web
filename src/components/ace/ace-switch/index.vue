<template>
  <el-switch
    v-model="curValue"
    :disabled="disabled"
    inline-prompt
    :active-text="textRange[0]"
    :active-value="valueRange[0]"
    :inactive-text="textRange[1]"
    :inactive-value="valueRange[1]"
    @change="handleChange"
  />
</template>

<script setup lang="ts">
import { propTypes } from '@/utils/propTypes'

// 普通输入框
defineOptions({ name: 'AceSwitch' })

const props = defineProps({
  modelValue: propTypes.string.def(''),
  disabled:propTypes.bool,
  textRange: {
    type: Array,
    default: ()=>['是','否']
  },
  valueRange: {
    type: Array,
    default: ()=>['1','0']
  }
})

const emit = defineEmits(['update:modelValue','change'])
const curValue = computed({
  get: () => {
    return props.modelValue
  },
  set: (val: string) => {
    emit('update:modelValue', val)
  }
})

const handleChange=(e)=>{
  emit('change',e)
}
</script>

<style scoped lang="scss">
</style>
