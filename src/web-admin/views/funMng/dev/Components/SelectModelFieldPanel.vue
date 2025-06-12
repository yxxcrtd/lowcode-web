<template>
  <el-cascader-panel ref="cascaderPanelRef" v-model="selectTableId" :options="options" style="width: 100%" :props="{ multiple: multiple,emitPath:false }">
    <template #default="{ node, data }">
      <span v-if="node.isLeaf" class="node-text">
        <span>{{data.label}}</span>
        <span>{{data.columnName}}</span>
      </span>
      <span v-else>
        {{data.tableAlias}}-{{ data.label }}
      <el-tooltip
        class="box-item"
        effect="dark"
        :content="data.whereSql"
        placement="right"
        v-if="data.whereSql"
      >
        <el-icon :size="14" color="#E6A23C"><ChatDotRound /></el-icon>
      </el-tooltip>
      </span>
    </template>
  </el-cascader-panel>
</template>

<script lang="ts" setup>
import { getPageModuleInfo } from '../api'
import {ChatDotRound} from '@element-plus/icons-vue'
import { propTypes } from '@/utils/propTypes'

defineOptions({ name: 'SelectModelApi' })

const props = defineProps({
  modelValue: propTypes.string.def(''),
  moduleId: propTypes.string,
  dataSource: propTypes.array,
  multiple: propTypes.bool.def(false),
  isShowChild: propTypes.bool.def(true),
})
const emit = defineEmits(['update:modelValue', 'change'])
const selectTableId = computed({
  get: () => {
    return props.modelValue
  },
  set: (val: string) => {
    emit('update:modelValue', val)
  }
})
const options = ref([])
const getModelInfo = async () => {
  const res = await getPageModuleInfo({ id: props.moduleId })
  if(!props.isShowChild){
    res.tableList=res.tableList.filter(tableItem=>!tableItem.isChild)
  }
  options.value = res.tableList.map((tableItem) => {
    return {
      label: tableItem.tableComment,
      value: tableItem.tableId,
      tableName: tableItem.tableName,
      tableAlias:tableItem.tableAlias,
      isMain: tableItem.isMain,
      whereSql:tableItem.whereSql,
      children: tableItem.fieldList.map((fieldItem) => {
        return {
          label: fieldItem.columnComment,
          value: fieldItem.columnName+'_'+tableItem.id,
          columnType: fieldItem.columnType,
          columnName:fieldItem.columnName,
          isSys: fieldItem.isSys
        }
      })
    }
  })
}

watch(
  () => props.moduleId,
  (val) => {
    console.log('d234234',val)
    if (val) {
      getModelInfo()
    }
  },
  { immediate: true }
)


const setOptions = async () => {
  let tableList:any= props.dataSource;
  if(!tableList){
    return
  }
  if(!props.isShowChild){
    tableList=tableList.filter(tableItem=>!tableItem.isChild)
  }
  options.value = tableList.map(tableItem => {
    return {
      label: tableItem.tableComment,
      value: tableItem.tableAlias+tableItem.tableId,
      tableName: tableItem.tableName,
      tableAlias:tableItem.tableAlias,
      isMain: tableItem.isMain,
      whereSql:tableItem.whereSql,
      children: tableItem.fieldList.map((fieldItem) => {
        return {
          label: fieldItem.columnComment || fieldItem.columnName,
          value: fieldItem.id,
          columnType: fieldItem.columnType,
          columnName:fieldItem.columnName,
          columnComment:fieldItem.columnComment,
          isSys: fieldItem.isSys
        }
      })
    }
  })
}
watch(
  () => props.dataSource,
  (val) => {
    setOptions()
  },
  { immediate: true }
)

const cascaderPanelRef=ref()
const getNodes=()=>{
  return cascaderPanelRef.value.getCheckedNodes()
}
defineExpose({getNodes})
/** 初始化 */
onMounted(async () => {})
</script>
<style lang="scss" scoped>
.node-text{
  display:flex;
  justify-content: space-between;
  &>span:first-child{
    width:100%;
    overflow: hidden;
    text-overflow: ellipsis;
    margin: 0 13px 0 0;
  }
  &>span:last-child{
    color: #a9a8a8;
  }
  .node-field-text{
    font-size: 12px;
  }
}
</style>
