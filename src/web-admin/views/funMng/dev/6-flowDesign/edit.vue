<template>
  <el-dialog title="模型配置" v-model="dialogVisible" fullscreen class="fullscreen-dialog">
    <template #title>
      <div class="dialog-title">
        <div>{{ titleName }}</div>
        <div class="menu-tabs">
          <el-tabs v-model="activeName">
            <el-tab-pane label="流程设置" name="base"> </el-tab-pane>
            <el-tab-pane label="流程设计" name="process"> </el-tab-pane>
          </el-tabs>
        </div>
        <div>
          <el-button :disabled="formLoading" type="primary" @click="submitForm">保 存</el-button>
        </div>
      </div>
    </template>

    <div class="page-container" v-loading="loading">
      <template v-if="isLoad">
        <ModelIndex
          v-show="activeName === 'base'"
          ref="modelIndexRef"
          v-model="formData"
          @close-click="closeDialog()"
          @page-change="loadPageInfo"
        ></ModelIndex>
        <FlowDesign
          v-show="activeName === 'process'"
          ref="modelViewRef"
          v-model="formData"
          :process="formData.process"
          :fields="fields"
          :readOnly="readOnly"
        >
          <!--          <el-switch-->
          <!--            v-model="readOnly"-->
          <!--            active-text="只读模式"-->
          <!--            inactive-text="编辑模式"-->
          <!--            inline-prompt-->
          <!--            :active-value="true"-->
          <!--            :inactive-value="false"-->
          <!--          />-->
        </FlowDesign>
      </template>
    </div>
  </el-dialog>
</template>
<script lang="ts" setup>
import { ref } from 'vue'
import ModelIndex from './Components/ModelIndex.vue'
import { defineEmits } from 'vue'
import FlowDesign from './design/index.vue'
import { EndNode, FlowNode, StartNode } from './design/nodes/type'
import * as api from './Components/api'
import { uuid } from './data'
import { getPageInfo } from '@/web-admin/views/funMng/dev/4-pageDesign/api'
import {cloneDeep} from "lodash-es";
defineOptions({ name: 'EditDialog' })
const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调

const route = useRoute()
const message = useMessage() // 消息弹窗
const dialogVisible = ref(false)
const activeName = ref('base')
const isLoad = ref(true)
const titleName = ref()
const menuId = route.query.id

//时间戳，本次编辑时的更新时间 
const updateTimeStamp=ref(null)

const formLoading = ref(false)
const modelIndexRef = ref()
const defaultProcess = ref<FlowNode>({
  id: uuid(10, 20),
  pid: undefined,
  type: 'start',
  name: '发起人',
  executionListeners: [],
  formProperties: [],
  child: {
    id: uuid(10, 20),
    pid: 'root',
    type: 'end',
    name: '流程结束',
    executionListeners: []
  } as EndNode
} as StartNode)
const formData = ref({
  id: undefined,
  processName: '',
  pageId: undefined,
  remark: null,
  processType: '',
  flowId:null,
  formModelId:null,
  menuId: menuId
})
/** 打开弹窗 */
const open = async (type: string, id) => {
  dialogVisible.value = true
  isLoad.value = false
  loading.value=true
  initDefaultProcess()
  await nextTick()
  formData.value = {
    id: undefined,
    processName: '',
    pageId: undefined,
    remark: null,
    processType: '',
    flowId:null,
    menuId: menuId,
    process: defaultProcess
  }
  await nextTick()
  if (type === 'creat') {
    titleName.value = '新增流程设置'
  } else {
    titleName.value = '修改流程设置'
    const res = await api.getProcessDesign(id)
    formData.value = res
    updateTimeStamp.value=res.updateTime
    await loadPageInfo(res.pageId)
  }
  activeName.value = 'base'
  isLoad.value = true
  loading.value=false
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

const initDefaultProcess=()=>{
  defaultProcess.value={
    id: uuid(10, 20),
    pid: undefined,
    type: 'start',
    name: '发起人',
    executionListeners: [],
    formProperties: [],
    child: {
      id: uuid(10, 20),
      pid: 'root',
      type: 'end',
      name: '流程结束',
      executionListeners: []
    } as EndNode
  }
}
const closeDialog = () => {
  dialogVisible.value = false
}
const loading = ref(false)
const submitForm = async () => {
  let res: any = null
  loading.value = true
  try {
    if (formData.value.id) {
      const params={
        ...formData.value,
        updateTimeStamp:updateTimeStamp.value,
      }
      res = await api.updateProcessDesign(params)
    } else {
      res = await api.addProcessDesign(formData.value)
    }
    if (res) {
      message.success('保存成功')
      emit('success')
      closeDialog()
    }
  } catch (e) {
    console.log(e)
  } finally {
    loading.value = false
  }
}

const fields = ref<Field[]>([])
const formModelId=ref(null)
const loadPageInfo = async (pageId) => {
  const res = await getPageInfo(pageId)
  fields.value=[]
  formData.value.formModelId=res.pageApiRespVOS[0].moduleId
  res.pageApiRespVOS[0].pageGroups.forEach(item=>{
    
  })
  res.pageApiRespVOS[0].pageListConfigs.forEach((item) => {
    const groupItem=res.pageApiRespVOS[0].pageGroups.find(groupItem=>groupItem.groupCode==item.groupCode)
    fields.value.push({
      id: item.fieldId,
      type: 'formItem',
      label: item.columnComment,
      name: item.columnDisplayComponent,
      groupCode:item.groupCode,
      groupName:groupItem?.groupName,
      value: null,
      readonly:!!item.isDisabled,
      hidden:!!item.isHidden,
      required:!!item.isRequire,
      props: {
        dict: item.columnDictType,
        multiple: true,
        ...item.columnComponentAttributeDO,
        placeholder: '请输入' + item.columnComment,
        style: {
          width: '100%'
        }
      }
    })
  })
}
// 是否只读
const readOnly = ref(false)
</script>
<style lang="scss" scoped>
.dialog-title {
  height: 32px;
  display: flex;
  justify-content: space-between;
  padding: 0 45px 0px 0px;
}
:deep(.el-dialog__headerbtn) {
  top: 10px;
  font-size: 26px;
}
/*:deep(.el-dialog__body){
  background-color: #8a909c;
}
.el-dialog__body{
  background-color: #8a909c;
}*/
.page-container {
  width: calc(100% - 30px);
  height: calc(100% - 30px);
  background-color: #f2f3f5;
}
:deep(.el-segmented) {
  width: 100%;
}
</style>
