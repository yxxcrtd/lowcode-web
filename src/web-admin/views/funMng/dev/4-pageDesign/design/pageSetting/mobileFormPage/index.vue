<template>
  <el-dialog v-model="dialogVisible" fullscreen class="fullscreen-dialog">
    <template #title>
      <div class="flex justify-between">
        <div>移动表单页配置</div>
        <div class="dialog-footer mr-5">
          <el-button type="primary" @click="submitForm">保存</el-button>
        </div>
      </div>
    </template>
    <div class="design-container" v-loading="loading" element-loading-text="加载中...">
      <el-tabs v-if="isLoadData" v-model="activeName" class="demo-tabs" :before-leave="handleTabBeforeLeave">
        <el-tab-pane label="基本信息" name="base">
          <BaseInfo v-model="formData" ref="formRef"></BaseInfo>
        </el-tab-pane>
        <el-tab-pane label="表单项配置" name="tableConfig" lazy>
          <FormItem ref="formItemRef" v-model="formData" />
        </el-tab-pane>
        <el-tab-pane label="操作按钮" name="actionBtn" lazy>
          <ActionButton ref="actionButtonRef" v-model="formData" />
        </el-tab-pane>
        <el-tab-pane label="附件管理" name="attachment" lazy v-if="formData.isSupportAttachment == 1">
          <Attachment ref="attachmentRef" v-model="formData" />
        </el-tab-pane>
        <el-tab-pane label="拓展事件" name="event" lazy>
          <Event v-model="formData" />
        </el-tab-pane>
        <el-tab-pane label="页面路由参数" name="params" lazy>
          <Paramter v-model="formData" />
        </el-tab-pane>
      </el-tabs>
    </div>
  </el-dialog>
</template>
<script lang="ts" setup>
import { ref } from 'vue'
import BaseInfo from "./Components/1-BaseInfo.vue"
import FormItem from "./Components/2-FormItem.vue"
import ActionButton from "./Components/4-ActionButton.vue"
import Event from "./Components/5-Event.vue"
import Paramter from "./Components/6-Paramter.vue"
import Attachment from "./Components/7-Attachment.vue"
import {
  addPageInfo,
  getPageModuleInfo,
  getPageInfo,
  updatePageInfo,
  getTemplateInfo
} from "../../../api"


defineOptions({ name: 'PageDesignFormPageIndex' })

const message = useMessage() // 消息弹窗
const dialogVisible = ref(false)
const activeName = ref('base')
const bizType=ref('create')
const formRef = ref()
const actionButtonRef= ref()

const route = useRoute()
const menuId = route.query.id

const formData = ref({
  menuId:menuId,
  pageType:'mobile-form',
  templateId:'',
  templateApiList:[],
  templateParamList:[],
  pageButtons:[],
  eventList:[],
  columnSpan:8,
  paramterList:[],
})

/** 打开弹窗 */
const isLoadData=ref(false)
const open = async (type: string ,pageType: string, data) => {
  isLoadData.value=false
  dialogVisible.value = true
  loading.value=true
  await nextTick()
  formData.value={
    menuId:menuId,
    pageType:'mobile-form',
    templateId:'',
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
      pageType:'mobile-form',
      pageCode:'M-BD-',
      pageState:'1',
      pageTemplate:'',
      columnSpan:8,
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
  if(type==='create'){
    nextTick(()=>{
      actionButtonRef.value && actionButtonRef.value.setDefaultBtn()
    })
  }
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

const generateUniqueId=()=> {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 9);
  return `yt-page-${timestamp}-${random}`;
}
/** 将列表转换为树结构 */
const listToTree = (list) => {
  const map = {}
  const result = []
  
  list.forEach(item => {
    map[item.id] = { ...item, children: [] }
  })
  
  list.forEach(item => {
    const node = map[item.id]
    if (item.parentId) {
      if (map[item.parentId]) {
        map[item.parentId].children.push(node)
      }
    } else {
      result.push(node)
    }
  })
  
  return result
}
/** 将树结构转换回列表 */
const treeToList = (tree) => {
  const result = []
  const flatten = (nodes) => {
    nodes.forEach(node => {
      const { children, ...item } = node
      result.push(item)
      if (children && children.length) {
        flatten(children)
      }
    })
  }
  flatten(tree)
  return result
}
const loadPageInfo=async (id)=>{
  const pageRes=await getPageInfo(id)
  formData.value={...formData.value,...pageRes}

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
      paramterList:[],
      tableLayoutConfig:[]
    }
  })

  //将模板信息和已保存信息合并
  const modelInfoMap={}
  for(let apiItem of formData.value.templateApiList) {
    const pageApiVO = pageRes.pageApiRespVOS.find(item => apiItem.apiCode === item.apiCode)
    if (pageApiVO) {
      apiItem = Object.assign(apiItem, pageApiVO)
      // 将 pageGroups 转换为树结构
      apiItem.pageGroupsTree = listToTree(apiItem.pageGroups || [])
      //查询模型信息，组装字段
      let params = {
        id:apiItem.moduleId
      }
      let moduleInfoRes= {}
      console.log('modelInfoMap[apiItem.moduleId]',modelInfoMap[apiItem.moduleId])
      if(modelInfoMap[apiItem.moduleId]){
        moduleInfoRes=modelInfoMap[apiItem.moduleId]
      }else{
        moduleInfoRes=await getPageModuleInfo(params)
        modelInfoMap[apiItem.moduleId]=moduleInfoRes
      }
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
      moduleInfoRes.tableList.forEach(tableItem=>{
        tableItem.fieldList.forEach(fieldItem=>{
          if(!fieldItem.isSys){
            const tableColumnsItem=apiItem.pageListConfigs && (apiItem.pageListConfigs.find(item=>item.moduleTableId==tableItem.id && item.fieldId==fieldItem.fieldId)) || {}
            apiItem.tableColumns.push({
              tableName:tableItem.tableName,
              relationTableId:fieldItem.fieldId,
              columnNameAlias:fieldItem.fieldAliasName,
              ...tableColumnsItem,
              moduleTableId:tableItem.id,
              moduleId:tableItem.moduleId,
              columnName:fieldItem.columnName,
              columnComment:fieldItem.columnComment,
              columnType:fieldItem.columnType,
              isVisible:!!tableColumnsItem.id ? 1 :0,
            })
          }
        })
      })
      console.log(moduleInfoRes)
    }
  }
}

const handleTabBeforeLeave=(name)=>{
  const isHaveNoApi=formData.value.templateApiList.find(item=>!item.serverId)
  if(name!='base' && isHaveNoApi){
    message.warning("请选择模型服务")
    return false
  }
  return true
}

const loading=ref(false)
const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调

const formItemRef=ref()
const submitForm = async () => {
  const baseInfoValid=await formRef.value.validateForm()
  if(formItemRef.value){
    const formItemValid = await formItemRef.value.validateFormItem()
  }

  const param:any={
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
    attachmentInfo:formData.value.attachmentInfo,
    paramterList:formData.value.paramterList,
    templateParamList:formData.value.templateParamList,
    isSupportAttachment:formData.value.isSupportAttachment,
    columnSpan:formData.value.columnSpan,
    labelWidth:formData.value.labelWidth,
    labelPosition:formData.value.labelPosition
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
      pageGroups: item.pageGroupsTree ? treeToList(item.pageGroupsTree) : [],// 将树结构转换回列表
      tableLayoutConfig: item.tableLayoutConfig
    }
  })
  loading.value=true
  try{
    let res =bizType.value==='create' ? await addPageInfo(param) :await updatePageInfo(param)
    if (res) {
      message.success('保存成功！')
      dialogVisible.value = false
      emit('success',res.id)
    }
  }catch(e){
    console.log(e)
  }finally {
    loading.value=false
  }
}
</script>
<style scoped lang="scss">
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
.custom-tree-node {
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin-right: 10px;
  a {
    font-size: 12px;
    color: #1e83e9;
    cursor: pointer;
  }
}
.left-tree {
  border-right: 1px solid #e9e4e4;
  margin: 0 10px;
}

.content-left {
  width: 260px;
  min-width: 260px;
  padding: 5px 10px 5px 0;
  margin: 0 16px 0 0;
  border-right: 1px solid #e9e4e4;
  .view-tabs {
    display: flex;
    justify-content: center;
    margin: 0px 0px 10px;
  }
  .model-cards {
    margin: 0 10px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    .model-cards-item {
      background: #f6f6f6;
      border-radius: 4px;
      padding: 5px 10px;
      display: flex;
      margin-bottom: 10px;
      .main {
        .title {
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 5px;
        }
        .subTitle {
          font-size: 12px;
          color: #929292;
        }
      }
    }
    .model-cards-item:hover {
      border: 1px solid #2340a0;
      background: #ebf0fc;
      .main {
        .title {
          color: #294aa6;
        }
        .subTitle {
          color: #a2abd7;
        }
      }
    }
  }
}
.content-right {
  width: calc(100% - 300px);
}
</style>
