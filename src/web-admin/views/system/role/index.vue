<template>
  <div class="page-tree-container">
    <div class="left-tree-wrap">
      <RoleList @click-role-item="clickRoleItem"/>
    </div>
    <div class="right-list-wrap">
      <el-tabs v-model="activeName" @tab-change="handleChange">
        <el-tab-pane label="成员管理" name="first">
          <RoleUserList ref="roleUserRef"/>
        </el-tab-pane>
        <el-tab-pane label="菜单权限" name="second">
          <RoleAssignMenuForm ref="roleAssignMenuRef"/>
        </el-tab-pane>
        <el-tab-pane label="数据权限" name="third">
          <RoleDataPermissionForm ref="roleDataPermissionRef"/>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>
<script lang="ts" setup>
import RoleList from "@/web-admin/views/system/role/RoleList.vue";
import RoleUserList from './RoleUserList.vue'
import RoleDataPermissionForm from './RoleDataPermissionForm.vue'
import RoleAssignMenuForm from './RoleAssignMenuForm.vue'
import { number, string } from "vue-types";

defineOptions({name: 'SystemRole'})

let activeName = ref('first')
const roleUserRef = ref()
const roleAssignMenuRef = ref()
const roleDataPermissionRef = ref()
const handleChange = (name: string) => {
  if (name === 'first') {
    roleUserRef.value?.handleQuery(currentRoleItem.id)
  } else if (name === 'second') {
    roleAssignMenuRef.value?.handleSelect(currentRoleItem.id, currentRoleItem.name, currentRoleItem.code)
  } else {
    roleDataPermissionRef.value?.handleSelect(currentRoleItem)
  }
}
let currentRoleItem = reactive({
  id: number,
  name: string,
  code: string,
})
const clickRoleItem = (item) => {
  currentRoleItem = item
  activeName.value = 'first'
  handleChange('first')
}

</script>
<style lang="scss" scoped>
 :deep(.el-tabs__content){
  overflow:visible;
 }
</style>
