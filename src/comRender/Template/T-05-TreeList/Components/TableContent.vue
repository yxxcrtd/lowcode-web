<template>
  <div class="table-content">
    <JVxeTable ref="jVxeTable" height="100%" :is-def-load-data="false" :row-height="42" apiType="post" :columns="columns" :data-fun="getPageData">
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

const props=defineProps({
  queryFields:{
    type:Object
  }
})

const jVxeTable = ref()
const pageInfo:any = inject('pageInfo')
const instance=getCurrentInstance()
const apiInfo = pageInfo.pageApiRespVOS.find((item) => item.apiCode === 'page-list')

//组装表格按钮
const tableButtons = getTableButtons(pageInfo.pageButtons,'page-list',apiInfo.pageListConfigs)
//组装表格列
let columns = tableCls.getTableColumns(apiInfo, tableButtons)
//获取所有插槽
const slots=tableCls.getColumnsSlots(columns)
/**
 * 对表格数据进行统一格式化
 * @param row
 * @param rowIndex
 * @param column
 */
const valueFormat=(row,rowIndex,column)=>{
  return tableCls.columnFormater(apiInfo,row,rowIndex,column)
}

//组装表格数据参数
const pageUrl = '/cfg/low-code-api/' + apiInfo.serverId
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
defineExpose({ refreshTable,getCheckedRows }) // 提供 open 方法，用于打开弹窗
</script>

<style scoped lang="scss">
.table-content {
  max-width: calc(100vw - 200px);
  padding: 5px 12px;
}
</style>
