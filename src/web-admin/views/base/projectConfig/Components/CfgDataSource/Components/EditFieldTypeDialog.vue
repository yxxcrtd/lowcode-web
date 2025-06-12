<template>
  <Dialog :title="title" v-model="dialogVisible" width="600">
    <div class="dialog-wrap">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="110">
        <el-form-item label="类型名称" prop="dataType">
          <el-input v-model="form.dataType" />
        </el-form-item>
        <el-form-item label="数据库类型" prop="dbType">
          <el-select v-model="form.dbType" placeholder="请选择数据库类型">
            <el-option-group v-for="group in dbFieldType" :key="group.label" :label="group.label">
              <el-option v-for="item in group.options" :key="item.value" :label="item.label" :value="item.value" />
            </el-option-group>
          </el-select>
        </el-form-item>
        <el-form-item label="长度" prop="dataLength">
          <el-input-number v-model="form.dataLength" controls-position="right" :min="0" :max="99999" :step="1" />
        </el-form-item>
        <el-form-item label="小数位" prop="dataScale">
          <el-input-number v-model="form.dataScale" controls-position="right" :min="0" :max="100" :step="1" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model.number="form.remark" :rows="2" type="textarea" />
        </el-form-item>
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
import { dbFieldType } from '../../../data'
import { addDataDomain, updateDataDomain } from '../../../api'

defineOptions({ name: 'CfgDataSourceEditFieldTypeDialog' })

let title = '新增字段类型'
const message = useMessage() // 消息弹窗
const dialogVisible = ref(false)
const formType = ref('create')
const formRef = ref()
const form = ref({
  dataType: '',
  dbType: '',
  dataLength: 0,
  dataScale: 0,
  remark: null
})
const rules = reactive({
  dataType: [{ required: true, message: '请输入类型名称', trigger: 'blur' }],
  dbType: [{ required: true, message: '请选择数据库类型', trigger: 'blur' }]
})

/** 打开弹窗 */
const open = async (type: string, tableInfo) => {
  form.value = {}
  dialogVisible.value = true
  formType.value = type
  if (type === 'create') {
    title = '创建表'
  } else {
    title = '编辑表'
    form.value = tableInfo
  }
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
const submitForm = () => {
  formRef.value.validate(async (valid) => {
    if (valid) {
      const res = formType.value === 'create' ? await addDataDomain(form.value) : await updateDataDomain(form.value)
      if (res) {
        message.success('保存成功！')
        dialogVisible.value = false
        form.value = {}
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
