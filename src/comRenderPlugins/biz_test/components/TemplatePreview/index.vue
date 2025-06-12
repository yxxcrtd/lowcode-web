<template>
  <el-button @click="handlePreview">模板预览</el-button>
  <el-dialog v-model="previewDialogVisible" title="模板预览" style="margin-top: 50px !important;" width="85vw" height="70vh" center>
    <div style="padding: 0px 20px 0 10px;">
      <div style="display: flex;justify-content: space-between;align-items: center;padding: 10px 0;">
        <div>
          <el-col :span="24">
            <el-form label-position="left">
              <el-form-item label="模板类型:" prop="fileType">
                <ace-select style="width: 200px;" v-model="fileType" placeholder="请选择" :data-source="fileTypeOptions"></ace-select>
              </el-form-item>
            </el-form>
          </el-col>
        </div>
        <div>
          <el-button  type="primary" @click="handleDownload">下载</el-button>
          <el-button type="primary" @click="handleUpload">点击上传附件</el-button>
        </div>
      </div>
      <div>
        <iframe
          class="h-565px! iframe-show"
          ref="frameRef"
          :src="previewUrl"
          style="width: 100%; height: 100%"
          frameborder="0"
          allowfullscreen
          @load="handleLoad"
        ></iframe>
        <!-- <WordView ref="viewRef" v-if="fileType=='word'"></WordView>
        <ExcelView ref="viewRef" v-if="fileType=='excel'"></ExcelView>
        <PDFView ref="viewRef" v-if="fileType=='pdf'"></PDFView>
        <PPTView ref="viewRef" v-if="fileType=='ppt'"></PPTView> -->
      </div>
    </div>
  </el-dialog>
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
      v-model="uploadFile"
      v-bind="uploadConfig"
      :limit="1"
      @update:model-value="handleUploadSuccess"
      style="padding: 10px 10px;"
    />
    <template #footer>
      <el-button @click="uploadDialogVisible = false">取消</el-button>
      <el-button type="primary" @click="confirmUpload">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import fetchDataSetData from '@/utils/dataSetCode'
import { downloadByUrl } from '@/utils/filt'
import { ElMessage } from 'element-plus'
import WordView from '@/components/FilePreview/src/Components/wordView.vue'
import ExcelView from '@/components/FilePreview/src/Components/excelView.vue'
import PPTView from '@/components/FilePreview/src/Components/pptView.vue'
import PDFView from '@/components/FilePreview/src/Components/pdfView.vue'
defineOptions({ name: 'TemplatePreview' })

const props = defineProps({
  disabled: {
    type: Boolean,
    default: false
  },
  url1:{
    type: String
  },
  fileName:{
    type: String
  },
  uploadConfig: {
    type: Object,
    default: () => ({})
  },
})
const formData=defineModel()

/**
 * 预览模板
 */
const previewUrl = ref('https://lg.joyintech.com/jupiter/plugins/pdfjs/web/viewer.html?file=/jupiter/pdf/preview/20250121102821395')
const fileType = ref('pdf')
const getFileType=(fileName)=>{
  if (!fileName) return '';
  //根据文件名提取后缀名
  const index = fileName.lastIndexOf('.');
  const ext = fileName.substr(index + 1).toLowerCase();
  const enumsFileType= {
    pdf: ['pdf'],
    excel: ['xlsx','xls'],
    word: ['docx', 'doc'],
    ppt: ['ppt', 'pptx'],
    video: ['mp4', 'avi', 'mov']
  };
  for (const key in enumsFileType) {
    if (enumsFileType[key].includes(ext)) {
      return key;
    }
  }
  return '';
}

/**
 * 打开预览弹框
 */
const previewDialogVisible = ref(false)
const handlePreview = () => {
  previewDialogVisible.value = true
  getPreviewUrl()
}

/**
 * 根据表单和接口获取模板预览
 */
const getPreviewUrl = () => {
  nextTick(()=>{
    viewRef.value.preview(props.previewUrl)
  })
}

/** 监听渲染完成 */
const frameRef = ref()
/**
 * iframe隐藏下载和上传按钮 但由于跨域拿不到document
 */
const handleLoad = () => {
  nextTick(()=>{
    let iframeDoc = frameRef.value.contentWindow;
    //跨域了
    console.log(iframeDoc.document,'iframeDoc');
    // 获取iframe里的元素
    // let elementInIframe = iframeDoc.top.document.getElementsByClassName('openFile')[0]
    // console.log(elementInIframe,'elementInIframe');
    
    // document.getElementsByClassName('iframe-show')[0].getElementsByClassName('openFile')[0].style.display = 'none'
  })
}

/** 下载 */
const handleDownload = () => {
  console.log(previewUrl.value,'========');
  downloadByUrl({
    url: previewUrl.value,
    target: '_blank',
    fileName: props.fileName
  })
}

/** 上传附件 */
const uploadDialogVisible = ref(false)
const uploadFile = ref({})
const handleUpload = () => {
  uploadFile.value = {}
  uploadDialogVisible.value = true
}
/** 处理上传成功 */
const handleUploadSuccess = (file) => {
  uploadFile.value = file
}
// 确认上传
const confirmUpload = async () => {
  if (!uploadFile.value) {
    ElMessage.warning('请先选择要上传的文件')
    return
  }
  try {
    // 预览新上传的文件
    previewUrl.value = uploadFile.value.url
    // 清空上传组件的文件列表
    uploadFile.value = {}
    uploadDialogVisible.value = false
    getFileType(uploadFile.value.fileName)
  } catch (error) {
    ElMessage.error('保存失败：' + error.message)
  }
}

//获取类型中文
const fileTypeOptions = ref([])
const viewRef = ref()
onMounted(async () => {
  try{
    fileTypeOptions.value = await fetchDataSetData('SJJ-CeShi')
  }catch{
    fileTypeOptions.value = []
  }
})
</script>

<style scoped lang="scss">
:deep(.el-input-group__prepend) {
  padding: 0;
}
:deep(.el-form-item__label){
  line-height: 32px;
  margin-bottom: 0px;
}
:deep(.el-dialog){
  margin-top: 50px !important;
}
</style>
