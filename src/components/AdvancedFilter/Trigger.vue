<script setup lang="ts">
import type { Field } from '../Components/Render/type'
import type { FilterRules } from '../Components/AdvancedFilter/type'
import { useVModel } from '@vueuse/core'

const $props = defineProps<{
  modelValue: any
  options: Field[]
  filterRules: FilterRules
}>()
const $emits = defineEmits<{
  (e: 'update:modelValue', modelValue: string): void
}>()
const data = useVModel($props, 'modelValue', $emits)

const dataSource=ref([])
const transferFieldData=()=>{
  const tableList={}
  $props.options.forEach(item=>{
    if(!tableList[item.tableId]){
      tableList[item.tableId]={
        id:item.tableId,
        label:item.tableName,
        children:[]
      }
    }
  })
  $props.options.forEach(item=>{
    tableList[item.tableId].children.push(item)
  })
  dataSource.value= Object.values(tableList)
}
transferFieldData()
</script>

<template>
  <el-cascader
    ref="cascaderRef"
    v-model="data"
    :options="dataSource"
    style="width: 100%"
    :props="{ multiple: false, emitPath: false,label:'label',value:'id' }"
    clearable
    filterable
    :show-all-levels="false"
    placeholder="选择字段"
  >
  </el-cascader>
</template>

<style scoped lang="scss"></style>
