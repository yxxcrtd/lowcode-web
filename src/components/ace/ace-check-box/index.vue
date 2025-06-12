<template>
  <el-checkbox-group v-model="curValue" :disabled="disabled" @change="handleChange">
    <el-checkbox v-for="item in sourceDataList" :label="item[labelKey]" :disabled="item.disabled" :value="item[valueKey]" :key="item[valueKey]">
      {{ item[labelKey] }}
    </el-checkbox>
  </el-checkbox-group>
</template>

<script setup lang="ts">
import {getIntDictOptions} from "@/utils/dict";

defineOptions({ name: 'AceCheckBox' })

const props = defineProps({
  modelValue: {
    type:[Number,String,Array<any>]
  },
  disabled: {
    type: Boolean,
    default: false
  },
  options: {
    type: Array,
    default: () => []
  },
  dict:{
    type:String
  },
  labelKey: {
    type: String,
    default: 'label'
  },
  valueKey: {
    type: String,
    default: 'value'
  },
  isJoin:{
    type:Boolean,
    default:false
  },
})
type optionItem = {
  value: string
  label: string
  disabled?: boolean
}

const emit = defineEmits(['update:modelValue','change'])
let curValue = computed({
  get: () => {
    if(props.isJoin){
      return props.modelValue?.split(',')
    }else{
      return props.modelValue
    }
  },
  set: (val: any[]) => {
    emit('update:modelValue', props.isJoin ? val?.join(',') : val)
  }
})

let sourceDataList = ref<any[]>([])
//加载数据源，数据
const loadDataSource = () => {
  //先判断是否有数据源
  if(props.options && props.options.length){
    sourceDataList.value = props.options
    return
  }
  //判断是否是字典
  if(props.dict){
    sourceDataList.value = getIntDictOptions(props.dict)
    return;
  }
}
loadDataSource()
onMounted(() => {})

const handleChange=(value)=>{
  const checkItems=sourceDataList.value.filter(item=>value.includes(item.value))
  emit('change',value,checkItems)
}
</script>

<style scoped lang="scss">
:deep(.el-input-group__prepend) {
  padding: 0;
}
</style>
