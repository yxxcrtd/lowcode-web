<template>
  <div class="menu-mng-container">
    <div class="btn-action">
      <el-button type="primary" @click="addMenu('create')"> 新建菜单 </el-button>
    </div>
    <div class="table-content">
      <vxe-table
        ref="vxeTableRef"
        border="inner"
        height="100%"
        :row-config="{ height: '58px' }"
        :tree-config="{ transform: true, rowField: 'id', parentField: 'parentId', expandAll: true }"
        :data="menuTableList"
      >
        <vxe-column title="序号" width="80">
          <template #default="{ rowIndex, row }">
            <span v-if="row.type == 1">{{ rowIndex + 1 }}</span>
          </template>
        </vxe-column>
        <vxe-column field="name" title="菜单名称" tree-node min-width="200">
          <template #default="{ row }">
            <el-tag type="primary" v-if="row.isMain">主页面</el-tag>
            {{ row.name }}
          </template>
        </vxe-column>
        <vxe-column field="type" title="菜单类型" width="130">
          <template #default="{ row }">
            <el-tag type="warning" v-if="row.type == 1">目录</el-tag>
            <el-tag type="success" v-if="row.type == 2 && row.pageType === 'list'">列表页</el-tag>
            <el-tag type="primary" v-if="row.type == 2 && row.pageType === 'form'">表单页</el-tag>
          </template>
        </vxe-column>
        <vxe-column field="path" title="菜单路径" min-width="200">
          <template #default="{ row }">
            {{row.path}}
            <template v-if="row.type == 2">
              <el-tooltip content="页面预览" placement="top" >
                <el-link type="primary" @click="toPreview(1,row)">功能预览</el-link>
              </el-tooltip>
              <el-tooltip content="页面预览" placement="top" v-if="row.pageType === 'form'">
                <el-link class="ml-10px" type="primary" @click="toPreview(2,row)">发起预览</el-link>
              </el-tooltip>
            </template>
          </template>
        </vxe-column>
        <vxe-column field="pageName" title="关联页面" width="200"></vxe-column>
        <vxe-column field="sort" title="排序" width="130"></vxe-column>
        <vxe-column field="action" title="操作" align="center" width="240">
          <template #default="{ row }">
            <div class="table-action">
              <el-link type="primary" @click="handleEdit(row)">编辑</el-link>
              <el-divider direction="vertical" v-if="row.type === 2" />
              <el-link type="primary" v-if="row.type === 2" @click="openModelDialog(row)">按钮权限</el-link>
              <el-divider direction="vertical" />
              <el-link type="primary" @click="handleDelete(row)">删除</el-link>
            </div>
          </template>
        </vxe-column>
      </vxe-table>
    </div>
  </div>
  <EditDialog ref="editDialogRef" @success="dialogSuccess" />
  <EditDrawer ref="editDrawerRef" />
</template>
<script lang="ts" setup>
import { deleteMenu, getModuleMenuList } from './api'
import EditDialog from './Components/EditDialog.vue'
import EditDrawer from './Components/buttonPermissionDrawer.vue'

defineOptions({ name: 'MenuMng' })

const router = useRouter()
const message = useMessage() // 消息弹窗

const route = useRoute()
const { id } = route.query

const menuTableList = ref([])
const vxeTableRef = ref()
/**
 * 查询模块的菜单数据
 */
const getList = async () => {
  const param = {
    moduleType: 1,
    functionId: id
  }
  const res = await getModuleMenuList(param)
  menuTableList.value = res
  await nextTick()
  vxeTableRef.value.setAllTreeExpand(true)
}
/**
 * 新增
 */
const addMenu = () => {
  openForm('create')
}
/**
 * 菜单编辑
 * @param row
 */
const handleEdit = async (row) => {
  openForm('edit', row)
}
/**
 * 新增编辑弹框
 */
const editDialogRef = ref()
const openForm = (type: string, id?: number) => {
  editDialogRef.value.open(type, id)
}
/**
 * 按钮权限
 */
const editDrawerRef = ref()
const openModelDialog = (row: any) => {
  // console.log(row)
  editDrawerRef.value.open(row)
}

/** 删除按钮操作 */
const handleDelete = async (row) => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    // 发起删除
    await deleteMenu(row.id)
    message.success('删除成功')
    // 刷新列表
    await getList()
  } catch {}
}

const dialogSuccess = () => {
  getList()
}
const toPreview=(type,row)=>{
  let viewUrl=window.location.origin
  const parentRow=menuTableList.value.find(item=>item.id==row.parentId)
  if(parentRow){
    if(type==1){
      viewUrl=viewUrl+parentRow.path+"/"+row.path
      if(row.pageType==='form'){
        viewUrl=viewUrl+"?pageType=create"
      }
    }else{
      if(row.pageType==='form'){
        viewUrl=`/workflow_form?pageId=${row.pageId}&pageType=create&business_id=`
      }else{
        viewUrl=viewUrl+parentRow.path+"/"+row.path
      }
    }
    window.open(viewUrl,'_blank')
  }
}
/** 初始化 */
onMounted(() => {
  getList()
})
const refreshPage = () => {
  getList()
}
defineExpose({ refreshPage }) // 提供 open 方法，用于打开弹窗
</script>
<style scoped lang="scss">
.menu-mng-container {
  height: calc(100vh - 160px);
  .table-content {
    height: calc(100vh - 215px);
  }
}
:deep(.vxe-body--row) {
  height: 58px;
}
</style>
