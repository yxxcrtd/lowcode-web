<!--
 * @Description: 流程通用附件组件
 * @Author: 胡金戈
 * @Date: 2025-03-06
 * 
-->

<template>
  <!-- 组件主容器 -->
  <div class="attachment-table">
    
    <!-- 表格部分 -->
    <JVxeTable
      ref="tableRef"
      :columns="defaultColumns"
      :data-source="(modelFileList || []).filter(item => !item.isHidden)"
      :max-height="400"
      :table-page-config="tablePageConfig"
      :show-check-box="enableMultiple"
      :check-box-config="{trigger: 'row'}"
      :row-config="{isHover: true,height:48}"
      :isShowRightButton="false"
      @checkbox-change="handleCheckboxChange"
      @checkbox-all="handleCheckboxAll"
    >
      <template #fileType_default="{ row }">
        <span class="requird-span" v-if="row.isRequire">*</span>
        {{row.fileTypeText || row.fileType}}
      </template>
      <template #uploadDate_default="{ row }">
        {{ formatDate(row.uploadDate) }}
      </template>
      <template #action_default="{ row,rowIndex }">
        <div class="table-action">
          <template v-if="row.fileId">
            <el-link v-if="isShowUploadBtn(row)" type="primary" @click="openUploadDialog(row,rowIndex)">上传</el-link>
            <el-divider v-if="isShowUploadBtn(row)" direction="vertical"/>
            <el-link type="primary" v-if="row.uploadTemplateFileId" @click="handleDownloadTemplate(row)">下载模板</el-link>
            <el-divider v-if="row.uploadTemplateFileId" direction="vertical"/>
            <el-link type="primary" @click="toPreview(row)">预览</el-link>
            <el-divider direction="vertical"/>
            <el-link type="primary" @click="handleDownload(row,rowIndex)">下载</el-link>
            
            <template v-if="isShowDelAction(row)">
              <el-divider direction="vertical"/>
              <el-popconfirm
                width="200"
                placement="top"
                title="确定删除该条记录?"
                @confirm.stop="handleDelete(row,rowIndex)"
              >
                <template #reference>
                  <el-link type="primary">删除</el-link>
                </template>
              </el-popconfirm>
            </template>
          </template>
          <template v-else>
            <el-link v-if="!isDetail" type="primary" @click="openUploadDialog(row,rowIndex)">上传</el-link>
            <el-divider v-if="row.uploadTemplateFileId" direction="vertical"/>
            <el-link type="primary" v-if="row.uploadTemplateFileId" @click="handleDownloadTemplate(row)">下载模板</el-link>
          </template>
        </div>
      </template>
    </JVxeTable>
    <!-- 底部操作区 -->
    <div class="attachment-footer">
      <!-- 左侧上传按钮 -->
      <div class="left-actions" v-if="!isDetail && !attachmentInfo.isNotAllowUpload">
        <el-button type="primary" @click="openUploadDialog">
          <el-icon><Upload /></el-icon>
          上传
        </el-button>
      </div>

      <!-- 右侧批量操作区 -->
      <div class="right-actions" v-if="false">
        <el-button
          :disabled="!selectedRows.length"
          @click="handleBatchDownload"
        >
          <el-icon><Download /></el-icon>
          批量下载
        </el-button>
        <el-button
          v-if="!isDetail"
          type="danger"
          :disabled="!selectedRows.length"
          @click="handleBatchDelete"
        >
          <el-icon><Delete /></el-icon>
          批量删除
        </el-button>
      </div>
    </div>
    <!-- 上传对话框 -->
    <el-dialog
      v-model="uploadDialogVisible"
      title="上传附件"
      width="500px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      @close="uploadDialogVisible=false"
      destroy-on-close
    >
      <el-form ref="uploadFormRef" :model="uploadForm" :rules="rules">
        <el-form-item label="附件类型" label-width="auto" prop="fileType">
          <SelectAttachmentType :filterFileType="attachmentInfo.filterFileType" :dirType="attachmentInfo.dirType" v-model="uploadForm.fileType" v-model:model-text="uploadForm.fileTypeText" :disabled="uploadForm.rowIndex!=null" class="mb-10px"/>
        </el-form-item>
        <el-form-item label-width="0" prop="fileList">
          <UploadFile
            ref="uploadFileRef"
            style="width: 100%"
            v-model="uploadForm.fileList"
            v-bind="uploadConfig"
            :uploadParams="uploadParams"
            :upload-mode="attachmentInfo.uploadMode"
            @update:model-value="handleUploadSuccess"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="uploadDialogVisible = false">取消</el-button>
        <el-button type="primary" :disabled="uploadFileRef?.uploadLoading" @click="confirmUpload">确定</el-button>
      </template>
    </el-dialog>

    <FilePreview ref="filePreviewRef"></FilePreview>
  </div>
</template>

<script setup lang="jsx">
import { ref, computed, onBeforeUnmount } from 'vue'
import { Download, Upload, Delete } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import UploadFile from '@/components/UploadFile/src/UploadFile.vue'
import FilePreview from '@/components/FilePreview/src/index.vue'
import {useUserStore} from "@/store/modules/user";
import * as FileApi from '@/api/infra/file'
import dayjs from "dayjs";
import SelectAttachmentType from "@/components-yt/biz/SelectAttachmentType/index.vue";
import { config } from '@/config/axios/config'
import {useSysConfigStore} from "@/store/modules/sysConfig";
import { template } from 'lodash-es'
import request from '@/config/axios'
import { formatDate } from '@/utils/formatTime'
// ================ Props 定义 ================
const props = defineProps({
  // 静态数据源
  modelValue: { 
    type: Array,
    default: () => []
  },
  //是否详情界面
  isDetail:{
    type:Boolean,
    default:false,
  },
  // 是否启用多选
  enableMultiple: {
    type: Boolean,
    default: false
  },
  pageId:{
    type:[String,Number]
  },
  flowNodeInfo:{
    type:Object
  },
  attachmentInfo: {
    type: Object,
    default: () => ({
      uploadMode: 'immediate',
      showPreview: true,
      showDownload: true,
      showDelete: true,
      isNotAllowUpload:false
    })
  }
})
const uploadParams = computed(() => {
  return {
    natrualKeyId:'',
    projId:'',
    folderId:'1',
    dirCode:uploadForm.value.fileType,
    fileType:uploadForm.value.fileType,
    fileSource:'',
    index:1,
    uploadNode:props.flowNodeInfo?.name
  }
})
const modelFileList = computed({
  get: () => {
    console.log(props.modelValue)
    return props.modelValue
  },
  set: (val) => {
    emit('update:modelValue', val)
  }
})

// ================ Emits 定义 ================
const emit = defineEmits([
  'update:modelValue',
  'download',
  'delete',
  'batch-download',
  'batch-delete',
  'refresh'
])

// ================ 组件状态 ================
const tableRef = ref(null)
const selectedRows = ref([])
const uploadDialogVisible = ref(false)
const userStore=useUserStore()
const route=useRoute()

const uploadFormRef=ref()
const uploadForm=ref({
  rowIndex:null,
  isRequire:false,
  oriAttachmentId:null,
  fileType:null,
  fileTypeText:null,
  fileList:null,
  template:null
})
const rules = reactive({
  fileType: [{ required: true, message: '请选择附件类型', trigger: 'change' }],
  fileList: [{ required: true, message: '请选择文件上传', trigger: 'change' }],
})

const curUploadRow = ref(null)

// ================ 表格配置 ================
// 默认列配置
const defaultColumns = [
  { type: 'checkbox', width: 50, fixed: true},
  { type: 'seq', title: '序号', width: 60 },
  { title: '附件类型', field: 'fileType', minWidth: 200,slots: {default:'fileType_default'} },
  { title: '附件名称', field: 'fileName', minWidth: 300 },
  { title: '上传节点', field: 'flowNodeText', minWidth: 100 },
  { title: '上传人', field: 'uploadUserText', minWidth: 100 },
  { title: '上传时间', field: 'uploadDate', minWidth: 200,slots: {default:'uploadDate_default'}},
  {
    title: '操作',
    field: 'action',
    width: 250,
    slots: {
      default: 'action_default',
    }
  }
]
const tablePageConfig={
  enabled: true,
  currentPage: 1,
  pageSize: 10,
  total: 0,
  pageSizes: [10, 20, 50, 100],
}
// 复选框配置
const checkBoxConfig = computed(() => ({
  trigger: 'row'
}))
console.log(props.flowNodeInfo,'props.flowNodeInfo----------');


const uploadConfig=computed(()=>{
  let fileAllowSuffix = []
  if(curUploadRow.value && curUploadRow.value.fileAllowSuffix) {
    fileAllowSuffix = curUploadRow.value.fileAllowSuffix.split(',')
  }
  return {
    fileSize:props.attachmentInfo.maxSize || 5,
    fileType:(fileAllowSuffix.length && fileAllowSuffix) || props.attachmentInfo.allowFileSuffix || ['pdf','xls','xlsx'],
  }
})

const isShowUploadBtn=(row)=>{
  if(props.isDetail){
    return false
  }
  if(props.attachmentInfo.isNotAllowUpload){
    return false
  }
  if(row.flowNodeId!=route.query.nodeId){
    return false
  }
  return true
}

const isShowDelAction=(row)=>{
  if(props.isDetail){
    return false
  }
  // 业务系统上传的附件没有流程节点导致退回不能删除
  // 4099 资产入池首节点 2140 论证 2430 快速 1548 动产融资质押 1565 动产融资转让
  if(!row.flowNodeId && ['4099','2140','2430','1548','1565'].includes(props.flowNodeInfo?.nodeId)){
    return true
  }
  if(!route.query.nodeId){
    return true
  }
  if(props.flowNodeInfo && row.flowNodeId!=route.query.nodeId){
    return false
  }
  return true
}

// ================ 事件处理方法 ================
const uploadFileRef = ref()
// 处理下载
const handleDownload = (row) => {
  downloadByUrl({
    fileId: row.fileId,
    target: '_blank',
    fileName: row.fileName
  })
}
//处理下载模板
const handleDownloadTemplate = (row) => {
  downloadByUrl({
    fileId: row.uploadTemplateFileId,
    target: '_blank',
    fileName: row.uploadTemplateFileName
  })
}
const downloadByUrl = async ({fileId, target = '_blank', fileName})=> {
  try {
    FileApi.downloadFileBusiness( fileId )
      .then((res) => {
        if (!res) {
          console.log(res?.message || '下载失败！')
          return
        }
        const dom = document.createElement('a')
        dom.href = new URL(config.business_url).origin + res.result
        dom.download = decodeURIComponent(fileName)
        dom.style.display = 'none'
        document.body.appendChild(dom)
        dom.click()
        dom.parentNode.removeChild(dom)
      })
      .catch((res) => {
        console.log(res);
      })

  }catch(e){
    console.log(e)
  }
}
// 处理删除
const handleDelete = async (row,rowIndex) => {
  if(row.fileId){
    await request.post({ url: `/ibps/system/fileManage/commonFileDel?fileId=${row.fileId}`})
  }
  if(row.oriAttachmentId){
    row.pageId=null
    row.fileName=null
    row.fileUrl=null
    row.fileId=null
    row.flowNodeId=null
    row.fileSize=null
    row.uploadUserId=null
    row.uploadUserText=null
    row.uploadDate=null
  }else{
    modelFileList.value.splice(rowIndex,1)
  }
}

// 处理批量下载
const handleBatchDownload = async () => {
  // emit('batch-download', selectedRows.value)
}

// 处理批量删除
const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(
      `确认要删除选中的 ${selectedRows.value.length} 个文件吗？`, 
      '提示',
      { type: 'warning' }
    )

    // 获取要删除的文件的 ID 列表
    const deleteIds = selectedRows.value.map(row => row[props.rowKey])
    
    // 从现有数据中过滤掉要删除的文件
    const updatedFileList = (Array.isArray(props.modelValue) ? props.modelValue : [])
      .filter(file => !deleteIds.includes(file[props.rowKey]))

    // 更新父组件数据
    emit('update:modelValue', updatedFileList)
    
    // 清空选中行
    selectedRows.value = []
    
    // 通知父组件删除事件（如果需要）
    await emit('batch-delete', selectedRows.value)
    
    ElMessage.success('批量删除成功')
    refresh(true)
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('批量删除失败：' + error.message)
    }
  }
}

// 处理选择变更
const handleCheckboxChange = ({ records }) => {
  selectedRows.value = records
}

// 处理全选/取消全选
const handleCheckboxAll = ({ records }) => {
  selectedRows.value = records
}

// ================ 上传相关方法 ================
// 打开上传对话框
const openUploadDialog = (row,rowIndex) => {
  uploadForm.value={
    rowIndex:row?rowIndex:null,
    isRequire:row?.isRequire,
    oriAttachmentId:row?.oriAttachmentId,
    fileType:row?.fileType,
    fileTypeText:row?.fileTypeText,
    fileList:null,
    template: row.uploadTemplateFileId && row.uploadTemplateFileName ? {
      uploadTemplateFileId: row.uploadTemplateFileId,
      uploadTemplateFileName: row.uploadTemplateFileName
    }: null
  }
  if(row) {
    curUploadRow.value = row
  } else {
    curUploadRow.value = null
  }
  uploadDialogVisible.value = true
}

// 处理上传成功
const handleUploadSuccess = (files) => {
  uploadForm.value.fileList = files
  console.log('files',files)
  uploadFormRef.value.validateField('fileList')
}
//用户信息
let businessUserInfo=userStore.getBusinessUser || {}
// 确认上传
const confirmUpload = async () => {
  await uploadFormRef.value.validate()
  console.log(businessUserInfo,'businessUserInfo---');
  if(!(businessUserInfo && businessUserInfo.userName) || businessUserInfo.userName !== route.query.userName){
    console.log(businessUserInfo,'businessUserInfo+++');
    route.query.userName && await userStore.autoLoginByUserName(route.query.userName)
    businessUserInfo=userStore.getBusinessUser || {}
  }
  console.log(businessUserInfo,'businessUserInfo---');
  try {
    // 根据上传模式处理文件数据
    const newFiles = uploadForm.value.fileList.map(file => {
      return {
        fileType:uploadForm.value.fileType,
        isRequire:uploadForm.value.isRequire,
        fileTypeText:uploadForm.value.fileTypeText,
        oriAttachmentId:uploadForm.value.oriAttachmentId,
        pageId:props.pageId,
        fileName: file.name,
        fileUrl: file.url,
        fileId:file.fileId,
        fileSize:file.size,
        flowNodeId:props.flowNodeInfo?.nodeId,
        flowNodeText:props.flowNodeInfo?.name,
        uploadUserId:businessUserInfo.userName || businessUserInfo.userCode,
        uploadUserText:businessUserInfo.realName,
        uploadDate:dayjs().format('YYYY-MM-DD HH:mm:ss'),
        uploadTemplateFileId: uploadForm.value.template ? uploadForm.value.template.uploadTemplateFileId : null,
        uploadTemplateFileName: uploadForm.value.template ? uploadForm.value.template.uploadTemplateFileName : null
      }
    })

    // 合并现有文件和新上传的文件
    let updatedFileList=props.modelValue || []
    if(uploadForm.value.rowIndex!==null && uploadForm.value.rowIndex!==undefined){
      const arr = updatedFileList.filter(item => !item.isHidden)
      arr.splice(uploadForm.value.rowIndex,1,...newFiles)
      updatedFileList = updatedFileList.filter(item => item.isHidden).concat(arr)
    }else{
      updatedFileList=[...updatedFileList,...newFiles]
    }
    // 更新父组件数据
    emit('update:modelValue', updatedFileList)
    
    // 清空上传组件的文件列表
    uploadForm.value.fileList.value = []
    uploadForm.value.rowIndex=null
    uploadForm.value.isRequire=false
    uploadForm.value.oriAttachmentId=null
    uploadForm.value.template=null
    uploadDialogVisible.value = false

    // 刷新表格数据
    refresh(true)
  } catch (error) {
    console.log(error)
    ElMessage.error('保存失败：' + error.message)
  }
}

// 预览
const filePreviewRef=ref()
const toPreview = async (fileItem)=>{
  if(fileItem.fileId){
    const res = await request.get({ url:`ibps/system/fileManage/getPcBrowseUrl?fileId=${fileItem.fileId}`})
    if(res){
        window.open(res)
    }
  }else{
      this.$proMessage.warning('请先上传附件')
  }
  // const previewContent = props.attachmentInfo.uploadMode === 'manual' ? fileItem.raw : fileItem.fileId
  // filePreviewRef.value.open(fileItem.fileName, previewContent)
}

// ================ 公共方法 ================
/**
 * 刷新表格数据
 * @param {boolean} [bool=false] - true: 重置到第一页刷新, false: 当前页刷新
 */
 const refresh = (bool = false) => {
  tableRef.value?.refresh(bool)
}

/**
 * 表格滑动到第几行用于校验文件必填
 */
const scrollTop = (index) => {
  tableRef.value.scrollToRow(index)
}

// ================ 生命周期钩子 ================
onBeforeUnmount(() => {
  selectedRows.value = []
  uploadForm.value.fileList = []
})

// ================ 暴露方法 ================
defineExpose({
  refresh,
  loadData: () => tableRef.value?.loadData(),
  getSelectedRows: () => selectedRows.value,
  clearSelection: () => {
    selectedRows.value = []
    tableRef.value?.clearCheckboxRow()
  },
  scrollTop
})
</script>

<style lang="scss" scoped>
// ================ 组件样式 ================
.attachment-table {
  display: flex;
  flex-direction: column;

  // 深度选择器样式
  :deep() {
    // 表格行样式
    .vxe-body--row {
      height: 48px !important;
    }

    // 操作按钮布局
    .table-actions {
      display: flex;
      gap: 8px;
      align-items: center;
      height: 100%;
    }

    // 文件名称列样式
    .vxe-cell {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    // 对话框样式
    .el-dialog__body {
      padding: 20px;
    }
  }
}

// 底部操作区样式
.attachment-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;

  .left-actions,
  .right-actions {
    display: flex;
    gap: 8px;
  }
}
</style>
