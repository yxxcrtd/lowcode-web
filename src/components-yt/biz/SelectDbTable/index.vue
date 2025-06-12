<!--
 * @Description: 选择表
 * @Author: miffy
 * @Date: 2024-11-12
 * 
-->

<template>
  <ace-select-tabs-table
    :columns="columns"
    :tabsList="tabsList"
    :sourceUrl="sourceUrl"
    :showLabel="showLabel"
    :disabled="disabled"
    :multiple="false"
    labelKey="tableComment"
    valueKey="id"
    :query-config="{ searchKey: 'tableName' }"
    v-model="tableId"
    @change="handleChange"
    @visibleChange="handleVisibleChange"
  />
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { propTypes } from '@/utils/propTypes'
import { getDbTableGroup } from './api'

// Types
interface GroupItem {
  id: string | number
  name: string
  isSys: boolean | string | number
}

// Component Definition
defineOptions({ name: 'BizSelectDbTable' })

// Props
const props = defineProps({
  /**
   * 选中的组件编码
   * @default ''
   */
  modelValue: propTypes.string.def(''),
  /**
   * 选中项的显示文本
   * @description 用于初始化时显示选中项的文本，当无法从数据源获取时使用
   * @default ''
   */
  showLabel: propTypes.string.def(''),
  disabled:{
    type:Boolean,
    default:false
  }
})

// Emits
const emit = defineEmits(['update:modelValue','change','visible-change'])

/** 组件列表接口地址 */
const sourceUrl = ref('/cfg/table-definition/page')
/** 分组标签列表 */
const tabsList = ref<{ label: string; value: string | number }[]>([])
tabsList.value=[
  {
    label:'业务表',
    value:1,
    params:{
      tableType:'biz_table'
    }
  },{
    label:'系统表',
    value:2,
    params:{
      tableType:'sys_table'
    }
  },{
    label:'虚拟表',
    value:3,
    params:{
      tableType:'virtual_table'
    }
  }
]
/** 表格列配置 */
const columns = ref([
  {
    title: '数据库表编号',
    align: 'left',
    width: '180',
    field: 'tableName'
  },
  {
    title: '数据库表名称',
    align: 'left',
    width: '240',
    field: 'tableComment'
  },
  {
    title: '描述',
    align: 'center',
    field: 'remark'
  }
])

/**
 * 组件编码双向绑定
 * @property {Function} get 获取选中值
 * @property {Function} set 设置选中值并触发更新事件
 */
const tableId = computed({
  get: () => props.modelValue,
  set: (val: string) => emit('update:modelValue', val)
})

const handleChange=(val,option)=>{
  emit('change',val,option)
}
const handleVisibleChange=(e)=>{
  emit('visible-change',e)
}
/** 组件挂载时获取分组数据 */
onMounted(async () => {
})
</script>

<style scoped lang="scss"></style>
