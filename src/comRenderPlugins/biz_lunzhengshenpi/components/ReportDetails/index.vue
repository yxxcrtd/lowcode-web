<template>
  <div class="def-group">
    <div class="report-list" v-if="isLoad">
      <div
        class="report-item"
        v-for="(report, index) in renderFormData['list_' + detailTable.tableId]"
        :key="'report-item' + index"
      >
        <el-form-item
          label=""
          label-width="0"
          :prop="`[list_${detailTable.tableId}][${index}].DETAIL_VALUE_${detailTable.tableId}`"
          :show-message="false"
          :rules="[{validator:(rule, value, callback)=>tableRowValidate(rule, value, callback,report,index), trigger: ['blur','change'] }]"
        >
          <div class="report-title">
            <span class="requird-span">*</span>
            {{ index + 1 }}、{{ report.title }}
            <span v-if="report.imgSrc">
              <el-link :icon="Picture" type="danger" @click="viewImgPreview(report)">查看示例</el-link>
            </span>
          </div>
          <div class="report-content">
            <div class="report-content-input">
              <el-radio-group v-model="report['DETAIL_VALUE_' + detailTable.tableId]" :disabled="isComDetail">
                <el-radio value="Y">是,已披露</el-radio>
                <el-radio value="N">否</el-radio>
                <el-radio value="O">其他</el-radio>
              </el-radio-group>
              <ace-input style="width: 600px" v-if="report['DETAIL_VALUE_' + detailTable.tableId]=='O' && !isComDetail" v-model="report['DETAIL_OTHER_REASON_' + detailTable.tableId]" ></ace-input>
              <span v-if="report['DETAIL_VALUE_' + detailTable.tableId]=='O' && isComDetail">{{ report['DETAIL_OTHER_REASON_' + detailTable.tableId] }}</span>
              <span class="error-msg" v-if="report.errorMsg">{{report.errorMsg}}</span>
            </div>
            <div class="attach-content">
              <vxe-table
                ref="vxeTableRef"
                :column-config="{ resizable: true }"
                border="inner"
                stripe
                align="center"
                :max-height="200"
                :min-height="34"
                :data="
                  renderFormData['list_' + detailAttachTable.tableId].filter(
                    (item) =>
                      item['REPORT_DETAIL_SORT_' + detailAttachTable.tableId] == report['SORT_' + detailTable.tableId]
                  )
                "
              >
                <vxe-column title="序号" width="60" align="center">
                  <template #default="{ rowIndex }">
                    {{ rowIndex + 1 }}
                  </template>
                </vxe-column>
                <vxe-column title="附件类型">
                  <template #default="{ row }">
                    {{ row['FILE_TYPE_TEXT_' + detailAttachTable.tableId] }}
                  </template>
                </vxe-column>
                <vxe-column title="附件名称">
                  <template #default="{ row }">
                    {{ row['FILE_NAME_' + detailAttachTable.tableId] }}
                  </template>
                </vxe-column>
                <vxe-column title="备注">
                  <template #default="{ row }">
                    <el-input v-if="!isComDetail" v-model="row['FILE_REMARK_' + detailAttachTable.tableId]"></el-input>
                    <span v-else>{{row['FILE_REMARK_' + detailAttachTable.tableId]}}</span>
                  </template>
                </vxe-column>
                <vxe-column title="操作" width="200">
                  <template #default="{ row, rowIndex }">
                    <div class="table-action">
                      <el-link type="primary"  v-if="!isComDetail" @click="openUploadDialog(report,row,rowIndex,row['FILE_TYPE_' + detailAttachTable.tableId],row['FILE_TYPE_TEXT_' + detailAttachTable.tableId])">上传</el-link>
                      <el-divider direction="vertical" v-if="!isComDetail"/>
                      <el-link type="primary" @click="handleDownload(row)">下载</el-link>
                      <el-divider direction="vertical" v-if="!isComDetail"/>
                      <el-link v-if="!isComDetail" type="primary" @click="handleDelete(row, rowIndex)">删除</el-link>
                    </div>
                  </template>
                </vxe-column>
                <template #empty>
                  <el-empty description="暂无数据" />
                </template>
              </vxe-table>
            </div>
            <div class="attachment-footer">
              <!-- 左侧上传按钮 -->
              <div class="left-actions" v-if="!isComDetail">
                <el-button type="primary" @click="openUploadDialog(report)">
                  <el-icon><Upload /></el-icon>
                  上传附件
                </el-button>
              </div>
            </div>
          </div>
        </el-form-item>
      </div>
    </div>
  </div>
  <el-image-viewer
    v-if="showPreview"
    :url-list="imgList"
    hide-on-click-modal
    show-progress
    @close="showPreview = false"
  />
  <!-- 上传对话框 -->
  <Dialog
    v-model="uploadDialogVisible"
    title="上传附件"
    width="500px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    @close="uploadDialogVisible = false"
    destroy-on-close
  >
    <el-form ref="uploadFormRef" :model="uploadForm" :rules="rules">
      <el-form-item label="附件类型" label-width="auto" prop="fileType">
        <SelectAttachmentType
          v-model="uploadForm.fileType"
          v-model:model-text="uploadForm.fileTypeText"
          class="mb-10px"
          :disabled="uploadForm.rowIndex!=null"
        />
      </el-form-item>
      <el-form-item label-width="0" prop="fileList">
        <UploadFile
          ref="uploadFileRef"
          style="width: 100%"
          v-model="uploadForm.fileList"
          v-bind="uploadConfig"
          upload-mode="immediate"
          :uploadParams="uploadParams"
          @update:model-value="handleUploadSuccess"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="uploadDialogVisible = false">取消</el-button>
      <el-button type="primary" :disabled="uploadFileRef?.uploadLoading" @click="confirmUpload">确定</el-button>
    </template>
  </Dialog>
</template>
<script setup>
import { computed, ref, watch } from 'vue'
import { Delete, Picture, Upload } from '@element-plus/icons-vue'
import SelectAttachmentType from '@/components-yt/biz/SelectAttachmentType/index.vue'
import UploadFile from '../../../../components/UploadFile/src/UploadFile.vue'
import { downloadByData, downloadByUrl } from '@/utils/filt'
import { cloneDeep } from 'lodash-es'
import { ElMessage, ElMessageBox } from 'element-plus'
import dayjs from 'dayjs'
import { detailDefaultData } from './data'

const renderFormData = defineModel()
const props = defineProps({
  groupItem: {
    type: Object
  },
  formGroups: {
    type: Array
  },
  instance:{
    type:Object
  },
  isDetail: {
    type: Boolean
  },
  flowNodeInfo:{
    type:Object
  }
})
const detailTable = ref(null)
const detailAttachTable = ref(null)
const isLoad=ref(false)
const showPreview=ref(false)
const imgList=ref([])
const initTable = () => {
  if (props.groupItem.formItems && props.groupItem.formItems.length) {
    detailTable.value = props.groupItem.formItems.find((item) => item.tableId == '1912753636423512066')
    detailAttachTable.value = props.groupItem.formItems.find((item) => item.tableId == '1912753636423512067')
  }
  setTimeout(() => {
    initTableData()
  },200)
}
initTable()

const isComDetail=computed(()=>{
  return props.isDetail || detailTable.value.tableItems.every(item=>!item.isRequire)
})

const initTableData = () => {
  const oriData = cloneDeep(renderFormData.value['list_' + detailTable.value.tableId])
  renderFormData.value['list_' + detailTable.value.tableId] = detailDefaultData.map((item) => {
    const oriItem = oriData.find((dataItem) => dataItem['SORT_' + detailTable.value.tableId] == item.index)
    return {
      ['SORT_' + detailTable.value.tableId]: item.index,
      ...oriItem,
      title:item.title,
      imgSrc:item.imgSrc
    }
  })
  renderFormData.value['list_' + detailTable.value.tableId].forEach(item => {
    if(!renderFormData.value['list_' + detailAttachTable.value.tableId].find((item1) =>
      item1['REPORT_DETAIL_SORT_' + detailAttachTable.value.tableId] == item['SORT_' + detailTable.value.tableId]
    ) && [1,2,3].includes(item['SORT_' + detailTable.value.tableId])){
      const obj = {}
      obj[`FILE_TYPE_TEXT_${detailAttachTable.value.tableId}`] = '信息披露/报告相关截图'
      obj[`FILE_TYPE_${detailAttachTable.value.tableId}`] = 'LEVEL2_1603'
      obj[`REPORT_DETAIL_SORT_${detailAttachTable.value.tableId}`] = item['SORT_' + detailTable.value.tableId]
      renderFormData.value['list_' + detailAttachTable.value.tableId].push({
        ...obj
      })
    }
  })
  isLoad.value=true
  console.log('renderFormData.value[\'list_\' + detailTable.value.tableId]',JSON.stringify(renderFormData.value['list_' + detailTable.value.tableId]))
}

const tableRowValidate=(rule, value, callback,report,index)=>{
  report.errorMsg=null
  //判断是否选择
  if(!report['DETAIL_VALUE_' + detailTable.value.tableId]){
    callback(new Error("请选择类型"))
    report.errorMsg="请选择类型"
    return;
  }
  if(report['DETAIL_VALUE_' + detailTable.value.tableId]=='O' && !report['DETAIL_OTHER_REASON_' + detailTable.value.tableId]){
    callback(new Error("请输入其他内容"))
    report.errorMsg="请输入其他内容"
    return;
  }
  callback()
}
const uploadDialogVisible = ref(false)

const uploadFormRef = ref()
const uploadFileRef = ref()
const uploadForm = ref({
  rowIndex: null,
  isRequire: false,
  fileType: null,
  fileTypeText: null,
  fileList: null
})
const uploadConfig = computed(() => {
  return {
    fileSize: 5,
    fileType: ['pdf', 'xlsx']
  }
})
const rules = reactive({
  fileType: [{ required: true, message: '请选择附件类型', trigger: 'change' }],
  fileList: [{ required: true, message: '请选择文件上传', trigger: 'change' }]
})
const uploadParams = computed(() => {
  return {
    natrualKeyId:'',
    projId:'',
    folderId:'1',
    dirCode:uploadForm.value.fileType,
    fileType:uploadForm.value.fileType,
    fileSource:'',
    index:1,
    uploadNode:props.flowNodeInfo?.name
  }
})

const viewImgPreview = async (report)=>{
  try{
    let image
    if(report.imgSrc === 'report1.png'){
      image = await import('@/assets/imgs/biz/reportdetail/report1.png')
    }else if(report.imgSrc === 'report2.png'){
      image = await import('@/assets/imgs/biz/reportdetail/report2.png')
    }if(report.imgSrc === 'report3.png'){
      image = await import('@/assets/imgs/biz/reportdetail/report3.png')
    }
    imgList.value=[image?.default]
    showPreview.value=true
    }catch(err){
      console.log('图片加载失败', err)
    }
}
// 处理下载
const handleDownload = (row) => {
  downloadByUrl({
    fileId: row['FILEID_' + detailAttachTable.value.tableId],
    target: '_blank',
    fileName: row['FILE_NAME_' + detailAttachTable.value.tableId]
  })
}

// 处理删除
const handleDelete = async (row, rowIndex) => {
  try {
    await ElMessageBox.confirm('确认要删除该文件吗？', '提示', {
      type: 'warning'
    })
    renderFormData.value['list_' + detailAttachTable.value.tableId] = renderFormData.value[
      'list_' + detailAttachTable.value.tableId
    ].filter((item) => item._X_ROW_KEY !== row._X_ROW_KEY)

    ElMessage.success('删除成功')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败：' + error.message)
    }
  }
}
const rowFileIndex = ref(null)
// 打开上传对话框
const openUploadDialog = (report,row,rowIndex,fileType = null,fileTypeText = null) => {
  rowFileIndex.value = rowIndex
  uploadForm.value = {
    rowId:row?._X_ROW_KEY,
    rowIndex:row?._X_ROW_KEY,
    sort: report['SORT_' + detailTable.value.tableId],
    fileType:fileType,
    fileTypeText:fileTypeText,
    attacheType: null,
    fileList: null
  }
  uploadDialogVisible.value = true
}

// 处理上传成功
const handleUploadSuccess = (files) => {
  uploadForm.value.fileList = files
  uploadFormRef.value.validateField('fileList')
}

// 确认上传
const confirmUpload = async () => {
  await uploadFormRef.value.validate()

  try {
    // 根据上传模式处理文件数据
    const newFiles = uploadForm.value.fileList.map((file) => {
      return {
        ['FILE_TYPE_' + detailAttachTable.value.tableId]: uploadForm.value.fileType,
        ['FILE_TYPE_TEXT_' + detailAttachTable.value.tableId]: uploadForm.value.fileTypeText,
        ['REPORT_DETAIL_SORT_' + detailAttachTable.value.tableId]: uploadForm.value.sort,
        ['FILE_NAME_' + detailAttachTable.value.tableId]: file.name,
        ['FILEID_' + detailAttachTable.value.tableId]: file.fileId,
        fileUrl: file.url,
        fileSize: file.size
      }
    })
    if(rowFileIndex.value !== null && rowFileIndex.value !== undefined){
      const arr = renderFormData.value['list_' + detailAttachTable.value.tableId].filter(
        (item) =>
          item['REPORT_DETAIL_SORT_' + detailAttachTable.value.tableId] == uploadForm.value.sort
      )
      arr.splice(rowFileIndex.value,1)
      arr.splice(rowFileIndex.value,0,...newFiles)
      renderFormData.value['list_' + detailAttachTable.value.tableId] = renderFormData.value['list_' + detailAttachTable.value.tableId].filter(
        (item) =>
          item['REPORT_DETAIL_SORT_' + detailAttachTable.value.tableId] !== uploadForm.value.sort
      ).concat(arr)
    }else{
      renderFormData.value['list_' + detailAttachTable.value.tableId].push(...newFiles)
    }

    // 清空上传组件的文件列表
    uploadForm.value.fileList.value = []
    uploadForm.value.rowIndex = null
    uploadDialogVisible.value = false
  } catch (error) {
    console.log(error)
    ElMessage.error('保存失败：' + error.message)
  }
}
</script>
<style lang="scss" scoped>
.report-item {
  :deep(.el-form-item__content) {
    display: block;
  }
  .report-content-input{
    display: flex;
    :deep(.el-radio-group){
      width:260px;
    }
  }
}
.error-msg{
  font-size: 12px;
  color:#f56c6c;
}
.report-title {
  font-size: 14px;
  margin-bottom: 5px;
}
.report-content {
  padding-left: 40px;
}
.attach-content {
  margin-top: 15px;
}
.attachment-footer {
  margin: 10px 0;
}
</style>
