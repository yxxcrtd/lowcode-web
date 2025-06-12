<template>
  <el-tooltip effect="dark" placement="bottom-start" :disabled="isTip" popper-class="amt-popover-tooltip">
    <template #content>
      {{ currencyFilter(modelValue) }}<br />
      {{ digitUppercase(modelValue) }}
    </template>
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
      <template v-for="(index, name) in slots" v-slot:[name]="data">
        <slot :name="name" v-bind="data" />
      </template>
      <template #append v-if="appendTitle">
        <span>{{ appendTitle }}</span>
      </template>
    </el-input>
  </el-tooltip>
</template>

<script setup lang="ts" name="TInput">
import { computed, useSlots } from "vue"
import bigNumberUtil from "@/utils/bigNumberUtil";
import { digitUppercase } from "@/utils/formatter";
const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ""
  },
  placeholder: {
    type: String,
    default: "请输入"
  },
  // 小数、金额类型时，小数点后最多几位
  decimalLimit: {
    type:[Number,String],
    default: null
  },
  maxlength:{
    type:Number,
  },
  appendTitle: {
    type: String,
    default: "元"
  },
  // 是否显示千分号
  showThousands: {
    type: Boolean,
    default: true
  },
  //比率
  rate:{
    type:[String,Number],
    default:1
  },
  // 是否显示金额中文提示
  isTip: {
    type: Boolean,
    default: true
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
const slots = useSlots()


const decimalCount=ref(props.decimalLimit)
const minValue=ref(props.min)
const maxValue=ref(props.max)
/**
 * 根据类型 设置默认值
 */
const setDefProps=()=>{
  if(decimalCount.value==null){
    decimalCount.value=2
    if(['万元','亿元'].includes(props.appendTitle)){
      decimalCount.value = 4
    }
  }
  if(minValue.value==null){
    if(props.appendTitle==='元') minValue.value=-9999999999999
    if(props.appendTitle==='万元') minValue.value=-999999999
    if(props.appendTitle==='亿元') minValue.value=-99999
  }
  if(maxValue.value==null){
    if(props.appendTitle==='元') maxValue.value=9999999999999
    if(props.appendTitle==='万元') maxValue.value=999999999
    if(props.appendTitle==='亿元') maxValue.value=99999
  }
}
setDefProps()

const emits = defineEmits(["update:modelValue",'change'])
// 双向绑定代理
const displayValue = ref('')
const actualValue = computed({
  get: () => {
    return props.modelValue || props.modelValue === 0 ? bigNumberUtil.divide(props.modelValue,props.rate,Number(decimalCount.value)) : props.modelValue
  },
  set: (val) =>{
    const decimalPlacesLen=bigNumberUtil.getDecimalPlacesLen(props.rate)
    emits('update:modelValue', val ? bigNumberUtil.multiply(val,props.rate,Number(decimalCount.value)+decimalPlacesLen) : val)
  }
})

// 格式化显示（千分位+小数点）
const formatNumber = (num) => {
  if (!num) return ''
  const parts = Number(num).toFixed(decimalCount.value).split('.')
  if(decimalCount.value>0){
    return `${parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')}.${parts[1] || ''}`
  }else{
    return `${parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`
  }
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

  displayValue.value = filtered
  actualValue.value = filtered ? parseNumber(filtered) : filtered
}

// 焦点事件处理
const handleFocus = () => {
  console.log('actualValue.value',actualValue.value)
  isFocus.value = true
  displayValue.value = actualValue.value.toString()
}

const handleBlur = () => {
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
}

// 响应外部值变化
watch(() => props.modelValue, (val) => {
  if (!isFocus.value) {
    displayValue.value = val || val === 0 ? formatNumber(bigNumberUtil.divide(val,props.rate)) : val
  }
}, { immediate: true })


/**
 * 数字金额格式过滤 10000 => "￥10,000.00"
 * @param {number} amt 被转换数字
 * @param {number} n 保留小数位
 */
const currencyFilter = (amt: any, n: number = 2) => {
  let num=String(amt).replaceAll(',','')
  const reg = /((^[1-9]\d*)|^0)(\.\d+)?$/
  if (!reg.test(num)) {
    return ""
  } else {
    n = n > 0 && n <= 20 ? n : 2
    if (num || num === 0) {
      num = parseFloat((num + "").replace(/^\d\.-/g, "")).toFixed(n) + ""
      const l = num.split(".")[0].split("").reverse()
      const r = num.split(".")[1]
      let t = ""
      for (let i = 0; i < l.length; i++) {
        t += l[i] + ((i + 1) % 3 === 0 && i + 1 !== l.length ? "," : "")
      }
      return num ? "￥ " + t.split("").reverse().join("") + "." + r : ""
    } else {
      return ""
    }
  }
}

const handleChange=(e)=>{
  emits('change',e)
}
const handleClear = () => {
  actualValue.value = null
}
</script>
<style lang="scss">
.amt-popover-tooltip{
  .el-popper__arrow{
    transform: translate(3px, 0px) !important;
  }
}
</style>
