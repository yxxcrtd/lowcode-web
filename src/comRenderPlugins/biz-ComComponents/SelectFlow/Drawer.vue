<template>
  <el-drawer title="选择相关流程" v-model="dialogVisible" size="60%" :before-close="handleCancel" class="drawer-select-asseta-wrap">
    <div class="dialog-wrap">
      <div class="card_header">
        <el-form-item :label="formLabel" label-width="auto">
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
          @radio-change="handleRadioChange"
          :check-box-config="{highlight: flase}"
          :radio-config="{labelField: 'radio', highlight: true,trigger: 'row'}"
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
import {getApprovalLaterInfoPage, getFlowList,getProjApprovalLaterPage} from "./api"
defineOptions({ name: 'Drawer' })

const props=defineProps({
  groupItem:{
    type:Object
  },
  pageId:{
    type:String
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
const formLabel=ref(props.pageId=='1902240079030341634' ?'产品':'资产')
const open = async (type: string,data,bizParams) => {
  bizType.value = type
  dialogVisible.value = true
  params.value=bizParams
  // choosedListIds.value=data
  if(data && data.length){
    vxeTableRef.value.setRadioRow({...data[0]},true)
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

const choosedRow = ref({})
const handleRadioChange = ({row}) => {
  choosedRow.value = {
    ...row,
    flowId:row.processNumber,
    flowTitle:row.instanceTitle,
  }
  console.log(row,'params-row-params');
  
}

defineExpose({ open }) // 提供 open 方法，用于打开弹窗

const handleCancel = () => {
  vxeTableRef.value.clearRadioRow()
  dialogVisible.value = false
}

const emits = defineEmits(['success'])
/**
 * 抽屉确定按钮
 */
const submitForm = async () => {
  // (关联交易信息披露审批、私募复审) 无后补材料
  const pageIdList = ['1876528510971789314','1915006565557792769']
  if(props?.groupItem?.pageId && pageIdList.includes(props?.groupItem?.pageId)) {
    emits('success', choosedRow.value)
    vxeTableRef.value.clearRadioRow()
    dialogVisible.value = false
  } else {
    const params={
      projectIdEquals:choosedRow.value.projId,
      requestIdEquals:choosedRow.value.flowId,
    }
    let res
    //成立条件验证-后补事项审批这块选择相关流程
    if(props?.groupItem?.pageId === '1902240079030341634'){
      res=await getApprovalLaterInfoPage(params)
    }else{
      res=await getProjApprovalLaterPage(params)
    }
    if(res && res.records && res.records.length){
      console.log('checkRows',choosedRow,res.records)
      emits('success', choosedRow.value,res.records)
      vxeTableRef.value.clearRadioRow()
      dialogVisible.value = false
    }else{
      message.error('审批流程不涉及后补材料，请重新选择！')
    }
  }
  
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
