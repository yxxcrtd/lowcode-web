<template>
  <div class="select-table-field-container">
    <ace-select class="sel-table" v-model="selectTableId" filterable placeholder="请选择表" :data-source="tableList" @change="tableChange">
      <template #default="{option}">
        <span style="float: left">{{ option.label }}</span>
          <span
            style="
            float: right;
            color: var(--el-text-color-secondary);
            font-size: 13px;
          "
          >
          {{ option.tableName }}
        </span>
      </template>
    </ace-select>
    <ace-select v-model="selectTableKey" placeholder="请选择关联字段" :data-source="columnList"></ace-select>
    <ace-select v-model="selectColumnId" placeholder="请选择回显字段" :data-source="columnList"></ace-select>
  </div>
</template>

<script lang="ts" setup>
import { getTableFields } from '../api'
import { propTypes } from '@/utils/propTypes'

defineOptions({ name: 'SelectTableField' })

const props = defineProps({
  tableId: propTypes.string.def(''),
  tableKey:propTypes.string.def(''),
  columnId: propTypes.string.def(''),
  multiple: propTypes.bool.def(false),
  tableList: propTypes.array.def([])
})
const emit = defineEmits(['update:tableId','update:tableKey','update:columnId', 'change'])
const selectTableId = computed({
  get: () => {
    return props.tableId
  },
  set: (val: string) => {
    console.log(val)
    emit('update:tableId', val)
  }
})
const selectTableKey = computed({
  get: () => {
    return props.tableKey
  },
  set: (val: string) => {
    emit('update:tableKey', val)
  }
})
const selectColumnId = computed({
  get: () => {
    return props.columnId
  },
  set: (val: string) => {
    emit('update:columnId', val)
  }
})

const columnList=ref([])

const loadColumnList=async ()=>{
  let param = { tableId: props.tableId, status: true, pageSize: 100, pageNo: 1 }
  const res = await getTableFields(param)
  columnList.value= res.list.map((item) => {
    return {
      value: item.id,
      label: item.columnComment || item.columnName,
      columnName: item.columnName,
      columnType: item.columnType,
      leaf: true
    }
  })
}
watch(
  () => props.tableId,
  (val) => {
    if (val) {
      loadColumnList()
    }
  },
  { immediate: true }
)
const tableChange=()=>{
  selectTableKey.value=null
  selectColumnId.value=null
}
/** 初始化 */
onMounted(async () => {})
</script>
<style lang="scss" scoped>
.select-table-field-container{
  display: flex;
  .sel-table{
    :deep(.el-select__wrapper){
      box-shadow: 1px 0 0 0 #dcdfe6 inset,0 1px 0 0 #dcdfe6 inset,0 -1px 0 0 #dcdfe6 inset;
    }
  }
}
</style>
