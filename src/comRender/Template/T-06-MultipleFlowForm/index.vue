<template>
  <div>
    <el-collapse
      v-model="activeNames"
      class="choose-flow-collapse"
    >
      <el-collapse-item
        title="选择流程"
        name="chooseFlowItem"
      >
        <el-row>
          <el-col :span="8">
            <el-form-item label="选择流程">
              <ace-select v-model="selPageId" :data-source="pageOptions" @change="changePage" value-key="pageId"></ace-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-collapse-item>
    </el-collapse>
  </div>
  <div class="flow-content" v-loading="!isLoadPage" element-loading-text="加载流程表单...">
    <FlowForm v-if="isLoadPage" :pageInfo="curPageInfo" :flowNodeInfo="curFlowNodeInfo"></FlowForm>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { propTypes } from '@/utils/propTypes'
import FlowForm from '../T-03-FlowForm/index.vue'
import {getFlow} from "@/web-sys/views/Redirect/api";
import {getFlowNodeCfg} from "@/comRender/api";

const props = defineProps({
  pageInfo: propTypes.object.def({}),
  flowNodeInfo:propTypes.object,
  dataId: propTypes.string
})

const message=useMessage()

const curPageInfo=ref(props.pageInfo)
const curFlowNodeInfo=ref(props.flowNodeInfo)

const activeNames=ref('chooseFlowItem')

const selPageId=ref(props.pageInfo.id)
const pageOptions=ref([
  {label:'流程1',pageId:'1899362078571700226'},
  {label:'流程2',pageId:'1894191632779866113'},
  {label:'流程3',pageId:'1875429525655912450',flowId:1533},
])

const isLoadPage=ref(true)
const changePage=async (val,option)=>{
  isLoadPage.value=false
  if(!option.pageId && !option.flowId){
    message.error("pageId错误，无法加载页面")
    return;
  }
  //加载页面数据
  const res=await getFlow(option.pageId,option.flowId,null)
  //加载流程节点数据
  const params = {
    pageId: option.pageId,
    flowId:option.flowId
  }
  curFlowNodeInfo.value = await getFlowNodeCfg(params)
  curFlowNodeInfo.value.nodeId=curFlowNodeInfo.value.outProcessNodeId
  await nextTick()
  curPageInfo.value=res
  isLoadPage.value=true
}

</script>

<style scoped lang="scss">
.choose-flow-collapse{
  margin-bottom: 10px;

  border-bottom: none;

  :deep(.el-collapse-item) {
    background-color: #f5f6f7;
  }
  :deep(.el-collapse-item__header) {
    position: relative;
    padding-left: 30px;
    border-bottom: 1px solid #f0f2f5;
    color: #333;
    font-weight: 700;
    line-height: 26px;
    font-size: 16px;
  }
  :deep(.el-collapse-item__header::before) {
    content: "";
    position: absolute;
    left: 17px;
    top: 50%;
    transform: translateY(-50%);
    width: 3px;
    height: 14px;
    background-color:#cfa479;
  }
  :deep(.el-collapse-item__wrap) {
    padding: 24px 24px 8px;
  }
  :deep(.el-collapse-item__content) {
    padding-bottom: 0;
  }
  :deep(.el-collapse-item) {
    margin-bottom: 15px;
  }
  :deep(.el-collapse-item:last-child) {
    margin-bottom: 0;
  }
  :deep(.vxe-table--body .el-form-item--default) {
    margin-bottom: 0;
  }
  .tips-div{
    white-space: pre-line;
  }
  .normal-tip{
    padding: 5px;
  }
}
.flow-content{
  min-height: calc(100vh - 200px);
}
</style>
