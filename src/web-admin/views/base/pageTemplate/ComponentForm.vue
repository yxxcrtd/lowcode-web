<template>
  <el-drawer
    v-model="dialogVisible"
    :title="dialogTitle"
    size="60%"
    direction="rtl"
  >
    <el-form
      ref="formRef"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="80px"
    >
      <el-row>
        <el-col :span="12">
          <el-form-item label="所属分组">
            <el-tree-select
              v-model="formData.groupId"
              :data="groupList"
              :props="defaultProp"
              check-strictly
              clearable
              :highlight-current="true"
              :render-after-expand="false"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="模板编码" prop="templateCode">
            <el-input v-model="formData.templateCode" placeholder="请输入模板编码" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="模板名称" prop="templateName">
            <el-input v-model="formData.templateName" placeholder="请输入模板名称" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="模板类型" prop="templateType">
            <el-select v-model="formData.templateType" placeholder="请输入模板模板地址">
              <el-option label="列表" value="list"></el-option>
              <el-option label="表单" value="form"></el-option>
              <el-option label="单页" value="page"></el-option>
              <el-option label="移动列表页" value="mobile-list"></el-option>
              <el-option label="移动表单页" value="mobile-form"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="模板地址" prop="templateAddress">
            <el-input v-model="formData.templateAddress" placeholder="请输入模板模板地址" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="模板图片" prop="templateImage">
            <el-upload
              v-model:file-list="files"
              class="upload-demo"
              action="https://run.mocky.io/v3/9d059bf9-4660-45f2-925d-ce80ad6c4d15"
              multiple
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              :before-remove="beforeRemove"
              :limit="1"
              :on-exceed="handleExceed"
            >
              <el-button type="primary">点击上传</el-button>
<!--              <template #tip>
                <div class="el-upload__tip">
                  jpg/png files with a size less than 500KB.
                </div>
              </template>-->
            </el-upload>
          </el-form-item>
        </el-col>
      </el-row>
      <component-props-table ref="propsFormRef" :tableParamData="myTableData" :table-api-data="myApiTableData"/>
    </el-form>
    <template #footer>
      <div class="footer">
        <el-button :disabled="formLoading" type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="dialogVisible = false">取 消</el-button>
      </div>
    </template>
  </el-drawer>
</template>
<script lang="ts" setup>
import ComponentPropsTable from "@/web-admin/views/base/pageTemplate/ComponentPropsTable.vue";
import * as api from './api'
import {FormRules, UploadProps} from 'element-plus'
import { ref } from 'vue';

defineOptions({ name: 'SystemUserForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗
const groupList = ref<Tree[]>([]) // 树形结构
const propsFormRef = ref()
const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined,
  groupId: undefined,
  templateCode: '',
  templateName: '',
  templateAddress:'',
  templateImage: '',
  templateType: '',
  apiList: [],
  paramList: []
})

const files = ref([])
const formRules = reactive<FormRules>({
  templateCode: [{ required: true, message: '模版编码不能为空', trigger: 'blur' }],
  templateName: [{ required: true, message: '模版名称不能为空', trigger: 'blur' }],
  templateType: [{ required: true, message: '模版类型不能为空', trigger: 'blur' }]
})
const formRef = ref() // 表单 Ref

const defaultProp = {
  children: 'children',
  label: 'groupName',
  value: 'id'
}

const getTree = async () => {
  const res = await api.getTree()
  groupList.value = res
}

//对文件的一些操作
const handleRemove: UploadProps['onRemove'] = (file, uploadFiles) => {
  console.log(file, uploadFiles)
}

const handlePreview: UploadProps['onPreview'] = (uploadFile) => {
  console.log(uploadFile)
}

const handleExceed: UploadProps['onExceed'] = (files, uploadFiles) => {
  ElMessage.warning(
    `The limit is 3, you selected ${files.length} files this time, add up to ${
      files.length + uploadFiles.length
    } totally`
  )
}

const beforeRemove: UploadProps['beforeRemove'] = (uploadFile, uploadFiles) => {
  return ElMessageBox.confirm(
    `Cancel the transfer of ${uploadFile.name} ?`
  ).then(
    () => true,
    () => false
  )
}
/** 打开弹窗 */
const myTableData = ref([]);
const myApiTableData = ref([]);
const open = async (type: string, id?: number) => {
  dialogVisible.value = true
  if (type === 'create') {
    dialogTitle.value = t('action.' + type)
    myTableData.value =[]
    myApiTableData.value=[]
  } else {
    dialogTitle.value = t('action.' + 'edit')
  }
  formType.value = type
  resetForm()
  // 修改时，设置数据
  if (id) {
    formLoading.value = true
    try {
      let res = await api.getTemplateInfo(id)
      formData.value = res
      myTableData.value = res.paramList
      myApiTableData.value=res.apiList
    } finally {
      formLoading.value = false
    }
  }
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

/** 提交表单 */
const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
const submitForm = async () => {
  // 校验表单
  if (!formRef.value) return
  const valid = await formRef.value.validate()
  if (!valid) return
  // 提交请求
  formLoading.value = true
  formData.value.paramList = myTableData.value
  formData.value.apiList = myApiTableData.value
  try {
    if (formType.value === 'create') {
      await api.createTemplateInfo(formData.value)
      message.success(t('common.createSuccess'))
    } else {
      await api.updateTemplateInfo(formData.value)
      message.success(t('common.updateSuccess'))
    }
    dialogVisible.value = false
    // 发送操作成功的事件
    emit('success')
  } finally {
    formLoading.value = false
  }
}

/** 重置表单 */
const resetForm = () => {
  formData.value = {
    id: undefined,
    groupId: undefined,
    templateCode: '',
    templateName: '',
    templateAddress:'',
    templateImage: '',
    templateType: '',
    apiList: [],
    paramList: []
  }
  formRef.value?.resetFields()
  getTree()
}
/** 初始化 */
onMounted(async () => {
  await getTree()
})
</script>
<style scoped lang="scss">
.footer{
  position: absolute;
  bottom: 10px;
}
</style>
