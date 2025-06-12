
<template>
  <div class="form-table-item">
    <el-form-item ref="refApprovalProcess" label="选择相关流程" :prop="curTable.moduleTableId+'.'+curTable.field" :rules="rule">
      <div class="approval-content">
        <div v-if="!isDetail && !curTable.isDisabled && curTable.isVisible">
          <el-button type="primary" v-if="pageType == 'create' || nodeId==1548" @click="handleSelectAssets">选择流程</el-button>
        </div>
        <div class="flow-list">
          <div class="flow-item" v-for="(row,index) in flowList" :key="'flow-item'+index">
            <el-link :icon="Link" @click="toFlowDetail(row)">{{row.flowTitle}}</el-link><el-button v-if="!isDetail && !curTable.isDisabled && curTable.isVisible && (pageType == 'create' || nodeId==1548)" type="primary" @click="handleDelete(row)">删除</el-button>
          </div>
        </div>
      </div>
    </el-form-item>
  </div>
  <Drawer ref="drawerSelectAssets" @success="tableSelectSuccess" :groupItem="groupItem"></Drawer>
</template>
<script setup>
import { ref, watch } from 'vue'
import Drawer from "./Drawer.vue";
import {Link} from '@element-plus/icons-vue'
import {getToken} from "@/api/system/fanwei";
import {openLoginFanWeiOA} from "@/web-sys/api/login";
import {useUserStore} from "@/store/modules/user";
import {getFlowList} from './api'
import bigNumberUtil from "@/utils/bigNumberUtil";

const renderFormData=defineModel()
const props=defineProps({
  groupItem:{
    type:Object
  },
  formGroups:{
    type: Array,
  },
  isDetail: {
    type:Boolean
  }
})
const userStore=useUserStore()
const route=useRoute()
const curTable=ref(null)
const flowList=ref([])
const nodeId = route.query.nodeId
const pageType = route.query.pageType
const rule=[{ required: true, message: '请选择相关流程', trigger: 'change' }]
const initData=()=>{
  if(props.groupItem.formItems && props.groupItem.formItems.length){
    curTable.value=props.groupItem.formItems[0]
  }
  console.log('curTable',curTable)
}
initData()
/**
 * 获取已选流程的详情 反显
 * @returns {Promise<void>}
 */
const getFlowDetail=async ()=>{
  if(renderFormData.value[curTable.value.moduleTableId][curTable.value.field]){
    const list = renderFormData.value[curTable.value.moduleTableId][curTable.value.field].split(',') || []
    const param={
      businessId:renderFormData.value[curTable.value.moduleTableId]['ASSET_INFO_ID_'+curTable.value.moduleTableId]
    }
    const flowRes=await getFlowList(param)
    if(flowRes){
      flowList.value=(flowRes.filter(item => list.includes(item.processNumber)) || []).map(item=>{
        return {
          ...item,
          flowId:item.instanceId,
          flowTitle:item.instanceTitle,
        }
      })
    }
  }
}


const drawerSelectAssets=ref()
/**
 * 打开抽屉
 */
const handleSelectAssets=()=>{
  isLoadFlowDetail.value=true
  const choosedAssetIds=flowList.value.map(item=>item.processNumber)
  const params={
    businessId:renderFormData.value[curTable.value.moduleTableId]['ASSET_INFO_ID_'+curTable.value.moduleTableId],
    // workFlowId:renderFormData.value[curTable.value.moduleTableId]['LC_FLOW_ID_'+curTable.value.moduleTableId],
    // status:'3'
  }
  drawerSelectAssets.value.open('create',flowList.value,params)
}
const refApprovalProcess=ref()
/**
 * 选择成功回调
 * @param choosedRow
 * @returns {Promise<void>}
 */
const tableSelectSuccess=async (choosedRows)=>{
  flowList.value = [...choosedRows]
  renderFormData.value[curTable.value.moduleTableId][curTable.value.field]=flowList.value.map(item=>item.processNumber).join(',')
  console.log('refApprovalProcess',refApprovalProcess.value)
  await nextTick()
  await refApprovalProcess.value.validate('change')
}

const handleDelete =async (row) => {
  flowList.value = flowList.value.filter(item => item.flowId !== row.flowId)
  renderFormData.value[curTable.value.moduleTableId][curTable.value.field]=flowList.value.map(item=>item.flowId).join(',')
  await nextTick()
  await refApprovalProcess.value.validate('change')
}

/**
 * 跳转到泛微页面
 * @param row
 */
const toFlowDetail = async (row) => {
  const userName=userStore.getBusinessUser.userName
  const tokenRes=await openLoginFanWeiOA(userName)
  const flowUrl=`http://10.0.23.88/common/chatResource/view.html?iswfshare=1&resourceid=${row.flowId}&resourcetype=0&ssoToken=${tokenRes.accessToken}`
  console.log('flowUrl',flowUrl)
  window.open(flowUrl)
}
const isLoadFlowDetail=ref(false)
// 响应外部值变化
watch(() => renderFormData.value[curTable.value.moduleTableId][curTable.value.field], (val) => {
  //获取反显数据
  console.log('val--------',val)
  if(val && !isLoadFlowDetail.value){
    getFlowDetail()
    isLoadFlowDetail.value=true
  }
}, { immediate: true })
</script>
<style lang="scss" scoped>
.flow-list{
}
</style>
