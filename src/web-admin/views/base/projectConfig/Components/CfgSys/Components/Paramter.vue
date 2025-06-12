<template>
  <Dialog :title="title" v-model="dialogVisible" width="600">
    <div class="dialog-wrap">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="110">
        <el-form-item label="参数编码" prop="key">
          <el-input v-model="form.key" :disabled="form.id"/>
        </el-form-item>
        <el-form-item label="参数名" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="值" prop="value">
          <el-input v-model="form.value" />
        </el-form-item>
        <el-form-item label="描述" prop="remark">
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
import {createParam, updateParam} from "@/web-admin/views/base/projectConfig/api";
import { cloneDeep } from 'lodash-es'
defineOptions({ name: 'EditDialog' })

let title="创建表"
const message = useMessage() // 消息弹窗
const dialogVisible = ref(false)
const formRef = ref()
const form = ref({
  name: '',
  key: '',
  value: '',
  remark: null
})
const rules = reactive({
  name: [{ required: true, message: '请输入参数名', trigger: 'blur' }],
  key: [{ required: true, message: '请输入参数编码', trigger: 'blur' }],
  value: [{ required: true, message: '请输入值', trigger: 'blur' }]
})


/** 打开弹窗 */
const open = async (type: string, tableInfo) => {
  form.value={}
  dialogVisible.value = true
  if(type === 'create'){
    title = "创建参数"
  }else{
    title = "编辑参数"
    form.value = cloneDeep(tableInfo)
  }
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调

const submitForm = async () => {
  if (!formRef.value) return
  const valid = await formRef.value.validate()
  if (!valid) return
  const params = {
    category:'Sys-Paramter',
    visible:true,
    ...form.value,
  }
  if(!params.id) {
   const res = await createParam(params)
  }else{
    const res = await updateParam(params)
  }
  emit('success')
  message.success('提交成功！')
  dialogVisible.value = false
  form.value = {}
}
</script>
