<template>
  <el-form :model="formData.attachmentInfo" ref="formRef" label-width="160">
    <el-row :gutter="20">
      <el-col :span="8">
        <el-form-item label="附件模式" prop="attachmentType">
          <ace-select v-model="formData.attachmentInfo.attachmentType" :data-source="attachmentUploadOptions"></ace-select>
        </el-form-item>
      </el-col>
      <el-col :span="8">
      </el-col>
      <el-col :span="8">
      </el-col>
      <el-col :span="8" v-if="['commonAttachment','selectAttachment'].includes(formData.attachmentInfo.attachmentType)">
        <el-form-item label="是否必传" prop="isRequire">
          <el-switch
            v-model="formData.attachmentInfo.isRequire"
            inline-prompt
            active-text="是"
            active-value="1"
            inactive-text="否"
            inactive-value="0"
          />
        </el-form-item>
      </el-col>
      <el-col :span="8">
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
      <el-col :span="8">
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
        <el-form-item label="允许上传的文件类型" prop="allowFileSuffix">
          <el-checkbox-group v-model="formData.attachmentInfo.allowFileSuffix">
            <el-checkbox v-for="(item,index) in fileSuffixOptions" :key="'allowFileSuffix_'+index" :label="item.label" :value="item.value" />
          </el-checkbox-group>
        </el-form-item>
      </el-col>
      <el-col :span="16">
        <el-form-item label="上传文件大小范围" prop="allowSize">
          <div class="item-allow-size">
            <ace-input-number-range v-model="formData.attachmentInfo.allowSize" append="MB"></ace-input-number-range>
            <el-slider class="allow-size-slider mb-10px" v-model="formData.attachmentInfo.allowSize" :format-tooltip="formatTooltip" :min="0" :max="500" range :marks="marks" />
          </div>
        </el-form-item>
      </el-col>
      <el-col :span="24" v-if="formData.attachmentInfo.attachmentType==='appointAttachment'">
        <el-form-item label="指定上传文件" prop="uploadFileList">
          <el-button type="primary" @click="addRow" class="mb-10px"> 新增 </el-button>
          <vxe-table border="inner" stripe  style="width: 100%" align="center" height="500px" :data="formData.attachmentInfo.uploadFileList">
            <vxe-column type="seq" title="序号" width="60" align="center" />
            <vxe-column field="paramName" title="文件名称" min-width="180">
              <template #default="{ row }">
                <el-input v-model="row.paramName" />
              </template>
            </vxe-column>
            <vxe-column field="isRequire" title="是否必传" width="120">
              <template #default="{ row }">
                <el-checkbox v-model="row.isRequire" :true-value="1" :false-value="0"/>
              </template>
            </vxe-column>
            <vxe-column field="remark" title="是否校验文件名">
              <template #default="{ row }">
                <el-checkbox v-model="row.isValidFileName" :true-value="1" :false-value="0"/>
              </template>
            </vxe-column>
            <vxe-column field="action" title="操作" width="180">
              <template #default="{ row,rowIndex }">
                <div class="table-action">
                  <el-link type="primary" @click="handleDelete(row,rowIndex)">删除</el-link>
                </div>
              </template>
            </vxe-column>
          </vxe-table>
        </el-form-item>
      </el-col>
      <el-col :span="8"></el-col>
      <el-col :span="8" v-if="formData.attachmentInfo.attachmentType==='selectAttachment'">
        <el-form-item label="文件类型（字典）" prop="fileSourceDict">
          <ace-select v-model="formData.attachmentInfo.fileSourceDict" :data-source="fileSourceOptions"></ace-select>
        </el-form-item>
      </el-col>
    </el-row>
  </el-form>
</template>
<script lang="ts" setup>
import { ref } from 'vue'
import { cloneDeep } from 'lodash-es'

defineOptions({name: 'FormPageAttachment'})

const formData:any=defineModel()

if(!formData.value.attachmentInfo){
  formData.value.attachmentInfo={
    attachmentType:'commonAttachment'
  }
}
const message = useMessage() // 消息弹窗
const attachmentUploadOptions=ref([
  {label:'普通附件模式',value:'commonAttachment'},
  {label:'指定类型模式',value:'appointAttachment'},
  {label:'自选类型上传',value:'selectAttachment'},
  {label:'表格类型上传',value:'tableAttachment'},
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
</style>
