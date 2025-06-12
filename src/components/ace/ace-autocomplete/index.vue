<template>
  <el-autocomplete
    v-model="curValue"
    ref="autocompleteRef"
    :fetch-suggestions="querySearchAsync"
    :placeholder="placeholder"
    :max-length="maxlength"
    :value-key="labelKey"
    @select="handleSelect"
    @change="handleChange"
    @input="handleInput"
    @blur="handleBlur"
    @focus="handleFocus"
    @clear="handleClear"
  >
    <template #default="{ item }">
      <div class="value">{{ item[labelKey] }}</div>
    </template>
    <template #loading>
      <svg class="circular" viewBox="0 0 50 50">
        <circle class="path" cx="25" cy="25" r="20" fill="none" />
      </svg>
    </template>
  </el-autocomplete>
</template>

<script setup lang="ts">
import { propTypes } from '@/utils/propTypes'
import request from '@/config/axios'
import { getIntDictOptions } from '@/utils/dict'

// 普通输入框
defineOptions({ name: 'AceAutocomplete' })

const props = defineProps({
  modelValue: propTypes.string.def(''),
  dataSource: propTypes.array,
  dict:propTypes.string,
  api:propTypes.string,
  dataFun:propTypes.func,
  placeholder:propTypes.string.def('请输入'),
  disabled:propTypes.bool,
  maxlength:propTypes.number,
  clearable:propTypes.bool,
  isNotSearch:propTypes.bool.def(false),
  labelKey:propTypes.string.def('value'),
  valueKey:propTypes.string.def('value'),
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
const options=ref([])
const loadOptions=async ()=>{
  //先判断是否有数据源
  if(props.dataSource) {
    options.value = props.dataSource ? props.dataSource : []
    return
  }
  if(props.dataFun){
    options.value = await props.dataFun()
    return
  }
  //判断是否是字典
  if(props.dict){
    options.value = getIntDictOptions(props.dict)
    return;
  }
  //加载url请求
  if (props.api) {
    const {list} = await request.post({url: props.api})
    options.value = list
    return
  }
}

const querySearchAsync = (queryString: string, cb: (arg: any) => void) => {
  if(props.isNotSearch){
    cb(options.value)
    return;
  }
  const results = queryString
    ? options.value.filter(createFilter(queryString))
    : options.value

  cb(results)
}

const createFilter = (queryString: string) => {
  return (restaurant) => {
    return (
      restaurant[props.valueKey].toLowerCase().indexOf(queryString.toLowerCase()) === 0
    )
  }
}
const autocompleteRef=ref()
const handleSelect = (item: Record<string, any>) => {
  console.log(item)
  curValue.value = item[props.valueKey]
  autocompleteRef.value.blur()
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
onMounted(() => {
  loadOptions()
})
</script>

<style scoped lang="scss">

</style>
