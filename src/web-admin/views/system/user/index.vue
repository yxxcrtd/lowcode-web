<template>
  <div class="page-tree-container">
    <div class="left-tree-wrap">
      <DeptTree @node-click="handleDeptNodeClick" />
    </div>
    <div class="right-list-wrap">
      <div class="search-content">
        <div class="search-items">
          <el-form
            class="-mb-15px"
            :model="queryParams"
            ref="queryFormRef"
            :inline="true"
            label-width="68px"
          >
            <el-form-item label="用户名称" prop="username">
              <el-input
                v-model="queryParams.username"
                placeholder="请输入用户名称"
                clearable
                @keyup.enter="handleQuery"
                class="!w-240px"
              />
            </el-form-item>
            <el-form-item label="手机号码" prop="mobile">
              <el-input
                v-model="queryParams.mobile"
                placeholder="请输入手机号码"
                clearable
                @keyup.enter="handleQuery"
                class="!w-240px"
              />
            </el-form-item>
            <el-form-item label="状态" prop="status">
              <el-select
                v-model="queryParams.status"
                placeholder="用户状态"
                clearable
                class="!w-240px"
              >
                <el-option
                  v-for="dict in getIntDictOptions(DICT_TYPE.COMMON_STATUS)"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="创建时间" prop="createTime">
              <el-date-picker
                v-model="queryParams.createTime"
                value-format="YYYY-MM-DD HH:mm:ss"
                type="datetimerange"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                class="!w-240px"
              />
            </el-form-item>
          </el-form>
        </div>
        <div class="search-action">
          <el-button type="primary" @click="handleQuery"><Icon icon="ep:search" />搜索</el-button>
          <el-button @click="resetQuery"><Icon icon="ep:refresh" />重置</el-button>
        </div>
      </div>
      <div class="button-content">
        <el-button type="primary" @click="openForm('create')"> <Icon icon="ep:plus" /> 新增 </el-button>
        <el-button
          type="warning"
          plain
          @click="handleImport"
          v-hasPermi="['system:user:import']"
        >
          <Icon icon="ep:upload" /> 导入
        </el-button>
        <el-button
          type="success"
          plain
          @click="handleExport"
          :loading="exportLoading"
          v-hasPermi="['system:user:export']"
        >
          <Icon icon="ep:download" />导出
        </el-button>
      </div>
      <div class="content">
        <JVxeTable ref="jVxeTable" :columns="columns" :row-height="58" height="100%"
        :searchParams="queryParams"
        :data-fun="getListApi">
          <template #action_default="{ row }">
            <div class="flex items-center justify-center">
                <el-button
                  type="primary"
                  link
                  @click="openForm('update', row.id)"
                >
                  <Icon icon="ep:edit" />修改
                </el-button>
                <el-dropdown
                  @command="(command) => handleCommand(command, row)"
                >
                  <el-button type="primary" link><Icon icon="ep:d-arrow-right" /> 更多</el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item
                        command="handleDelete"
                      >
                        <Icon icon="ep:delete" />删除
                      </el-dropdown-item>
                      <el-dropdown-item
                        command="handleResetPwd"
                      >
                        <Icon icon="ep:key" />重置密码
                      </el-dropdown-item>
                      <el-dropdown-item
                        command="handleRole"
                      >
                        <Icon icon="ep:circle-check" />分配角色
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
          </template>
          <template #status_default="{ row }">
              <el-switch
                v-model="row.status"
                :active-value="0"
                :inactive-value="1"
                @change="handleStatusChange(row)"
              />
          </template>
        </JVxeTable>
      </div>  
    </div>
  </div>
  <!-- 添加或修改用户对话框 -->
  <UserForm ref="formRef" @success="getList" />
  <!-- 用户导入对话框 -->
  <UserImportForm ref="importFormRef" @success="getList" />
  <!-- 分配角色 -->
  <UserAssignRoleForm ref="assignRoleFormRef" @success="getList" />
</template>
<script lang="ts" setup>
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { checkPermi } from '@/utils/permission'
import { columns } from './data';
import download from '@/utils/download'
import { CommonStatusEnum } from '@/utils/constants'
import * as UserApi from '@/api/system/user'
import UserForm from './UserForm.vue'
import UserImportForm from './UserImportForm.vue'
import UserAssignRoleForm from './UserAssignRoleForm.vue'
import DeptTree from './DeptTree.vue'

defineOptions({ name: 'SystemUser' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(true) // 列表的加载中
// const total = ref(0) // 列表的总页数
// const list = ref([]) // 列表的数
const jVxeTable = ref()
const queryParams = reactive({
  username: undefined,
  mobile: undefined,
  status: undefined,
  deptId: undefined,
  createTime: []
})
const queryFormRef = ref() // 搜索的表单

const getListApi = (queryParams) => {    
  return UserApi.getUserPage(queryParams)
}
/** 查询列表 */
const getList = async (op: any) => {
  loading.value = true
  try {
    /* const data = await UserApi.getUserPage(queryParams)
    list.value = data.list
    total.value = data.total */
    if (jVxeTable.value && jVxeTable.value.loadData) {
      jVxeTable.value.loadData(op)
    }
  } finally {
    loading.value = false
  }
}

/** 搜索按钮操作 */
const handleQuery = () => {
  getList('reload')
}

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value?.resetFields()
  handleQuery()
}

/** 处理部门被点击 */
const handleDeptNodeClick = async (row) => {
  queryParams.deptId = row.id
  await getList(null)
}

/** 添加/修改操作 */
const formRef = ref()
const openForm = (type: string, id?: number) => {
  formRef.value.open(type, id)
}

/** 用户导入 */
const importFormRef = ref()
const handleImport = () => {
  importFormRef.value.open()
}

/** 修改用户状态 */
const handleStatusChange = async (row: UserApi.UserVO) => {
  try {
    // 修改状态的二次确认
    const text = row.status === CommonStatusEnum.ENABLE ? '启用' : '停用'
    await message.confirm('确认要"' + text + '""' + row.username + '"用户吗?')
    // 发起修改状态
    await UserApi.updateUserStatus(row.id, row.status)
    // 刷新列表
    await getList(null)
  } catch {
    // 取消后，进行恢复按钮
    row.status =
      row.status === CommonStatusEnum.ENABLE ? CommonStatusEnum.DISABLE : CommonStatusEnum.ENABLE
  }
}

/** 导出按钮操作 */
const exportLoading = ref(false)
const handleExport = async () => {
  try {
    // 导出的二次确认
    await message.exportConfirm()
    // 发起导出
    exportLoading.value = true
    const data = await UserApi.exportUser(queryParams)
    download.excel(data, '用户数据.xls')
  } catch {
  } finally {
    exportLoading.value = false
  }
}

/** 操作分发 */
const handleCommand = (command: string, row: UserApi.UserVO) => {
  switch (command) {
    case 'handleDelete':
      handleDelete(row.id)
      break
    case 'handleResetPwd':
      handleResetPwd(row)
      break
    case 'handleRole':
      handleRole(row)
      break
    default:
      break
  }
}

/** 删除按钮操作 */
const handleDelete = async (id: number) => {
  try {
    // 删除的二次确认
    await message.delConfirm()
     // 如果删除的是非第一页，并且当前页只有一条数据的数据，页码需要减1
    let currentPage = jVxeTable.value.tablePage.currentPage
    let op: String = ''
    if (currentPage > 1) {
      let len = jVxeTable.value.tableData.length
      if (len === 1) {
        op = 'delLast'
      }
    }
    // 发起删除
    await UserApi.deleteUser(id)
    message.success(t('common.delSuccess'))
    // 刷新列表
    await getList(op)
  } catch {}
}

/** 重置密码 */
const handleResetPwd = async (row: UserApi.UserVO) => {
  try {
    // 重置的二次确认
    const result = await message.prompt(
      '请输入"' + row.username + '"的新密码',
      t('common.reminder')
    )
    const password = result.value
    // 发起重置
    await UserApi.resetUserPwd(row.id, password)
    message.success('修改成功，新密码是：' + password)
  } catch {}
}

/** 分配角色 */
const assignRoleFormRef = ref()
const handleRole = (row: UserApi.UserVO) => {
  assignRoleFormRef.value.open(row)
}

/** 初始化 */
// onMounted(() => {
//   getList()
// })
</script>
<style lang="scss" scoped>
</style>
