<template>
  <div>
    <vxe-toolbar>
      <template #buttons>
        <el-button type="primary" @click="insertEvent()">新增属性</el-button>
      </template>
    </vxe-toolbar>
    <JVxeTable
      ref="jVxeTable"
      :enable-row-drag-sort="true"
      :columns="propsTableColumns"
      :table-page-config="{enabled:false}"
      :row-height="58"
      :data-source="tableData"
    >
      <template #attributeCode_default="{ row }">
        <el-input v-model="row.attributeCode" placeholder="请输入属性名"></el-input>
      </template>
      <template #attributeName_default="{ row }">
        <el-input v-model="row.attributeName" placeholder="请输入属性名称"></el-input>
      </template>
      <template #attributeType_default="{ row }">
        <ace-select v-model="row.attributeType" :data-source="propsTypeList" placeholder="请选择属性类型"></ace-select>
      </template>
      <template #attributeValue_default="{ row }">
        <el-input v-model="row.attributeValue" placeholder=""></el-input>
      </template>
      <template #action_default="{ row }">
        <div class="table-action" v-if="row.code !== 'master'">
          <el-link type="primary" @click="handleDelete(row)">删除</el-link>
        </div>
      </template>
    </JVxeTable>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue'
import { VxeTableInstance } from 'vxe-table'
import { propsTableColumns } from './data'
interface RowVO {
  id: number
  sequence: number
  attributeCode: string
  attributeName: string
  attributeType: string
  attributeValue: string
}

const tableRef = ref<VxeTableInstance<RowVO>>()

const propsTypeList = ref([
  { label: '字符串', value: 'String' },
  { label: '数字', value: 'Number' },
  { label: '布尔', value: 'Boolean' },
  { label: '对象', value: 'Object' },
  { label: '脚本', value: 'Script' },
  { label: '数组', value: 'Array' },
  { label: '方法', value: 'Function' },
  { label: '字典', value: 'Dict' },
  { label: '字典值', value: 'DictValue' },
  { label: '信托三分类', value: 'SelectTree' },
  { label: '用户', value: 'User' },
  { label: '角色', value: 'Role' },
  { label: '接口系统', value: 'ApiSys' },
  { label: '日期限制类型', value: 'rangeType' },
])

const propsTableData:any=defineModel()

const tableData = computed(()=>{
  return propsTableData.value.filter(item=>item.type!='Del')
})

const validEvent = async () => {
  const $table = tableRef.value
  if ($table) {
    const errMap = await $table.validate(true)
    return !errMap
  }
}
const insertEvent = async () => {
  const curIndex=propsTableData.value.length;
  propsTableData.value.push({
    id: '',
    attributeCode: '',
    attributeName: '',
    attributeType: '',
    attributeValue: '',
    type:'Add',
    sort: curIndex + 1 //benlaisshunxu
  })
}

const handleDelete = (row) => {
  row.type='Del'
}
defineExpose({ validEvent })

onMounted(() => {
})
</script>
