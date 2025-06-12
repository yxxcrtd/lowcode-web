<template>
  <div class="render-page-container" v-loading="!isLoadPage" element-loading-text="加载页面中...">
    <component v-if="isLoadPage" :is="pageComponent" :pageInfo="pageInfo" :flowNodeInfo="flowNodeInfo"></component>
  </div>
</template>
<script lang="ts" setup>
import {getFlow} from "./api"
import {getComponentPath} from '@/comRender/utils'
import {getFlowNodeCfg} from "@/comRender/api";

defineOptions({ name: 'WorkFlowForm' })
const message=useMessage()

const route=useRoute()
const pageId=route.query.pageId
const flowId=route.query.flowId
const nodeId=route.query.nodeId
const pageDataId=route.query.id

//获取所有模板组件 只取模板目录下第一层vue组件
let templateModules = import.meta.glob('@/comRender/Template/*/*.vue')
/**
 * 加载页面信息
 */

const pageComponent=ref(null)
const pageInfo=ref({})
const flowNodeInfo=ref()
const isLoadPage=ref(false)
const loadPageInfo=async ()=>{
  if(!pageId && !flowId && !pageDataId){
    message.error("pageId错误，无法加载页面")
    return;
  }
  //加载页面数据
  const res=await getFlow(pageId,flowId,pageDataId)
  const componentPath=getComponentPath(res.pageType,res.templateInfo.templateAddress)
  const renderComponent =await templateModules[componentPath]()
  pageComponent.value=renderComponent.default
  //加载流程节点数据
  const params = {
    pageId: pageId,
    flowId:flowId,
    nodeId: nodeId
  }
  flowNodeInfo.value = await getFlowNodeCfg(params)
  flowNodeInfo.value.nodeId=flowNodeInfo.value.outProcessNodeId
  await nextTick()
  pageInfo.value=res
  isLoadPage.value=true
}
onMounted(async () => {
  loadPageInfo()
})
</script>
<style lang="scss" scoped>
.render-page-container{
  height: calc(100vh - 66px);
}
</style>
