<template>
  <div class="page-container">
    <el-tabs v-model="activeName" class="demo-tabs" @tab-change="handleClick">
      <el-tab-pane label="数据模型" name="viewModel" >
        <DataModel />
      </el-tab-pane>
      <el-tab-pane label="API管理" name="apiMng" lazy>
        <APIMng/>
      </el-tab-pane>
      <el-tab-pane label="页面管理" name="pageDesign" lazy>
        <PageDesign/>
      </el-tab-pane>
      <el-tab-pane label="流程设计" name="flowDesign" lazy>
        <FlowDesign/>
      </el-tab-pane>
<!--      <el-tab-pane label="报表设计" name="reportDesign" />-->
<!--      <el-tab-pane label="打印设计" name="printDesign" />-->
      <el-tab-pane label="菜单配置" name="menuConfig" lazy>
        <MenuMng ref="menuMngRef"/>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script lang="ts" setup>
import { ref } from 'vue'
import type { TabsPaneContext } from 'element-plus'
import DataModel from './2-dataModel/index.vue'
import APIMng from './3-APIMng/index.vue'
import PageDesign from './4-pageDesign/index.vue'
import MenuMng from './5-MenuMng/index.vue'
import FlowDesign from './6-flowDesign/index.vue'
import {useTagsView} from "@/hooks/web/useTagsView";
import {getFunctionInfo} from "@/api/system/menu";


defineOptions({ name: 'SystemUser' })
const route = useRoute()
const menuId = route.query.id
const tag=useTagsView()
const getMoudlueInfo=async ()=>{
  const res=await getFunctionInfo(menuId)
  tag.setTitle('设计-'+res.functionName,route.fullPath)
}
getMoudlueInfo()

const activeName = ref('viewModel')
const menuMngRef=ref()
const handleClick = (name) => {
  if(name==='menuConfig'){
    menuMngRef.value.refreshPage()
  }
}

/** 初始化 */
onMounted(() => {})
</script>
<style scoped lang="scss">
.el-tabs__content {
  padding: 32px;
  color: #6b778c;
  font-size: 32px;
  font-weight: 600;
}
</style>
