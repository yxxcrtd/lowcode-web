<template>
  <Dialog :title="title" v-model="dialogVisible" width="700">
    <div class="dialog-wrap">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="110">
        <el-row>
          <el-col :span="12">
            <el-form-item label="上级模块" prop="parentId">
              <el-tree-select v-model="form.parentId" :data="menuList" check-strictly :props="defaultProps" node-key="id" :render-after-expand="false" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="类型" prop="functionType">
              <el-radio-group v-model="form.functionType">
                <el-radio value="1">目录</el-radio>
                <el-radio value="2">模块</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="模块名称" prop="functionName">
              <el-input v-model="form.functionName" @change="handleNameChange"/>
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="form.functionType=='2'">
            <el-form-item label="模块编码" prop="functionCode">
              <el-input v-model="form.functionCode" />
            </el-form-item>
          </el-col>
          <el-col :span="12" v-else>
          </el-col>
          <el-col :span="12">
            <el-form-item label="模块图标" prop="functionIcon">
              <IconSelect v-model="form.functionIcon" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="form.functionType=='2'">
            <el-form-item label="模块状态" prop="status">
              <el-radio-group v-model="form.status">
                <el-radio value="1">开启</el-radio>
                <el-radio value="2">停用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12" v-else>
          </el-col>
          <el-col :span="12">
            <el-form-item label="排序" prop="sort">
              <el-input v-model="form.sort" type="number"/>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="描述" prop="remark">
              <el-input v-model="form.remark" :rows="2" type="textarea" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="cancel">取 消</el-button>
        <el-button type="primary" @click="submitForm">确 定</el-button>
      </span>
    </template>
  </Dialog>
</template>
<script lang="ts" setup>
import { createFunctionInfo, updateFunctionInfo } from '@/api/system/menu'
import { ref } from 'vue'
import { handleTree } from '@/utils/tree'
import * as MenuApi from '@/api/system/menu'
import {getPinyin} from '@/utils'

defineOptions({ name: 'ModuleEditDialog' })

let title = ref('创建')
const message = useMessage() // 消息弹窗
const dialogVisible = ref(false)
const bizType = ref('create')
const formRef = ref()
const form = ref({
  id: '',
  parentId: '',
  functionName: '',
  functionIcon: '',
  functionType: '',
  functionCode: '',
  sort: 1,
  status: '',
  remark: ''
})
const rules = reactive({
  functionName: [{ required: true, message: '请输入模块名称', trigger: 'blur' }],
  functionCode: [{ required: true, message: '请输入模块编码', trigger: 'blur' }],
  icon: [{ required: true, message: '请选择图标', trigger: 'blur' }]
})

const defaultProps = {
  children: 'children',
  label: 'functionName',
  value: 'id'
}

/** 打开弹窗 */
const menuList = ref<any>([]) // 列表的数据
const open = async (type: string, info) => {
  form.value = {
    id: '',
    parentId: '',
    functionName: '',
    functionIcon: '',
    functionType: '2',
    functionCode: '',
    sort: 1,
    status: '1',
    remark: ''
  }
  if (info && info.id !== undefined && info.id !== '') {
    let res: any = null
    res = await MenuApi.getFunctionInfo(info.id)
    if (res.parentId === 0) {
      res.parentId = ''
    }
    if (type === 'create') {
      form.value.parentId = res.id
    } else {
      form.value = res
    }
  }
  getMenuList()
  if (type === 'create') {
    title.value = '创建模块'
  } else {
    title.value = '编辑模块'
  }
  bizType.value = type
  dialogVisible.value = true
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
const submitForm = () => {
  formRef.value.validate(async (valid) => {
    if (valid) {
      let res: any = null
      if (form.value.id) {
        res = await updateFunctionInfo(form.value)
      } else {
        res = await createFunctionInfo(form.value)
      }
      if (res) {
        message.success('提交成功！')
        dialogVisible.value = false
        emit('success', bizType.value, res)
        form.value = {
          id: '',
          parentId: '',
          functionName: '',
          functionIcon: '',
          functionType: '',
          functionCode: '',
          sort: 0,
          status: '',
          remark: ''
        }
      } else {
        message.error('表单验证失败，请检查输入')
      }
    } else {
      return false
    }
  })
}

const cancel = () => {
  dialogVisible.value = false
  form.value = {
    id: '',
    parentId: '',
    functionName: '',
    functionIcon: '',
    functionType: '',
    functionCode: '',
    sort: 0,
    status: '',
    remark: ''
  }
}

const handleNameChange=()=>{
  form.value.functionCode=getPinyin(form.value.functionName,'MK-')
}

/** 查询列表 */
const getMenuList = async () => {
  const data = await MenuApi.getFunctionInfoList({})
  menuList.value = handleTree(data)
}

onMounted(() => {
  getMenuList()
})
</script>
<style scoped lang="scss">
:deep(.el-tree .el-tree-node .el-tree-node__content .el-select-dropdown__item) {
  font-weight: 600 !important;
}
.el-tree .el-tree-node .el-tree-node__content .el-select-dropdown__item {
  font-weight: 600 !important;
}
</style>
