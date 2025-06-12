<template>
  <Dialog :title="title" v-model="dialogVisible" width="600">
    <div class="dialog-wrap">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="110">
        <el-row>
          <el-col :span="24">
            <el-form-item label-width="0" prop="fileList">
              <UploadFile
                style="width: 100%"
                v-model="form.fileList"
                :file-size="5"
                :file-type="['zip','rar']"
                upload-mode="manual"
                @update:model-value="handleUploadSuccess"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitForm">确 定</el-button>
      </span>
    </template>
  </Dialog>
</template>
<script lang="ts" setup>
import { ref } from 'vue'
import * as api from './api'
import UploadFile from "../../../../components/UploadFile/src/UploadFile.vue";
import dayjs from "dayjs";
import {ElMessage} from "element-plus";

defineOptions({ name: 'EditDialog' })

let title = '导出脚本'
const message = useMessage() // 消息弹窗
const dialogVisible = ref(false)
const bizType=ref('create')
const formRef = ref()
const form = ref({
  version: '',
  updateContent: '',
  dateRange: [],
})

const rules = reactive({
  updateContent: [{ required: true, message: '请输入更新内容', trigger: 'blur' }],
  dateRange: [{ required: true, message: '请选择脚本日期范围', trigger: 'change' }]
})

/** 打开弹窗 */
const open = async () => {
  form.value = {
    version: '',
    updateContent: '',
    dateRange: [],
  }
  dialogVisible.value = true
}

defineExpose({ open }) // 提供 open 方法，用于打开弹窗



// 处理上传成功
const handleUploadSuccess = (files) => {
  uploadForm.value.fileList = files
  console.log('files',files)
  uploadFormRef.value.validateField('fileList')
}

// 确认上传
const confirmUpload = async () => {
  await uploadFormRef.value.validate()

  try {
    // 根据上传模式处理文件数据
    const newFiles = uploadForm.value.fileList.map(file => {
      return {
        fileType:uploadForm.value.fileType,
        isRequire:uploadForm.value.isRequire,
        fileTypeText:uploadForm.value.fileTypeText,
        oriAttachmentId:uploadForm.value.oriAttachmentId,
        pageId:props.pageId,
        fileName: file.name,
        fileUrl: file.url,
        fileId:file.fileId,
        fileSize:file.size,
        nodeId:nodeId,
        uploadUserId:userStore.getUser.id,
        uploadUserText:userStore.getUser.nickname,
        uploadDate:dayjs().format('YYYY-MM-DD HH:mm:ss'),
      }
    })

    // 合并现有文件和新上传的文件
    let updatedFileList=props.modelValue || []
    if(uploadForm.value.rowIndex!=null && uploadForm.value.rowIndex!=undefined){
      updatedFileList.splice(uploadForm.value.rowIndex,1,...newFiles)
    }else{
      updatedFileList=[...updatedFileList,...newFiles]
    }
    // 更新父组件数据
    emit('update:modelValue', updatedFileList)

    // 清空上传组件的文件列表
    uploadForm.value.fileList.value = []
    uploadForm.value.rowIndex=null
    uploadForm.value.isRequire=false
    uploadForm.value.oriAttachmentId=null
    uploadDialogVisible.value = false

    // 刷新表格数据
    refresh(true)
  } catch (error) {
    console.log(error)
    ElMessage.error('保存失败：' + error.message)
  }
}


const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
const submitForm = () => {
  formRef.value.validate(async (valid) => {
    if (valid) {
      let res: any = null
      if (form.value.id) {
        res = await api.updateDataSourceConfig(form.value)
      } else {
        res = await api.createDataSourceConfig(form.value)
      }
      if (res) {
        message.success('提交成功！')
        dialogVisible.value = false
        emit('success', bizType.value,res.id)
        form.value = {
          version: '',
          updateContent: '',
          dateRange: [],
        }
      } else {
        message.error('表单验证失败，请检查输入')
      }
    } else {
      return false
    }
  })
}
</script>
