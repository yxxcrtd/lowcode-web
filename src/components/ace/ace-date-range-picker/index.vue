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
defineOptions({ name: 'AceDateRangePicker' })

const props = defineProps({
  modelValue: propTypes.string.def(''),
  startDate:propTypes.string.def(null),
  endDate:propTypes.string.def(null),
  placeholder:propTypes.string.def('请输入'),
  disabled:propTypes.bool.def(false),
  clearable:propTypes.bool.def(true),
  type:propTypes.string.def('daterange'),
  format:propTypes.string.def('YYYY-MM-DD'),
  valueFormat:propTypes.string.def('YYYY-MM-DD'),
  labelName: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue','update:startDate','update:endDate','change','input','blur','focus','clear'])
const curValue = computed({
  get: () => {
    if(props.startDate || props.endDate){
      return [props.startDate && props.startDate.substring(0,10),props.endDate && props.endDate.substring(0,10)]
    }else{
      return props.modelValue
    }
  },
  set: (val) => {
    emit('update:modelValue', val)
    if(val && val.length > 0){
      emit('update:startDate', val[0])
      emit('update:endDate', val[1])
    }
  }
})

watch(
  ()=>[props.startDate,props.endDate],
  ()=>{
    if(!props.modelValue && (props.startDate || props.endDate)){
      curValue.value=[props.startDate && props.startDate.substring(0,10),props.endDate && props.endDate.substring(0,10)]
    }
  }
)

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
