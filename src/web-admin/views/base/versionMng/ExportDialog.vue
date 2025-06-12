<template>
  <Dialog :title="title" v-model="dialogVisible" width="600">
    <div class="dialog-wrap">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="110">
        <el-row>
          <el-col :span="24">
            <el-form-item label="版本号" label-width="100" prop="version">
              <el-input v-model="form.version" clearable >
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="更新内容" label-width="100" prop="updateContent">
              <el-input v-model="form.updateContent" clearable >
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="脚本范围" label-width="100" prop="dateRange">
              <ace-datetime-range-picker v-model="form.dateRange"/>
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
