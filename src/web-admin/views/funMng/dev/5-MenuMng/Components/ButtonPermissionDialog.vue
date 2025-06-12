<template>
  <el-dialog title="创建" v-model="dialogVisible" width="800">
    <div class="dialog-wrap">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="110">
        <el-form-item label="菜单名称" prop="modelName">
          <el-input v-model="form.modelName" />
        </el-form-item>
        <el-form-item label="上级菜单" prop="modelName">
          <el-input v-model="form.modelName" />
        </el-form-item>
        <el-form-item label="关联页面" prop="modelDataSource">
          <el-input v-model.number="form.modelDataSource" />
        </el-form-item>
        <el-form-item label="菜单路径" prop="modelCode">
          <el-input v-model="form.modelCode" />
        </el-form-item>
        <el-form-item label="菜单图标" prop="modelType">
          <el-input v-model.number="form.modelType" />
        </el-form-item>
        <el-form-item label="排序" prop="modelType">
          <el-input v-model.number="form.modelType" />
        </el-form-item>
        <el-form-item label="隐藏菜单" prop="modelType">
          <el-input v-model.number="form.modelType" />
        </el-form-item>
        <el-form-item label="缓存路由" prop="modelType">
          <el-input v-model.number="form.modelType" />
        </el-form-item>
        <el-form-item label="描述" prop="modelRemark">
          <el-input v-model.number="form.modelRemark" :rows="2" type="textarea" />
        </el-form-item>
      </el-form>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitForm">确 定</el-button>
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
  modelName: '',
  modelCode: '',
  modelDataSource: '',
  modelType: '',
  modelRemark: null
})
const rules = reactive({
  modelName: [{ required: true, message: '请输入模型名称', trigger: 'blur' }],
  modelCode: [
    { required: true, message: '请输入模型编码', trigger: 'blur' },
  ],
  modelDataSource: [{ required: true, message: '请选择数据源', trigger: 'blur' }],
  modelType: [{ required: true, message: '请选择模型类型', trigger: 'blur' }]
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
