<!--
 * @Description: 附件表格组件
 * @Author: miffy
 * @Date: 2024-11-27
 * 
 * 功能：
 * 1. 支持单选和多选模式
 * 2. 支持文件上传、下载、删除操作
 * 3. 支持批量下载和删除
 * 4. 支持远程数据加载和静态数据源
 * 5. 支持自定义列配置
 * 6. 支持分页配置
 * 7. 集成文件上传组件
-->

<template>
  <!-- 组件主容器 -->
  <div class="attachment-table">
    <!-- 底部操作区 -->
    <div class="attachment-footer">
      <!-- 左侧上传按钮 -->
      <div class="left-actions" v-if="!isDetail">
        <el-button type="primary" @click="openUploadDialog">
          <el-icon><Upload /></el-icon>
          上传附件
        </el-button>
      </div>

      <!-- 右侧批量操作区 -->
      <div v-if="enableMultiple" class="right-actions">
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
    <!-- 表格部分 -->
    <JVxeTable
      ref="tableRef"
      :height="height"
      :columns="processedColumns"
      :data-url="dataUrl"
      :data-source="modelValue"
      :table-page-config="tablePageConfig"
      :show-check-box="enableMultiple"
      :check-box-config="checkBoxConfig"
      :row-config="rowConfig"
      @checkbox-change="handleCheckboxChange"
      @checkbox-all="handleCheckboxAll"
    >
      <!-- 透传插槽 -->
      <template v-for="(_, name) in $slots" #[name]="slotData">
        <slot :name="name" v-bind="slotData"></slot>
      </template>
    </JVxeTable>

    <!-- 上传对话框 -->
    <el-dialog
      v-model="uploadDialogVisible"
      title="上传附件"
      width="500px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      destroy-on-close
    >
      <UploadFile
        v-model="uploadFiles"
        v-bind="uploadConfig"
        :upload-mode="attachmentInfo.uploadMode"
        @update:model-value="handleUploadSuccess"
      />
      <template #footer>
        <el-button @click="uploadDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmUpload">确定</el-button>
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
import { downloadByData, downloadByUrl } from '@/utils/filt'

// ================ Props 定义 ================
const props = defineProps({
  // 表格行主键字段
  rowKey: {
    type: String,
    default: 'id'
  },
  // 表格高度
  height: {
    type: [String, Number],
    default: '300'
  },
  //是否详情界面
  isDetail:{
    type:Boolean,
    default:false,
  },
  // 数据源URL
  dataUrl: {
    type: String,
    default: ''
  },
  // 静态数据源
  modelValue: { 
    type: Array,
    default: () => []
  },
  // 分页配置
  tablePageConfig: {
    type: Object,
    default: () => ({
      enabled: true,
      currentPage: 1,
      pageSize: 10,
      total: 0,
      pageSizes: [10, 20, 50, 100],
    })
  },
  // 是否启用多选
  enableMultiple: {
    type: Boolean,
    default: false
  },
  // 自定义列配置
  columns: {
    type: Array,
    default: () => [],
    validator: (columns) => {
      return columns.every(col => 
        typeof col.title === 'string' &&
        typeof col.field === 'string'
      )
    }
  },
  // 上传配置
  uploadConfig: {
    type: Object,
    default: () => ({})
  },
  attachmentInfo: {
    type: Object,
    default: () => ({
      uploadMode: 'immediate',
      showPreview: true,
      showDownload: true,
      showDelete: true
    })
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
const uploadFiles = ref([])

// ================ 表格配置 ================
// 操作列渲染函数
const renderActions = ({ row }) => {
  return (
    <div class="table-actions">
      {props.attachmentInfo.showPreview && (
        <el-button 
          link 
          type="primary" 
          onClick={(e) => { 
            e.stopPropagation()
            toPreview(row) 
          }}
        >
          预览
        </el-button>
      )}
      {props.attachmentInfo.showDownload && (
        <el-button 
          link 
          type="primary" 
          onClick={(e) => { 
            e.stopPropagation()
            handleDownload(row) 
          }}
        >
          下载
        </el-button>
      )}
      {props.attachmentInfo.showDelete && (
          <el-button 
            link 
            type="danger" 
            onClick={(e) => { 
              e.stopPropagation()
              handleDelete(row) 
            }}
          >
          删除
        </el-button>
      )}
    </div>
  )
}

// 默认列配置
const defaultColumns = [
  { type: 'seq', title: '序号', width: 60 },
  { title: '附件名称', field: 'fileName', minWidth: 200 },
  {
    title: '操作',
    field: 'action',
    width: 180,
    slots: {
      default: renderActions
    }
  }
]

// 计算最终的列配置
const processedColumns = computed(() => {
  const columns = [...(props.columns.length ? props.columns : defaultColumns)]
  if (props.enableMultiple) {
    columns.unshift({
      type: 'checkbox',
      width: 50,
      fixed: true
    })
  }
  return columns
})

// 复选框配置
const checkBoxConfig = computed(() => ({
  trigger: 'row'
}))

// 行配置
const rowConfig = computed(() => ({
  isHover: true,
  height: 48,
  keyField: props.rowKey
}))

// ================ 事件处理方法 ================
// 处理下载
const handleDownload = (row) => {
  const downloadContent = props.attachmentInfo.uploadMode === 'manual' ? row.raw : row.fileId
  if(props.attachmentInfo.uploadMode === 'manual'){
    downloadByData(downloadContent, downloadContent.name)
  }else {
    downloadByUrl({
      fileId: downloadContent,
      target: '_blank',
      fileName: row.fileName
    })
  }
}

// 处理删除
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确认要删除该文件吗？', '提示', {
      type: 'warning'
    })

    // 从现有数据中过滤掉要删除的文件
    const updatedFileList = (Array.isArray(props.modelValue) ? props.modelValue : [])
      .filter(file => file[props.rowKey] !== row[props.rowKey])

    // 更新父组件数据
    emit('update:modelValue', updatedFileList)
    
    // 通知父组件删除事件（如果需要）
    await emit('delete', row)
    
    ElMessage.success('删除成功')
    refresh(true)
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败：' + error.message)
    }
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
const openUploadDialog = () => {
  uploadFiles.value = []
  uploadDialogVisible.value = true
}

// 处理上传成功
const handleUploadSuccess = (files) => {
  uploadFiles.value = files
}

// 确认上传
const confirmUpload = async () => {
  if (!uploadFiles.value?.length) {
    ElMessage.warning('请先选择要上传的文件')
    return
  }
  
  try {
    // 根据上传模式处理文件数据
    const newFiles = uploadFiles.value.map(file => {
      if (props.attachmentInfo.uploadMode === 'manual') {
        // 手动上传模式，返回原始文件对象
        return {
          fileName: file.name,
          raw: file.file,  // 原始文件对象
          type: file.file?.type,  // 文件类型
          size: file.file?.size,  // 文件大小
        }
      } else {
        // 即时上传模式，返回文件URL
        return {
          fileName: file.name,
          fileUrl: file.url,
          fileId:file.fileId
        }
      }
    })

    // 合并现有文件和新上传的文件
    const updatedFileList = [
      ...(Array.isArray(props.modelValue) ? props.modelValue : []),
      ...newFiles
    ]

    // 更新父组件数据
    emit('update:modelValue', updatedFileList)
    
    // 清空上传组件的文件列表
    uploadFiles.value = []
    uploadDialogVisible.value = false

    // 刷新表格数据
    refresh(true)
  } catch (error) {
    ElMessage.error('保存失败：' + error.message)
  }
}

// 预览
const filePreviewRef=ref()
const toPreview = (fileItem)=>{
  const previewContent = props.attachmentInfo.uploadMode === 'manual' ? fileItem.raw : fileItem.fileId
  filePreviewRef.value.open(fileItem.fileName, previewContent)
}

// ================ 公共方法 ================
/**
 * 刷新表格数据
 * @param {boolean} [bool=false] - true: 重置到第一页刷新, false: 当前页刷新
 */
 const refresh = (bool = false) => {
  tableRef.value?.refresh(bool)
}

// ================ 生命周期钩子 ================
onBeforeUnmount(() => {
  selectedRows.value = []
  uploadFiles.value = ''
})

// ================ 暴露方法 ================
defineExpose({
  refresh,
  loadData: () => tableRef.value?.loadData(),
  getSelectedRows: () => selectedRows.value,
  clearSelection: () => {
    selectedRows.value = []
    tableRef.value?.clearCheckboxRow()
  }
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
