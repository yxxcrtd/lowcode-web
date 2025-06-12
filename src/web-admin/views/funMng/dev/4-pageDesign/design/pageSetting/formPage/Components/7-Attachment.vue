<template>
  <el-form :model="formData.attachmentInfo" ref="formRef" label-width="160">
    <el-row :gutter="20">
<!--      <el-col :span="8">-->
<!--        <el-form-item label="附件模式" prop="attachmentType">-->
<!--          <ace-select v-model="formData.attachmentInfo.attachmentType" :data-source="attachmentUploadOptions"></ace-select>-->
<!--        </el-form-item>-->
<!--      </el-col>-->
<!--      <el-col :span="8">-->
<!--      </el-col>-->
<!--      <el-col :span="8">-->
<!--      </el-col>-->
      <el-col :span="24">
        <el-form-item label="是否允许下载" prop="isAllowDownload">
          <el-switch
            v-model="formData.attachmentInfo.isAllowDownload"
            inline-prompt
            active-text="是"
            active-value="1"
            inactive-text="否"
            inactive-value="0"
          />
        </el-form-item>
      </el-col>
      <el-col :span="24">
        <el-form-item label="是否允许预览" prop="isAllowPreview">
          <el-switch
            v-model="formData.attachmentInfo.isAllowPreview"
            inline-prompt
            active-text="是"
            active-value="1"
            inactive-text="否"
            inactive-value="0"
          />
        </el-form-item>
      </el-col>
      <el-col :span="24">
        <el-form-item label="是否允许选择多个文件" prop="isAllowMultiple">
          <el-switch
            v-model="formData.attachmentInfo.isAllowMultiple"
            inline-prompt
            active-text="是"
            active-value="1"
            inactive-text="否"
            inactive-value="0"
          />
        </el-form-item>
      </el-col>
      <el-col :span="24">
        <el-form-item label="允许上传的文件类型" prop="allowFileSuffix">
          <el-checkbox-group v-model="formData.attachmentInfo.allowFileSuffix">
            <el-checkbox v-for="(item,index) in fileSuffixOptions" :key="'allowFileSuffix_'+index" :label="item.label" :value="item.value" />
          </el-checkbox-group>
        </el-form-item>
      </el-col>
      <el-col :span="16">
        <el-form-item label="最大文件限制" prop="maxSize">
          <div class="item-allow-size">
            <ace-input-number
              v-model="formData.attachmentInfo.maxSize"
              style="width: 400px"
              placeholder="请输入文件大小限制"
              class="input-with-select"
            >
              <template #append>
                <el-select v-model="formData.attachmentInfo.maxSizeUnit" style="width: 115px">
                  <el-option label="KB" value="KB" />
                  <el-option label="MB" value="MB" />
                </el-select>
              </template>
            </ace-input-number>
          </div>
        </el-form-item>
      </el-col>
      <el-col :span="24">
        <el-form-item label="上传提示语" prop="uploadTips">
          <ace-textarea
            v-model="formData.attachmentInfo.uploadTips"
          />
        </el-form-item>
      </el-col>
      <el-col :span="8">
        <el-form-item label="附件业务类型" prop="uploadTips">
          <ace-select v-model="formData.attachmentInfo.dirType" :data-source="dirTypeList" placeholder="请选择文件类型" @clear="clearDirType"></ace-select>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="上传文件过滤类型配置" prop="uploadTips">
          <SelectAttachmentType v-model="formData.attachmentInfo.filterFileType" :dirType="formData.attachmentInfo.dirType" multiple/>
        </el-form-item>
      </el-col>
      <el-col :span="8">
        <el-form-item label="是否查询业务系统附件" prop="uploadTips">
          <el-switch v-model="formData.attachmentInfo.isQueryBusinessFileList" />
        </el-form-item>
      </el-col>
      <el-col :span="8">
        <el-form-item label="是否禁止上传" prop="isNotAllowUpload">
          <el-switch v-model="formData.attachmentInfo.isNotAllowUpload" />
        </el-form-item>
      </el-col>
      <el-col :span="24">
        <el-form-item label="指定上传文件" prop="uploadFileList">
          <el-button type="primary" @click="addRow" class="mb-10px"> 新增 </el-button>
          <vxe-table border="inner" stripe  style="width: 100%" align="center" height="500px" :data="formData.attachmentInfo.uploadFileList">
            <vxe-column type="seq" title="序号" width="60" align="center" fixed="left"/>
            <vxe-column field="paramName" title="文件类型" min-width="180">
              <template #default="{ row }">
                <SelectAttachmentType v-model="row.fileTypeId" v-model:model-text="row.fileTypeText" :dirType="formData.attachmentInfo.dirType"/>
              </template>
            </vxe-column>
            <vxe-column field="isRequire" title="是否必传" min-width="120">
              <template #default="{ row }">
                <el-checkbox v-model="row.isRequire" :true-value="1" :false-value="0"/>
              </template>
            </vxe-column>
            <vxe-column field="remark" title="文件名校验规则（正则）" min-width="200">
              <template #default="{ row }">
                <el-input v-model="row.validRule"/>
              </template>
            </vxe-column>
            <vxe-column field="fileAllowSuffix" title="文件类型" min-width="200">
              <template #default="{ row }">
                <ace-select v-model="row.fileAllowSuffix" multiple is-join :data-source="fileSuffixOptions"></ace-select>
              </template>
            </vxe-column>
            <vxe-column field="flowNodeId" title="流程节点Id" min-width="200">
              <template #default="{ row }">
                <el-input v-model="row.flowNodeId"/>
              </template>
            </vxe-column>
            <vxe-column field="uploadTemplateFileId" title="上传模板" width="250">
              <template #default="{ row,rowIndex }">
                <div style="display: flex;">
                <UploadFile
                  :ref="(el) => getUploadRef(el, rowIndex)"
                  class="upload-template"
                  style="flex: auto;"
                  v-model="row.file"
                  v-bind="{fileSize:5,fileType:['pdf','xls','xlsx']}"
                  upload-mode="immediate"
                  :limit="1"
                  :isShowTip="false"
                  :isShowButton="false"
                  :isShowFileInfo="false"
                  :showFileList="false"
                  @update:model-value="(file) => handleUploadSuccess(file,row)"
                >
                
                  <el-button type="text" >{{ row.uploadTemplateFileName || '上传文件' }}</el-button>
                </UploadFile>
                <el-button 
                    v-if="row.uploadTemplateFileId"
                    style="width: 20px;"
                    link 
                    type="danger" 
                    @click="handleRemove(row,rowIndex)"
                  >
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </div>
              </template>
            </vxe-column>
            <vxe-column field="pageLinkageRespVOS" title="联动配置" width="80">
              <template #default="{ row }">
                <div class="table-row-cfg-wrap">
                  <el-button
                    text
                    type="primary"
                    @click="openDialog('linkage', row)"
                    :class="row.pageLinkageRespVOS ? 'green-text' : ''"
                  >
                    配置
                  </el-button>
                  <el-popconfirm
                    title="确定清空配置?"
                    @confirm="clearCfg(row, 'pageLinkageRespVOS')"
                    v-if="row.pageLinkageRespVOS"
                  >
                    <template #reference>
                      <el-icon class="cfg-del-btn" title="清空配置">
                        <Delete />
                      </el-icon>
                    </template>
                  </el-popconfirm>
                </div>
              </template>
            </vxe-column>
            <vxe-column fixed="right" field="action" title="操作" min-width="80">
              <template #default="{ row,rowIndex }">
                <div class="table-action">
                  <el-link type="primary" @click="handleDelete(row,rowIndex)">删除</el-link>
                </div>
              </template>
            </vxe-column>
          </vxe-table>
        </el-form-item>
      </el-col>
    </el-row>
  </el-form>
  <LinkageDialog
    ref="linkageDialogRef"
    :defLinkType="['require','hidden']"
    :fieldList="curApi.tableColumns"
    @success="configSuccess($event, 'pageLinkageRespVOS')"
  />
</template>
<script lang="ts" setup>
import { ref } from 'vue'
import { cloneDeep } from 'lodash-es'
import { Delete } from '@element-plus/icons-vue'
import SelectAttachmentType from "@/components-yt/biz/SelectAttachmentType/index.vue";
import LinkageDialog from "@/web-admin/views/funMng/dev/Components/LinkageDialogV2.vue";
import ValidateDialog from "@/web-admin/views/funMng/dev/Components/ValidateDialog.vue";

defineOptions({name: 'FormPageAttachment'})

const formData:any=defineModel()

if(!formData.value.attachmentInfo){
  formData.value.attachmentInfo={
    attachmentType:'flowAttachment',
    isAllowDownload:'1',
    isAllowPreview:'1',
    isAllowMultiple:'0',
    allowFileSuffix:['pdf','doc','docx','xls','xlsx'],
    maxSize:5,
    dirType:'0',
    maxSizeUnit:'MB'
  }
}else{
  if(!formData.value.attachmentInfo.allowFileSuffix){
    formData.value.attachmentInfo.allowFileSuffix=[]
  }
}
const message = useMessage() // 消息弹窗

/**
 * 切换pai
 */
const curApi: any = ref(formData.value.templateApiList[0])
const curApiIndex = ref()
const handleChangeApi = (apiItem, index) => {
  curApi.value = apiItem
  curApiIndex.value = index // 保存当前 index
}

const attachmentUploadOptions=ref([
  {label:'普通附件模式',value:'commonAttachment'},
  {label:'指定类型模式',value:'appointAttachment'},
  {label:'自选类型上传',value:'selectAttachment'},
  {label:'表格类型上传',value:'tableAttachment'},
])
const dirTypeList=ref([
  {label:'产品型',value:'0'},
  {label:'资产型',value:'1'}
])
const fileSuffixOptions=ref([
  {label:'pdf',value:'pdf'},
  {label:'doc',value:'doc'},
  {label:'docx',value:'docx'},
  {label:'xls',value:'xls'},
  {label:'xlsx',value:'xlsx'},
  {label:'ppt',value:'ppt'},
  {label:'pptx',value:'pptx'},
  {label:'txt',value:'txt'},
  {label:'jpeg',value:'jpeg'},
  {label:'png',value:'png'},
  {label:'gif',value:'gif'},
  {label:'zip',value:'zip'},
])

const fileSourceOptions=ref([
  {label:'资产报告',value:'zcbg'},
  {label:'信披报告',value:'xpbg'},
])

const marks=ref({
  0: '0',
  100: '100',
  200: '200',
  300: '300',
  400: '400',
  500: '500',
})
const formatTooltip=(val)=>{
  return val+'MB'
}
const addRow = () => {
  if(!formData.value.attachmentInfo.uploadFileList){
    formData.value.attachmentInfo.uploadFileList=[]
  }
  formData.value.attachmentInfo.uploadFileList.push({
  })
}
const handleDelete=async (row,rowIndex)=>{
  try {
    // 删除的二次确认
    await message.delConfirm()
    formData.value.attachmentInfo.uploadFileList.splice(rowIndex,1)
  } catch {}
}
const clearDirType=()=>{
  formData.value.attachmentInfo.dirType=''
}
// 处理上传成功
const uploadRefList = ref<HTMLElement[]>([])
const getUploadRef = (el, index) => {
  if (el) {
    uploadRefList.value[index] = el
  }
}
const handleUploadSuccess = (file,row) => {
  row.uploadTemplateFileId = file.fileId
  row.uploadTemplateFileName = file.name
}
const handleRemove = (row,rowIndex) => {
  row.uploadTemplateFileId = ''
  row.uploadTemplateFileName = ''
  uploadRefList.value[rowIndex].handleRemove(row.file || {
    fileId:row.uploadTemplateFileId,name:row.uploadTemplateFileName
  })
}

const curRow = ref()
const linkageDialogRef = ref()
const openDialog = (type, row) => {
  curRow.value = row
  linkageDialogRef.value.open(type,row)
}
const configSuccess = (data, type) => {
  curRow.value[type] = data
}
const clearCfg = (row, field) => {
  row[field] = null
}
</script>
<style lang="scss" scoped>
.item-allow-size{
  display: flex;
  width: 100%;
  :deep(.number-range-container){
    width: 260px;
  }
  .allow-size-slider{
    margin-left: 20px;
  }
}
.upload-template{
  :deep(.upload-file-uploader) {
    height: 100% !important;
    .el-upload-dragger{
      padding: 2px !important;
      border: 0 !important;
      background: transparent !important;
    }
  } 
}
</style>
