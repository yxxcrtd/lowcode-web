<template>
  <Dialog :title="title" v-model="dialogVisible" width="800">
    <div class="dialog-wrap">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100">
        <el-row>
          <el-col :span="12">
            <el-form-item label="模型名" prop="modelName">
              <el-input v-model="form.modelName" placeholder="请输入模型名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="模型编码" prop="modelCode">
              <el-input v-model="form.modelCode" placeholder="请输入模型编码" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="备注" prop="remark">
              <el-input type="textarea" :autosize="{ minRows: 2, maxRows: 4}" v-model="form.remark" placeholder="请输入备注" />
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
import { createCommonModel, updateCommonModel } from '../../../api'

defineOptions({ name: 'EditDialog' })

let title = '新增系统字段'
const message = useMessage() // 消息弹窗
const dialogVisible = ref(false)
const formType = ref('create')
const formRef = ref()
const form = ref({
  modelName: '',
  modelCode: '',
  remark: '',
})
const rules = reactive({
  modelName: [{ required: true, message: '请输入模型名称', trigger: 'blur' }],
  modelCode: [{ required: true, message: '请输入模型编码', trigger: 'blur' }]
})

/** 打开弹窗 */
const open = async (type: string, tableInfo) => {
  form.value = {
    modelName: '',
    modelCode: '',
    remark: '',
  }
  dialogVisible.value = true
  formType.value = type
  if (type === 'create') {
    title = '新增全局模型'
  } else {
    title = '编辑全局模型'
    form.value = {...tableInfo}
  }
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
const submitForm = () => {
  formRef.value.validate(async (valid) => {
    if (valid) {
      const res = formType.value === 'create' ? await createCommonModel(form.value) : await updateCommonModel(form.value)
      if (res) {
        message.success('保存成功！')
        dialogVisible.value = false
        form.value = {
          modelName: '',
          modelCode: '',
          remark: '',
        }
        emit('success', formType.value)
      } else {
        message.error('保存失败')
      }
    } else {
      return false
    }
  })
}
</script>
<style scoped lang="scss">
:deep(.el-input-number){
  width: 100%;
}
</style>
