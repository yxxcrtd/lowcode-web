<template>
  <el-cascader v-model="selectTableId" :props="cascaderProps" style="width: 100%;" />
</template>

<script lang="ts" setup>
import {getModelSourceListPage,getModelPageList} from "../api";
import {propTypes} from "@/utils/propTypes";

defineOptions({ name: 'SelectModelApi' })

const props = defineProps({
  modelValue: propTypes.string.def('')
})
const emit = defineEmits(['update:modelValue','change'])
const selectTableId = computed({
  get: () => {
    return props.modelValue
  },
  set: (val: string) => {
    emit('update:modelValue', val)
  }
})

const getModelList = async (resolve) => {
  const params={
    page: 1,
    pageSize: 100
  }
  const tableRes:any[] = await getModelSourceListPage(params)
  const modelList=tableRes.list.map(tableItem=>{
    return {
      label:tableItem.moduleName,
      value:tableItem.id,
      ...tableItem
    }
  })
  resolve(modelList)
}

const getModelPageList = async (resolve,modelId) => {
  let params = {
    id:modelId
  }
  const moduleInfo=await getModelPageList(params)
  const modelApiList = moduleInfo.apiList.map(tableItem=>{
    return {
      label:tableItem.serviceName,
      value:tableItem.id,
      leaf:true,
      ...tableItem
    }
  })
  resolve(modelApiList)
}

const cascaderProps={
  emitPath:false,
  lazy:true,
  lazyLoad(node,resolve){
    console.log(node)
    const {level,value}=node
    if(level===0){
      getModelList(resolve)
    }else{
      getModelApiList(resolve,value)
    }
  }
}

/** 初始化 */
onMounted(async () => {
  
})
const nodeClick=(data,node)=>{
  console.log(data,node)
  if(node.isLeaf){
    emit("change",data)
  }
}
</script>
