<template>
  <el-cascader
    v-model="selectTableId"
    :options="options"
    style="width: 100%"
    :placeholder="modelValue || '请选择'"
    :props="{ multiple: multiple, emitPath: false }"
    clearable
    filterable
    collapse-tags
    collapse-tags-tooltip
  >
    <template #default="{ node, data }">
      <span v-if="node.isLeaf" class="node-text">
        <span
          >{{data.fieldIndex}}.{{ data.label }}<span v-if="data.columnComment" class="node-field-text">({{ data.columnName }})</span></span
        >
        <span>{{ data.columnType }}</span>
      </span>
      <span v-else>
        <el-tooltip class="box-item" effect="dark" placement="left" v-if="data.whereSql || data.tableRemark">
          <template #content>
            <div>查询条件：{{ data.searchSql }}</div>
            <div>说明：{{ data.tableRemark }}</div>
          </template>
          <div class="table-name-warning">
          <el-icon class="table-where-icon" :size="14"><WarningFilled /></el-icon>
          {{ data.tableAlias }}-{{ data.label }}
          </div>
        </el-tooltip>
        <template v-else> {{ data.tableAlias }}-{{ data.label }} </template>
      </span>
    </template>
  </el-cascader>
</template>

<script lang="ts" setup>
import { getPageModuleInfo } from '../api'
import {ChatDotRound, WarningFilled} from '@element-plus/icons-vue'
import { propTypes } from '@/utils/propTypes'

defineOptions({ name: 'SelectModelApi' })

const props = defineProps({
  modelValue: propTypes.string.def(''),
  moduleId: propTypes.string,
  dataSource: propTypes.array,
  multiple: propTypes.bool.def(false),
  isShowChild: propTypes.bool.def(true)
})
const emit = defineEmits(['update:modelValue', 'change'])
const selectTableId = computed({
  get: () => {
    return props.modelValue
  },
  set: (val: string) => {
    console.log(val)
    emit('update:modelValue', val)
    emit('change',val)
  }
})
const options = ref([])
const getModelInfo = async () => {
  const res = await getPageModuleInfo({ id: props.moduleId })
  if (!props.isShowChild) {
    res.tableList = res.tableList.filter((tableItem) => !tableItem.isChild)
  }
  options.value = res.tableList.map((tableItem) => {
    return {
      label: tableItem.tableComment,
      value: tableItem.tableId,
      tableName: tableItem.tableName,
      isMain: tableItem.isMain,
      whereSql: tableItem.whereSql,
      tableRemark:tableItem.tableRemark,
      children: tableItem.fieldList.map((fieldItem,index) => {
        return {
          index:index+1,
          label: fieldItem.columnComment,
          value: fieldItem.columnName + '_' + tableItem.id,
          columnType: fieldItem.columnType,
          columnName: fieldItem.columnName,
          isSys: fieldItem.isSys
        }
      })
    }
  })
}

watch(
  () => props.moduleId,
  (val) => {
    if (val) {
      getModelInfo()
    }
  },
  { immediate: true }
)

const setOptions = async () => {
  let tableList: any = props.dataSource
  if (!props.isShowChild) {
    tableList = tableList.filter((tableItem) => !tableItem.isChild)
  }
  options.value = tableList.map((tableItem) => {
    return {
      label: tableItem.tableComment,
      value: tableItem.tableAlias + tableItem.tableId,
      tableName: tableItem.tableName,
      tableAlias: tableItem.tableAlias,
      isMain: tableItem.isMain,
      whereSql: tableItem.whereSql,
      tableRemark:tableItem.tableRemark,
      children: tableItem.fieldList.map((fieldItem,fieldIndex) => {
        return {
          fieldIndex:fieldIndex+1,
          label: fieldItem.columnComment || fieldItem.columnName,
          value: fieldItem.id,
          columnType: fieldItem.columnType,
          columnName: fieldItem.columnName,
          columnComment: fieldItem.columnComment,
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
/** 初始化 */
onMounted(async () => {})
</script>
<style lang="scss" scoped>
.node-text {
  width: 300px;
  display: flex;
  justify-content: space-between;
  & > span:first-child {
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    margin: 0 13px 0 0;
  }
  & > span:last-child {
    width: 100px;
    color: #a9a8a8;
  }
  .node-field-text {
    font-size: 12px;
  }
}
.table-name-warning{
  display: flex;
  align-items: center;
  .table-where-icon{
    margin-right: 6px;
  }
}
</style>
