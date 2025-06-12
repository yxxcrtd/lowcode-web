
<template>
  <div class="excel-analysis">
    <h4>第一步: 请下载模板后进行填写，填写完成请上传该附件</h4>
    <el-card>
      <template #header>
        <div class="card-header">
          <span>必传文件</span>
        </div>
      </template>
      <div class="file-list">
        <div class="title">资产入池资料/新增资产模板/数据解析文件</div>
        <FileUploader
            accept=".xlsx,.xls"
            @change="handleFileChange"
          />
      </div>
    </el-card>
    <el-divider border-style="dashed" />
    <h4>第二步: 请点击“数据解析” 按钮,进行表格附件数据解析</h4>
    <!-- 解析 -->
    <ExcelResult v-model="renderFormData" :formGroups="formGroups" :file-list="attachmentList"/>
  </div>
</template>
<script setup>
import { ref, watch } from 'vue'
import ExcelResult from './ExcelResultV2.vue'
import { Download, Upload, Delete } from '@element-plus/icons-vue'
import FileUploader from './ExcelUpload.vue'

const renderFormData=defineModel()
const props=defineProps({
  formGroups:{
    type: Array,
  }
})
const attachmentList=ref([])
// 处理文件变化
const handleFileChange = (file) => {
  if (!file) return
  // 更新 attachmentList
  attachmentList.value = [{
    fileName: file.name,
    raw: file.raw
  }]
}
</script>
<style lang="scss" scoped>
.batch-download{
  cursor:pointer;
}
.excel-analysis {
  background: #fff;
  padding: 2px 24px;
  padding-bottom: 24px;
  h4{
    color:#4f5565;
  }
}
::v-deep .el-card__header {
  padding: 10px 15px;
  font-size: 15px;
  font-weight: 600;
}
.excel-upload {
  padding: 20px;
  background: #fff;

  h3 {
    margin-bottom: 16px;
    font-size: 14px;
    color: #333;
  }
}

.file-list {
  // background: #f5f7fa;
  border-radius: 4px;
  // padding: 16px;
  .title{
    font-size: 16px;
  font-weight: bold;
  background: #cde2fc;
  color: #333;
  padding: 12px;
  border-radius:4px;
  }
}

.file-item {
  .file-type {
    color: #666;
    font-size: 14px;
    margin-bottom: 12px;
    display: block;
  }

  .file-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #fff;
    padding: 12px 16px;
    border-radius: 4px;

    .info-left {
      display: flex;
      align-items: center;
      gap: 24px;

      .file-name {
        color: #1890ff;
      }

      .file-size,
      .file-time {
        color: #999;
      }
    }

    .info-right {
      display: flex;
      gap: 16px;

      .action-btn {
        color: #1890ff;
        cursor: pointer;

        &:hover {
          opacity: 0.8;
        }
      }
    }
  }
}
.download-btn {
  color: #1890ff;
}
</style>
