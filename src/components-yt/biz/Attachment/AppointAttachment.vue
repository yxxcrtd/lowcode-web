<!--
 * @Description: 指定文件上传
 * @Author: miffy
 * @Date: 2024-11-27
-->

<template>
  <!-- 组件主容器 -->
  <div class="appoint-attachment-container">
    <!-- 表格部分 -->
    <div class="file-list-warp">
      <div class="file-list-item" v-for="(item, index) in modelValue" :key="item.rowKey">
        <div class="file-list-item-header">
          <div class="left">
            <el-tag type="danger" v-if="item.isRequire">必传</el-tag>
            <span class="left-title">{{item.title}}</span>
          </div>
          <div class="right">
            <el-button type="primary" @click="openUploadDialog(index)" v-if="!isDetail">
              <el-icon><Upload /></el-icon>
              上传附件
            </el-button>
          </div>
        </div>
        <div class="file-list-item-content">
          <ul>
            <li v-for="(fileItem, fileIndex) in item.fileList" :key="fileItem.rowKey">
              <div class="file-name">{{fileIndex+1}}.{{fileItem.title}}</div>
              <div class="file-size">{{`${fileItem.size ? fileItem.size + 'K' : ''}`}}</div>
              <div class="file-action">
                <el-button v-if="attachmentInfo.showPreview" link type="primary" @click="(e) => { e.stopPropagation(); handlePreview(fileItem) }">预览</el-button>
                <el-button v-if="attachmentInfo.showDownload" link type="primary" @click="(e) => { e.stopPropagation(); handleDownload(fileItem) }">下载</el-button>
                <el-button v-if="attachmentInfo.showDelete" link type="danger" @click="(e) => { e.stopPropagation(); handleDelete(fileItem, index, fileIndex) }">删除</el-button>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
    
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
import UploadFile from '@/components/UploadFile/src/UploadFile.vue'
import FilePreview from '@/components/FilePreview/src/index.vue'
import { downloadByData, downloadByUrl } from '@/utils/filt'

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
  // 上传配置
  uploadConfig: {
    type: Object,
    default: () => ({
      fileType: ['doc', 'docx', 'xls', 'xlsx', 'pdf', 'png', 'jpg', 'jpeg'],
      fileSize: 10,
      limit: 5,
      autoUpload: true,
      drag: true,
      disabled: false,
      isShowTip: true
    })
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
  'upload',
  'download',
  'delete',
  'batch-download',
  'batch-delete',
  'refresh'
])

// ================ 组件状态 ================
const tableRef = ref(null)
const uploadDialogVisible = ref(false)
const uploadFiles = ref([])
const uploadIndex = ref(0)

// ================ 事件处理方法 ================
// 处理删除
const handleDelete = (fileItem, index, fileIndex) => {
  try {
    // 获取当前数据的副本
    const updatedList = [...props.modelValue]
    // 从指定索引的 fileList 中删除文件
    updatedList[index].fileList.splice(fileIndex, 1)
    
    // 更新父组件数据
    emit('update:modelValue', updatedList)
    
    ElMessage.success('删除成功')
  } catch (error) {
    ElMessage.error('删除失败：' + error.message)
  }
}

// ================ 上传相关方法 ================
// 打开上传对话框
const openUploadDialog = (index) => {
  uploadFiles.value = []
  uploadIndex.value = index
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
        return {
          title: file.name,
          type: file.name.split('.').pop(),
          size: file.file?.size || 0,
          raw: file.file,
        }
      } else {
        return {
          title: file.name,
          type: file.name.split('.').pop(),
          size: file.size,
          fileUrl: file.url,
          fileId:file.fileId
        }
      }
    })

    // 获取当前数据的副本
    const updatedList = [...(Array.isArray(props.modelValue) ? props.modelValue : [])]
    
    // 确保目标索引存在且有 fileList 属性
    if (uploadIndex.value >= 0 && uploadIndex.value < updatedList.length) {
      // 如果 fileList 不存在，则创建一个空数组
      if (!updatedList[uploadIndex.value].fileList) {
        updatedList[uploadIndex.value].fileList = []
      }
      
      // 添加新文件到指定索引的 fileList
      updatedList[uploadIndex.value].fileList = [
        ...updatedList[uploadIndex.value].fileList,
        ...newFiles
      ]
    }

    // 更新父组件数据
    emit('update:modelValue', updatedList)
    
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
const handlePreview = (fileItem)=>{
  const previewContent = props.attachmentInfo.uploadMode === 'manual' ? fileItem.raw : fileItem.fileId
  filePreviewRef.value.open(fileItem.title, previewContent)
}

// 下载
const handleDownload = (row) => {
  const downloadContent = props.attachmentInfo.uploadMode === 'manual' ? row.raw : row.fileId
  if(props.attachmentInfo.uploadMode === 'manual'){
    downloadByData(downloadContent, downloadContent.name)
  }else {
    downloadByUrl({
      fileId: downloadContent,
      target: "_blank",
      fileName: row.title
    })
  }
}

// ================ 公共方法 ================
// 刷新表格
const refresh = (bool = false) => {
  tableRef.value?.refresh(bool)
}

// ================ 生命周期钩子 ================
onBeforeUnmount(() => {
  uploadFiles.value = []
  uploadIndex.value = 0
})

// ================ 暴露方法 ================
defineExpose({
  refresh,
  loadData: () => tableRef.value?.loadData(),
})
</script>

<style lang="scss" scoped>
// ================ 组件样式 ================
.appoint-attachment-container {
  display: flex;
  flex-direction: column;
  .file-list-warp{
    .file-list-item{
      background: #f8fbff;
      border-radius: 10px;
      padding: 13px 8px;
      margin-bottom: 10px;
      .file-list-item-header{
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding:0 10px;
        line-height: 45px;
        border-bottom: 1px solid #e1ecfb;
        .left{
          display: flex;
          align-items: center;
          .left-title{
            margin-left: 8px;
            font-size: 16px;
            font-weight: bold;
          }
        }
        .uploadBtn{
          width: 72px;
          height: 29px;
          border-radius: 5px;
          font-size: 16px;
        }
      }
      .file-list-item-content{
        ul{
          list-style: none;
          li{
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 50px 0 24px;
            font-size: 14px;
            .file-name{
            }
            .file-action{
              display: flex;
              justify-content: space-between;
              width: 150px;
            }
          }
        }
      }
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

:deep() {
  // 对话框样式
  .el-dialog__body {
    padding: 20px;
  }
}
</style>
