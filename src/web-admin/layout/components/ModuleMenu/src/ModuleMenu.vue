<template>
  <div class="module-menu">
    <div class="title"> 开发中心 </div>
    <div class="operator">
      <span>模块管理</span>
      <el-icon @click="addMenu"><Plus /></el-icon>
    </div>
    <div class="tree">
      <el-tree
        style="max-width: 600px"
        :data="menuList"
        :props="defaultProps"
        @node-click="handleNodeClick"
      >
        <template #default="{ node, data }">
          <span class="custom-tree-node">
            <div class="men-title">
              <template v-if="data.functionType==='1'">
                <img src="@/assets/imgs/icon/folder.png" v-if="node.expanded"/>
                <img src="@/assets/imgs/icon/folder-open.png" v-else/>
              </template>
              <img class="app_img" src="@/assets/imgs/icon/page.png" v-else/>
              <div> {{ node.label }}</div>
             </div>
            <span class="action">
              <el-icon v-if="data.functionType === '1'" @click.prevent.stop="addMenu(data)"><Plus /></el-icon>
              <el-icon style="margin-left: 4px" @click.prevent.stop="updateModule(data)"><Edit /></el-icon>
              <el-icon style="margin-left: 4px" @click.prevent.stop="remove(data,node)"><Delete /></el-icon>
            </span>
          </span>
        </template>
      </el-tree>
    </div>
  </div>
  <EditDialog ref="editDialogRef" @success="editSuccess"/>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, unref, watch } from 'vue'
import * as MenuApi from '@/api/system/menu'
import { handleTree } from '@/utils/tree'
import { Plus, Delete,Folder,FolderOpened,Document,Edit } from '@element-plus/icons-vue'
import EditDialog from "./EditDialog.vue";

defineOptions({ name: 'ModuleMenu' })
const router = useRouter() // 路由
const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化
const defaultProps = {
  children: 'children',
  label: 'functionName',
  value: 'id'
}

onMounted(() => {
  getMenuList()
})
const loading = ref(true) // 列表的加载中
const menuList = ref<any>([]) // 列表的数据
/** 查询列表 */
const getMenuList = async () => {
  loading.value = true
  try {
    const data = await MenuApi.getFunctionInfoList({})
    menuList.value = handleTree(data)
  } finally {
    loading.value = false
  }
}
const handleNodeClick = (data: Tree,node) => {
  if(node.isLeaf){
    router.push({
      path: '/develop/funMng',
      meta:{
        title:data.name
      },
      query:{
        id:data.id
      }
    })
  }
}
const editDialogRef=ref()
const addMenu=(data: Tree) =>{
  editDialogRef.value.open('create',data)
}
const updateModule=(data)=>{
  editDialogRef.value.open('update',data)
}
const remove=async (data: Tree,node)=>{
  console.log(node)
  if(node.childNodes && node.childNodes.length){
    message.warning("存在子模块，不允许删除目录")
    return;
  }
  try {
    // 删除的二次确认
    await message.delConfirm()
    // 发起删除
    await MenuApi.deleteFunctionInfo(data.id)
    message.success(t('common.delSuccess'))
    // 刷新列表
    await getMenuList()
  } catch {}
}
const editSuccess=(data)=>{
  getMenuList()
}
</script>
<style lang="scss" scoped>
.module-menu {
  width: 175px;
  padding: 10px;
  color: #1f2329;
  border-right: 1px solid #e9e4e4;
  .tree{
    height: calc(100vh - 100px);
    overflow-y:auto;
  }
  .title {
    font-size: 16px;
    margin-bottom: 14px;
  }
  .operator {
    font-size: 14px;
    display: flex;
    justify-content: space-between;
    padding: 5px 0;
    margin: 6px 0;
    border-bottom: 1px solid #e8eaed;
  }
}
.custom-tree-node {
  color: #333;
  width: 100%;
  display: flex;
  justify-content: space-between;
  position: relative;
  .men-title{
    display: flex;
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
    position: absolute;
    right: 0;
    top: 2px;
    display:none;
  }
  &:hover{
    .men-title{
      width: 88px;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .action{
      display:block;
    }
  }
}
.el-icon {
  cursor: pointer;
  color: #333;
  &:hover{
    color: #40a9ff;
  }
}
</style>
