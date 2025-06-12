<template>
  <el-dialog title="生成代码" v-model="dialogVisible" width="600">
    <el-form :model="form" :rules="rules" ref="formRef" label-width="110">
      <el-form-item label="实体类名" prop="tableCode">
        <el-input v-model="form.tableCode" />
      </el-form-item>
      <el-form-item label="包名" prop="tableName">
        <el-input v-model="form.tableName" />
      </el-form-item>
      <el-form-item label="页面风格" prop="dataSource">
        <el-input v-model.number="form.dataSource" />
      </el-form-item>
      <el-form-item label="功能说明" prop="remark">
        <el-input v-model.number="form.remark" :rows="2" type="textarea" />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button type="primary" @click="submitForm">预 览 代 码</el-button>
      </span>
    </template>
  </el-dialog>
</template>
<script lang="ts" setup>
import { ref } from 'vue'

defineOptions({ name: 'EditDialog' })

const message = useMessage() // 消息弹窗
const dialogVisible = ref(false)
const formRef = ref()
const form = ref({
  tableName: '',
  tableCode: '',
  dataSource: '',
  remark: null
})
const rules = reactive({
  tableName: [{ required: true, message: '请输入显示名称', trigger: 'blur' }],
  tableCode: [
    { required: true, message: '请输入表名', trigger: 'blur' },
  ],
  dataSource: [{ required: true, message: '请选择数据源', trigger: 'blur' }],
})

/** 打开弹窗 */
const open = async (type: string, id?: number) => {
  dialogVisible.value = true
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
const submitForm = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      message.success('提交成功！')
      dialogVisible.value = false
      emit('success','123')
    } else {
      message.error('表单验证失败，请检查输入')
      return false
    }
  })
}
</script>
