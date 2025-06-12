<!--
 * @Description: 附件上传统一组件
 * @Author: hujinge
 * @Date: 2024-12-09
 * 
 * 功能：
 * 1. commonAttachment 普通上传（支持上传指定格式的文件、支持下载、预览等）
 * 2. appointAttachment 指定上传（指定文件名上传，列出具体文件名，按照文件名上传文件，并支持上传其他文件）
 * 3. selectAttachment 选择上传（可通过下拉框选择固定类型的文件，并支持上传其他文件）
-->

<template>
  <Appointment
    v-if="attachmentInfo.attachmentType == 'appointAttachment'"
    ref="attachmentTableRef"
    v-model="fileList"
    v-bind="$attrs"
    :isDetail="isDetail"
    :attachmentInfo="attachmentInfo"
  ></Appointment>
  <SelectAttachment
    v-else-if="attachmentInfo.attachmentType == 'selectAttachment'"
    ref="attachmentTableRef"
    v-model="fileList"
    v-bind="$attrs"
    :isDetail="isDetail"
    :attachmentInfo="attachmentInfo"
  ></SelectAttachment>
  <TableAttachment 
    v-else-if="attachmentInfo.attachmentType == 'tableAttachment'" 
    ref="attachmentTableRef" 
    v-model="fileList" 
    v-bind="$attrs"
    :isDetail="isDetail"
    :attachmentInfo="attachmentInfo"
  ></TableAttachment>
  <CommonAttachment v-else ref="attachmentTableRef" v-model="fileList" v-bind="$attrs" :isDetail="isDetail" :attachmentInfo="attachmentInfo"></CommonAttachment>
</template>

<script setup lang="jsx" name="Attachment">
import { ref, computed, onBeforeUnmount } from 'vue'
import CommonAttachment from './CommonAttachment.vue'
import TableAttachment from './TableAttachment.vue'
import Appointment from './AppointAttachment.vue'
import SelectAttachment from './SelectAttachment.vue'

// ================ Props 定义 ================
const props = defineProps({
  // 附件模式
  attachmentInfo: {
    type: Object,
    default: () => {}
  },
  // 附件数据源
  modelValue: {
    type: Array,
    default: () => []
  }
})

// ================ Emits 定义 ================
const emit = defineEmits(['update:modelValue', 'change'])

const route=useRoute()

// ================ 组件状态 ================
const fileList = computed({
  get: () => {
    return props.modelValue
  },
  set: (val) => {
    emit('update:modelValue', val)
  }
})

const pageType=route.query.pageType;
const isDetail=route.query.pageType=='detail'

const initFileList=()=>{
  if(props.attachmentInfo.attachmentType==='appointAttachment'){
    fileList.value=props.attachmentInfo.uploadFileList.map(item=>{
      return {
        title:item.paramName,
        fileCount:1,
        fileType:'xls,ppt',
        fileSize:10,
        isRequire:item.isRequire,
        isValidName:item.isValidFileName,
        fileList:[
        ]
      }
    })
  }
}
initFileList()
const attachmentTableRef = ref()
</script>

<style lang="scss" scoped></style>
