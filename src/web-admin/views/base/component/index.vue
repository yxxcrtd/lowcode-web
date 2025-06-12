<template>
  <TreeListPage ref="queryFormRef" :columns="columns" :row-height="58" :data-fun="getList">
    <template #left>
      <ComponentsTree @data-received="handleDataFromChild" />
    </template>
    <template #searchItems="{queryParams}">
      <el-row>
        <el-col :span="8">
          <el-form-item label="组件名称">
            <el-input
              v-model="queryParams.componentName"
              placeholder="请输入组件名称"
              clearable
              @keyup.enter="handleQuery"
              class="!w-240px"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="创建时间">
            <el-date-picker
              v-model="queryParams.createTime"
              value-format="YYYY-MM-DD HH:mm:ss"
              type="datetimerange"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              class="!w-100%"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </template>
    <template #buttonItems>
      <el-button
        type="primary"
        @click="openForm('create')"
      >
        <Icon icon="ep:plus" /> 新增
      </el-button>
    </template>
    <template #action_default="{ row }">
      <div class="table-action">
        <el-link type="primary" @click="updateComponent('edit', row)">编辑</el-link>
        <el-divider direction="vertical" />
        <el-link type="primary" @click="delComponent(row)">删除</el-link>
      </div>
    </template>
  </TreeListPage>

  <!-- 添加或修改用户对话框 -->
  <ComponentForm ref="formRef" @success="getList"/>
</template>
<script lang="ts" setup>
import { columns } from './data';
import * as api from "./api";
import TreeListPage from "@/web-admin/components/PageTemplate/TreeListPage.vue"
import ComponentForm from './ComponentForm.vue'
import ComponentsTree from './ComponentsTree.vue'
import {ref} from "vue";

defineOptions({ name: 'ComponentTable' })
const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化
let listQ = ref([])
const getTestList = async () => {
  const {list} = await api.getTree()
  listQ.value = list
}
const queryFormRef = ref() // 搜索的表单

const dataFromChild = ref('');
const groupId = ref()
const handleDataFromChild = (data) => {  
      dataFromChild.value = data;
      groupId.value = data
      handleQuery()
}; 

// watch(queryParams, (a, b) => {
//   console.log(a, 'a')
//   console.log(b, 'b')
// })


/** 查询列表 */
const getList = (queryParams) => {    
  if (groupId.value) {
    queryParams = { ...queryParams, groupId: groupId.value };
  }
  return api.getComponentTablePage(queryParams)
}

const delComponent =async (row)=>{
  try {
    // 删除的二次确认
    await message.delConfirm()
    // 发起删除
    await api.deleteComponentTable(row.id)
    message.success(t('common.delSuccess'))
    queryFormRef.value.search()
  } catch {}
}
/** 搜索按钮操作 */
const handleQuery = () => {
  queryFormRef.value.search()
}

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value?.resetFields()
  handleQuery()
}

/** 添加/修改操作 */
const formRef = ref()
const openForm = (type: string, id?: number) => {
  formRef.value.open(type, id)
}

const updateComponent = (type: string, data) => {
  formRef.value.open(type, data.id)
}

onMounted(() => {
  getTestList()
  queryFormRef.value.search()
})
</script>
