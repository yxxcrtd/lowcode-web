<template>
  <div class="table-content">
    <JVxeTable ref="jVxeTable" height="100%" :is-def-load-data="false" :row-height="42" apiType="post" :columns="columns" :data-fun="getPageData" :tablePageConfig="getTablePageCfg()">
      <template #expand_content="{row}">
        <div class="expand-wrapper">
          <JVxeTable ref="subJVxeTable" height="300"  :searchParams="getSearchParams(row)" :row-height="42" :columns="subColumns" :data-fun="getSubPageData" :tablePageConfig="getTablePageCfg('sub')">
            <template v-for="(slotName,index) in subSlots" #[slotName]="{ row,rowIndex,column }" :key="'vxetable-col-slot-'+index">
              <template v-if="slotName.indexOf('_header')>-1">
                <div class="table-header">
                  <template v-if="column.params.headSlot">
                    <RenderSlot :slot-path="column.params.headSlot" :templateModule="slotModules" :template-path="templateModulePath" :instance="instance" :column="column"></RenderSlot>
                  </template>
                  <template v-else>
                    {{column.title}}
                  </template>
                  <el-tooltip
                    v-if="column.params.titleTips"
                    popper-class="tooltips"
                    :content="column.params.titleTips"
                    placement="top-start"
                  >
                    <el-icon class="table-header-tips-icon"><WarningFilled /></el-icon>
                  </el-tooltip>
                </div>
              </template>
              <template v-else>
                <div v-if="column.params.slot">
                  <RenderSlot :slot-path="column.params.slot" :templateModule="slotModules" :template-path="templateModulePath" :instance="instance" :row="row" :column="column"></RenderSlot>
                </div>
                <div v-else>
                  {{valueFormat(row,rowIndex,column)}}
                </div>
              </template>
            </template>
            <template #action_default="{ row }">
              <div class="table-action">
                <template v-for="(item, index) in subTableButtons" :key="'row-btn' + index">
                  <template v-if="tableRowCheckRules(row,item.showRuleStr)">
                    <el-link v-hasPermi="[item.pageId+':'+item.permissionSign]" :type="item.buttonStyle || 'primary'" @click="handleClick(item, row)">
                      <Icon v-if="item.buttonIcon" :icon="item.buttonIcon" class="mr-2px" />
                      {{ item.buttonName }}</el-link>
                    <el-divider direction="vertical" v-if="index < tableButtons.length - 1" />
                  </template>
                </template>
              </div>
            </template>
          </JVxeTable>
        </div>
      </template>
      <template v-for="(slotName,index) in slots" #[slotName]="{ row,rowIndex,column }" :key="'vxetable-col-slot-'+index">
        <template v-if="slotName.indexOf('_header')>-1">
          <div class="table-header">
            <template v-if="column.params.headSlot">
              <RenderSlot :slot-path="column.params.headSlot" :templateModule="slotModules" :template-path="templateModulePath" :instance="instance" :column="column"></RenderSlot>
            </template>
            <template v-else>
              {{column.title}}
            </template>
            <el-tooltip
              v-if="column.params.titleTips"
              popper-class="tooltips"
              :content="column.params.titleTips"
              placement="top-start"
            >
              <el-icon class="table-header-tips-icon"><WarningFilled /></el-icon>
            </el-tooltip>
          </div>
        </template>
        <template v-else>
          <div v-if="column.params.slot">
            <RenderSlot :slot-path="column.params.slot" :templateModule="slotModules" :template-path="templateModulePath" :instance="instance" :row="row" :column="column"></RenderSlot>
          </div>
          <div v-else>
            {{valueFormat(row,rowIndex,column)}}
          </div>
        </template>
      </template>
      <template #action_default="{ row }">
        <div class="table-action">
          <template v-for="(item, index) in tableButtons" :key="'row-btn' + index">
            <template v-if="tableRowCheckRules(row,item.showRuleStr)">
              <el-link v-hasPermi="[item.pageId+':'+item.permissionSign]" :type="item.buttonStyle || 'primary'" @click="handleClick(item, row)">
                <Icon v-if="item.buttonIcon" :icon="item.buttonIcon" class="mr-2px" />
                {{ item.buttonName }}</el-link>
              <el-divider direction="vertical" v-if="index < tableButtons.length - 1" />
            </template>
          </template>
        </div>
      </template>
    </JVxeTable>
  </div>
</template>

<script setup lang="ts">
import * as tableCls from '../js/table'
import request from '@/config/axios'
import {WarningFilled} from "@element-plus/icons-vue"
import RenderSlot from '@/comRender/Components/RenderSlot/index.vue'
import {ref} from "vue";
import {tableRowCheckRules} from "@/comRender/render/v1/Core/linkage";
import {getTableButtons} from "../js/table";
import {
  getModuleApiParamInfo
} from "@/comRender/api";

const props=defineProps({
  queryFields:{
    type:Object
  }
})

const jVxeTable = ref()
const subJVxeTable=ref()
const pageInfo:any = inject('pageInfo')
const instance=getCurrentInstance()
const apiInfo = pageInfo.pageApiRespVOS.find((item) => item.apiCode === 'page-list')
const mainTableId=apiInfo.moduleTables.find(item=>item.isMain).id
const pageUrl = '/cfg/low-code-api/' + apiInfo.serverId


//获取主表配置
const mainTableConfig=tableCls.getTableConfig(apiInfo.tableLayoutConfig,mainTableId)
//组装表格按钮
const tableButtons = getTableButtons(pageInfo.pageButtons,'page-list',apiInfo.pageListConfigs)
//组装表格列
let columns = tableCls.getTableColumns(apiInfo, tableButtons,null,mainTableConfig)
//获取所有插槽
const slots=tableCls.getColumnsSlots(columns)

//组装子表列
const subApiInfo = pageInfo.pageApiRespVOS.find((item) => item.apiCode === 'sub-page-list')
//获取子表id
const subTableId=tableCls.getSubTableId(pageInfo,'page-list','sub_table_id')
const subTableConfig=tableCls.getTableConfig(apiInfo.tableLayoutConfig,subTableId)
//组装表格按钮
const subTableButtons = getTableButtons(pageInfo.pageButtons,'sub-page-list',apiInfo.pageListConfigs)
const subPageUrl = '/cfg/low-code-api/' + subApiInfo.serverId
let subColumns=tableCls.getTableColumns(apiInfo, subTableButtons,subTableId,subTableConfig)
const subSlots=tableCls.getColumnsSlots(subColumns)

//
const getTablePageCfg=(type)=>{
  const tableConfg=type=='sub'?subTableConfig:mainTableConfig
  const tablePageConfig={
    enabled:!!tableConfg.isPageList,
    pageSize:tableConfg.tableDefPageSize
  }
  return tablePageConfig
}
const apiParams=ref()
/**
 * 对表格数据进行统一格式化
 * @param row
 * @param rowIndex
 * @param column
 */
const valueFormat=(row,rowIndex,column)=>{
  return tableCls.columnFormater(apiInfo,row,rowIndex,column)
}
const loadApiParams=async ()=>{
  apiParams.value=await getModuleApiParamInfo(subApiInfo.serverId)
}
//组装表格数据参数
const getPageData=(paramter)=>{
  let sortingFields:any=null
  if(paramter.sortdesc){
    sortingFields=paramter.sortdesc
  }
  if(paramter.order){
    sortingFields=[
      {
        field:paramter.field,
        order:paramter.order
      }
    ]
  }
  const params={
    pageNo: 1,
    pageSize: 20,
    serviceId: apiInfo.serverId,
    pageApiCode: apiInfo.apiCode,
    pageId: apiInfo.id,
    enablePage: false,
    params: {},
    sortingFields: sortingFields,
    queryFields: props.queryFields,
    ...paramter
  }
  return request.post({ url: pageUrl, data: params })
}

const getSubPageData=(paramter)=>{
  console.log('paramter',paramter)
  let sortingFields:any=null
  if(paramter.sortdesc){
    sortingFields=paramter.sortdesc
  }
  if(paramter.order){
    sortingFields=[
      {
        field:paramter.field,
        order:paramter.order
      }
    ]
  }
  const params={
    pageNo: 1,
    pageSize: 20,
    serviceId: subApiInfo.serverId,
    pageApiCode: subApiInfo.apiCode,
    pageId: apiInfo.id,
    enablePage: false,
    params: {
      ...paramter.otherParams
    },
    sortingFields: sortingFields,
    queryFields: props.queryFields
  }
  return request.post({ url: subPageUrl, data: params })
}
const getSearchParams=(row)=>{
  let searchParams={
    otherParams:{}
  }
  if(apiParams.value){
    apiParams.value.filter(item=>item.paramType=='请求参数').forEach(item=>{
      if(row[item.fieldName]){
        if(item.dataType==='array' || item.fieldName.includes('id_')){
          searchParams.otherParams[item.fieldName]=[row[item.fieldName]]
        }else{
          searchParams.otherParams[item.fieldName]=row[item.fieldName]
        }
      }
    })
  }
  return searchParams
}
onBeforeMount(()=>{
  loadApiParams()
})
//行内按钮事件处理
const emits=defineEmits(["btnEvent"])
const handleClick=(btnItem, row)=>{
  emits("btnEvent",btnItem, row)
}
//获取指定目录下的组件，用来加载插槽
let slotModules = import.meta.glob('@/comRenderPlugins/**/**/*.vue')
const templateModulePath = ref('/src/comRenderPlugins')

/**
 * 暴露方法：刷新表格
 */
const refreshTable = () => {
  jVxeTable.value.refresh()
}
/**
 * 暴露方法：获取选择行
 */
const getCheckedRows=()=>{
  return jVxeTable.value.getCheckboxRecords()
}
const getSubCheckedRows=()=>{
  return subJVxeTable.value.getCheckboxRecords()
}
defineExpose({ refreshTable,getCheckedRows,getSubCheckedRows }) // 提供 open 方法，用于打开弹窗
</script>

<style scoped lang="scss">
.table-content {
  max-width: calc(100vw - 200px);
  padding: 5px 12px;
}
</style>
