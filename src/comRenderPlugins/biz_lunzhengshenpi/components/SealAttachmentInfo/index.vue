<template>
  <div class="form-table-item">
    <vxe-table
      ref="vxeTableRef"
      :column-config="{resizable: true}"
      border="inner"
      stripe
      align="center"
      :min-height="34"
      :data="renderFormData['list_' + curTable.tableId]"
    >
      <vxe-column title="序号" width="60" align="center">
        <template #default="{ rowIndex }">
          {{ rowIndex + 1 }}
        </template>
      </vxe-column>
      <vxe-column title="附件类型" width="260">
        <template #default="{ row }">
          <span class="requird-span" v-if="row.isRequire">*</span>
          {{row[fieldMap.AttachmentTypeText]}}
        </template>
      </vxe-column>
      <vxe-column title="上传原用印文件" width="400">
        <template #default="{ row,rowIndex }">
          <el-form-item
label-width="0"
                        :prop="`['list_${curTable.tableId}'][${rowIndex}].${fieldMap.UploadOrigFile}`"
                        :rules="[{validator:(rule, value, callback)=>tableRowValidate(rule, value, callback,row,rowIndex), trigger: ['blur','change'] }]">
            <div class="row-file">
              <div class="file-title">{{row[fieldMap.UploadOrigFileName]}}</div>
              <div class="action" v-if="row[fieldMap.UploadOrigFile]">
                <el-link type="primary" @click="toPreview(row,'orig')">预览</el-link>
                <el-link type="primary" @click="handleDownload(row,'orig')">下载</el-link>
                <el-link type="primary" v-if="!uploadOriFileFormState" @click="handleDelete(row,'orig',rowIndex)">删除</el-link>
              </div>
              <div class="action" v-else>
                <el-link type="primary" v-if="!isDetail && !uploadOriFileFormState" @click="openUploadDialog(row,'orig')">上传</el-link>
              </div>
            </div>
          </el-form-item>
        </template>
      </vxe-column>
      <vxe-column title="上传已用印文件" width="400">
        <template #header>
          <span v-show="!uploadUseFileFormState" class="used_file_require_flag">*</span>上传已用印文件
        </template>
        <template #default="{ row, rowIndex }">
          <el-form-item
            label-width="0"
            :prop="`['list_${curTable.tableId}'][${rowIndex}].${fieldMap.UploadUsedFile}`"
            :rules="[{validator:(rule, value, callback)=>tableRowUsedFileValidate(rule, value, callback,row,rowIndex), trigger: ['blur','change'] }]"
          >
            <div class="row-file">
              <div class="file-title">{{row[fieldMap.UploadUsedFileName]}}</div>
              <div class="action" v-if="row[fieldMap.UploadUsedFile]">
                <el-link type="primary" @click="toPreview(row,'used')">预览</el-link>
                <el-link type="primary" @click="handleDownload(row,'used')">下载</el-link>
                <el-link type="primary" v-if="!isDetail && !uploadUseFileFormState" @click="handleDelete(row,'used',rowIndex)">删除</el-link>
              </div>
              <div class="action" v-else>
                <el-link type="primary" v-if="!uploadUseFileFormState" @click="openUploadDialog(row,'used')">上传</el-link>
              </div>
            </div>
          </el-form-item>
        </template>
      </vxe-column>
      <vxe-column title="用印份数" width="140">
        <template #default="{ row }">
          <span v-if="useNumState">{{row[fieldMap.UseNum]}}</span>
          <ace-input-number v-else :decimal-limit="0" v-model="row[fieldMap.UseNum]"></ace-input-number>
        </template>
      </vxe-column>
      <vxe-column title="备注" min-width="130">
        <template #default="{ row }">
          <span v-if="remarkState">{{row[fieldMap.Remark]}}</span>
          <el-input maxlength="100" v-else v-model="row[fieldMap.Remark]"></el-input>
        </template>
      </vxe-column>
      <template #empty>
        <el-empty description="暂无数据"/>
      </template>
    </vxe-table>
    <div class="attachment-footer">
      <!-- 左侧上传按钮 -->
      <div class="left-actions" v-if="!isDetail && !uploadOriFileFormState">
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
        <SelectAttachmentType v-model="uploadForm.fileType" v-model:model-text="uploadForm.fileTypeText" :disabled="uploadForm.rowIndex!=null" class="mb-10px"/>
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
const initTable=()=>{
  if(props.groupItem.formItems && props.groupItem.formItems.length){
    curTable.value=props.groupItem.formItems[0] || {}
  }
  console.log('curTable',curTable,renderFormData)
}
initTable()

const isComDetail=computed(()=>{
  return props.isDetail || curTable.value.tableItems?.every(item=>!item.isRequire)
})

const fieldMap={
  AttachmentType:'ATTACHMENT_TYPE_'+curTable.value.tableId,//附件类型
  AttachmentTypeText:'ATTACHMENT_TYPE_TEXT_'+curTable.value.tableId,//附件类型中文
  UploadOrigFile:'UPLOAD_ORIG_FILE_'+curTable.value.tableId,//未用印附件文件id
  UploadOrigFileUrl:'UPLOAD_ORIG_FILE_URL_'+curTable.value.tableId,//未用印附件文件url
  UploadOrigFileName:'UPLOAD_ORIG_FILE_NAME_'+curTable.value.tableId,//未用印附件文件名称
  UploadUsedFile:'UPLOAD_USED_FILE_'+curTable.value.tableId,//已用印附件文件id
  UploadUsedFileUrl:'UPLOAD_USED_FILE_URL_'+curTable.value.tableId,//已用印附件文件url
  UploadUsedFileName:'UPLOAD_USED_FILE_NAME_'+curTable.value.tableId,//已用印附件文件名称
  UseNum:'USE_NUM_'+curTable.value.tableId,//用印份数
  Remark:'REMARK_'+curTable.value.tableId,//备注
}

const uploadOriFileFormState=computed(()=>{
  return curTable.value.tableItems?.find(item=>item.columnName=='UPLOAD_ORIG_FILE').isDisabled
})
const uploadUseFileFormState=computed(()=>{
  return curTable.value.tableItems?.find(item=>item.columnName=='UPLOAD_USED_FILE').isDisabled
})
const useNumState=computed(()=>{
  return curTable.value.tableItems?.find(item=>item.columnName=='USE_NUM').isDisabled
})
const remarkState=computed(()=>{
  return curTable.value.tableItems?.find(item=>item.columnName=='REMARK').isDisabled
})

const uploadDialogVisible=ref(false)
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
const uploadFormRef=ref()
const uploadFileRef = ref()
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

const setDefaultAttachmentInfo=()=>{
  //关联信息交易披露流程
  if(props.groupItem.pageId=='1876528510971789314'){
    renderFormData.value['list_1916315394903961601']=[
      {
        isRequire:true,
        ATTACHMENT_TYPE_1916315394903961601:"LEVEL2_1611",
        ATTACHMENT_TYPE_TEXT_1916315394903961601:"信息披露 / 关联交易信息披露",
      }
    ]
  }
  //产品公函审批（去掉 bug1281）
  // if(props.groupItem.pageId=='1876556942510243842'){
  //   renderFormData.value['list_1876527884372131841']=[
  //     {
  //       isRequire:true,
  //       ATTACHMENT_TYPE_1876527884372131841:"LEVEL2_1704",
  //       ATTACHMENT_TYPE_TEXT_1876527884372131841:"公函 / 其他",
  //     }
  //   ]
  // }
  // //证券类业务投资交易函件用印审批
  // if(props.groupItem.pageId=='1902978357656416258'){
  //   renderFormData.value['list_1912118892895719425']=[
  //     {
  //       isRequire:true,
  //       ATTACHMENT_TYPE_1912118892895719425:"LEVEL2_1704",
  //       ATTACHMENT_TYPE_TEXT_1912118892895719425:"公函 / 其他",
  //     }
  //   ]
  // }
  
}
//创建页面初始化默认值
if(route.query.pageType==='create'){
  setDefaultAttachmentInfo()
}else if(props.groupItem.pageId=='1876528510971789314' && route.query.nodeId==='2036'){
  setDefaultAttachmentInfo()
}
// 处理下载
const handleDownload = (row,fileType) => {
  let fileId=null,fileName=null
  if(fileType==='orig'){
    fileId=row[fieldMap.UploadOrigFile]
    fileName=row[fieldMap.UploadOrigFileName]
  }else{
    fileId=row[fieldMap.UploadUsedFile]
    fileName=row[fieldMap.UploadUsedFileName]
  }
  downloadByUrl({
    fileId: fileId,
    target: '_blank',
    fileName: fileName
  })
}
const tableRowValidate=(rule, value, callback,row,rowIndex)=>{
  if(row.isRequire && !row[fieldMap.UploadOrigFile]){
    callback(new Error('请上传附件'))
    return
  }else{
    callback()
  }
}
const tableRowUsedFileValidate=(rule, value, callback,row,rowIndex)=>{
  if(!uploadUseFileFormState.value && !row[fieldMap.UploadUsedFile]){
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
    await request.post({ url: `/ibps/system/fileManage/commonFileDel?fileId=${fileType=='orig'?row[fieldMap.UploadOrigFile]:row[fieldMap.UploadUsedFile]}`})
    if(fileType=='orig'){
      if(row.isRequire){
        row[fieldMap.UploadOrigFile]=null
        row[fieldMap.UploadOrigFileName]=null
      }else{
        renderFormData.value['list_' + curTable.value.tableId].splice(rowIndex,1)
      }
    }else{
      row[fieldMap.UploadUsedFile]=null
      row[fieldMap.UploadUsedFileName]=null
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
const toPreview = async (fileItem,type)=>{
  let fileId = ''
  if(type === 'orig'){
    fileId = fileItem[fieldMap.UploadOrigFile]
  }else{
    fileId = fileItem[fieldMap.UploadUsedFile]
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
// 打开上传对话框
const openUploadDialog = (row,rowType) => {
  console.log(row)
  uploadForm.value={
    rowId:row?._X_ROW_KEY,
    rowIndex:row?._X_ROW_KEY,
    rowType:rowType,
    fileType:row?row[fieldMap.AttachmentType] : null,
    fileTypeText:row?row[fieldMap.AttachmentTypeText] : null,
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
        rowItem[fieldMap.UploadOrigFile]=fileItem.fileId
        rowItem[fieldMap.UploadOrigFileName]=fileItem.name
        rowItem[fieldMap.UploadOrigFileUrl]=fileItem.url
      }else{
        rowItem[fieldMap.UploadUsedFile]=fileItem.fileId
        rowItem[fieldMap.UploadUsedFileName]=fileItem.name
        rowItem[fieldMap.UploadUsedFileUrl]=fileItem.url
      }
      if(rowItem[fieldMap.UseNum]==null || rowItem[fieldMap.UseNum]==''){
        rowItem[fieldMap.UseNum]=0
      }
    }else{
      // 根据上传模式处理文件数据
      const newFiles = uploadForm.value.fileList.map(file => {
        return {
          [fieldMap.AttachmentType]:uploadForm.value.fileType,
          [fieldMap.AttachmentTypeText]:uploadForm.value.fileTypeText,
          [fieldMap.UploadOrigFile]:file.fileId,
          [fieldMap.UploadOrigFileName]:file.name,
          [fieldMap.UploadOrigFileUrl]: file.url,
          [fieldMap.UseNum]:0,
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
  }
  .action{
    width: 90px;
    display: flex;
    justify-content: space-evenly;
  }
}
.attachment-footer{
  margin:10px 0 20px;
}
.used_file_require_flag {
  color: var(--el-color-danger);
}
</style>
