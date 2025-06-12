<template>
  <el-date-picker
    v-model="curValue"
    :placeholder="placeholder"
    :disabled="disabled"
    :clearable="clearable"
    :type="type"
    :format="format"
    :value-format="valueFormat"
    @change="handleChange"
    @input="handleInput"
    @blur="handleBlur"
    @focus="handleFocus"
    @clear="handleClear"
  ></el-date-picker>
</template>

<script setup lang="ts">
import { propTypes } from '@/utils/propTypes'

// 普通输入框
defineOptions({ name: 'AceDatetimeRangePicker' })

const props = defineProps({
  modelValue: propTypes.string.def(''),
  placeholder:propTypes.string.def('请输入'),
  disabled:propTypes.bool.def(false),
  clearable:propTypes.bool.def(true),
  type:propTypes.string.def('daterange'),
  format:propTypes.string.def('YYYY-MM-DD HH:mm:ss'),
  valueFormat:propTypes.string.def('YYYY-MM-DD HH:mm:ss'),
  labelName: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue','change','input','blur','focus','clear'])
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
const handleInput=(e)=>{
  emit('input',e)
}
const handleBlur=(e)=>{
  emit('blur',e)
}
const handleFocus=(e)=>{
  emit('focus',e)
}
const handleClear=(e)=>{
  emit('clear',e)
}

</script>

<style scoped lang="scss">
:deep(.el-input-group__prepend) {
  padding: 0;
}
</style>
