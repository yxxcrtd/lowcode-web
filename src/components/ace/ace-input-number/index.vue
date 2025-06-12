<template>
  <el-input
    ref="inputRef"
    v-model="displayValue"
    v-bind="{ placeholder, clearable: true,maxlength, ...$attrs }"
    @input="handleInput"
    @blur="handleBlur"
    @focus="handleFocus"
    @change="handleChange"
    @clear="handleClear"
  >
    <!-- 透传插槽 -->
    <template v-for="(_, name) in $slots" #[name]="slotData">
      <slot :name="name" v-bind="slotData"></slot>
    </template>
    <template #append v-if="append">
      <span>{{ append }}</span>
    </template>
  </el-input>
</template>

<script setup lang="ts" name="TInput">
import {computed, useSlots} from "vue"
import bigNumberUtil from "@/utils/bigNumberUtil";
const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ""
  },
  placeholder: {
    type: String,
    default: "请输入"
  },
  maxlength:{
    type:[Number,String],
  },
  //小数点后最多几位
  decimalLimit: {
    type:[Number,String],
    default: null
  },
  //比率
  rate:{
    type: [Number,String],
    default: 1
  },
  append:{
    type:String,
    default:null
  },
  min:{
    type:[Number,String]
  },
  max:{
    type:[Number,String]
  },
})
const inputRef = ref(null)
const isFocus = ref(false)

const decimalCount=ref(props.decimalLimit)
const minValue=ref(props.min)
const maxValue=ref(props.max)
/**
 * 根据类型 设置默认值
 */
const setDefProps=()=>{
  if(decimalCount.value==null){
    decimalCount.value=2
    if(['年','月','日'].includes(props.append)){
      decimalCount.value = 0
    }
    if(['%','倍'].includes(props.append)){
      decimalCount.value=4
    }
  }
  if(minValue.value==null){
    if(props.append==='%'){
      minValue.value=0
    }
  }
  if(maxValue.value==null){
    if(props.append==='%'){
      maxValue.value=1000
    }
  }
}
setDefProps()

const emits = defineEmits(["update:modelValue", 'change', 'input', 'blur', 'focus', 'clear'])
// 双向绑定代理
const displayValue = ref('')
const actualValue = computed({
  get: () => {
    return props.modelValue || props.modelValue === 0 ? bigNumberUtil.divide(props.modelValue,props.rate,Number(decimalCount.value)) : props.modelValue
  },
  set: (val) =>{
    //获取换算比率的小数位，如果换算比率是小数，必须在计算时补充，否则实际保存会丢失小数部分
    const decimalPlacesLen=bigNumberUtil.getDecimalPlacesLen(props.rate)
    emits('update:modelValue', val ? bigNumberUtil.multiply(val,props.rate,Number(decimalCount.value)+decimalPlacesLen) : val)
  }
})

// 格式化显示（千分位+小数点）
const formatNumber = (num) => {
  if (num==null || num==undefined || num == '') return ''
  return bigNumberUtil.format(num,Number(decimalCount.value))
}

// 解析输入值
const parseNumber = (str) => parseFloat(str.replace(/,/g, '')) || 0

// 输入过滤逻辑
const handleInput = (value) => {
  if (!isFocus.value) return

  // 1. 基础过滤（允许负号开头，禁止其他非法字符）
  let filtered = value.replace(/[^-0-9.]/g, '')

  // 2. 多小数点处理
  const dotCount = (filtered.match(/\./g) || []).length
  if (dotCount > 1) filtered = filtered.replace(/\.+$/, '')

  // 3. 负号位置校验
  if (filtered.indexOf('-') > 0) filtered = filtered.replace(/-/g, '')
  
  // 4. 小数位控制
  if(!decimalCount.value || decimalCount.value==0){
    filtered = filtered.replace(/[^0-9]/g, "")//只能输入整数
  }else{
    const regex=new RegExp(`^\\D*([0-9]\\d*\\.?\\d{0,${decimalCount.value}})?.*$`) 
    filtered = filtered.replace(regex, '$1')//限制小数位
  }

  displayValue.value = filtered
  actualValue.value = filtered ? parseNumber(filtered) : filtered 
}

// 焦点事件处理
const handleFocus = (e) => {
  isFocus.value = true
  displayValue.value = actualValue.value?.toString()
  emits('focus', e)
}

const handleBlur = (e) => {
  isFocus.value = false
  //控制最大最小值
  if(minValue.value!=null && Number(actualValue.value)<Number(minValue.value)){
    actualValue.value=minValue.value
  }
  if(maxValue.value!=null && Number(actualValue.value)>Number(maxValue.value)){
    actualValue.value=maxValue.value
  }
  //格式化
  displayValue.value = formatNumber(actualValue.value)
  emits('blur', e)
}
const handleChange=(e)=>{
  emits('change',e)
}
const handleClear = () => {
  actualValue.value = null
}
// 响应外部值变化
watch(() => props.modelValue, (val) => {
  if (!isFocus.value) {
    displayValue.value = val || val === 0 ? formatNumber(bigNumberUtil.divide(val,props.rate)) : val
  }
}, { immediate: true })
</script>

<style scoped lang="scss">
:deep(.el-input-group__prepend) {
  padding: 0;
}
</style>
