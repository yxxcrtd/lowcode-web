<template>
  <div class="file-uploader">
    <el-upload
      class="excel-uploader"
      :accept="accept"
      :auto-upload="false"
      :show-file-list="false"
      :on-change="handleFileChange"
    >
      <template #trigger>
        <el-button type="default" v-if="!fileInfo">
          <el-icon><Upload /></el-icon>
          选择文件
        </el-button>
      </template>
    </el-upload>
    <!-- 文件信息展示 -->
    <div class="file-info" v-if="fileInfo">
      <div class="info-left">
        <el-icon><Connection style="color: #1890ff" /></el-icon>
        <span class="file-name">{{ fileInfo.name }}</span>
      </div>
      <div class="info-right">
        <span class="file-size">{{ formatFileSize(fileInfo.size) }}</span>
        <span class="file-time">{{ formatDate(fileInfo.lastModified) }}</span>
        <span class="action-btn" @click="handlePreview"> 预览 </span>
        <span class="action-btn" @click="handleDownload"> 下载 </span>
        <span class="action-btn" @click="handleDelete"> 删除 </span>
      </div>
    </div>
    <FilePreview ref="filePreviewRef"></FilePreview>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import FilePreview from '@/components/FilePreview/src/index.vue'
import { Document, View, Download, Upload, Delete, Connection } from '@element-plus/icons-vue'
const props = defineProps({
  accept: {
    type: String,
    default: '.xlsx,.xls'
  }
})
const emit = defineEmits(['change'])

const fileInfo = ref(null)

// 处理文件变化
const handleFileChange = (file) => {
  if (!file) return
  fileInfo.value = file.raw
  emit('change', file)
}
// 格式化文件大小
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
// 格式化日期
const formatDate = (timestamp) => {
  const date = new Date(timestamp)
  return date.toLocaleString()
}
// 预览文件
const filePreviewRef = ref(null)
// 预览文件
const handlePreview = async () => {
  if (!fileInfo.value) return
  filePreviewRef.value?.open(
    fileInfo.value.name, // 文件名
    fileInfo.value // 文件对象
  )
}
// 下载文件
const handleDownload = () => {
  const url = URL.createObjectURL(fileInfo.value)
  const link = document.createElement('a')
  link.href = url
  link.download = fileInfo.value.name
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
const handleDelete = () => {
  fileInfo.value = null
  emit('change', null)
}

</script>

<style lang="scss" scoped>
.file-uploader {
  //margin-top: 10px;
  .el-button--default {
    margin-top: 10px;
  }
  .file-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #fff;
    padding: 12px 16px;
    border-radius: 4px;
    //   margin-top: 10px;
    font-size: 15px;
    .info-left {
      display: flex;
      align-items: center;
      gap: 16px;

      .file-name {
        color: #1890ff;
      }
    }

    .info-right {
      display: flex;
      gap: 16px;
      .file-size,
      .file-time {
        color: #999;
      }
      .action-btn {
        color: #1890ff;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 4px;

        &:hover {
          opacity: 0.8;
        }
      }
    }
  }
}
</style>
