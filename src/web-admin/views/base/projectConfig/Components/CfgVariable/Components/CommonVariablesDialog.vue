<template>
  <Dialog :title="title" v-model="dialogVisible" width="800">
    <div class="dialog-wrap">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100">
        <el-row>
          <el-col :span="12">
            <el-form-item label="字段名" prop="fieldName">
              <el-input v-model="form.fieldName" placeholder="请输入字段名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="缓存类型" prop="cacheType">
              <ace-select v-model="form.cacheType" :data-source="cacheOptions" placeholder="请选择缓存类型"/>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="字段描述" prop="fieldDescribe">
              <el-input type="textarea" :autosize="{ minRows: 2, maxRows: 4}" v-model="form.fieldDescribe" placeholder="请输入字段描述" />
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
import { createCommonVar, updateCommonVar } from '../../../api'

defineOptions({ name: 'EditDialog' })

let title = '新增系统字段'
const message = useMessage() // 消息弹窗
const dialogVisible = ref(false)
const formType = ref('create')
const operateType = ref('backend')
const formRef = ref()
const form = ref({
  fieldName: '',
  fieldDescribe: '',
  cacheType: '',
  type: ''
})
const rules = reactive({
  fieldName: [{ required: true, message: '请输入字段名', trigger: 'blur' }],
  cacheType: [{ required: true, message: '请输入缓存类型', trigger: 'blur' }]
})

const frontCacahOptions=[
  {label:'cookies', value:'cookies'},
  {label:'localStorage', value:'localStorage'},
  {label:'sessionStorage', value:'sessionStorage'},
  {label:'indexDB',value:'indexDB'}
]
const backCacahOptions=[
  {label:'redis',value:'redis'}
]
const cacheOptions=ref()

/** 打开弹窗 */
const open = async (operate: string, tableInfo,type) => {
  form.value = {
    fieldName: '',
    fieldDescribe: '',
    cacheType: '',
    type: ''
  }
  dialogVisible.value = true
  formType.value = operate
  operateType.value = type
  if (operate === 'create') {
    title = type ==='backend'?'新增后端公共变量':'新增前端公共变量'
  } else {
    title = type ==='backend'?'编辑后端公共变量':'编辑前端公共变量'
    form.value = {...tableInfo}
  }
  if(type==='backend'){
    cacheOptions.value=backCacahOptions
  }else{
    cacheOptions.value=frontCacahOptions
  }
  form.value.type = type;
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
const submitForm = () => {
  formRef.value.validate(async (valid) => {
    if (valid) {
      const res = formType.value === 'create' ? await createCommonVar(form.value) : await updateCommonVar(form.value)
      if (res) {
        message.success('保存成功！')
        dialogVisible.value = false
        form.value = {
          fieldName: '',
          fieldDescribe: '',
          cacheType: '',
          type: ''
        }
        emit('success', formType.value,operateType.value)
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
