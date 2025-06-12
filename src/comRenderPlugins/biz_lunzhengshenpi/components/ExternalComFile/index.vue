<template>
  <div class="form-table-item">
    <vxe-table
      ref="vxeTableRef"
      :column-config="{resizable: true}"
      border="inner"
      stripe
      align="center"
      :max-height="200"
      :data="renderFormData['list_' + curTable.tableId]"
    >
      <vxe-column title="序号" width="60" align="center">
        <template #default="{ rowIndex }">
          {{ rowIndex + 1 }}
        </template>
      </vxe-column>
      <vxe-column title="文件类型" width="120">
        <template #default="{ row }">
          <div style="display: flex;align-items: center;">
            <ace-ellipsis :line="1">
              {{row[fieldMap.fileTypeText]}}
            </ace-ellipsis>
          </div>
        </template>
      </vxe-column>
      <vxe-column title="文件标题" width="260">
        <template #header>
          <span v-show="titleState.isRequire" class="used_file_require_flag">*</span>文件标题
        </template>
        <template #default="{ row }">
          <div v-if="isComDetail || titleState.isDisabled" style="display: flex;align-items: center;">
            <ace-ellipsis :line="1">
              {{row[fieldMap.title]}}
            </ace-ellipsis>
          </div>
          <el-form-item
            label-width="0"
            v-else
            :prop="`['list_${curTable.tableId}'][${rowIndex}].${fieldMap.title}`"
            :rules="titleState.isRequire?[{validator:(rule, value, callback)=>tableTitleValidate(rule, value, callback,row,rowIndex), trigger: ['blur','change'] }]:[]"
          >
            <el-input maxlength="200" v-model="row[fieldMap.title]"></el-input>
          </el-form-item>
        </template>
      </vxe-column>
      <vxe-column title="上传原文件" width="400">
        <template #header>
          <span v-show="originalFileFormState.isRequire" class="used_file_require_flag">*</span>上传原文件
        </template>
        <template #default="{ row,rowIndex }">
          <el-form-item label-width="0"
            :prop="`['list_${curTable.tableId}'][${rowIndex}].${fieldMap.originalFile}`"
            :rules="originalFileFormState.isRequire?[{validator:(rule, value, callback)=>tableRowValidate(rule, value, callback,row,rowIndex), trigger: ['blur','change'] }]:[]">
            <div class="row-file">
              <div class="file-title">
                <ace-ellipsis :line="1">
                  {{row[fieldMap.originalFileName]}}
                </ace-ellipsis>
              </div>
              <div class="action" v-if="row[fieldMap.originalFile]">
                <el-link type="primary" @click="toPreview(row,'orig')">预览</el-link>
                <el-link type="primary" @click="handleDownload(row,'orig')">下载</el-link>
                <el-link type="primary" v-if="!isDetail && !originalFileFormState.isDisabled" @click="handleDelete(row,'orig',rowIndex)">删除</el-link>
              </div>
              <div class="action" v-else>
                <el-link type="primary" v-if="!isDetail && !originalFileFormState.isDisabled" @click="openUploadDialog(row,'orig')">上传</el-link>
              </div>
            </div>
          </el-form-item>
        </template>
      </vxe-column>
      <vxe-column title="上传信披文件" width="400">
        <template #header>
          <span v-show="letterDocumentFormState.isRequire" class="used_file_require_flag">*</span>上传信披文件
        </template>
        <template #default="{ row, rowIndex }">
          <el-form-item
            label-width="0"
            :prop="`['list_${curTable.tableId}'][${rowIndex}].${fieldMap.letterDocument}`"
            :rules="letterDocumentFormState.isRequire?[{validator:(rule, value, callback)=>tableRowUsedFileValidate(rule, value, callback,row,rowIndex), trigger: ['blur','change'] }]:[]"
          >
            <div class="row-file">
              <div class="file-title">
                <ace-ellipsis :line="1">
                  {{row[fieldMap.letterDocumentName]}}
                </ace-ellipsis>
              </div>
              <div class="action" v-if="row[fieldMap.letterDocument]">
                <el-link type="primary" @click="toPreview(row,'used')">预览</el-link>
                <el-link type="primary" @click="handleDownload(row,'used')">下载</el-link>
                <el-link type="primary" v-if="!isDetail && !letterDocumentFormState.isDisabled" @click="handleDelete(row,'used',rowIndex)">删除</el-link>
              </div>
              <div class="action" v-else>
                <el-link type="primary" v-if="!isDetail && !letterDocumentFormState.isDisabled" @click="openUploadDialog(row,'used')">上传</el-link>
              </div>
            </div>
          </el-form-item>
        </template>
      </vxe-column>
      <vxe-column title="用印份数" width="140">
        <template #default="{ row }">
          <div v-if="isComDetail || sealNumState" style="display: flex;align-items: center;">
            <ace-ellipsis :line="1">
              {{row[fieldMap.sealNum]}}
            </ace-ellipsis>
          </div>
          <ace-input-number v-else :decimal-limit="0" v-model="row[fieldMap.sealNum]"></ace-input-number>
        </template>
      </vxe-column>
      <vxe-column title="备注" min-width="130">
        <template #default="{ row }">
          <div v-if="isComDetail || remarkState" style="display: flex;align-items: center;">
            <ace-ellipsis :line="1">
              {{row[fieldMap.remark]}}
            </ace-ellipsis>
          </div>
          <el-input maxlength="100" v-else v-model="row[fieldMap.remark]"></el-input>
        </template>
      </vxe-column>
      <template #empty>
        <el-empty description="暂无数据"/>
      </template>
    </vxe-table>
    <div class="attachment-footer">
      <!-- 左侧上传按钮 -->
      <div class="left-actions" v-if="!isDetail && !originalFileFormState.isDisabled">
        <el-button type="primary" @click="openUploadDialog">
          <el-icon><Upload /></el-icon>
          上传附件
        </el-button>
      </div>
    </div>
  </div>
  <!-- 上传对话框 -->
  <Dialog
    v-model="uploadDialogVisible"
    title="上传附件"
    width="500px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    @close="uploadDialogVisible=false"
    destroy-on-close
  >
    <el-form ref="uploadFormRef" :model="uploadForm" :rules="rules">
      <el-form-item label="附件类型" label-width="auto" prop="fileType">
        <SelectAttachmentType v-model="uploadForm.fileType" :filterFileType="filterFileType" v-model:model-text="uploadForm.fileTypeText" :disabled="uploadForm.rowIndex!=null" class="mb-10px"/>
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
import {computed, ref, watch} from 'vue'
import AceEllipsis from '@/components/ace/ace-ellipsis/index.vue'
import {Delete, Download, Upload} from "@element-plus/icons-vue";
import SelectAttachmentType from "@/components-yt/biz/SelectAttachmentType/index.vue";
import UploadFile from "../../../../components/UploadFile/src/UploadFile.vue";
import {downloadByData, downloadByUrl} from "@/utils/filt";
import {ElMessage, ElMessageBox} from "element-plus";
import dayjs from "dayjs";
import {useUserStore} from "@/store/modules/user";
import request from '@/config/axios'
const userStore=useUserStore()
const route=useRoute()
const renderFormData=defineModel()
const props=defineProps({
  groupItem:{
    type:Object
  },
  formGroups:{
    type: Array,
  },
  isDetail: {
    type:Boolean
  },
  flowNodeInfo:{
    type:Object
  }
})

const curTable=ref({})
const filterFileType = ref([])
const initTable=()=>{
  if(props.groupItem.formItems && props.groupItem.formItems.length){
    curTable.value=props.groupItem.formItems[0] || {}
  }
  console.log('curTable----------------',curTable,renderFormData)
}
initTable()
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
const isComDetail=computed(()=>{
  return props.isDetail || curTable.value.tableItems?.every(item=>!item.isRequire)
})

const fieldMap={
  title:'TITLE_'+curTable.value.tableId,//附件标题
  originalFile:'ORIGINAL_FILE_'+curTable.value.tableId,//未用印附件文件id
  originalFileName:'ORIGINAL_FILE_NAME_'+curTable.value.tableId,//未用印附件文件名称
  letterDocument:'LETTER_DOCUMENT_'+curTable.value.tableId,//已用印附件文件id
  letterDocumentName:'LETTER_DOCUMENT_NAME_'+curTable.value.tableId,//已用印附件文件名称
  sealNum:'SEAL_NUM_'+curTable.value.tableId,//用印份数
  remark:'REMARK_'+curTable.value.tableId,//备注
  fileType:'FILE_TYPE_'+curTable.value.tableId, //附件类型
  fileTypeText:'FILE_TYPE_TEXT_'+curTable.value.tableId //附件类型
}

const setDefaultAttachmentInfo=()=>{
  //产品成立公告
  if(props.groupItem.pageId=='1888847186638958593'){
    if(renderFormData.value['list_' + curTable.value.tableId] && renderFormData.value['list_' + curTable.value.tableId].length){
      (renderFormData.value['list_' + curTable.value.tableId].find(item => item[`FILE_TYPE_${curTable.value.tableId}`] === "LEVEL2_1601") || {}).isRequire = true
    }else{
      renderFormData.value['list_' + curTable.value.tableId]=[{}]
      renderFormData.value['list_' + curTable.value.tableId][0]["isRequire"]= true
      renderFormData.value['list_' + curTable.value.tableId][0][`FILE_TYPE_${curTable.value.tableId}`]= "LEVEL2_1601"
      renderFormData.value['list_' + curTable.value.tableId][0][`FILE_TYPE_TEXT_${curTable.value.tableId}`]= "信息披露 / 成立公告"
    }
    //首节点3693 资金管理资产运营
  }else if(props.groupItem.pageId=='1904435256075612161'){
    filterFileType.value = ['LEVEL2_1601','LEVEL2_1602','LEVEL2_1603','LEVEL2_1604','LEVEL2_1605','LEVEL2_1606','LEVEL2_1607','LEVEL2_1608','LEVEL2_1609','LEVEL2_1611','LEVEL2_1610']
    // 兑付公告审批
  } else if(props.groupItem.pageId=='1881240727470292994'){
    if(renderFormData.value['list_' + curTable.value.tableId] && renderFormData.value['list_' + curTable.value.tableId].length){
      (renderFormData.value['list_' + curTable.value.tableId].find(item => item[`FILE_TYPE_${curTable.value.tableId}`] === "LEVEL2_1605") || {}).isRequire = true
    }else{
      renderFormData.value['list_1922940892253880322']=[
        {
          isRequire:true,
          FILE_TYPE_1922940892253880322:"LEVEL2_1605",
          FILE_TYPE_TEXT_1922940892253880322:"信息披露 / 兑付公告",
        }
      ]
    }
    //关联交易信息披露审批 
  } else if(props.groupItem.pageId=='1876528510971789314'){
    if(renderFormData.value['list_' + curTable.value.tableId] && renderFormData.value['list_' + curTable.value.tableId].length){
      (renderFormData.value['list_' + curTable.value.tableId].find(item => item[`FILE_TYPE_${curTable.value.tableId}`] === "LEVEL2_1611") || {}).isRequire = true
    }else{
      renderFormData.value['list_1922951504761552898']=[
        {
          isRequire:true,
          FILE_TYPE_1922951504761552898:"LEVEL2_1611",
          FILE_TYPE_TEXT_1922951504761552898:"信息披露 / 关联交易信息披露",
        }
      ]
    }
    // 临时信息披露
  } else if(props.groupItem.pageId=='1914565883139514369'){
    if(renderFormData.value['list_' + curTable.value.tableId] && renderFormData.value['list_' + curTable.value.tableId].length){
      (renderFormData.value['list_' + curTable.value.tableId].find(item => item[`FILE_TYPE_${curTable.value.tableId}`] === "LEVEL2_1604") || {}).isRequire = true
    }else{
      renderFormData.value['list_1922954527734857729']=[
        {
          isRequire:true,
          FILE_TYPE_1922954527734857729:"LEVEL2_1604",
          FILE_TYPE_TEXT_1922954527734857729:"信息披露 / 临时信息披露",
        }
      ]
    }
    // 清算报告
  } else if(props.groupItem.pageId=='1909583387704500225'){
    if(renderFormData.value['list_' + curTable.value.tableId] && renderFormData.value['list_' + curTable.value.tableId].length){
      (renderFormData.value['list_' + curTable.value.tableId].find(item => item[`FILE_TYPE_${curTable.value.tableId}`] === "LEVEL2_1606") || {}).isRequire = true
    }else{
      renderFormData.value['list_1922950652319596546']=[
        {
          isRequire:true,
          FILE_TYPE_1922950652319596546:"LEVEL2_1606",
          FILE_TYPE_TEXT_1922950652319596546:"信息披露 / 清算报告",
        }
      ]
    }
  }  
}
// 响应外部值变化 资金管理资产运营
watch(() => renderFormData.value?.['1887415370883379202']?.['PROPERTY_NATURE_1887415370883379202'], (val) => {
  //获取反显数据
  if(props.groupItem.pageId=='1904435256075612161' && (route.query.nodeId==='3693' || route.query.pageType === 'create')){
    if(renderFormData.value?.['1887415370883379202']?.['PROPERTY_NATURE_1887415370883379202'] === '1'){
      if(renderFormData.value['list_1922949695363973121'] && renderFormData.value['list_1922949695363973121'].length){
        (renderFormData.value['list_1922949695363973121'].find(item => item.FILE_TYPE_1922949695363973121  === 'LEVEL2_1602') || {}).isRequire = true
      }else{
        renderFormData.value['list_1922949695363973121']=[
          {
            isRequire:true,
            FILE_TYPE_1922949695363973121:"LEVEL2_1602",
            FILE_TYPE_TEXT_1922949695363973121:"信息披露 / 资金管理报告",
          }
        ]
      }
    }else if(renderFormData.value?.['1887415370883379202']?.['PROPERTY_NATURE_1887415370883379202'] === '2'){
      if(renderFormData.value['list_1922949695363973121'] && renderFormData.value['list_1922949695363973121'].length){
        if(renderFormData.value['list_1922949695363973121'] && renderFormData.value['list_1922949695363973121'].length){
          (renderFormData.value['list_1922949695363973121'].find(item => item.FILE_TYPE_1922949695363973121 === 'LEVEL2_1608') || {}).isRequire = true
        }
      }else{
        renderFormData.value['list_1922949695363973121']=[
          {
            isRequire:true,
            FILE_TYPE_1922949695363973121:"LEVEL2_1608",
            FILE_TYPE_TEXT_1922949695363973121:"信息披露 / 资产运营报告",
          }
        ]
      }
    }
  }
}, { immediate: true,deep:true })

//给isRequire赋值防止删除全删
watch(() => renderFormData.value['list_' + curTable.value.tableId],() => {
  if(renderFormData.value['list_' + curTable.value.tableId] && renderFormData.value['list_' + curTable.value.tableId].length){
    setDefaultAttachmentInfo()
  }
}, { immediate: true,deep:true })

if(props.groupItem.pageId=='1888847186638958593' && (route.query.nodeId==='3573' || route.query.pageType === 'create')){
  //3573 产品成立
  setDefaultAttachmentInfo()
}else if(props.groupItem.pageId=='1904435256075612161' && (route.query.nodeId==='3693' || route.query.pageType === 'create')){
  //首节点3693 资金管理资产运营
  setDefaultAttachmentInfo()
}else if(props.groupItem.pageId=='1881240727470292994' && (route.query.nodeId==='3038' || route.query.pageType === 'create')){
  //首节点3038 兑付公告审批
  setDefaultAttachmentInfo()
}else if(props.groupItem.pageId=='1876528510971789314' && (route.query.nodeId==='2036' || route.query.pageType === 'create')){
  //首节点2036 关联交易信息披露审批
  setDefaultAttachmentInfo()
}else if(props.groupItem.pageId=='1914565883139514369' && (route.query.nodeId==='2323' || route.query.pageType === 'create')){
  //首节点2323 临时信息披露
  setDefaultAttachmentInfo()
}else if(props.groupItem.pageId=='1909583387704500225' && (route.query.nodeId==='3736' || route.query.pageType === 'create')){
  //首节点3736 清算报告
  setDefaultAttachmentInfo()
}
const originalFileFormState=computed(()=>{ 
  const item = curTable.value.tableItems?.find(item=>item.columnName=='ORIGINAL_FILE') || {}
  return {
    isDisabled:item.isDisabled,
    isRequire:item.isRequire
  }
})
const letterDocumentFormState=computed(()=>{
  const item = curTable.value.tableItems?.find(item=>item.columnName=='LETTER_DOCUMENT') || {}
  return {
    isDisabled:item.isDisabled,
    isRequire:item.isRequire
  }
})
const sealNumState=computed(()=>{
  return (curTable.value.tableItems?.find(item=>item.columnName=='SEAL_NUM') || {}).isDisabled
})
const remarkState=computed(()=>{
  return (curTable.value.tableItems?.find(item=>item.columnName=='REMARK') || {}).isDisabled
})
const titleState=computed(()=>{
  const item = curTable.value.tableItems?.find(item=>item.columnName=='TITLE') || {}
  return {
    isDisabled:item.isDisabled,
    isRequire:item.isRequire
  }
})

const uploadDialogVisible=ref(false)

const uploadFormRef=ref()
const uploadForm=ref({
  rowIndex:null,
  isRequire:false,
  fileType:null,
  fileTypeText:null,
  fileList:null
})
const uploadConfig=computed(()=>{
  return {
    fileSize:5,
    fileType:['pdf','xlsx'],
  }
})
const rules = reactive({
  fileType: [{ required: true, message: '请选择附件类型', trigger: 'change' }],
  fileList: [{ required: true, message: '请选择文件上传', trigger: 'change' }],
})

const toPreview = async (fileItem,type)=>{
  let fileId = ''
  if(type === 'orig'){
    fileId = fileItem[fieldMap.originalFile]
  }else{
    fileId = fileItem[fieldMap.letterDocument]
  }
  if(fileId){
    const res = await request.get({ url:`ibps/system/fileManage/getPcBrowseUrl?fileId=${fileId}`})
    if(res){
        window.open(res)
    }
  }else{
      this.$proMessage.warning('请先上传附件')
  }
}

// 处理下载
const handleDownload = (row,fileType) => {
  let fileId=null,fileName=null
  if(fileType==='orig'){
    fileId=row[fieldMap.originalFile]
    fileName=row[fieldMap.originalFileName]
  }else{
    fileId=row[fieldMap.letterDocument]
    fileName=row[fieldMap.letterDocumentName]
  }
  downloadByUrl({
    fileId: fileId,
    target: '_blank',
    fileName: fileName
  })
}
const tableTitleValidate=(rule, value, callback,row,rowIndex)=>{
  if(!row[fieldMap.title]){
    callback(new Error('请输入标题'))
    return
  }else{
    callback()
  }
}
const tableRowValidate=(rule, value, callback,row,rowIndex)=>{
  if(!row[fieldMap.originalFile]){
    callback(new Error('请上传附件'))
    return
  }else{
    callback()
  }
}
const tableRowUsedFileValidate=(rule, value, callback,row,rowIndex)=>{
  if(!row[fieldMap.letterDocument]){
    callback(new Error('请上传附件'))
    return
  }else{
    callback()
  }
}
// 处理删除
const handleDelete = async (row,fileType,rowIndex) => {
  try {
    await ElMessageBox.confirm('确认要删除该文件吗？', '提示', {
      type: 'warning'
    })
    await request.post({ url: `/ibps/system/fileManage/commonFileDel?fileId=${fileType=='orig'?row[fieldMap.originalFile]:row[fieldMap.letterDocument]}`})
    if(fileType=='orig'){
      if(row.isRequire){
        row[fieldMap.originalFile]=null
        row[fieldMap.originalFileName]=null
      }else{
        renderFormData.value['list_' + curTable.value.tableId].splice(rowIndex,1)
      }
    }else{
      row[fieldMap.letterDocument]=null
      row[fieldMap.letterDocumentName]=null
    }

    ElMessage.success('删除成功')
    refresh(true)
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败：' + error.message)
    }
  }
}
const vxeTableRef=ref()
const refresh = (bool = false) => {
  //vxeTableRef.value?.refresh(bool)
}
// 打开上传对话框
const uploadFileRef = ref()
const openUploadDialog = (row,rowType) => {
  console.log(row)
  uploadForm.value={
    rowId:row?._X_ROW_KEY,
    rowIndex:row?._X_ROW_KEY,
    rowType:rowType,
    fileType:row?row[fieldMap.fileType] : null,
    fileTypeText:row?row[fieldMap.fileTypeText] : null,
    fileList:null
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
    if(uploadForm.value.rowId){
      const rowItem=renderFormData.value['list_' + curTable.value.tableId].find(item=>item._X_ROW_KEY==uploadForm.value.rowId)
      const fileItem=uploadForm.value.fileList[0]
      if(uploadForm.value.rowType=='orig'){
        rowItem[fieldMap.originalFile]=fileItem.fileId
        rowItem[fieldMap.originalFileName]=fileItem.name
      }else{
        rowItem[fieldMap.letterDocument]=fileItem.fileId
        rowItem[fieldMap.letterDocumentName]=fileItem.name
      }
      if(rowItem[fieldMap.sealNum]==null || rowItem[fieldMap.UseNum]==''){
        rowItem[fieldMap.sealNum]=0
      }
    }else{
      // 根据上传模式处理文件数据
      const newFiles = uploadForm.value.fileList.map(file => {
        return {
          [fieldMap.fileType]:uploadForm.value.fileType,
          [fieldMap.fileTypeText]:uploadForm.value.fileTypeText,
          [fieldMap.originalFile]:file.fileId,
          [fieldMap.originalFileName]:file.name,
          [fieldMap.sealNum]:0,
          uploadUserId:userStore.getUser.id,
          uploadUserText:userStore.getUser.nickname,
          uploadTime:dayjs().format('YYYY-MM-DD HH:mm:ss'),
        }
      })
      renderFormData.value['list_' + curTable.value.tableId].push(...newFiles)
    }
    

    // 清空上传组件的文件列表
    uploadForm.value.fileList.value = []
    uploadForm.value.rowIndex=null
    uploadForm.value.isRequire=false
    uploadDialogVisible.value = false

    // 刷新表格数据
    refresh(true)
  } catch (error) {
    console.log(error)
    ElMessage.error('保存失败：' + error.message)
  }
}
</script>
<style lang="scss" scoped>

.row-file{
  width:100%;
  display: flex;
  .file-title{
    flex: 1;
    text-align:left;
    height: 32px;
  }
  .action{
    display: flex;
    .el-link{
      margin-left: 10px;
    }
  }
}
.attachment-footer{
  margin:10px 0 20px;
}
.used_file_require_flag {
  color: var(--el-color-danger);
}
.form-table-item{
  :deep(.vxe-body--row){
    height: 55px !important;
  }
}
</style>
