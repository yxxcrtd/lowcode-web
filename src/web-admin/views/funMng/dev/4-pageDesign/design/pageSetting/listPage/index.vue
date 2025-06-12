<template>
  <el-dialog v-model="dialogVisible" fullscreen class="fullscreen-dialog">
    <template #title>
      <div class="flex justify-between">
        <div>列表页配置</div>
        <div class="dialog-footer mr-5">
          <el-button type="primary" @click="submitForm">保存</el-button>
        </div>
      </div>

    </template>
    <div class="design-container" v-loading="loading" element-loading-text="加载中...">
      <el-tabs v-if="isLoadData"  v-model="activeName" class="demo-tabs" :before-leave="handleTabBeforeLeave">
        <el-tab-pane label="基本信息" name="base">
          <BaseInfo v-model="formData" ref="formRef"></BaseInfo>
        </el-tab-pane>
        <el-tab-pane label="列表配置" name="tableConfig" lazy>
          <TableColumn v-model="formData"/>
        </el-tab-pane>
        <el-tab-pane label="查询条件" name="search" lazy>
          <Search v-model="formData"/>
        </el-tab-pane>
        <el-tab-pane label="操作按钮" name="actionBtn" lazy>
          <ActionButton v-model="formData"/>
        </el-tab-pane>
        <el-tab-pane label="拓展事件" name="event" lazy>
          <Event v-model="formData"/>
        </el-tab-pane>
        <el-tab-pane label="页面路由参数" name="params" lazy>
          <Paramter v-model="formData"/>
        </el-tab-pane>
      </el-tabs>
    </div>
  </el-dialog>
</template>
<script lang="ts" setup>
import { ref } from 'vue'
import BaseInfo from "./Components/1-BaseInfo.vue"
import TableColumn from "./Components/2-TableColumn.vue"
import Search from "./Components/3-Search.vue"
import ActionButton from "./Components/4-ActionButton.vue"
import Event from "./Components/5-Event.vue"
import Paramter from "./Components/6-Paramter.vue"
import {
  addPageInfo,
  getPageInfo,
  getPageModuleInfo,
  getTemplateInfo,
  updatePageInfo
} from "../../../api"
import {PageModelVO} from "../../../type"


defineOptions({ name: 'PageDesignListPageIndex' })

const message = useMessage() // 消息弹窗
const dialogVisible = ref(false)
const bizType=ref('create')
const activeName = ref('base')
const formRef = ref()

const route = useRoute()
const menuId = route.query.id
//时间戳，本次编辑时的更新时间 
const updateTimeStamp=ref('')

const formData = ref({
  menuId:menuId,
  pageType:'list',
  pageTemplate:'',
  templateApiList:[],
  templateParamList:[],
  pageButtons:[],
  eventList:[],
  paramterList:[]
})
/**
 * 打开弹窗
 */
const isLoadData=ref(false)
const open = async (type: string, pageType: string, data) => {
  dialogVisible.value = true
  isLoadData.value=false
  loading.value=true
  await nextTick()
  formData.value={
    menuId:menuId,
    pageType:'list',
    pageTemplate:'',
    templateApiList:[],
    templateParamList:[],
    pageButtons:[],
    eventList:[],
    paramterList:[]
  }
  if (type === 'edit') {
    bizType.value='edit'
    await loadPageInfo(data.id)
  }else{
    bizType.value='create'
    formData.value={
      menuId:menuId,
      pageType:'list',
      pageCode:'LB-',
      pageState:'1',
      pageTemplate:'',
      templateApiList:[],
      templateParamList:[],
      pageButtons:[],
      eventList:[],
      paramterList:[]
    }
  }
  activeName.value='base'
  isLoadData.value=true
  loading.value=false
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

const generateUniqueId=()=> {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 9);
  return `yt-page-${timestamp}-${random}`;
}
/**
 * 编辑时 加载页面信息
 * @param id
 */
const loadPageInfo=async (id)=>{
  const pageRes=await getPageInfo(id)
  formData.value={...formData.value,...pageRes}
  updateTimeStamp.value=pageRes.updateTime
  //加载页面模板信息
  const templateRes=await getTemplateInfo({id:pageRes.pageTemplate})
  formData.value.templateApiList=templateRes.apiList.map(item=>{
    return {
      apiId:item.id,
      apiCode:item.apiCode,
      apiName:item.apiName,
      pageGroups:[],
      tableList:[],
      tableColumns:[],
      searchItems:[],
      pageListConditions:[],
      pageButtons:[],
      eventList:[],
      paramterList:[]
    }
  })
  // debugger
  // if(templateRes.paramList){
  //   formData.value.templateParamList=templateRes.paramList.map(item=>{
  //     return {
  //       ...item
  //     }
  //   })
  // }else{
  //   formData.value.templateParamList=[]
  // }
  //将模板信息和已保存信息合并
  for(let apiItem of formData.value.templateApiList){
    const pageApiVO=pageRes.pageApiRespVOS.find(item=>apiItem.apiCode===item.apiCode)
    if(pageApiVO){
      apiItem=Object.assign(apiItem,pageApiVO)

      //查询模型信息，组装字段
      let params = {
        id:apiItem.moduleId
      }
      const moduleInfoRes=await getPageModuleInfo(params)
      const pageModuleApiOption = moduleInfoRes.apiList.map(tableItem=>{
        return {
          label:tableItem.serviceName,
          value:tableItem.id,
          ...tableItem
        }
      })
      apiItem.pageModuleApiOption = pageModuleApiOption
      apiItem.tableList=moduleInfoRes.tableList
      if(!apiItem.tableLayoutConfig){
        apiItem.tableLayoutConfig=[]
      }

      apiItem.tableColumns=[]
      apiItem.searchItems=[]
      moduleInfoRes.tableList.forEach(tableItem=>{
        let sort=1
        tableItem.fieldList.forEach(fieldItem=>{
          if(!fieldItem.isSys){
            const tableColumnsItem=apiItem.pageListConfigs.find(item=>item.fieldId==fieldItem.fieldId) || {}
            apiItem.tableColumns.push({
              childTableId:tableItem.isChild ? tableItem.tableId:null,
              tableId:tableItem.tableId,
              fieldId:fieldItem.fieldId,
              columnFixedWidth:null,
              columnMinWidth:null,
              ...tableColumnsItem,
              tableName:tableItem.tableName,
              relationTableId:fieldItem.fieldId,
              moduleTableId:tableItem.id,
              moduleId:tableItem.moduleId,
              columnName:fieldItem.columnName,
              columnComment:fieldItem.columnComment,
              columnType:fieldItem.columnType,
            })
            
            const searchItem=apiItem.pageListConditions?.find(item=>item.fieldId==fieldItem.fieldId) || {}
            apiItem.searchItems.push({
              childTableId:tableItem.isChild ? tableItem.tableId:null,
              tableId:tableItem.id,
              columnDisplayComponent:"ace-input",
              columnDisplayComponentName:"普通输入框",
              columnQueryOperator:'eq',
              sort:sort,
              ...searchItem,
              moduleTableId:tableItem.id,
              tableName:tableItem.tableName,
              moduleId:tableItem.moduleId,
              relationTableId:fieldItem.fieldId,
              fieldId:fieldItem.fieldId,
              columnName:fieldItem.columnName,
              columnComment:fieldItem.columnComment,
              columnType:fieldItem.columnType,
              isQueryColumn:searchItem.id ? 1 :0,
              isColumnRequire:searchItem.isColumnRequire=='1'?1:0
            })
          }
          sort++
        })
      })
    }
  }

}
/**
 * tab切换判断，必须选择模型后才可以切换
 * @param name
 */
const handleTabBeforeLeave=(name)=>{
  const isHaveNoApi=formData.value.templateApiList.find(item=>!item.serverId)
  console.log(isHaveNoApi)
  if(name!='base' && isHaveNoApi){
    message.warning("请选择模型服务")
    return false
  }
  return true
}
/**
 * 保存按钮事件
 */
const loading=ref(false)
const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
const submitForm = () => {
  formRef.value.validateForm(async (valid) => {
    if(valid){
      const param={
        id:formData.value.id,
        menuId:menuId,
        pageId:formData.value.pageId,
        pageType:formData.value.pageType,
        pageState:formData.value.pageState,
        pageName:formData.value.pageName,
        pageCode:formData.value.pageCode,
        pageTemplate:formData.value.pageTemplate,
        headerSlot:formData.value.headerSlot,
        middleSlot:formData.value.middleSlot,
        tailSlot:formData.value.tailSlot,
        externalJsFile:formData.value.externalJsFile,
        eventList:formData.value.eventList,
        pageButtons:formData.value.pageButtons,
        paramterList:formData.value.paramterList,
        templateParamList:formData.value.templateParamList,
        isSupportAttachment:formData.value.isSupportAttachment,
        columnSpan:formData.value.columnSpan,
        labelWidth:formData.value.labelWidth,
        labelPosition:formData.value.labelPosition,
        updateTimeStamp:updateTimeStamp.value,
      }
      param.pageApiRespVOS=formData.value.templateApiList.map(item=>{
        return {
          id:item.id,
          apiId:item.apiId,
          apiCode:item.apiCode,
          apiName:item.apiName,
          moduleId:item.moduleId,
          serverId:item.serverId,
          pageListConfigs:item.tableColumns.filter(item=>item.isVisible),
          pageListConditions:item.searchItems.filter(item=>item.isQueryColumn),
          pageGroups:item.pageGroups,
          tableLayoutConfig: item.tableLayoutConfig
        }
      })
      loading.value=true
      try{
        let res =bizType.value==='create' ? await addPageInfo(param) :await updatePageInfo(param)
        if (res) {
          message.success('保存成功！')
          isLoadData.value=true
          dialogVisible.value = false
          formData.value={}
          emit('success',res.id)
        }
      }catch (e){
        console.log(e)
      }finally {
        loading.value=false
      }
    }
  })
}
</script>
<style scoped lang="scss">
// .oprate-button-warp{
//   border-bottom:1px solid #ddd;
//   margin-bottom:10px;
//   padding-left:280px;
// }
.datamodel-content {
  display: flex;
}
.main-icon {
  background: #1e83e9;
  color: #fff;
  font-size: 12px;
  padding: 2px;
  border-radius: 4px;
  margin-right: 6px;
}
.custom-tree-node{
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin-right:10px;
  a{
    font-size: 12px;
    color: #1e83e9;
    cursor: pointer;
  }
}
.left-tree{
  border-right: 1px solid #e9e4e4;
  margin: 0 10px;
}

.content-left{
  width: 260px;
  min-width: 260px;
  padding:5px 10px 5px 0;
  margin:0 16px 0 0;
  border-right: 1px solid #e9e4e4;
  .view-tabs{
    display: flex;
    justify-content: center;
    margin: 0px 0px 10px;
  }
  .model-cards{
    margin: 0 10px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    .model-cards-item{
      background: #f6f6f6;
      border-radius: 4px;
      padding: 5px 10px;
      display: flex;
      margin-bottom: 10px;
      .main{
        .title{
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 5px;
        }
        .subTitle{
          font-size: 12px;
          color: #929292;
        }
      }
    }
    .model-cards-item:hover{
      border:1px solid #2340a0;
      background: #ebf0fc;
      .main{
        .title{
          color: #294aa6;
        }
        .subTitle{
          color: #a2abd7;
        }
      }
    }
  }
}
.content-right{
  width: calc(100% - 300px);
}
</style>
