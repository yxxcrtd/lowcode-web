<template>
  <el-drawer title="选择相关流程" v-model="dialogVisible" size="60%" :before-close="handleCancel" class="drawer-select-asseta-wrap">
    <div class="dialog-wrap">
      <div class="card_header">
        <el-form-item label="流程标题" label-width="auto">
          <ace-input
            uiType="text"
            labelWidth="80px"
            placeholder="请选择"
            v-model="searchQuery.flowName"
            class="BBW head"
            style="width: 350px"
          >
          </ace-input>
        </el-form-item>
        <div class="ml-10px">
          <el-button type="primary" @click="searchTable">查询</el-button>
          <el-button @click="resetTable">重置</el-button>
        </div>
      </div>

      <div class="table-content">
        <JVxeTable
          ref="vxeTableRef"
          height="100%"
          :columns="columns"
          :row-height="48"
          :tablePageConfig="{ enabled: false }"
          :data-fun="getTableData"
          :showCheckBox="true"
          :check-box-config="{highlight: true}"
          >
          <!-- :row-class-name="setRowClass" -->
        </JVxeTable>
      </div>
    </div>
    <template #footer>
      <span class="dialog-footer">
          <el-button @click="handleCancel">取 消</el-button>
          <el-button type="primary" @click="submitForm">确 定</el-button>
      </span>
    </template>
  </el-drawer>
</template>
<script lang="ts" setup>
import { ref } from 'vue'
import { columns } from './data'
import {getFlowList} from "./api"
defineOptions({ name: 'Drawer' })

const props=defineProps({
  groupItem:{
    type:Object
  }
})
const message = useMessage() // 消息弹窗
const route=useRoute()
const dialogVisible = ref(false)
const bizType = ref('create')
const formData = ref({})

const searchQuery=ref({
  flowName:null,
})


const choosedListIds=ref([])
const vxeTableRef = ref()
/** 打开弹窗 */
/**
 * 打开抽屉
 * @param type 打开类型
 * @param data 已选数据
 */
const params=ref({})
const open = async (type: string,data,bizParams) => {
  bizType.value = type
  dialogVisible.value = true
  params.value=bizParams
  // choosedListIds.value=data
  if(data && data.length){
    vxeTableRef.value.setCheckboxRow([...data],true)
  }
}
const checkMethod=({row})=>{
  // return !choosedListIds.value.includes(row.instanceId)
  return true
}
// const setRowClass=({row})=>{
//   return choosedListIds.value.includes(row.instanceId) ? 'is-choosed' : ''
// }

const searchTable = () => {
  vxeTableRef.value.refresh()
}
const resetTable=()=>{
  searchQuery.value.flowName=null
  searchTable()
}
const getTableData=async (paramer)=>{
  const param={
    flowName:searchQuery.value.flowName,
    ...params.value,
    ...paramer,
  }
  const res=await getFlowList(param)
  return res
}

defineExpose({ open }) // 提供 open 方法，用于打开弹窗

const handleCancel = () => {
  vxeTableRef.value.clearCheckboxRow()
  dialogVisible.value = false
}

const emits = defineEmits(['success'])
/**
 * 抽屉确定按钮
 */
const submitForm = async () => {
  const checkRows=vxeTableRef.value.getCheckboxRecords().map(item=>({
    ...item,
    flowId:item.instanceId,
    flowTitle:item.instanceTitle,
  }))
  emits('success', checkRows)
  vxeTableRef.value.clearCheckboxRow()
  dialogVisible.value = false
}
</script>

<style scoped lang="scss">
.drawer-select-asseta-wrap {
  .card_header{
    display: flex;
    margin-bottom:10px;
    >span{
      color: #333;
      font-weight: 700;
      line-height: 26px;
      font-size: 16px;
      font-family: HanSans;
    }
  }
}
:deep(.el-form-item--default){
  margin-bottom: 0!important;
}
:deep(.is-choosed){
  color: #cccccc;
}
.table-content{
  height: calc(100vh - 200px);
}
</style>
