<template>
  <div class="upload-file">
    <el-upload
      ref="uploadRef"
      v-model:file-list="fileList"
      :action="uploadUrl"
      :auto-upload="autoUpload"
      :before-upload="beforeUpload"
      :disabled="disabled"
      :drag="drag"
      :http-request="(e) => httpRequest(e,{...uploadParams,...loginParams})"
      :limit="props.limit"
      :multiple="props.limit > 1"
      :on-change="handleFileChange"
      :on-error="excelUploadError"
      :on-exceed="handleExceed"
      :on-preview="handlePreview"
      :on-remove="handleRemove"
      :on-success="handleFileSuccess"
      :show-file-list="showFileList"
      class="upload-file-uploader"
      name="file"
      v-loading="uploadLoading"
    >
    <el-button v-if="isShowButton && !disabled" type="primary" class="upload-button">
        <Icon icon="ep:upload-filled" class="upload-icon" />
        选取文件
      </el-button>
      <template v-if="isShowTip && !disabled" #tip>
        <div class="upload-tip">
          <div class="tip-item">
            大小不超过 <b>{{ fileSize }}{{fileSizeUnit}}</b>
          </div>
          <div class="tip-item">
            格式为 <b>{{ fileType?.join(' / ') }}</b>
          </div>
        </div>
      </template>
      <template #file="row" v-if="isShowFileInfo">
        <div class="file-item">
          <div class="file-info">
            <el-icon><Document /></el-icon>
            <span class="file-name">{{ row.file.name }}</span>
          </div>
          <div class="file-actions">
            <template v-if="row.file.status === 'ready' || row.file.status === 'success'">
              <el-button
                link
                type="primary"
                @click="handlePreview(row.file)"
              >
                <el-icon><View /></el-icon>
                预览
              </el-button>
            </template>
            <template v-if="row.file.status === 'ready' || row.file.status === 'success'">
              <el-button 
                v-if="!disabled"
                link 
                type="danger" 
                @click="handleRemove(row.file)"
              >
                <el-icon><Delete /></el-icon>
                删除
              </el-button>
            </template>
              <el-progress 
                v-if="row.file.status === 'uploading'"
                :percentage="row.file.percentage"
              :stroke-width="2"
              class="upload-progress"
            />
          </div>
        </div>
      </template>
      <slot></slot>
    </el-upload>

    <FilePreview ref="filePreviewRef"></FilePreview>
  </div>
</template>
<script lang="ts" setup>
import { propTypes } from '@/utils/propTypes'
import type { UploadInstance, UploadProps, UploadRawFile, UploadUserFile } from 'element-plus'
import { Document, View, Delete } from '@element-plus/icons-vue'
// import { isString } from '@/utils/is'
import { useUpload } from '@/components/UploadFile/src/useUpload'
import { UploadFile } from 'element-plus/es/components/upload/src/upload'
import FilePreview from '@/components/FilePreview/src/index.vue'
import { useSysConfigStore } from '@/store/modules/sysConfig'
import * as authUtil from '@/utils/auth'
import {useUserStore} from "@/store/modules/user";
defineOptions({ name: 'UploadFile' })

interface FileInfo {
  url?: string;
  name: string;
  file?: File;
}

const message = useMessage() // 消息弹窗
const userStore=useUserStore()
const emit = defineEmits<{
  'update:modelValue': [value: FileInfo | FileInfo[]];
}>()

const props = defineProps({
  modelValue: propTypes.oneOfType<FileInfo | FileInfo[]>([Object as PropType<FileInfo>, Array as PropType<FileInfo[]>]).isRequired,
  fileType: propTypes.array.def(['doc', 'xls', 'ppt', 'txt', 'pdf', 'png', 'jpg', 'jpeg']), // 文件类型, 例如['png', 'jpg', 'jpeg']
  fileSize: propTypes.number.def(5), // 大小限制(MB)
  fileSizeUnit:propTypes.string.def('MB'),
  limit: propTypes.number.def(5), // 数量限制
  autoUpload: propTypes.bool.def(true), // 自动上传
  drag: propTypes.bool.def(true), // 拖拽上传
  isShowTip: propTypes.bool.def(true), // 是否显示提示
  disabled: propTypes.bool.def(false), // 是否禁用上传组件 ==> 非必传（默认为 false）
  isShowButton: propTypes.bool.def(true),
  isShowFileInfo: propTypes.bool.def(true),
  showFileList: propTypes.bool.def(true),
  uploadMode: {
    type: String,
    default: 'immediate', // 'immediate' | 'manual'
    validator: (value: string) => ['immediate', 'manual'].includes(value)
  },
  uploadParams: propTypes.object.def({
    natrualKeyId:'1',
    projId:'1',
    folderId:'1',
    dirCode:'1',
    fileType:'1',
    fileSource:'1',
    index:1
  })
})

const sysConfigStore = useSysConfigStore()

// ========== 上传相关 ==========
const uploadRef = ref<UploadInstance>()
// const uploadList = ref<UploadUserFile[]>([])
const fileList = ref<UploadUserFile[]>([])
const uploadNumber = ref<number>(0)

const { uploadUrl, httpRequest } = useUpload()
const route=useRoute()
/**
 * 上传文件用户信息
 */
const loginForm = userStore.getUser || {}
// console.log(route.query.userName,'route.query.userName----');
let businessUserInfo=userStore.getBusinessUser || {}

const getBusinessUserInfo = async () => {
  if(!businessUserInfo.userName || (route.query.userName && businessUserInfo.userName !== route.query.userName)){
    route.query.userName && await userStore.autoLoginByUserName(route.query.userName)
    businessUserInfo=userStore.getBusinessUser || {}
  }
}
const loginParams = computed(() => ({
  uploadUserId:'1',//loginForm.id,
  uploadUserName:route.query.userName || businessUserInfo.userName || loginForm.username || loginForm.nickname
}))

const uploadLoading = ref(false)
// 文件上传之前判断
const beforeUpload: UploadProps['beforeUpload'] = (file: UploadRawFile) => {
  if (fileList.value.length >= props.limit) {
    message.error(`上传文件数量不能超过${props.limit}个!`)
    return false
  }
  let fileExtension = ''
  if (file.name.lastIndexOf('.') > -1) {
    fileExtension = file.name.slice(file.name.lastIndexOf('.') + 1)
  }
  const isImg = props.fileType.some((type: string) => {
    if (file.type.indexOf(type) > -1) return true
    return !!(fileExtension && fileExtension.indexOf(type) > -1)
  })
  const isLimit = file.size < props.fileSize * 1024 * 1024
  if (!isImg) {
    message.error(`文件格式不正确, 请上传${props.fileType.join('/')}格式!`)
    return false
  }
  if (!isLimit) {
    message.error(`上传文件大小不能超过${props.fileSize}MB!`)
    return false
  }

  // 只在即时上传模式下显示上传提示
  if (props.uploadMode === 'immediate') {
    // message.success('正在上传文件，请稍候...')
    uploadLoading.value = true
  }
  uploadNumber.value++
}

// 修改文件选择处理函数
const handleFileChange = (file: UploadFile, files: UploadUserFile[]) => {
  if (props.uploadMode === 'manual') {
    // 手动模式下，直接更新文件列表
    fileList.value = files.map(file => ({
      name: file.name,
      uid: file.uid,
      status: 'ready',
      raw: file.raw // 保存原始文件对象
    }))

    // 更新上传文件计数
    uploadNumber.value = files.length

    // 发送更新事件
    emitUpdateModelValue()
  }
}

// 文件上传成功
const handleFileSuccess: UploadProps['onSuccess'] = (res: any, uploadFile: UploadFile): void => {
  if (props.uploadMode !== 'manual') {
    if(res && res.result && res.result.code === '0'){
      message.success('上传成功')
    }else{
      message.error(res?.result?.message || '上传失败')
      uploadLoading.value = false
      fileList.value = []
      return
    }
    uploadLoading.value = false
    const index = fileList.value.findIndex((item) => item.uid === uploadFile.uid)
    if (index > -1) {
      if(sysConfigStore.getSysParamter?.uploadService === '泛微'){
        fileList.value[index] = {
          name: res.data.filename || uploadFile.name,
          url: res.data.loadlink,
          uid: uploadFile.uid,
          size:uploadFile.size,
          status: 'success'
        }
      }else if(sysConfigStore.getSysParamter?.uploadService === '业务' || 1==1){
        fileList.value[index] = {
          name: res.result.filename || uploadFile.name,
          url: res.result.downloadUrl,
          fileId: res.result.commFileId,
          size:uploadFile.size,
          status: 'success'
        }
      }else{
        fileList.value[index] = {
          name: uploadFile.name,
          url: res.data,
          uid: uploadFile.uid,
          size:uploadFile.size,
          status: 'success'
        }
      }
    }
    // 检查是否所有文件都上传完成
    const allUploaded = fileList.value.every(file => file.status === 'success')
    if (allUploaded) {
      uploadNumber.value = 0
      emitUpdateModelValue()
    }
  }
}

// 文件数超出提示
const handleExceed: UploadProps['onExceed'] = (): void => {
  message.error(`上传文件数量不能超过${props.limit}个!`)
}

// 上传错误提示
const excelUploadError: UploadProps['onError'] = (): void => {
  message.error('导入数据失败，请您重新上传！')
}

// 删除上传文件
const handleRemove = (file: UploadFile) => {
  const index = fileList.value.findIndex((f) => f.fileId === file.fileId)
  if (index > -1) {
    fileList.value.splice(index, 1)
    // 更新上传文件计数
    uploadNumber.value = Math.max(0, uploadNumber.value - 1)
    emitUpdateModelValue()
  }
}
defineExpose({ handleRemove,uploadLoading })
// 预览文件
const filePreviewRef = ref()
const handlePreview: UploadProps['onPreview'] = (uploadFile) => {
  const previewContent = props.uploadMode === 'manual' ? uploadFile.raw : sysConfigStore.getSysParamter?.uploadService === '业务' ? uploadFile.fileId : uploadFile.url
  filePreviewRef.value.open(uploadFile.name, previewContent)
}

// 监听模型绑定值变动
// watch(
//   () => props.modelValue,
//   (val: FileInfo | FileInfo[]) => {
//     if (!val) {
//       fileList.value = []
//       return
//     }

//     fileList.value = [] // 保障数据为空
//     // 情况1：单个文件对象
//     if (!Array.isArray(val)) {
//       fileList.value.push({
//         name: val.name,
//         url: val.url,
//       })
//       return
//     }

//     // 情况2：文件对象数组
//     fileList.value.push(
//       ...val.map((file) => ({
//         name: file.name,
//         url: file.url,
//       }))
//     )
//   },
//   { immediate: true, deep: true }
// )
// 发送文件链接列表更新
const emitUpdateModelValue = () => {
  if (props.uploadMode === 'manual') {
    // 手动模式下，返回文件对象和名称
    const fileInfos = fileList.value.map((file) => ({
      file: file.raw,
      name: file.name,
      size:file.size,
    }))
    emit('update:modelValue', props.limit === 1 ? fileInfos[0] : fileInfos)
  } else {
    // 即时上传模式，返回 URL 和名称
    const fileInfos = fileList.value.map((file) => ({
      url: file.url!,
      name: file.name,
      size:file.size,
      fileId: file.fileId
    }))
    emit('update:modelValue', props.limit === 1 ? fileInfos[0] : fileInfos)
  }
}
// ================ 生命周期钩子 ================
onBeforeUnmount(() => {
  getBusinessUserInfo()
})
</script>
<style lang="scss" scoped>
.upload-file {
  .upload-file-uploader {
    width: 100%;

    :deep(.el-upload) {
      width: 100%;
      text-align: center;
    }

    :deep(.el-upload-dragger) {
      width: 100%;
      height: auto;
      padding: 60px 20px;
    }
  }

  .upload-button {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    
    .upload-icon {
      font-size: 16px;
    }
  }

  .upload-tip {
    margin-top: 8px;
    padding: 8px 12px;
    background-color: var(--el-fill-color-light);
    border-radius: 4px;
    font-size: 12px;
    color: var(--el-text-color-secondary);

    .tip-item {
      line-height: 1.5;
      
      b {
        color: var(--el-color-danger);
        font-weight: 500;
      }
    }
  }

  :deep(.el-upload-list) {
    margin-top: 16px;
  }

  .file-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 4px;
    margin-bottom: 8px;
    transition: all 0.3s;

    &:hover {
      background-color: var(--el-fill-color-light);
    }

    .file-info {
      display: flex;
      align-items: center;
      gap: 8px;
      flex: 1;
      min-width: 0;

      .el-icon {
        font-size: 16px;
        color: var(--el-text-color-secondary);
      }

      .file-name {
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        color: var(--el-text-color-regular);
      }
    }

    .file-actions {
      display: flex;
      align-items: center;
      gap: 8px;

      .el-button {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 4px 8px;
        
        .el-icon {
          font-size: 14px;
          margin-right: 4px;
        }
      }
    }

    .upload-progress {
      width: 120px;
    }
  }
}

// 修正深度选择器的写法
:deep(.el-upload-list) {
  .el-upload-list__item {
    &-status-label,
    &-actions {
      display: none;
    }
  }
}

// 或者使用这种写法
.upload-file :deep(.el-upload-list__item-status-label),
.upload-file :deep(.el-upload-list__item-actions) {
  display: none;
}
</style>
