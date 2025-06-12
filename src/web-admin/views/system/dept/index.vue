<template>
  <!-- 搜索工作栏 -->
  <div class="list-page-container">
    <div class="search-content">
      <div class="search-items">
        <el-form class="-mb-15px" :model="queryParams" ref="queryFormRef" :inline="true" label-width="110px">
          <el-form-item label="部门名称" prop="name">
            <el-input v-model="queryParams.name" placeholder="请输入部门名称" clearable class="!w-240px" />
          </el-form-item>
          <el-form-item label="部门状态" prop="status">
            <el-select v-model="queryParams.status" placeholder="请选择部门状态" clearable class="!w-240px">
              <el-option
                v-for="dict in getIntDictOptions(DICT_TYPE.COMMON_STATUS)"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </el-form-item>
        </el-form>
      </div>
      <div class="search-action">
        <el-button type="primary" @click="handleQuery"><Icon icon="ep:search" />搜索</el-button>
        <el-button @click="resetQuery"><Icon icon="ep:refresh" />重置</el-button>
      </div>
    </div>
    <div class="button-content">
      <el-button v-hasPermi="['system:dept:create']" type="primary" @click="openForm('create')">
        <Icon icon="ep:plus" /> 新增
      </el-button>
    </div>
    <!-- 列表 -->
    <div class="content">
      <JVxeTable
        ref="jVxeTable"
        :columns="columns"
        height="100%"
        :tree-config="{ transform: true, rowField: 'id', parentField: 'parentId' }"
        :row-height="58"
        :data-url="DeptApi.getDeptPageUrl"
        :searchParams="queryParams"
      >
        <template #action_default="{ row }">
          <div v-hasPermi="['system:dept:update']" class="table-action" v-if="row.code !== 'master'">
            <el-link type="primary" @click="openForm('update', row.id)">编辑</el-link>
            <el-divider direction="vertical" />
            <el-link v-hasPermi="['system:dept:delete']" type="primary" @click="handleDelete(row.id)">删除</el-link>
          </div>
        </template>
        <template #status_default="{ row }">
          <dict-tag :type="DICT_TYPE.COMMON_STATUS" :value="row.status" />
        </template>
      </JVxeTable>
    </div>
  </div>
  <!-- 表单弹窗：添加/修改 -->
  <DeptForm ref="formRef" @success="getList" />
</template>
<script lang="ts" setup>
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import * as DeptApi from '@/api/system/dept'
import DeptForm from './DeptForm.vue'
import { columns } from './data'

defineOptions({ name: 'SystemDept' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化
const queryParams = reactive({
  name: undefined,
  status: undefined
})

const queryFormRef = ref() // 搜索的表单
const isExpandAll = ref(true) // 是否展开，默认全部展开
const refreshTable = ref(true) // 重新渲染表格状态
const jVxeTable = ref()
/** 查询部门列表 */
const getList = async () => {
  jVxeTable.value?.refresh(true)
}

/** 展开/折叠操作 */
const toggleExpandAll = () => {
  refreshTable.value = false
  isExpandAll.value = !isExpandAll.value
  nextTick(() => {
    refreshTable.value = true
  })
}

/** 搜索按钮操作 */
const handleQuery = () => {
  getList()
}

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value.resetFields()
  handleQuery()
}

/** 添加/修改操作 */
const formRef = ref()
const openForm = (type: string, id?: number) => {
  formRef.value.open(type, id)
}

/** 删除按钮操作 */
const handleDelete = async (id: number) => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    // 发起删除
    await DeptApi.deleteDept(id)
    message.success(t('common.delSuccess'))
    // 刷新列表
    await getList()
  } catch {}
}
</script>
