<template>
  <el-tree-select
    v-model="selectTableId"
    :multiple="multiple"
    :data="dataList"
    @node-click="nodeClick"
  />
</template>

<script lang="ts" setup>
import {propTypes} from "@/utils/propTypes";

defineOptions({ name: 'SelectTable' })

const props = defineProps({
  modelValue: propTypes.string.def(''),
  tableList: propTypes.array,
  multiple:propTypes.bool.def(false)
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

const dataList = computed(()=>{
  return props.tableList.map(tableItem=>{
    return {
      label:tableItem.columnComment,
      value:tableItem.columnName,
      children:tableItem.fieldList.map(fieldItem=>{
        return {
          label:fieldItem.columnName,
          value:fieldItem.columnaName
        }
      })
    }
  })
})
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
