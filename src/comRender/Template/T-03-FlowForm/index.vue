<template>
  <!--  <FormHeader></FormHeader>-->
  <div class="form-page-container">
    <!--前置插槽-->
    <RenderSlot
      :slot-path="pageInfo.headerSlot"
      :templateModule="slotModules"
      :template-path="templateModulePath"
      :instance="instance"
      v-model="formData"
    ></RenderSlot>
    <template v-if="pageInfo.pageVersion=='v2' || ['1926177946425171970'].includes(pageInfo.id)">
      <!--表单-->
      <div class="page-version" v-if="isDev">page-version:v2</div>
      <RenderFormV2
        v-model="formData"
        ref="formRef"
        :form-layouts="apiInfo"
        :form-props="formProps"
        :formTableProps="formTableProps"
        :flow-node-info="curFlowNodeInfo"
        :is-detail="tableIsDetail"
        :page-info="pageInfo"
        :is-mapping="true"
        @layout-success="layoutSuccess"
        @change-flow="changeFlow"
      ></RenderFormV2>
    </template>
    <template v-else>
      <div class="page-version" v-if="isDev">page-version:v1</div>
      <!--表单-->
      <RenderFormV1
        v-model="formData"
        ref="formRef"
        :form-layouts="apiInfo"
        :form-props="formProps"
        :formTableProps="formTableProps"
        :flow-node-info="curFlowNodeInfo"
        :is-detail="tableIsDetail"
        :page-info="pageInfo"
        :is-mapping="true"
        @layout-success="layoutSuccess"
        @change-flow="changeFlow"
      ></RenderFormV1>
    </template>
    <!--后置插槽-->
    <RenderSlot
      :slot-path="pageInfo.tailSlot"
      :templateModule="slotModules"
      :template-path="templateModulePath"
      :instance="instance"
      v-model="formData"
    ></RenderSlot>
    <div class="foot-split" v-if="isShowBtnFooter"></div>
    <div class="fixed-footer" v-if="isShowBtnFooter">
      <template v-for="item in pageButtons">
        <el-popconfirm
          title="确定关闭页面吗？"
          width="200px"
          popper-class="cancel-btn-popconfirm"
          v-if="item.operationType === 'cancel'"
          :key="'cancel-btn' + item.buttonId"
          @confirm="handlePageButtons(item)"
        >
          <template #reference>
            <el-button>
              <Icon v-if="item.buttonIcon" :icon="item.buttonIcon" class="mr-5px" />
              {{ item.buttonName }}</el-button
            >
          </template>
        </el-popconfirm>
        <el-button v-else :type="item.buttonStyle" :loading="item.isLoading" :key="item.buttonId" @click="handlePageButtons(item)">
          <Icon v-if="item.buttonIcon" :icon="item.buttonIcon" class="mr-5px" />
          {{ item.buttonName }}</el-button
        >
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, provide } from 'vue'
import { propTypes } from '@/utils/propTypes'
import {cloneDeep, throttle} from 'lodash-es'
import request from '@/config/axios'
import { useTagsView } from '@/hooks/web/useTagsView'
import {getDictLabel, getDictLabels} from '@/utils/dict'
import {getFlowNodeCfg} from "@/comRender/api";
import RenderFormV1 from '@/comRender/render/v1/Components/RenderForm/index.vue'
import RenderFormV2 from '@/comRender/render/v2/Components/RenderForm/index.vue'
import RenderSlot from '@/comRender/Components/RenderSlot/index.vue'
import {
  getModuleApiParamInfo,
  getUserListByIds
} from '@/comRender/api'
import { isEmptyObj } from '@/utils/is'
import {getColumnsByTag, getTagsData} from '@/comRender/utils/columnTag/index'
import {useRouteParamStore} from "@/store/modules/routeParams";
import {useUserStore} from "@/store/modules/user";
//定义模板页面api和参数
const templateAPI = ref([
  {
    apiCode: 'form-start-detail',
    apiName: '发起详情'
  },
  {
    apiCode: 'form-create',
    apiName: '新增'
  },
  {
    apiCode: 'form-update',
    apiName: '修改'
  },
  {
    apiCode: 'form-detail',
    apiName: '详情'
  }
])

const props = defineProps({
  pageInfo: propTypes.object.def({}),
  flowNodeInfo:propTypes.object,
  dataId: propTypes.string
})
provide('pageInfo', props.pageInfo)
const instance = getCurrentInstance()
const apiInfo = props.pageInfo.pageApiRespVOS.find((item) => item.apiCode === 'form-create')

const message = useMessage()
const tag = useTagsView()
const userStore=useUserStore()
const routeParamsStore=useRouteParamStore()
const isDev=import.meta.env.NODE_ENV == 'development'

const route = useRoute()
const { pageType,paramKey } = route.query
  
const formData = ref<any>(null)
const formRef = ref()


//临时切换的流程信息；流程可能是根据具体字段确定；
const curFlowNodeInfo=ref(props.flowNodeInfo)

const tableIsDetail = ref(pageType == 'detail')
const formProps = ref({
  'label-position': 'right',
  labelWidth: 'auto'
})
//如果有nodeId，说明是从泛微接入，不需要显示按钮
const isShowBtnFooter=computed(()=>{
  if(window.top!=window.self && route.query.nodeId) {
    return false
  }
  if(pageType == 'detail'){
    return false
  }
  return true
})
const formTableProps = ref({
  showBtnFun: () => {
    return !['detail'].includes(pageType)
  }
})
const paramData=routeParamsStore.getUrlParam(paramKey)
console.log('paramData',paramData)
/**
 * 加载插槽组件
 *
 */
let slotModules = import.meta.glob('@/comRenderPlugins/**/**/*.vue')
const templateModulePath = ref('/src/comRenderPlugins')

/**
 * 流程发起时，获取映射的业务数据
 */
const loadInitData = async () => {
  //查询初始化数据服务
  const initDataApiInfo = props.pageInfo.pageApiRespVOS.find((item) => item.apiCode === 'form-start-detail')
  const apiParamsRes = await getModuleApiParamInfo(initDataApiInfo.serverId)
  //获取服务参数，从url中获取对应的参数
  const queryParams = apiParamsRes
    .filter((item) => item.paramType === '请求参数')
    .reduce((obj, cur) => {
      const queryName = cur.fieldName.substring(0, cur.fieldName.lastIndexOf('_'))
      if(route.query[queryName.toLowerCase()]){
        obj[cur.fieldName] = route.query[queryName.toLowerCase()]
      }
      return obj
    }, {})
  if (!isEmptyObj(queryParams)) {
    //调用服务
    let apiUrl = '/cfg/low-code-api/' + initDataApiInfo.serverId
    const params = {
      serviceId: initDataApiInfo.serverId,
      pageId: initDataApiInfo.pageId,
      pageApiCode: initDataApiInfo.apiCode,
      params: queryParams
    }
    let res = await request.post({ url: apiUrl, data: params })
    //数据赋值到表单
    formRef.value.initForm(res)
  }
}

/**
 * 编辑查询数据
 */
const loadEditData = async () => {
  const apiInfo = props.pageInfo.pageApiRespVOS.find((item) => item.apiCode === 'form-detail')
  const apiParamsRes = await getModuleApiParamInfo(apiInfo.serverId)
  const queryParams = apiParamsRes
    .filter((item) => item.paramType === '请求参数')
    .reduce((obj, cur) => {
      const queryName = cur.fieldName.substring(0, cur.fieldName.lastIndexOf('_'))
      obj[cur.fieldName] = route.query[queryName.toLowerCase()] ||  route.query[cur.fieldName] || route.query[cur.fieldName.toLowerCase()]
      return obj
    }, {})
  console.log('queryParams',queryParams)
  if(!isEmptyObj(queryParams)){
    let apiUrl = '/cfg/low-code-api/' + apiInfo.serverId
    const params = {
      serviceId: apiInfo.serverId,
      pageId: apiInfo.pageId,
      pageApiCode: apiInfo.apiCode,
      params: queryParams
    }
    let res = await request.post({ url: apiUrl, data: params })
    formRef.value.initForm(res)
  }
}

/**
 * 表单加载完成后再进行数据加载，否则可能会把加载数据覆盖
 */
const layoutSuccess = async () => {
  if (['create'].includes(pageType)) {
    await loadInitData()
  }else{
    await loadEditData()
  }
  //加载默认数据
  formRef.value.loadDataOver()
}

const changeFlow=async(flowId,nodeId)=>{
  console.log('changFlow',flowId,nodeId)
  //加载流程节点数据
  const params = {
    pageId: props.pageInfo.id,
    flowId:flowId,
    nodeId: nodeId
  }
  curFlowNodeInfo.value = await getFlowNodeCfg(params)
  curFlowNodeInfo.value.nodeId=curFlowNodeInfo.value.outProcessNodeId
  nextTick(()=>{
    //更新表单权限
    formRef.value.updateFormItem()
  })
}
/**
 * 按钮点击事件
 * @param btnItem
 */
const handlePageButtons =throttle(async (btnItem) => {
  if (btnItem.operationType === 'cancel') {
    tag.closeCurrent()
    return
  }
  btnItem.isLoading=true
  await nextTick()
  if (btnItem.operationType === 'save') {
    await saveForm(btnItem)
  }
  if (btnItem.operationType === 'submit') {
    await saveForm(btnItem)
  }
  if (btnItem.operationType === 'staging') {
    await stagingForm(btnItem)
  }
},1000)
/**
 * 表单提交
 */
//保存
const saveForm = async (btnItem,msgData?) => {
  try{
    const valid = await formRef.value.validateForm()
    if (valid) {
      const beformSaveResult=await formRef.value.runCustomEvent('before-save')
      console.log('beformSaveResult',beformSaveResult)
      if(beformSaveResult){
        save(btnItem,msgData)
        formRef.value.runCustomEvent('after-save')
      }else{
        btnItem?.isLoading && (btnItem.isLoading=false)
      }
    }else{
      btnItem?.isLoading && (btnItem.isLoading=false)
    }
  }catch (e){
    console.error(e)
    btnItem?.isLoading && (btnItem.isLoading=false)
  }
}
//暂存
const stagingForm = async (btnItem,msgData?) => {
  try{
    const valid = await formRef.value.validateForm(true)
    if (valid) {
      save(btnItem,msgData)
    }
  }catch (e) {
    console.error(e)
    btnItem?.isLoading && (btnItem.isLoading=false)
  }
}
//提交

//保存请求
const save = async (btnItem,msgData) => {
  console.log(btnItem,msgData,route.query)
  let pageTemplateApi = pageType === 'create' ? 'form-create':'form-update'
  const apiInfo = props.pageInfo.pageApiRespVOS.find((item) => item.apiCode === pageTemplateApi)
  const apiUrl = '/cfg/low-code-api/' + apiInfo.serverId
  //组装表单数据
  const curFormData = cloneDeep(formRef.value.getFormData())
  //获取主表主键
  const mainTableId=apiInfo.moduleTables.find(item=>item.isMain).id
  const pageDataId=curFormData[mainTableId]["ID_"+mainTableId]
  const flowExData=route.query.flowExData || '{}'
  //组装泛微标签字段
  const fanweiTagData=await getFanWeiTagData()
  //组装流程业务数据
  const flowBusiData={...JSON.parse(flowExData || '{}'),...fanweiTagData}
  //删除未删除文件的附件 以及过滤从业务系统查询到的附件  不保存
  if(curFormData.attachmentList && curFormData.attachmentList.length){
    curFormData.attachmentList=curFormData.attachmentList.filter(item=>item.fileId && !item.isBiz)
  }
  //组装流程数据
  let flowInfo=null
  const flowTitle=getFlowTitle(curFormData)
  if(curFlowNodeInfo.value && curFlowNodeInfo.value.flowId){
    flowInfo = {
      flowId: curFlowNodeInfo.value.flowId,
      pageId: props.pageInfo.id,
      nodeId:curFlowNodeInfo.value?.nodeId,
      flowInstanceId: null,
      flowTitle:flowTitle,
      ...getFanWeiParams(curFormData),
      flowType: 1,
      pageDataId: pageDataId,
      flowKey: props.pageInfo.flowKey,
      ywbm:flowBusiData.ywbm,
      workNo:flowBusiData.workNo || route.query.workNo,
      flowExData:flowBusiData
    }
  }

  const params = {
    serviceId: apiInfo.serverId,
    pageId: apiInfo.pageId,
    pageApiCode: apiInfo.apiCode,
    params: curFormData,
    flowInfo: flowInfo,
    ...btnItem?.actionDefaultParams
  }
  try{
    let res = await request.post({ url: apiUrl, data: params })
    console.log(res)
    if(res){
      if(window.__POWERED_BY_WUJIE__){
        // @ts-ignore
        window.$wujie.bus.$emit("message", "app-platform",
          {
            msgType:'success',
            title:flowTitle+'流程发起成功'
          });
      }else{
        message.success('保存成功')
      }
      msgData && sendParentMessage(msgData.type,fanweiTagData,200,'保存成功')
      tag.closeCurrent()
    }else{
      btnItem.isLoading=false
    }
  }catch (e){
    btnItem.isLoading=false
    formRef.value.runCustomEvent('after-save-fail')
    msgData && sendParentMessage(msgData.type,null,500,'保存失败')
  }
}
/**
 * 获取流程标题，流程标题可能是动态字段拼接
 * @param curFormData
 */
const getFlowTitle=(curFormData)=>{
  const flowTitle =props.flowNodeInfo?.processName
  let newFlowTitle=flowTitle
  if(flowTitle){
    try{
      const fieldArr: any = []
      flowTitle.replace(/\${([^}]+)}/g, (match, p1) => {
        fieldArr.push(p1) // 提取捕获组的内容
      })
      const fieldMap = {}
      const fieldItems=apiInfo.pageListConfigs.filter(formItem=>{
        return fieldArr.includes(formItem.columnName+'_'+formItem.moduleTableId)
      })
      fieldItems.forEach(formItem=>{
        if(formItem.columnDictType){
          fieldMap[formItem.columnName+'_'+formItem.moduleTableId] =
            `getDictLabels('${formItem.columnDictType}',formData['${formItem.moduleTableId}'].${formItem.columnName}_${formItem.moduleTableId} || '')`
        }else{
          // 优先取AsText字段
          const fileIdAsText = curFormData[`${formItem.moduleTableId}`][`${formItem.columnName}_TEXT_${formItem.moduleTableId}`]
          fieldMap[formItem.columnName+'_'+formItem.moduleTableId] = fileIdAsText ? `formData['${formItem.moduleTableId}'].${formItem.columnName}_TEXT_${formItem.moduleTableId}` : 
            `formData['${formItem.moduleTableId}'].${formItem.columnName}_${formItem.moduleTableId} || ''`
        }
        
      })
      console.log(fieldArr,fieldItems,fieldItems)
      //替换变量
      let newScript =flowTitle;
      if(!isEmptyObj(fieldMap)){
        const regex = new RegExp(Object.keys(fieldMap).join('|'), 'g')
        newScript = flowTitle.replace(regex, (match) => fieldMap[match])
      }

      const scriptCode = `
        return \`${newScript}\`
      `
      console.log('scriptCode',scriptCode)
      const func = new Function('formData','getDictLabels', scriptCode) // 将字符串转换为函数
      let result = func(curFormData, getDictLabels)
      // 处理空括号情况
      newFlowTitle =  result.replace(/【\s*】/g, '')
    } catch (e) {
      console.log('执行格式化脚本错误：' + e)
      // 返回失败后的兼容处理标题
      const regex = /【(.+?)】/g
      const fallbackText = newFlowTitle.replace(regex, '');
      return fallbackText
    }
  }
  return newFlowTitle
}
/**
 * 获取泛微流程必须的 紧急程度、备注两个字段
 * 模型配置时，字段必须与前端保持一致！
 * @param curFormData
 */
const getFanWeiParams=(curFormData)=>{
  let requestLevel='0'
  let remark=''
  const mainTableId=apiInfo.moduleTables.find(item=>item.isMain).id
  if(mainTableId && curFormData[mainTableId]){
    Object.keys(curFormData[mainTableId]).forEach(key=>{
      if(key.includes('FW_REQUESTLEVEL') && !key.includes('FW_REQUESTLEVEL_TEXT')){
        requestLevel=curFormData[mainTableId][key]
      }
      if(key.includes('FW_REMARK')){
        remark=curFormData[mainTableId][key]
      }
    })
  }
  return {requestLevel,remark}
}
/**
 * 组装泛微标签的所有数据
 */
const getFanWeiTagData=async ()=>{
  let msgParmas={}
  const formTempData=formRef.value.getFormData()
  //获取标签为【泛微字段】字段
  const fanweiTagColumn=getTagsData(formTempData,apiInfo,['fanwei_field'])
  msgParmas={...msgParmas,...fanweiTagColumn}
  //获取标签为【泛微用户字段】【第一、第二信托经理】字段，因为泛微需要的是usercode，需要根据userId转换为userCode
  const fanweiUserTagColumn=getColumnsByTag(formTempData,apiInfo.pageListConfigs,['fanwei_user_field','fanwei_dyxtjl','fanwei_dextjl'])
  if(fanweiUserTagColumn && !isEmptyObj(fanweiUserTagColumn)){
    const userIds=Object.values(fanweiUserTagColumn).join(',')
    const userListRes=await getUserListByIds(userIds)
    Object.keys(fanweiUserTagColumn).forEach(key=>{
      msgParmas[key]=userListRes.find(item=>item.id==fanweiUserTagColumn[key])?.workNo;
    })
  }
  return msgParmas
}
onMounted(async () => {
  listenerMessage()
})

/**
 * 监听postMessage
 * {
 *   type:'save',
 *   data:{},
 *   id:uuid(),
 *   timestamp:11111
 * }
 */
const pageButtons = ref([])
const listenerMessage = () => {
  window.addEventListener('message', function (event) {
    //console.log(event.data,'window.addEventListene')
    // 检查消息来源是否可信
    // if (event.origin !== 'http://test.com') {
    //   return;
    // }
    if (event.data && event.data.type === 'save') {
      saveForm(null,event.data)
    }
  })
  if(props.pageInfo.pageButtons){
    const formButtons=props.pageInfo.pageButtons.filter(item=>!item.moduleTableId)
    const cancelBtn = formButtons.find(item => item.operationType === 'cancel')
    pageButtons.value = (cancelBtn?[cancelBtn]:[]).concat(formButtons.filter(item => item.operationType !== 'cancel'))
  }
}
/**
 * 发送到父框架的消息
 * @param type
 * @param data
 */
const sendParentMessage = async (type,busiParams, status,message) => {
  window.parent.postMessage(
    {
      type: type,
      data: {
        status:status,
        message:message,
        params:busiParams
      }
    },
    '*'
  )
}
</script>

<style scoped lang="scss">
.fixed-footer {
  position: absolute;
  background: #fff;
  width: calc(100% - 40px);
  height: 50px;
  z-index: 99;
  box-shadow: 0 -5px 5px -5px rgba(0, 0, 0, 0.5);
  text-align: left;
  left: 0;
  bottom: 0px;
  display: flex;
  align-items: center;
  padding: 0 20px;
}
.foot-split {
  height: 80px;
}
.formPage {
  border-bottom: none;

  :deep(.el-collapse-item) {
    background-color: #f5f6f7;
  }
  :deep(.el-collapse-item__header) {
    padding-left: 24px;
    padding-right: 16px;
    position: relative;
    border-bottom: 1px solid #f0f2f5;
    color: #1d2129;
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
    background-color: #FF0000;
  }
  :deep(.el-collapse-item__wrap) {
    padding-left: 24px;
    padding-right: 16px;
  }
  :deep(.el-collapse-item__wrap) {
    padding-top: 24px;
    border-bottom: none;
    padding-bottom: 24px;
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
}
</style>
<style lang="scss">
.microAppContainer .fixed-footer{
  position: fixed;
  background: #fff;
  width: calc(100% - 260px);
  height: 68px;
  z-index: 99;
  box-shadow: 0 -5px 5px -5px rgba(0, 0, 0, 0.5);
  text-align: left;
  left: 219px;
  bottom: 0px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 20px;
}
.microAppContainer .cancel-btn-popconfirm{
  margin-bottom: 76px;
}
.page-version{
  background: #eae9e9;
  position: absolute;
  padding: 2px 10px;
  border-radius: 3px;
  right:10px;
  bottom: 55px;
  z-index: 99;
}
</style>
