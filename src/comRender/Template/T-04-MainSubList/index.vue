<template>
  <div class="page-list-container" v-loading="loading">
    <RenderSlot :slot-path="pageInfo.headerSlot" :templateModule="slotModules" :template-path="templateModulePath" :instance="instance"></RenderSlot>
    <SearchContent v-model="queryParams" @search="search"></SearchContent>
    <RenderSlot :slot-path="pageInfo.middleSlot" :templateModule="slotModules" :template-path="templateModulePath" :instance="instance"></RenderSlot>
    <div class="content">
      <ButtonContent @btn-event="handleBtnClick"></ButtonContent>
      <TableContent ref="tableContentRef" v-bind="$attrs" :queryFields="queryParams" @btn-event="handleBtnClick"></TableContent>
    </div>
    <RenderSlot :slot-path="pageInfo.tailSlot" :templateModule="slotModules" :template-path="templateModulePath" :instance="instance"></RenderSlot>
  </div>
  <EditContent ref="editContentRef"></EditContent>
</template>

<script setup lang="ts">
import SearchContent from './Components/SearchContent.vue'
import ButtonContent from './Components/ButtonContent.vue'
import TableContent from './Components/TableContent.vue'
import EditContent from './Components/EditContent.vue'
import RenderSlot from '@/comRender/Components/RenderSlot/index.vue'
import {ref, provide} from 'vue'
import {propTypes} from "@/utils/propTypes";
import {btnEvent} from "./js/button";

const templateAPI=ref([
  {
    apiCode:'page-list',
    apiName:'分页列表'
  }
])
const templateParams=[
  {
    paramName:'子表id',
    paramCode:'sub_table_id'
  }
]
const props=defineProps({
  pageInfo:propTypes.object.def({})
})
provide('pageInfo',props.pageInfo)

const router=useRouter()
const queryParams = ref([])
const tableContentRef=ref()
const loading=ref(false)

const search=()=>{
  tableContentRef.value.refreshTable();
}
const getCheckedRows=()=>{
  return tableContentRef.value.getCheckedRows()
}
defineExpose({ search,getCheckedRows,router })

const instance=getCurrentInstance()
const editContentRef=ref()

/**
 * 加载外部JS文件
 */
let externalJsModule:any=null
const loadExternalScript=async (jsSrc)=>{
  try{
    externalJsModule= await import(new URL(`/src/web-sys/views/plugins/${jsSrc}`, import.meta.url).href)
  }catch(e){
    console.error("外部JS文件地址错误")
  }
}
if(props.pageInfo.externalJsFile){
  loadExternalScript(props.pageInfo.externalJsFile)
}
/**
 * 加载按钮使用的API服务
 */

/**
 * 加载插槽组件
 * 
 */
let slotModules = import.meta.glob('@/comRenderPlugins/**/**/*.vue')
const templateModulePath = ref('/src/comRenderPlugins')

/**
 * 按钮事件
 * @param btnItem
 */
const handleBtnClick=(btnItem,rows)=>{
  if(btnItem.apiCode==='sub-page-list'){
    rows=tableContentRef.value.getSubCheckedRows()
  }else{
    rows=tableContentRef.value.getCheckedRows()
  }
  btnEvent(btnItem,instance,externalJsModule,rows)
}
onMounted(async () => {
})

</script>

<style lang="scss">
.page-list-container{
  height: 100%;
  display: flex;
  flex-direction: column;
  .content{
    background-color: white;
    box-shadow: 0 0 rgba(0, 0, 0, 0), 0 0 rgba(0, 0, 0, 0), 0 1px 3px 0 rgba(0, 0, 0, 0.1019607843), 0 1px 2px -1px rgba(0, 0, 0, 0.1019607843);
    flex: 1;
    border-radius: 4px;
    display: flex;
    flex-direction: column;
    .table-content{
      flex: 1;
      .j-vxe-table{
        height: calc(100% + 30px);
      }
    }
  }
}
</style>
