<template>
<div class="role-user-content" >
  <JVxeTable ref="jVxeTable" :columns="columns" v-if="queryParams.roleId" :row-height="58" :data-url="RoleApi.getUserByRoleIdPageUrl" :searchParams="queryParams">
    <template #action_default="{ row }">
      <div class="flex items-center justify-center">
        <el-button
          type="primary"
          link
          @click="handleDelete(row.id)"
          v-hasPermi="['system:permission:delete-user-role']"
        >
          <Icon icon="ep:delete" />删除
        </el-button>
      </div>
    </template>
  </JVxeTable>
</div>
</template>
<script setup lang="ts">
import * as RoleApi from "@/api/system/role";
import * as PermissionApi from "@/api/system/permission";
import {columns} from "@/web-admin/views/system/role/RoleUserListData";
const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const queryParams = reactive({
  roleId: undefined
})
const jVxeTable = ref()
const getList = async () => {
  jVxeTable.value?.refresh(true)
}
/** 搜索按钮操作 */
const handleQuery = (roleId?) => {
  if (roleId) {
    queryParams.roleId = roleId
  }
  getList()
}
defineExpose({ handleQuery })
/** 删除按钮操作 */
const handleDelete = async (id: number) => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    // 发起删除
    await PermissionApi.deleteUserRole(queryParams.roleId,id)
    message.success(t('common.delSuccess'))
    // 刷新列表
    await getList()
  } catch {}
}
</script>
<style scoped lang="scss">
.role-user-content{
  padding: 5px;
}
</style>
