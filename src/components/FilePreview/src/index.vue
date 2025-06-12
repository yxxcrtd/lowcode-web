<template>
  <template v-if="fileType">
    <ImgView ref="viewRef" v-if="fileType=='image'" @close="closed"></ImgView>
    <Dialog v-else :title="title" v-model="dialogVisible" width="80vw" class="preview-dialog" top="5vh" @closed="closed">
      <div class="dialog-wrap">
        <WordView ref="viewRef" v-if="fileType=='word'"></WordView>
        <ExcelView ref="viewRef" v-if="fileType=='excel'"></ExcelView>
        <PDFView ref="viewRef" v-if="fileType=='pdf'"></PDFView>
        <PPTView ref="viewRef" v-if="fileType=='ppt'"></PPTView>
      </div>
    </Dialog>
  </template>
</template>
<script lang="ts" setup>
import { ref } from 'vue'
import WordView from './Components/wordView.vue'
import ExcelView from './Components/excelView.vue'
import PPTView from './Components/pptView.vue'
import PDFView from './Components/pdfView.vue'
import ImgView from './Components/imgView.vue'
import { useSysConfigStore } from '@/store/modules/sysConfig'
import { config } from '@/config/axios/config'
import * as FileApi from '@/api/infra/file'
const { business_url } = config
defineOptions({ name: 'FilePreview' })

let title = '预览'
const message=useMessage()
const dialogVisible = ref(false)
const fileType=ref('word')
const viewRef=ref()

/** 打开弹窗 */
const open = async (fileName, file) => {
  dialogVisible.value = true
  fileType.value=getFileType(fileName)
  await nextTick()
  if(fileType.value){
    const sysConfigStore = useSysConfigStore()
  //泛微下载文件请求
  if(sysConfigStore.getSysParamter?.downloadService === '业务'){
    FileApi.downloadFileBusiness( file )
      .then((res) => {
      if (!res) {
        console.log(res?.message || '文件打开失败')
        return
      }
      viewRef.value.preview(new URL(business_url).origin + res.result)
    })
    .catch((res) => {
      console.log(res);
    })
  }else{
    viewRef.value.preview(file)
  }
    
  }else{
    message.warning("无法识别的文件类型")
  }
}
const getFileType=(fileName)=>{
  if (!fileName) return '';
  //根据文件名提取后缀名
  const index = fileName.lastIndexOf('.');
  const ext = fileName.substr(index + 1).toLowerCase();
  const enumsFileType= {
    image: ['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'svg', 'tiff'],
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
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

const closed=()=>{
  fileType.value=''
}
</script>
<style scoped lang="scss">

</style>
<style lang="scss">
.preview-dialog{
  .dialog-wrap{
    height: 78vh;
  }
  &.is-fullscreen{
    .dialog-wrap{
      height: 100%;
    }
  }
  .el-dialog__body{
    max-height: calc(100vh - 60Px);
    padding: 0 !important;
  }
}
</style>
