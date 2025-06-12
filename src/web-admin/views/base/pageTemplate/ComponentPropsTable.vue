<template>
  <div>
    <vxe-toolbar>
      <template #buttons>
        <el-button type="primary" @click="insertEvent()">新增</el-button>
        <!-- <el-button @click="removeSelectRowEvent">删除选中</el-button> -->
      </template>
    </vxe-toolbar>
    <el-tabs v-model="activeName" class="demo-tabs" @tab-click="handleClick">
      <el-tab-pane label="模板API" name="api">
        <JVxeTable
          ref="tableAPIRef"
          :enable-row-drag-sort="true"
          :columns="apiColumns"
          :table-page-config="{enabled:false}"
          :row-height="58"
          :data-source="propsApiTableData"
        >
          <template #apiCode_default="{ row }">
            <el-input v-model="row.apiCode" placeholder="请输入"></el-input>
          </template>
          <template #apiName_default="{ row }">
            <el-input v-model="row.apiName" placeholder="请输入"></el-input>
          </template>
          <template #apiType_default="{ row }">
            <ace-select v-model="row.apiType" :data-source="apiTypeList" placeholder="请选择"></ace-select>
          </template>
          <template #remark_default="{ row }">
            <el-input v-model="row.remark" placeholder="请输入"></el-input>
          </template>
          <template #action_default="{ rowIndex }">
            <div class="table-action">
              <el-link type="primary" @click="handleDelete(rowIndex)">删除</el-link>
            </div>
          </template>
        </JVxeTable>
      </el-tab-pane>
      <el-tab-pane label="模板参数" name="param">
        <JVxeTable
          ref="tableAPIRef"
          :enable-row-drag-sort="true"
          :columns="paramColumns"
          :table-page-config="{enabled:false}"
          :row-height="58"
          :data-source="tableParamData"
        >
          <template #parameterCode_default="{ row }">
            <el-input v-model="row.parameterCode" placeholder="请输入"></el-input>
          </template>
          <template #parameterName_default="{ row }">
            <el-input v-model="row.parameterName" placeholder="请输入"></el-input>
          </template>
          <template #parameterType_default="{ row }">
            <ace-select v-model="row.parameterType" :data-source="parameterTypeList" placeholder="请选择"></ace-select>
          </template>
          <template #remark_default="{ row }">
            <el-input v-model="row.remark" placeholder="请输入"></el-input>
          </template>
          <template #action_default="{ rowIndex }">
            <div class="table-action">
              <el-link type="primary" @click="handleDelete(rowIndex)">删除</el-link>
            </div>
          </template>
        </JVxeTable>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script lang="ts" setup>
import { propTypes } from '@/utils/propTypes'
import { ref } from 'vue'
import { VxeTablePropTypes} from 'vxe-table'
const activeName = ref('api')
//点击tab切换
const handleClick = () => {

}
const message = useMessage() // 消息弹窗
const apiColumns = [
  {
    title: '序号',
    align: 'center',
    type: 'seq',
    width: 60,
  },
  {
    title: 'API编码',
    align: 'center',
    field: 'apiCode',
    minWidth: 120,
    slots: {
      default: 'apiCode_default',
    },
  },
  {
    title: 'API名称',
    align: 'center',
    field: 'apiName',
    minWidth: 120,
    slots: {
      default: 'apiName_default',
    },
  },
  {
    title: 'API类型',
    align: 'center',
    field: 'apiType',
    minWidth: 120,
    slots: {
      default: 'apiType_default',
    },
  },
  {
    title: '备注',
    align: 'center',
    field: 'remark',
    minWidth: 120,
    slots: {
      default: 'remark_default',
    },
  },
  {
    title: '操作',
    align: 'center',
    fixed: 'right',
    minWidth: 60,
    slots: {
      default: 'action_default',
    },
  }
]
const paramColumns = [
{
    title: '序号',
    align: 'center',
    type: 'seq',
    width: 60,
  },
  {
    title: '参数编码',
    align: 'center',
    field: 'parameterCode',
    minWidth: 120,
    slots: {
      default: 'parameterCode_default',
    },
  },
  {
    title: '参数名称',
    align: 'center',
    field: 'parameterName',
    minWidth: 120,
    slots: {
      default: 'parameterName_default',
    },
  },
  {
    title: '参数类型',
    align: 'parameterType',
    field: 'apiType',
    minWidth: 120,
    slots: {
      default: 'parameterType_default',
    },
  },
  {
    title: '备注',
    align: 'center',
    field: 'remark',
    minWidth: 120,
    slots: {
      default: 'remark_default',
    },
  },
  {
    title: '操作',
    align: 'center',
    fixed: 'right',
    minWidth: 60,
    slots: {
      default: 'action_default',
    },
  }
]
const apiTypeList = ref([
  { label: 'post', value: 'post' },
  { label: 'get', value: 'get' }
])
const parameterTypeList = ref([
  { label: '字符串', value: 'String' },
  { label: '数字', value: 'Number' },
  { label: '布尔', value: 'Boolean' },
  { label: '对象', value: 'Object' },
  { label: '数组', value: 'Array' }
])

const tableParamRef = ref()
const tableAPIRef = ref()
const validApiRules = ref<VxeTablePropTypes.EditRules>({
  // apiCode: [{ required: true, message: 'API编码必须填写' }],
  // apiName: [{ required: true, message: 'API名称必须填写' }],
})
const validParamRules = ref<VxeTablePropTypes.EditRules>({
  // parameterCode: [{ required: true, message: '参数编码必须填写' }],
  // parameterName: [{ required: true, message: '参数名称必须填写' }],
  // parameterType: [{ required: true, message: '参数类型必须填写' }],
})

// 定义接收的 props
const props = defineProps({
  tableParamData: propTypes.array, // 父组件传递的表格数据
  tableApiData: propTypes.array // 父组件传递的表格数据
})
const emit = defineEmits(['update:tableParamData','update:tableApiData'])
const propsTableData = computed({
  get() {
    return props.tableParamData
  },
  set(val) {
    emit('update:tableParamData', val)
  }
})
const propsApiTableData = computed({
  get() {
    return props.tableApiData
  },
  set(val) {
    emit('update:tableApiData', val)
  }
})

const validEvent = async () => {
  activeName.value ==='param' ? await handleValidEvent(tableParamRef) :await handleValidEvent(tableAPIRef)
}
const handleValidEvent = async (tableRef)=>{
  const $table = tableRef.value
  if ($table) {
    const errMap = await $table.validate(true)
    return !errMap;
  }
}
const handleInsertEvent = async (table)=>{
  table.value.push({
    id: undefined,
    templateId: undefined,
    apiCode: '',
    apiName: '',
    apiType: '',
    parameterName: '',
    parameterCode: '',
    parameterType: '',
    remark: '',
  })
}
const handleRemoveEvent = async (table,rowIndex) => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    // 发起删除
    table.value.splice(rowIndex,1)
  } catch {}
}

const insertEvent = async () => {
  activeName.value ==='param' ? await handleInsertEvent(propsTableData) :await handleInsertEvent(propsApiTableData)
}

const handleDelete = (rowIndex) => {
  activeName.value ==='param' ?  handleRemoveEvent(propsTableData,rowIndex) : handleRemoveEvent(propsApiTableData,rowIndex)
}
</script>
