<template>
  <el-radio-group v-model="curValue" :disabled="disabled" @change="handleChange">
    <el-radio v-for="item in sourceDataList" :label="item[labelKey]" :disabled="item.disabled" :value="item[valueKey]" :key="item[valueKey]">
      {{ item[labelKey] }}
    </el-radio>
  </el-radio-group>
</template>

<script setup lang="ts">
import {getIntDictOptions} from "@/utils/dict";
defineOptions({ name: 'AceRadio' })

const props = defineProps({
  modelValue: {
    type: [String,Number],
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
  }
})
type optionItem = {
  value: string
  label: string
  disabled?: boolean
}

const emit = defineEmits(['update:modelValue','change'])
let curValue:any = computed({
  get: () => {
    return props.modelValue
  },
  set: (val: any) => {
    emit('update:modelValue', val)
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
    sourceDataList.value = getIntDictOptions(props.dict.trim())
    return;
  }
}

const handleChange=(value)=>{
  const checkItem=sourceDataList.value.find(item=>value==item.value)
  emit('change',value,checkItem)
}


loadDataSource()
onMounted(() => {
})
</script>

<style scoped lang="scss">
:deep(.el-input-group__prepend) {
  padding: 0;
}
</style>
