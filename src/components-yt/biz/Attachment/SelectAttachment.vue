<!--
 * @Description: 选择固定类型文件上传
 * @Author: miffy
 * @Date: 2024-11-27
-->

<template>
  <!-- 组件主容器 -->
  <div class="select-attachment-container">
    <el-form-item label="选择附件类型" label-width="100px" v-if="!isDetail">
      <el-cascader class="attachment-type-cascader" v-model="selFileType" :options="options" @change="handleFileTypeChange" />
    </el-form-item>
    <!-- 表格部分 -->
    <div class="file-list-warp">
      <div class="file-list-item" v-for="item in fileTypeList" :key="item.rowKey">
        <div class="file-list-item-header">
          <div class="left">
            <el-tag type="danger" v-if="item.isRequire">必传</el-tag>
            <span class="left-title">{{item.title}}</span>
          </div>
          <div class="right">
            <el-upload
              ref="uploadRef"
              v-if="!isDetail"
              class="upload-demo"
              :auto-upload="false"
              :show-file-list="false"
              :on-change="(file,files)=>handleUploadChange(item,file,files)"
            >
              <template #trigger>
                <el-button type="primary">
                  <el-icon><Upload /></el-icon>
                  上传附件
                </el-button>
              </template>
            </el-upload>
          </div>
        </div>
        <div class="file-list-item-content">
          <ul>
            <li v-for="(fileItem,fileIndex) in item.fileList" :key="fileItem.rowKey">
              <div class="file-name">
                {{fileIndex+1}}.{{fileItem.fileName}}</div>
              <div class="file-size">{{convertFileSize(fileItem.fileSize)}}</div>
              <div class="file-action">
                <el-link type="primary" @click="toPreview(fileItem)">预览</el-link>
                <el-link type="danger" v-if="!isDetail">删除</el-link>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
  <FilePreview ref="filePreviewRef"></FilePreview>
</template>

<script setup lang="jsx">
import { ref, computed, onBeforeUnmount } from 'vue'
import { Download, Upload, Delete } from '@element-plus/icons-vue'
import UploadFile from '@/components/UploadFile/src/UploadFile.vue'
import FilePreview from '@/components/FilePreview/src/index.vue'

// ================ Props 定义 ================
const props = defineProps({
  // 静态数据源
  dataSource: {
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
const options = [
  {
    value: '清算中心',
    label: '清算中心',
  },
  {
    value: '家办中心',
    label: '家办中心',
    children: [
      {
        value: '合规审查报告',
        label: '合规审查报告',
      },
    ],
  },
  {
    value: '项目审查材料',
    label: '项目审查材料',
    children: [
      {
        value: '分控初审报告',
        label: '分控初审报告',
      },
      {
        value: '预审会意见汇总表',
        label: '预审会意见汇总表',
      },
      {
        value: '分控审查报告',
        label: '分控审查报告',
      },
    ],
  }
]

const fileTypeList=ref([])
const selFileType=ref([])
const handleFileTypeChange=(val)=>{
  console.log(val)
  fileTypeList.value=val.map(item=>{
    return {
      title:'信息披露/资金管理报告',
      fileCount:1,
      fileType:'xls,ppt',
      fileSize:10,
      isRequire:1,
      isValidName:1,
      fileList:[
      ]
    }
  })
}
// ================ 组件状态 ================
const uploadDialogVisible = ref(false)
const uploadFiles = ref('')


// ================ 事件处理方法 ================
// 处理下载
const handleDownload = (row) => {
  emit('download', row)
}

// 处理删除
const handleDelete = (row) => {
  emit('delete', row)
}

// ================ 上传相关方法 ================
// 打开上传对话框
const openUploadDialog = () => {
  uploadFiles.value = ''
  uploadDialogVisible.value = true
}

// 处理上传成功
const handleUploadSuccess = (files) => {
  console.log(files)
  uploadFiles.value = files
}

const handleUploadChange=(row,file,files)=>{
  console.log(file,files)
  row.fileList.push({
    fileName:file.name,
    fileSize:file.size,
    ...file
  })
}
const convertFileSize=(size)=>{
  if(!size){
    return "0B"
  }
  let data = "";
  const _size = Number.parseFloat(size);
  if (_size < 1 * 1024) {
    //如果小于0.1KB转化成B
    data = _size.toFixed(2) + "B";
  } else if (_size < 1 * 1024 * 1024) {
    //如果小于0.1MB转化成KB
    data = (_size / 1024).toFixed(2) + "KB";
  } else if (_size < 1 * 1024 * 1024 * 1024) {
    //如果小于0.1GB转化成MB
    data = (_size / (1024 * 1024)).toFixed(2) + "MB";
  } else {
    //其他转化成GB
    data = (_size / (1024 * 1024 * 1024)).toFixed(2) + "GB";
  }
  const size_str = data + "";
  const len = size_str.indexOf(".");
  const dec = size_str.substr(len + 1, 2);
  if (dec == "00") {
    //当小数点后为00时 去掉小数部分
    return size_str.substring(0, len) + size_str.substr(len + 3, 2);
  }
  return size_str;
}

// 确认上传
const confirmUpload = async () => {
  if (!uploadFiles.value) return
  
  try {
    await emit('upload', uploadFiles.value)
    uploadDialogVisible.value = false
  } catch (error) {
    console.error('上传失败：', error)
  }
}

const filePreviewRef=ref()
const toPreview=(fileItem)=>{
  console.log(fileItem)
  filePreviewRef.value.open(fileItem.fileName,fileItem.raw)
}
// ================ 生命周期钩子 ================
onBeforeUnmount(() => {
  uploadFiles.value = ''
})
</script>

<style lang="scss" scoped>
// ================ 组件样式 ================
.select-attachment-container {
  display: flex;
  flex-direction: column;
  :deep(.attachment-type-cascader){
    width: 400px;
  }
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
              width: 40%;
            }
            .file-action{
              display: flex;
              justify-content: space-between;
              width: 70px;
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
</style>
