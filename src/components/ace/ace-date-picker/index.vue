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
import {getCurDate} from "@/comRender/utils/renderUtil";

// 普通输入框
defineOptions({ name: 'AceDatePicker' })

const props = defineProps({
  modelValue: propTypes.string.def(''),
  placeholder:propTypes.string.def('请输入'),
  disabled:propTypes.bool.def(false),
  clearable:propTypes.bool.def(true),
  type:propTypes.string.def('date'),
  format:propTypes.string.def('YYYY-MM-DD'),
  valueFormat:propTypes.string.def('YYYY-MM-DD'),
  labelName: {
    type: String,
    default: ''
  },
  minDate:propTypes.string.def(''),
  maxDate:propTypes.string.def(''),
  rangeType:propTypes.string.def(''),
  disabledDate:propTypes.func
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
const rangTypeMap={
  'curMonth':()=>{
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return {
      start: firstDay,
      end: lastDay
    }
  },
  'curYear':()=>{
    const year = new Date().getFullYear();
    const firstDay = new Date(year, 0, 1);    // 1月1日
    const lastDay = new Date(year, 11, 31);   // 12月31日

    return {
      start: firstDay,
      end: lastDay
    }
  },
  'todayAfter':()=>{
    const firstDay = getCurDate('YYYY-MM-DD 00:00:00');    // 当日
    return {
      start: firstDay,
      end:null
    }
  },
  'todayBefore':()=>{
    const lastDay = getCurDate('YYYY-MM-DD 00:00:00');    // 当日
    return {
      start: null,
      end:lastDay
    }
  }
}
const handleDisabledDate = (value: Date) => {
  let minDate = props.minDate
  let maxDate = props.maxDate
  if(props.rangeType){
    const {start,end} = rangTypeMap[props.rangeType] && rangTypeMap[props.rangeType]() || {}
    minDate=start
    maxDate=end
  }
  if (minDate && maxDate) {
    const endTime = new Date(maxDate)
    const startTime = new Date(minDate)
    if (endTime.toString() !== "Invalid Date" && startTime.toString() !== "Invalid Date") {
      return !(value.getTime() >= startTime.getTime() && value.getTime() <= endTime.getTime())
    } else {
      // 代表传入的值有问题
      return false
    }
  }
  if (minDate) {
    const startTime = new Date(minDate)
    if (startTime.toString() !== "Invalid Date") {
      return !(startTime.getTime() <= value.getTime())
    } else {
      return false
    }
  }
  if (maxDate) {
    const endTime = new Date(maxDate)
    if (endTime.toString() !== "Invalid Date") {
      return !(value.getTime() <= endTime.getTime())
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
