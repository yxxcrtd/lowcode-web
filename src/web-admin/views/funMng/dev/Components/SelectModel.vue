<template>
  <el-tree-select
    v-model="selectTableId"
    :data="dataList"
    clearable
    :default-expanded-keys="defaultExpandedKeys"
    @node-click="nodeClick"
  >
    <template #default="{ data }">
      <el-tag v-if="data.isCur" type="primary" size="small" class="mr-10px">当前模型</el-tag>{{ data.label }}
    </template>
  </el-tree-select>
</template>

<script lang="ts" setup>
import {getModuleList} from "../api";
import {propTypes} from "@/utils/propTypes";
import {moveElementInArray} from "@/utils";

defineOptions({ name: 'SelectModel' })

const props = defineProps({
  modelValue: propTypes.string.def(''),
  modelList:propTypes.array,
})
const route=useRoute()
const menuId=route.query.id
const defaultExpandedKeys=ref(menuId)
const emit = defineEmits(['update:modelValue','change'])
const selectTableId = computed({
  get: () => {
    return props.modelValue
  },
  set: (val: string) => {
    emit('update:modelValue', val)
  }
})

const dataList = ref<Option[]>([])
const getTableList = async () => {
  const params={}
  let moduleRes:any[]=[]
  if(props.modelList && props.modelList.length){
    moduleRes=props.modelList
  }else{
    moduleRes= await getModuleList(params)
  }
  dataList.value=moduleRes.filter(item=>item.parentId==0).map(item=>{
    return {
      label:item.name,
      value:item.id,
      id:item.id,
      isCur:item.id==menuId,
      children:moduleRes.filter(childItem=>childItem.parentId==item.id).map(childItem=>{
        return {
          label:childItem.name,
          value:childItem.id,
          id:childItem.id
        }
      })
    }
  })
  const curModuleIndex=dataList.value.findIndex(item=>item.value===menuId)
  console.log('curModuleIndex',curModuleIndex)
  moveElementInArray(dataList.value,curModuleIndex,0)
  console.log('dataList.value',dataList.value)
}
getTableList()
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
