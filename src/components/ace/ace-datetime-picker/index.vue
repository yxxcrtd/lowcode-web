<template>
  <el-date-picker
    v-model="curValue"
    :placeholder="placeholder"
    :disabled="disabled"
    :clearable="clearable"
    :type="type"
    :format="format"
    :value-format="valueFormat"
    :disabled-date="disabledDate || handleDisabledDate"
    :disabled-hours = "disabledHours"
    :disabled-minutes = "disabledMinutes"
    :disabled-seconds = "disabledSeconds"
    @change="handleChange"
    @input="handleInput"
    @blur="handleBlur"
    @focus="handleFocus"
    @clear="handleClear"
  ></el-date-picker>
</template>

<script setup lang="ts">
import { propTypes } from '@/utils/propTypes'
import dayjs from "dayjs";

// 普通输入框
defineOptions({ name: 'AceDatetimePicker' })

const props = defineProps({
  modelValue: propTypes.string.def(''),
  placeholder:propTypes.string.def('请输入'),
  disabled:propTypes.bool.def(false),
  clearable:propTypes.bool.def(true),
  type:propTypes.string.def('datetime'),
  format:propTypes.string.def('YYYY-MM-DD HH:mm:ss'),
  valueFormat:propTypes.string.def('YYYY-MM-DD HH:mm:ss'),
  labelName: {
    type: String,
    default: ''
  },
  minDate:propTypes.string.def(''),
  maxDate:propTypes.string.def(''),
  disabledDate:propTypes.func,
  disabledHours:propTypes.func,
  disabledMinutes:propTypes.func,
  disabledSeconds:propTypes.func
})

const emit = defineEmits(['update:modelValue','change','input','blur','focus','clear'])
const curValue = computed({
  get: () => {
    if(typeof props.modelValue === "number"){
      return dayjs(props.modelValue).format(props.valueFormat)
    }else{
      return props.modelValue
    }
  },
  set: (val: string) => {
    emit('update:modelValue', val)
  }
})
const handleDisabledDate = (value: Date) => {
  if (props.minDate && props.maxDate) {
    const endTime = new Date(props.maxDate)
    const startTime = new Date(props.minDate)
    if (endTime.toString() !== "Invalid Date" && startTime.toString() !== "Invalid Date") {
      return !(value.getTime() > startTime.getTime() && value.getTime() < endTime.getTime())
    } else {
      // 代表传入的值有问题
      return false
    }
  }
  if (props.minDate) {
    const startTime = new Date(props.minDate)
    if (startTime.toString() !== "Invalid Date") {
      return !(startTime.getTime() < value.getTime())
    } else {
      return false
    }
  }
  if (props.maxDate) {
    const endTime = new Date(props.maxDate)
    if (endTime.toString() !== "Invalid Date") {
      return !(value.getTime() < endTime.getTime())
    } else {
      return false
    }
  }
}
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
