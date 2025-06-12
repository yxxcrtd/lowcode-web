<template>
  <div class="data-model-container">
    <div class="btn-action">
      <el-button type="primary" @click="openModelDialog('create')">
        <Icon icon="ep:plus" /> 新增模型
      </el-button>
    </div>
    <div class="table-container">
    <JVxeTable ref="jVxeTable" class="table-content" height="100%" :columns="columns" :row-height="58" :data-url="getModuleInfoPageUrl" :search-params="queryParams">
      <template #moduleName_default="{row}">
        <span class="vxe-cell--label">{{row.moduleName}}</span>
      </template>
      <template #moduleType_default="{row}">
        <el-tag class="tag" :type="modelTypeTag[row.moduleType]">{{formmater('moduleType',row)}}</el-tag>
        <el-tag class="tag ml-10px" v-if="row.readonly" type="warning">只读模型</el-tag>
      </template>
      <template #action_default="{ row }">
        <div class="table-action">
          <el-link type="primary" @click="openModelDialog('edit',row)">编辑</el-link>
<!--          <el-divider direction="vertical" />-->

<!--          <el-link type="primary" @click="handleDesign(row)">历史记录</el-link>-->
          <el-divider direction="vertical" />

          <el-link type="primary" @click="handleRefresh(row)">刷新模型</el-link>

          <el-divider direction="vertical" />
          <el-dropdown>
            <span class="el-dropdown-link">
              <el-link type="primary">更多</el-link>
              <el-icon class="el-icon--right">
                <arrow-down />
              </el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>
                  <el-link type="primary" @click="copyTo(row.id)">复制模型</el-link>
                </el-dropdown-item>
                <el-dropdown-item>
                  <el-link type="primary" @click="handleDelete(row)">删除</el-link>
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </template>
    </JVxeTable>
  </div>
  </div>
  <Design v-if="isLoadDesign" ref="digDesign" @success="designSuccess"/>
</template>
<script lang="ts" setup>
import { columns } from './data';
import Design from "./design/index.vue"
import {getModuleInfoPageUrl, deleteModuleInfo, refreshModule, copyModule} from "./api";
import {ref} from "vue";
import {ArrowDown} from "@element-plus/icons-vue";

defineOptions({ name: 'DataModel-Index' })

const route = useRoute()
const menuId = route.query.id
const message = useMessage() // 消息弹窗
const jVxeTable=ref()
const queryParams = reactive({
  menuId: menuId
})
/**
 * 刷新模型
 * @param row
 */
const handleRefresh=async (row)=>{
  try{
    // 二次确认
    await message.confirm('点击后会刷新模型的字段和服务sql，确定更新吗')
    await refreshModule(row.id)
    message.success("刷新成功")
    // 刷新列表
    jVxeTable.value.refresh()
  }catch{}
}
/**
 * 操作
 * @param row
 */
const handleDelete = async (row) => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    // 发起删除
    await deleteModuleInfo(row.id)
    message.success("删除成功")
    // 刷新列表
    jVxeTable.value.refresh()
  } catch {}
}

/**
 * 复制模型
 * @param id
 */
const copyTo=async (id)=>{
  await message.confirm('确定复制该流程吗?')
  await copyModule(id)
  message.success('复制成功')
  // 刷新列表
  jVxeTable.value.refresh()
}

const digDesign=ref()
const isLoadDesign=ref(false)
const openModelDialog= (type,row) => {
  if ('create' === type && !menuId) {
    message.notifyError('请先选择菜单')
    return
  }
  isLoadDesign.value=true
  nextTick(()=>{
    digDesign.value.open(type, row)
  })
}
const designSuccess=()=>{
  isLoadDesign.value=false
  jVxeTable.value.refresh()
}

const modelTypeOptions = [
  { label: '普通模型', value: '1' },
  { label: 'SQL', value: '2' },
  { label: 'JavaBean', value: '3' },
  { label: '接口服务', value: '4' }
]
const modelTypeTag = {
  1:'primary',
  2:'success',
  3:'info',
  4:'danger',
}
const formmater=(field,row)=>{
  if(field==='moduleType'){
    return modelTypeOptions.find(item=>item.value===row[field])?.label
  }
}
</script>

<style scoped lang="scss">
.data-model-container{
  height: calc(100vh - 160px);
  .table-container{
    height: calc(100vh - 150px);
  }
}
:deep(.vxe-body--row){
  height:58px;
  .vxe-cell{
    .vxe-cell--label{
      display: inline-block;
      width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}
</style>
