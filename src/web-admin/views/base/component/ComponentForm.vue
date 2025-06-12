<template>
    <el-drawer
      v-model="dialogVisible"
      :title="dialogTitle"
      size="60%"
      direction="rtl"
    >
    <el-form
      ref="formRef"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="110px"
    >
      <el-row>
        <el-col :span="12">
          <el-form-item label="组件名称" prop="componentName">
            <el-input v-model="formData.componentName" placeholder="请输入组件名称" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="组件分组" prop="groupId">
            <el-tree-select
              v-model="formData.groupId"
              :data="groupList"
              clearable
              :props="defaultProp"
              check-strictly
              node-key="id"
              placeholder="请选择组件分组"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="组件编码" prop="componentCode">
            <el-input v-model="formData.componentCode" placeholder="请输入组件编码" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="说明" prop="remark">
            <el-input v-model="formData.remark" placeholder="请输入组件说明" />
          </el-form-item>
        </el-col>
      </el-row>
      <component-props-table ref="propsFormRef" v-model="myTableData"/>
    </el-form>
    <template #footer>
      <div class="footer">
        <el-button :disabled="formLoading" type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="dialogVisible = false">取 消</el-button>
      </div>
    </template>
  </el-drawer>
</template>
<script lang="ts" setup>
import { CommonStatusEnum } from '@/utils/constants'
import ComponentPropsTable from "@/web-admin/views/base/component/ComponentPropsTable.vue";
import * as api from './api'
import { FormRules } from 'element-plus'
import { ref } from 'vue';

defineOptions({ name: 'SystemUserForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗
const propsFormRef = ref()
const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined,
  groupId: undefined,
  componentName: '',
  componentCode: '',
  status: CommonStatusEnum.ENABLE,
  addComponentAttribute: [],
  updateComponentAttribute: [],
  delComponentAttribute: [],
})
const formRules = reactive<FormRules>({
  componentName: [{ required: true, message: '请输入组件名称', trigger: 'blur' }],
  componentCode: [{ required: true, message: '请输入组件编码', trigger: 'blur' }],
  groupId: [{ required: true, message: '请选择组件分组', trigger: 'blur' }],
})
const formRef = ref() // 表单 Ref
const groupList = ref<Tree[]>([]) // 树形结构

/** 打开弹窗 */
const myTableData = ref([]); 
const open = async (type: string, id?: number) => {
  dialogVisible.value = true
  formLoading.value = true
  await nextTick()
  if (type === 'create') {
    dialogTitle.value = t('action.' + type)
    myTableData.value =[]
  } else {
    dialogTitle.value = t('action.' + 'edit')
  }
  formType.value = type
  resetForm()
  // 修改时，设置数据
  if (id) {
    try {
      let res = await api.getComponentTable(id)
      formData.value = res
      myTableData.value = res.componentAttributeList

      formData.value.addComponentAttribute=[]
      formData.value.updateComponentAttribute=[]
      formData.value.delComponentAttribute=[]
    } finally {
      formLoading.value = false
    }
  } 
  // 加载部门树
  groupList.value = await api.getTree()
  formLoading.value = false
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

/** 提交表单 */
const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
const submitForm = async () => {
  // 校验表单
  if (!formRef.value) return
  const valid = await formRef.value.validate()
  if (!valid) return
  // 提交请求
  formLoading.value = true
  myTableData.value.forEach(item=>{
    if(item.type==='Add'){
      formData.value.addComponentAttribute.push(item)
    }else if(item.type==='Del'){
      formData.value.delComponentAttribute.push(item)
    }else{
      formData.value.updateComponentAttribute.push(item)
    }
  })
  try {
    if (formType.value === 'create') {
      await api.createComponentTable(formData.value)
      message.success(t('common.createSuccess'))
    } else {
      await api.updateComponentTable(formData.value)
      message.success(t('common.updateSuccess'))
    }
    dialogVisible.value = false
    // 发送操作成功的事件
    emit('success')
  } finally {
    formLoading.value = false
  }
}

const defaultProp = {
  children: 'children',
  label: 'groupName',
  value: 'id'
}

/** 重置表单 */
const resetForm = () => {
  formData.value = {
    id: undefined,
    groupId: undefined,
    componentName: '',
    componentCode: '',
    status: CommonStatusEnum.ENABLE,
    addComponentAttribute: [],
    updateComponentAttribute: [],
    delComponentAttribute: [],
  }
  formRef.value?.resetFields()
}
</script>
<style scoped lang="scss">
.footer{
  position: absolute;
  bottom: 10px;
}
</style>
