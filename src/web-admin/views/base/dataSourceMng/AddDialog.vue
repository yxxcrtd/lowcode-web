<template>
  <Dialog :title="title" v-model="dialogVisible" width="900">
    <div class="dialog-wrap">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="110">
        <el-row>
          <el-col :span="12">
            <el-form-item label="类型" label-width="100" prop="typeSource">
              <el-select v-model="form.typeSource" clearable @change="handleThemeChange" placeholder="请选择" >
                <el-option
                  v-for="item in options"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="动态数据源" label-width="100" prop="source">
              <el-radio-group v-model="form.source">
                <el-radio :value=0 >是</el-radio>
                <el-radio :value=1>否</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="数据源编码" label-width="100" prop="code">
              <el-input v-model="form.code" autocomplete="off" @input="validateInput('code')" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="数据源名称" label-width="100" prop="name">
              <el-input v-model="form.name" autocomplete="off" @input="validateInput('name')" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="ip" label-width="100" prop="ip">
              <el-input v-model="form.ip" autocomplete="off" @input="validateInput('ip')" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="JDBC URl" label-width="100" prop="url">
              <el-input type="textarea" :rows="2" v-model="form.url" autocomplete="off" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="用户名" label-width="100" prop="username">
              <el-input v-model="form.username" autocomplete="off" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="密码" label-width="100" prop="password">
              <el-input v-model="form.password" show-password type="password" autocomplete="off" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="备注" label-width="100">
              <el-input v-model="form.remark" autocomplete="off" />
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

let title = '创建数据源'
const message = useMessage() // 消息弹窗
const dialogVisible = ref(false)
const bizType=ref('create')
const formRef = ref()
const form = ref({
  id: '',
  typeSource: '',
  typeName: '',
  source: '',
  name: '',
  code: '',
  ip: '',
  url: '',
  username: '',
  password: '',
  remark: ''
})

const rules = reactive({
  typeSource: [{ required: true, message: '请选择数据类型', trigger: 'change' }],
  source: [{ required: true, message: '请选择动态数据源', trigger: 'change' }],
  ip: [{ required: true, message: '请输入IP', trigger: 'blur' }],
  code: [{ required: true, message: '请输入数据源编码', trigger: 'blur' }],
  name: [{ required: true, message: '请输入数据源名称', trigger: 'blur' }],
  url: [{ required: true, message: '请输入JDBC URl', trigger: 'change' }],
  username: [{ required: true, message: '请输入用户名称', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
})
const validateInput = (field) => {
  const regex = /^[a-zA-Z0-9.]*$/; // 允许英文、数字和点
  form.value[field] = form.value[field].split('').filter(char => regex.test(char)).join('');
}
const options = [
    { value: 'mysql', label: 'mysql' },
    { value: 'oracle', label: 'oracle' },
]

// 赋值类型
const handleThemeChange = (value) => {
  const option = options.find((options) => options.value === value)
  formRef.value.typeName = option?.label
}

/** 打开弹窗 */
const open = async (type: string, tableInfo) => {
  form.value = {
    id: '',
    typeSource: '',
    typeName: '',
    source: '',
    name: '',
    code: '',
    ip: '',
    url: '',
    username: '',
    password: '',
    remark: ''
  }
  bizType.value=type
  dialogVisible.value = true
  const formRefValue = formRef.value;
  if (formRefValue) {
    formRefValue.resetFields();
  }
  if (type === 'create') {
    title = '创建数据源'
  } else {
    title = '编辑数据源'
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
        res = await api.updateDataSourceConfig(form.value)
      } else {
        res = await api.createDataSourceConfig(form.value)
      }
      if (res) {
        message.success('提交成功！')
        dialogVisible.value = false
        emit('success', bizType.value,res.id)
        form.value = {
          id: '',
          typeSource: '',
          typeName: '',
          source: '',
          name: '',
          code: '',
          ip: '',
          url: '',
          username: '',
          password: '',
          remark: ''
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
