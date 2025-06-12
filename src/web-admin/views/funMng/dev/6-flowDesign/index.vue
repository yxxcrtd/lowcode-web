<template>
  <div class="flow-container">
    <div class="btn-action">
      <el-button type="primary" @click="handleAdd('creat')">
        新建流程
      </el-button>
    </div>
    <JVxeTable ref="jVxeTable" class="table-content" :columns="columns" :row-height="58" height="100%" :data-url="api.pageInfoPageUrl" :search-params="queryParams">
      <template #action_default="{ row }">
        <div class="table-action">
          <el-link type="primary" @click="handleEdit('edit',row)">编辑</el-link>
          <el-divider direction="vertical" />
          <el-link type="primary" @click="handleDelete(row.id)">删除</el-link>
        </div>
      </template>
      <template #associationFrom_default="{ row }">
        <div class="table-action">
          <span v-if="row.processType === '1'">内流程</span>
          <span v-else>外流程</span>
        </div>
      </template>
    </JVxeTable>
  </div>
  <Edit ref="editRef" @success="createSuccess"/>
</template>
<script lang="ts" setup>
import { columns } from './data';
import Edit from "./edit.vue"
import * as api from './Components/api'

defineOptions({ name: 'SystemUser' })

const router=useRouter()
const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化
const jVxeTable = ref()

const route = useRoute()
const menuId = route.query.id
const queryParams = reactive({
  menuId: menuId
})


/** 添加/修改操作 */
const editRef = ref()
const handleAdd = (type: string) => {
  editRef.value.open(type)
}
const handleEdit = (type: string, row) => {
  editRef.value.open(type, row.id)
}

/** 删除按钮操作 */
const handleDelete = async (id: number) => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    // 发起删除
    await api.deleteProcessDesign(id)
    message.success(t('common.delSuccess'))
    // 刷新列表
    jVxeTable.value?.refresh()
  } catch {}
}
const createSuccess=(id)=>{
  toDesign(id)
}

const toDesign=(id)=>{
  jVxeTable.value?.refresh()
}

/** 初始化 */
onMounted(() => {
})
</script>

<style scoped lang="scss">
.flow-container{
  height: calc(100vh - 160px);
  .table-content{
    height: calc(100vh - 215px);
  }
}
:deep(.vxe-body--row){
  height:58px;
}
</style>

