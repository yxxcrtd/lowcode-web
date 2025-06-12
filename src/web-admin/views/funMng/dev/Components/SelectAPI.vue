<template>
  <ace-select v-model="selectServerId" :data-fun="getModelApiList"  @change="handleChange"/>
</template>

<script lang="ts" setup>
import {getPageModuleInfo} from "../api";
import {propTypes} from "@/utils/propTypes";

defineOptions({ name: 'SelectApi' })

const props = defineProps({
  modelValue: propTypes.string.def(''),
  moduleId:propTypes.string,
})
const emit = defineEmits(['update:modelValue','change'])
const selectServerId = computed({
  get: () => {
    return props.modelValue
  },
  set: (val: string) => {
    emit('update:modelValue', val)
  }
})

const getModelApiList = async () => {
  let params = {
    id:props.moduleId
  }
  let pageModuleInfo = await getPageModuleInfo(params)
  return pageModuleInfo.apiList.map(apiItem=>{
    return {
      label:apiItem.serviceName,
      value:apiItem.id,
      ...apiItem
    }
  })
}
const handleChange=(val,option)=>{
  emit('change',val,option)
}
/** 初始化 */
onMounted(async () => {
  
})
</script>
