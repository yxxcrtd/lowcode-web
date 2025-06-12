<template>
  <el-dialog :title="title" v-model="dialogVisible" width="900">
    <div class="dialog-wrap">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="110">
        <el-row>
          <el-col :span="12">
            <el-form-item label="应用编码" label-width="100" prop="appCode">
              <el-input v-model="form.appCode" autocomplete="off" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="应用名称" label-width="100" prop="appName">
              <el-input v-model="form.appName" autocomplete="off" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="应用地址" label-width="100" prop="appAddress">
              <el-input v-model="form.appAddress" autocomplete="off" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="容器" label-width="100" prop="container">
              <el-input  v-model="form.container" autocomplete="off" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" label-width="100" prop="status">
              <el-select v-model="form.status" clearable @change="handleThemeChange" placeholder="请选择" >
                <el-option
                  v-for="item in options"
                  :key="item.value"  
                  :label="item.label"  
                  :value="item.value">
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="备注" label-width="100">
              <el-input type="textarea" v-model="form.remark" :rows="2"  autocomplete="off" />
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
  </el-dialog>
</template>
<script lang="ts" setup>
import { ref } from 'vue'
import * as api from './api'

defineOptions({ name: 'EditDialog' })

let title = '创建应用'
const message = useMessage() // 消息弹窗
const dialogVisible = ref(false)
const bizType=ref('create')
const formRef = ref()
const form = ref({
  id: '',
  appName: '',
  appCode: '',
  appAddress: '',
  container: '',
  status: '',
  remark: '',
})

const rules = reactive({
  status: [{ required: true, message: '请选择应用状态', trigger: 'change' }],
  source: [{ required: true, message: '请选择动态数据源', trigger: 'blur' }],
  ip: [{ required: true, message: '请输入IP', trigger: 'blur' }],
  appCode: [{ required: true, message: '请输入应用编码', trigger: 'blur' }],
  appName: [{ required: true, message: '请输入应用名称', trigger: 'blur' }],
  appAddress: [{ required: true, message: '请输入应用地址', trigger: 'blur' }],
  username: [{ required: true, message: '请输入用户名称', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
})

const options = [
    { value: 0, label: '开启' },  
    { value: 1, label: '停用' },  
]

// 赋值类型
const handleThemeChange = (value) => {
  const option = options.find((options) => options.value === value)
  form.value.typeName = option?.label
}

/** 打开弹窗 */
const open = async (type: string, tableInfo) => {
  form.value = {
    id: '',
    appName: '',
    appCode: '',
    appAddress: '',
    container: '',
    status: '',
    remark: '',
  }
  bizType.value=type
  dialogVisible.value = true
  const formRefValue = formRef.value;
  if (formRefValue) {
    formRefValue.resetFields();
  }
  if (type === 'create') {
    title = '创建应用'
  } else {
    title = '编辑应用'
    form.value = tableInfo
  }
}

const props = defineProps({
  callback: Function,
})


defineExpose({ open }) // 提供 open 方法，用于打开弹窗

const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
const submitForm = () => {
  formRef.value.validate(async (valid) => {
    if (valid) {
      let res: any = null
      if (form.value.id) {
        res = await api.updateAppInfo(form.value)
      } else {
        res = await api.createAppInfo(form.value)
      }
      if (res) {
        message.success('提交成功！')
        dialogVisible.value = false
        emit('success', bizType.value,res.id)
        form.value = {
          id: '',
          appName: '',
          appCode: '',
          appAddress: '',
          container: '',
          status: '',
          remark: '',
        }
      } else {
        message.error('表单验证失败，请检查输入')
      }
      if (props.callback) {  
        props.callback();  
      }
    } else {
      return false
    }
  })
}
</script>
