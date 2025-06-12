<template>
  <div class="head-container">
    <div class="add">
      <el-button
        class="add-input"
        type="primary"
        @click="openForm"
      >
        <Icon icon="ep:plus" />新增分组
      </el-button>
    </div>
  </div>
  <div class="head-container">
    <el-tree
      ref="treeRef"
      :data="deptList"
      :expand-on-click-node="false"
      :filter-node-method="filterNode"
      :props="defaultProp"
      default-expand-all
      highlight-current
      @node-click="handleNodeClick"
      node-key="id">
      <template #default="{ node, data }">
          <span class="custom-tree-node">
            <span class="men-title">
              <span> {{ node.label }}</span>
            </span>
            <span class="action">
              <el-icon @click="addMenu(data)"><Edit /></el-icon>
              <el-icon style="margin-left: 8px" @click="remove(data)"><Delete /></el-icon>
            </span>
          </span>
      </template>
    </el-tree>
  </div>
  <el-dialog
    v-model="dialogVisible"
    :title="title"
    width="800"
  >
    <el-form
      class="mt20px"
      :model="form"
      ref="queryFormRef"
      :inline="true"
      label-width="100px"
    >
      <el-row class="row-bg" justify="space-evenly" style="display: inline-table;">
        <el-col :span="12">
          <el-form-item label="上级分组">
            <el-tree-select
              v-model="form.parentId"
              :data="deptList"
              :props="defaultProp"
              check-strictly
              clearable
              :highlight-current="true"
              :render-after-expand="false"
              style="width: 240px"
            />
          </el-form-item>
          <el-form-item label="分组名称" prop="groupName">
            <el-input
              v-model="form.groupName"
              placeholder="请输入模板名称"
              clearable
              class="!w-240px"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="排序" prop="numSort">
            <el-input
              v-model="form.numSort"
              placeholder="请输入排序"
              clearable
              class="!w-240px"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">
          确认
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ElTree } from 'element-plus'
import * as api from './api'
import { Delete, Edit } from '@element-plus/icons-vue'
const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化
const queryFormRef = ref()
defineOptions({ name: 'TemplateTree' })
let title = "添加模板分组"

const deptName = ref('')
const deptList = ref<Tree[]>([]) // 树形结构
const treeRef = ref<InstanceType<typeof ElTree>>()
const dialogVisible = ref(false)
/** 获得部门树 */
const getTree = async () => {
  const res = await api.getTree()
  deptList.value = res
}
const form = ref({
  id: undefined,
  parentId: '',
  groupName: undefined,
  numSort: undefined,
})

const defaultProp = {
  children: 'children',
  label: 'groupName',
  value: 'id'
}

/** 基于名字过滤 */
const filterNode = (name: string, data: Tree) => {
  if (!name) return true
  return data.name.includes(name)
}

const openForm = ()=>{
  title = '添加模板分组'
  form.value = {
    id: undefined,
    groupName: undefined,
    numSort: undefined,
    parentId: undefined,
  }
  dialogVisible.value = true
}

const submitForm = () => {
  queryFormRef.value.validate(async (valid) => {
    if (valid) {
      let res: any = null
      if (form.value.id) {
        res = await api.updateTemplateGroup(form.value)
      } else {
        res = await api.createTemplateGroup(form.value)
      }
      if (res) {
        message.success('提交成功！')
        dialogVisible.value = false
        queryFormRef.value?.clearValidate()
      } else {
        message.error('表单验证失败，请检查输入')
      }
      getTree()
    } else {
      return false
    }
  })
}

const addMenu=async (data: Tree) =>{
  const res = await api.getTemplateGroup(data.id)
  if (res.parentId === 0) {
    res.parentId = ''
  }
  form.value = res
  title = '修改模板分组'
  dialogVisible.value = true
}
const remove= async (data: Tree)=>{
  try {
    // 删除的二次确认
    await message.delConfirm()
    // 发起删除
    await api.deleteTemplateGroup(data.id)
    message.success(t('common.delSuccess'))
    getTree()
  } catch {}
}

/** 处理分组被点击 */
const handleNodeClick = async (row: { [key: string]: any }) => {
  emits('node-click', row)
  emits('data-received', row.id);
}
const emits = defineEmits(['node-click', 'data-received'])

/** 监听deptName */
watch(deptName, (val) => {
  treeRef.value!.filter(val)
})

/** 初始化 */
onMounted(async () => {
  await getTree()
})
</script>
<style lang="scss" scoped>
.add{
  display: flex;
  justify-content: flex-end;
  margin-bottom: 10px;
  .add-input{
    margin-right: 5px;
    width: 100%;
  }
  :deep(.el-icon){
    color:#fff;
    margin-right: 10px;
  }
}
.custom-tree-node {
  color: #333;
  width: 100%;
  display: flex;
  justify-content: space-between;
  .men-title{
    display: flex;
    justify-content: center;
    align-items: center;
    img{
      height: 12px;
      margin-right: 4px;
    }
    .app_img{
      height: 18px;
    }
  }
  .action{
    display:none;
  }
  &:hover{
    .action{
      display:block;
    }
  }
}
.el-icon {
  cursor: pointer;
  color: #333;
}
</style>
