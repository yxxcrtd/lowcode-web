<template>
  <div class="role">
    <div class="head">
      <div class="left">角色列表</div>
      <div class="right">
        <el-button
          v-hasPermi="['system:role:create']"
          link
          type="primary"
          @click="openForm('create')"
        >
          <Icon class="mr-5px" icon="ep:plus"/>
          新增角色
        </el-button>
      </div>
    </div>
    <div class="search mt-15px">
      <el-form
        ref="queryFormRef"
        :inline="true"
        :model="queryParams"
        class=""
        label-width="68px"
      >
        <el-form-item label="" prop="name">
          <el-input
            v-model="queryParams.name"
            class=""
            clearable
            placeholder="请输入角色名称"
            @input="handleQuery"
          />
        </el-form-item>
      </el-form>
    </div>
    <div class="role-list">
      <div class="role-item" :class="currentId === roleItem.id?'is-active':''"
           @click="clickRoleItem(roleItem)" v-for="roleItem in list" :key="roleItem.id">
        <div class="icon">
          <Icon class="icon" icon="ep:avatar"/>
        </div>
        <div class="content">
          <span>{{ roleItem.name }}</span>
        </div>
        <div class="role-edit">
          <Icon class="icon" icon="ep:edit" @click.stop="openForm('update', roleItem.id)"/>
        </div>
      </div>
    </div>
  </div>
  <RoleForm ref="formRef" @success="getList"/>
</template>
<script setup lang="ts">
import RoleForm from "@/web-admin/views/system/role/RoleForm.vue";
import * as RoleApi from "@/api/system/role";

const list = ref([]) // 列表的数据
const queryFormRef = ref() // 搜索的表单
const formRef = ref()
const openForm = (type: string, id?: number) => {
  formRef.value.open(type, id)
}
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  name: ''
})
let currentId = ref('')
const getList = async () => {
  const data = await RoleApi.getRolePage(queryParams)
  list.value = data.list
  if (list.value.length > 0) {
    clickRoleItem(list.value[0])
    currentId.value = list.value[0].id
  }
}
const handleQuery = () => {
  getList()
}
const emit = defineEmits(['clickRoleItem'])
const clickRoleItem = (roleItem) => {
  currentId.value = roleItem.id
  emit('clickRoleItem', roleItem)
}
// defineEmits(['clickRoleItem'])
onMounted(() => {
  getList()
})
</script>
<style scoped lang="scss">
.role {
  .head {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .role-item {
    display: flex;
    height: 35px;
    align-items: center;
    cursor: pointer;
    border-radius: 5px;

    &:hover {
      //color: #fff;
      //background-color: var(--el-color-primary);
      border-left: 1px solid var(--el-color-secondary);

      .role-edit {
        visibility: visible;
      }
    }

    .icon {
      width: 30px;
      color:#a3a3a3;
    }

    .content {
      flex: 1;
      font-size: 14px;
    }

    .role-edit {
      width: 30px;
      visibility: hidden;
    }
  }

  .is-active {
    color: #fff;
    background-color: var(--el-color-primary);
    border-left: 1px solid var(--el-color-secondary);

    .role-edit {
      visibility: visible;
    }

    .icon {
      width: 30px;
      color:#fff;
    }
  }
}
</style>
