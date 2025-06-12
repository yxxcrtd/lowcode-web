<!--
 * @Description: 附件按钮组件
 * @Author: miffy
 * @Date: 2025-05-14
 *
 * 功能：
 * 1. 提供详情和上传两个按钮
 * 2. 详情按钮打开抽屉显示附件列表
 * 3. 附件详情抽屉，支持预览和下载功能
 * 4. 支持上传附件功能
 * 5. 支持批量下载附件
-->

<template>
  <div class="attachment-button-wrapper">
    <!-- 仅保留两个按钮 -->
    <div class="operation-buttons">
      <el-button 
        link 
        type="primary" 
        @click="showAttachmentDrawer"
      >
        详情
      </el-button>
      <el-button 
        v-if="!isHiddenUploadBtn" 
        link 
        type="primary" 
        @click="showUploadDialog"
      >
        上传
      </el-button>
    </div>
  
    <!-- 附件详情抽屉 -->
    <el-drawer
      v-model="drawerVisible"
      :title="drawerTitleText"
      size="80%"
      :destroy-on-close="true"
      :before-close="handleDrawerClose"
    >
      <div class="attachment-drawer-content">
        <!-- 附件表格（包裹在折叠面板中） -->
        <el-collapse v-model="drawerActiveCollapse">
          <el-collapse-item name="attachment-files">
            <template #title>
              <div class="collapse-title">
                <div class="collapse-title-text">附件信息</div>
                <div v-if="attachmentFiles.length > 0" class="collapse-title-count">
                  (共 {{ attachmentFiles.length }} 项)
                </div>
              </div>
            </template>
    
            <!-- 使用JVxeTable替换el-table -->
            <JVxeTable
              ref="attachmentFileTable"
              :max-height="400"
              :columns="processedColumns"
              :data-source="attachmentFiles"
              show-check-box
              :check-box-config="checkBoxConfig"
              :tablePageConfig="{enabled:false}"
              :rowHeight="48"
              :row-config="{ isHover: true, height: 48 }"
              v-loading="fileLoading"
              @checkbox-change="handleSelectionChange"
              @checkbox-all="handleAllSelectionChange"
            >
              <template #typeSlot="{ row }">
                <span>{{ row.fileTypeText || '-' }}</span>
              </template>
              <template #nameSlot="{ row }">
                <span>{{ row.fileName || '-' }}</span>
              </template>
              <template #isPublicSlot="{ row }">
                <span>{{ row.isPublic === 'true' ? '是' : '否' }}</span>
              </template>
              <template #fileTitleSlot="{ row }">
                <span>{{ row.fileTitle || '-' }}</span>
              </template>
              <template #operation="{ row }">
                <div class="table-actions">
                  <el-button link type="primary" @click="previewFile(row)">预览</el-button>
                  <el-button link type="primary" @click="downloadFile(row)">下载</el-button>
                </div>
              </template>
            </JVxeTable>

            <!-- 表格底部的批量下载按钮 -->
            <div class="table-footer" v-if="attachmentFiles.length > 0">
              <div class="selection-info">
                <div v-if="selectedFiles.length > 0">已选择 {{ selectedFiles.length }} 项</div>
              </div>
              <el-button 
                type="primary"
                size="small" 
                :disabled="selectedFiles.length === 0 || downloadLoading" 
                @click="handleBatchDownload"
              >
                <el-icon><Download /></el-icon>
                下载({{ selectedFiles.length }})
              </el-button>
            </div>
          </el-collapse-item>
        </el-collapse>
      </div>
    </el-drawer>
  
    <!-- 上传弹窗 -->
    <el-dialog
      v-model="uploadDialogVisible"
      title="上传附件"
      width="500px"
      :destroy-on-close="true"
      :close-on-click-modal="false"
      class="attachment-dialog-content"
    >
      <!-- 表单区域 -->
      <el-form 
        ref="uploadFormRef" 
        :model="uploadFormData" 
        :rules="formRules" 
        label-width="120px"
        class="upload-form"
      >
        <el-col :span="24">
          <el-form-item label="附件类型" prop="fileType">
            <SelectAttachmentType v-model="uploadFormData.fileType" v-model:model-text="uploadFormData.fileTypeText"/>
          </el-form-item>
          <el-form-item label="是否对外披露" prop="isPublic">
            <ace-radio v-model="uploadFormData.isPublic" placeholder="请选择" dict="infra_boolean_string"></ace-radio>
          </el-form-item>
          <el-form-item label="文件标题" prop="fileTitle" v-if="uploadFormData.isPublic == 'true'">
            <ace-input v-model="uploadFormData.fileTitle" placeholder="请输入文件标题"></ace-input>
          </el-form-item>
        </el-col>
      </el-form>

      <!-- 上传组件 -->
      <UploadFile
        ref="uploadRef"
        v-model="uploadFiles"
        :limit="1"
        :file-size="10"
        :file-type="['pdf','doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'jpeg', 'png', 'gif']"
        :upload-params="uploadFormData"
        :disabled="disabledUpload"
        @update:model-value="handleUploadSuccess"
      />
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="uploadDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmUpload">确定</el-button>
        </span>
      </template>
    </el-dialog>
  
    <!-- 文件预览组件 -->
    <FilePreview ref="filePreviewRef"></FilePreview>
  </div>
</template>

<script setup lang="ts">
import {ref, computed, nextTick, onMounted, watch, inject} from 'vue'
import { downloadByUrl } from '@/utils/filt'
import { cloneDeep } from "lodash-es"
import {uploadAttachment} from './api'
import request from '@/config/axios'
import { useUserStore } from "@/store/modules/user"

import { Download } from '@element-plus/icons-vue'
import { UploadFile } from '@/components/UploadFile'
import FilePreview from '@/components/FilePreview/src/index.vue'
import SelectAttachmentType from "@/components-yt/biz/SelectAttachmentType/index.vue"
import { ElMessage } from 'element-plus'
import {replaceScriptField} from "@/comRender/utils";


// 定义组件名称
defineOptions({ name: 'AttachmentButton' })

// 定义Props类型
interface AttachmentFile {
  fileId?: string
  name: string
  url?: string
  type?: string
  size?: number
  isPublic?: boolean | string
  fileTitle?: string
  [key: string]: any
}

const pageInfo:any = inject('pageInfo')
// Props定义
const props = defineProps({
  // 文件ID字段 (逗号分隔的ID字符串)
  modelValue:{
    type:String
  },
  // 上传按钮是否隐藏
  isHiddenUploadBtn: {
    type: Boolean,
    default: false
  },
  bizRequestUrl:{
    type:String
  },
  bizReuqestParams:{
    type:Object
  },
  formData:{
    type:Object
  },
  pageListConfigs:{
    type:Array
  },
  // 请求URL
  requestUrl: {
    type: String,
    default:'/cfg/file-info/getFileList'
  },
  // 抽屉标题
  drawerTitle: {
    type: String,
    default: '附件详情'
  }
})

// Emits定义
const emit = defineEmits([
  'update:modelValue',
  'upload-success',
  'download',
  'batch-download',
  'preview',
  'update:modelValue'
])
// Refs
const filePreviewRef = ref<any>(null)
const uploadRef = ref<any>(null)
const attachmentFileTable = ref<any>(null)
const uploadFormRef = ref<any>(null)

// 响应式状态
const drawerActiveCollapse = ref(['attachment-files']) // 抽屉内折叠面板的状态
const drawerVisible = ref(false)
const drawerTitleText = ref(props.drawerTitle)
const attachmentFiles = ref<AttachmentFile[]>([])
const selectedFiles = ref<AttachmentFile[]>([])
const fileLoading = ref(false)
const downloadLoading = ref(false) // 下载按钮状态控制
const uploadDialogVisible = ref(false)
const uploadFiles = ref<any>(null)
const tableData = ref<any[]>([])

// 监听附件文件变化，重置选中状态
watch(attachmentFiles, () => {
  selectedFiles.value = []
  if (attachmentFileTable.value) {
    nextTick(() => {
      // 确保表格已渲染
      if (attachmentFileTable.value.clearCheckboxRow) {
        attachmentFileTable.value.clearCheckboxRow()
      }
    })
  }
}, { deep: true })

// JVxeTable列配置 - 抽屉表格
const drawerTableColumns = [
  { type: 'seq', title: '序号', width: 60 },
  { 
    title: '附件类型', 
    field: 'fileType', 
    minWidth: 100,
    slots: { default: 'typeSlot' }
  },
  { 
    title: '附件名称', 
    field: 'fileName', 
    minWidth: 200,
    slots: { default: 'nameSlot' }
  },
  { 
    title: '是否对外披露', 
    field: 'isPublic', 
    minWidth: 100,
    slots: { default: 'isPublicSlot' }
  },
  { 
    title: '文件标题', 
    field: 'fileTitle', 
    minWidth: 200,
    slots: { default: 'fileTitleSlot' }
  },
  { 
    title: '操作', 
    field: 'operation', 
    width: 150,
    fixed: 'right',
    slots: { default: 'operation' }
  }
]

// 计算最终的列配置
const processedColumns = computed(() => {
  const columns = [...drawerTableColumns]
  
  columns.unshift({
    type: 'checkbox',
    width: 50,
    fixed: true
  })
  
  return columns
})

// 表单数据与校验规则
const uploadFormData = ref({
  fileType: '',
  isPublic: '',
  fileTitle: '',
  fileTypeText: ''
})

// 复选框配置
const checkBoxConfig = computed(() => ({
  trigger: 'row'
}))

// 上传组件禁用逻辑
const disabledUpload = computed(() => {
  const { fileType, isPublic, fileTitle } = uploadFormData.value
  if(fileType && isPublic) {
    if(isPublic == 'true' && !fileTitle) {
      return true
    }
    return false
  } else {
    return true
  }
})

// 表单校验规则
const formRules = {
  fileType: [
    { required: true, message: '请选择附件类型', trigger: ['blur', 'change'] }
  ],
  isPublic: [
    { required: true, message: '请选择是否对外披露', trigger: 'change' }
  ],
  fileTitle: [
    { required: true, message: '请输入文件标题', trigger: ['blur', 'change'] }
  ]
}

// 方法定义
async function showAttachmentDrawer() {
  console.log('显示附件抽屉，fieldid:', props.modelValue)
  drawerTitleText.value = props.drawerTitle
  fileLoading.value = true
  drawerVisible.value = true
  
  try {
    // 根据fieldid从接口获取附件列表
    const response = await getInfoTableData(props.modelValue)

    if (response && Array.isArray(response)) {
      attachmentFiles.value = response
      
      // 确保表格渲染完成后可以显示复选框
      nextTick(() => {
        if (attachmentFileTable.value) {
          console.log('Table ref exists, data length:', attachmentFiles.value.length)
        }
      })
    } else {
      attachmentFiles.value = []
    }
  } catch (error) {
    console.error('获取附件列表失败:', error)
    ElMessage.error('获取附件列表失败')
    attachmentFiles.value = []
  } finally {
    fileLoading.value = false
  }
}

function handleDrawerClose() {
  drawerVisible.value = false
  attachmentFiles.value = []
  selectedFiles.value = []
}

// 处理JVxeTable选择变更
function handleSelectionChange({ records }) {
  selectedFiles.value = records
  console.log('选中的文件数量:', records.length)
}

// 处理JVxeTable全选/取消全选
function handleAllSelectionChange({ records }) {
  selectedFiles.value = records
  console.log('全选/取消全选，选中的文件数量:', records.length)
}

async function previewFile(file) {
  if(file.fileId){
    const res = await request.get({ url:`ibps/system/fileManage/getPcBrowseUrl?fileId=${file.fileId}`})
    if(res){
      window.open(res)
    }
  }
}

// 获取详情表格数据
async function getInfoTableData(fileIds) {
  //查询业务系统接口的附件
  let fileList:any=[]
  if(props.bizRequestUrl){
    let params:any={}
    if(props.bizReuqestParams){
      params= replaceScriptField(props.bizReuqestParams,props.pageListConfigs,props.formData);
    }
    const res = await request.post({ url: props.bizRequestUrl, params })
    fileList.push(...res?.records || [])
  }
  if(props.requestUrl && fileIds){
    const params = {
      fileIds: fileIds
    }
    const res = await request.get({ url: props.requestUrl, params })
    fileList.push(...res || [])
  }
  return fileList
}

function downloadFile(file) {
  // 实现下载逻辑
  downloadByUrl({
    fileId: file.fileId,
    target: '_blank',
    fileName: file.fileName
  })
}

function handleBatchDownload() {
  if (selectedFiles.value.length === 0) {
    // 如果没有选择文件，提示用户先选择
    ElMessage.warning('请先选择要下载的文件')
    return
  }
  
  // 设置下载中状态
  downloadLoading.value = true
  
  // 实现批量下载逻辑
  selectedFiles.value.forEach(element => {
    downloadByUrl({
      fileId: element.fileId,
      target: '_blank',
      fileName: element.fileName
    })
  })
}

// 打开上传对话框
function showUploadDialog() {
  // 重置表单和上传文件
  uploadFormData.value = {
    fileType: '',
    isPublic: '',
    fileTitle: '',
    fileTypeText: ''
  }
  uploadFiles.value = null
  tableData.value = []
  uploadDialogVisible.value = true
}

// 处理上传成功
function handleUploadSuccess(files) {
  if (!files) return
  
  const newFiles = Array.isArray(files) ? files : [files]
  
  // 处理上传的文件，添加到表格中
  newFiles.forEach(file => {
    // 添加表单信息到文件对象中
    const enrichedFile = {
      ...file,
      fileType: uploadFormData.value.fileType,
      fileTypeText: uploadFormData.value.fileTypeText,
      isPublic: uploadFormData.value.isPublic,
      fileTitle: uploadFormData.value.isPublic === 'true' ? uploadFormData.value.fileTitle : ''
    }
    
    // 添加到表格数据中
    tableData.value.push(enrichedFile)
  })
}

const userStore = useUserStore()
const loginForm = userStore.getUser || {}
const route = useRoute()

// 新增文件信息到文件详情
function createFileInfoToSystem(file) {
  const params = {
    pageId:pageInfo.id,
    fileType: file.fileType,
    fileTypeText: file.fileTypeText,
    fileName: file.name,
    fileUrl: file.url,
    fileId: file.fileId,
    fileSize: file.fileSize,
    isPublic: file.isPublic,
    fileTitle: file.fileTitle,
    flowNodeId: route.query.flowId || '',
    flowNodeText: '',
    uploadUserId: loginForm.id || '',
    uploadUserText: loginForm.username || loginForm.nickname || '',
  }
  uploadAttachment(params)
}

// 确认上传
function confirmUpload() {
  // 表单校验
  uploadFormRef.value.validate(async (valid) => {
    if (!valid) {
      ElMessage.warning('请完善表单信息')
      return
    }
    
    if (!uploadFiles.value || (Array.isArray(uploadFiles.value) && uploadFiles.value.length === 0)) {
      ElMessage.warning('请先选择要上传的文件')
      return
    }
    
    try {
      // 收集上传文件的ID
      let newFileIds: string[] = []
      
      // 处理单个文件和多个文件的情况
      if (Array.isArray(uploadFiles.value)) {
        newFileIds = uploadFiles.value.map(file => file.fileId).filter(id => id)
      } else if (uploadFiles.value && uploadFiles.value.fileId) {
        newFileIds.push(uploadFiles.value.fileId)
      }
      
      if (newFileIds.length === 0) {
        ElMessage.warning('上传的文件没有有效的ID')
        return
      }
      
      // 添加表单信息到文件对象中
      const uploadedFiles = Array.isArray(uploadFiles.value) ? uploadFiles.value : [uploadFiles.value]
      const enrichedFiles = uploadedFiles.map(file => ({
        ...file,
        fileType: uploadFormData.value.fileType,
        fileTypeText: uploadFormData.value.fileTypeText,
        isPublic: uploadFormData.value.isPublic,
        fileTitle: uploadFormData.value.isPublic === 'true' ? uploadFormData.value.fileTitle : ''
      }))
      
      // 将新的文件ID与现有的ID合并
      const currentIds = props.modelValue ? props.modelValue.split(',').filter(id => id.trim()) : []
      const allIds = [...new Set([...currentIds, ...newFileIds])] // 使用Set去重
      const newFieldid = allIds.join(',')

      // 更新fieldid并通知父组件
      emit('update:modelValue', newFieldid)

      // 更新文件信息到文件详情
      createFileInfoToSystem({ 
        ...uploadFormData.value,
        ...cloneDeep(uploadFiles.value)
      })
      
      // 触发上传成功事件
      emit('upload-success', {
        fieldid: newFieldid,
        files: enrichedFiles
      })
      
      // 重置表单和上传文件
      uploadFormData.value = {
        fileType: '',
        isPublic: '',
        fileTitle: '',
        fileTypeText: ''
      }
      uploadFiles.value = null
      
      // 关闭上传对话框
      uploadDialogVisible.value = false
      
      // 如果抽屉是打开的，则刷新附件列表
      if (drawerVisible.value) {
        showAttachmentDrawer()
      }
      
      ElMessage.success('上传成功')
    } catch (error: any) {
      console.error('上传失败:', error)
      ElMessage.error('上传失败: ' + (error.message || '未知错误'))
    }
  })
}

// 暴露组件方法
defineExpose({
  showDetails: showAttachmentDrawer,
  showUpload: showUploadDialog
})
</script>

<style lang="scss" scoped>
.attachment-button-wrapper {
  display: inline-flex;
  
  .operation-buttons {
    display: flex;
    gap: 8px;
  }
  
  .attachment-drawer-content {
    padding: 0 16px;
    
    .drawer-actions {
      margin-bottom: 16px;
      display: flex;
      justify-content: flex-end;
    }
  }

  :deep(.attachment-dialog-content .el-dialog__body) {
    padding: 20px;
  }
  
  .collapse-title {
    display: flex;
    align-items: center;
    
    .collapse-title-text {
      font-size: 16px;
      font-weight: 600;
      color: var(--el-color-primary);
    }
    
    .collapse-title-count {
      margin-left: 8px;
      font-size: 14px;
      color: #999;
    }
  }
  
  .table-footer {
    margin-top: 16px;
    padding: 8px 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .selection-info {
      font-size: 14px;
      color: #606266;
    }
  }
  
  .upload-form {
    margin-bottom: 20px;
    padding-bottom: 15px;
    border-bottom: 1px dashed #e0e0e0;
  }
  
  :deep(.el-collapse-item__header) {
    font-size: 16px;
    font-weight: 600;
    padding-left: 8px;
    background-color: #f7f8fa;
    border-bottom: 1px solid #e4e7ed;
  }
  
  :deep(.el-collapse-item__content) {
    padding: 16px 0;
  }
  
  :deep(.table-actions) {
    display: flex;
    gap: 8px;
    align-items: center;
  }
}
</style> 
  
  
