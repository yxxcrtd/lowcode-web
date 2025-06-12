<template>
  <el-tabs v-model="activeName">
    <el-tab-pane label="前端公共变量" name="fronttvar">
      <div class="tips">存储于前端浏览器缓存的变量，可直接获取的数据</div>
      <div class="tab-content">
        <div class="btn">
          <el-button type="primary" @click="openCommonVariablesDialog('create', {}, 'frontend')"
          >新增公共变量</el-button
          >
        </div>
        <JVxeTable ref="fontendVxeTable" :columns="variableColumns" :row-height="58" style="height: calc(100vh - 280px)" height="auto" :data-fun="getFrontVars">
          <template #action_default="{ row }">
            <div class="table-action">
              <el-link type="primary" @click="openCommonVariablesDialog('edit', row, 'frontend')">编辑</el-link>
              <el-divider direction="vertical" />
              <el-link type="primary" @click="handleDelCommonVar('frontend',row.id)">删除</el-link>
            </div>
          </template>
        </JVxeTable>
      </div>
    </el-tab-pane>
    <el-tab-pane label="后端公共变量" name="backvar">
      <div class="tips">存储于后端缓存中的公共变量，可直接获取的数据</div>
      <div class="tab-content">
        <div class="btn">
          <el-button type="primary" @click="openCommonVariablesDialog('create', {}, 'backend')">新增公共变量</el-button>
        </div>
        <JVxeTable ref="backendVxeTable" :columns="variableColumns" :row-height="58" style="height: calc(100vh - 280px)" height="auto" :data-fun="getBackendVars">
          <template #action_default="{ row }">
            <div class="table-action">
              <el-link type="primary" @click="openCommonVariablesDialog('edit', row, 'backend')">编辑</el-link>
              <el-divider direction="vertical" />
              <el-link type="primary" @click="handleDelCommonVar('backend',row.id)">删除</el-link>
            </div>
          </template>
        </JVxeTable>
      </div>
    </el-tab-pane>
  </el-tabs>
  <CommonVariablesDialog ref="commonVariablesDialog" @success="refreshTable" />
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { variableColumns } from '../../data'
import CommonVariablesDialog from './Components/CommonVariablesDialog.vue'
import * as CfgApi from '../../api'

const message = useMessage() // 消息弹窗
const activeName = ref('fronttvar')

/**
 * 前，后公共变量新增、编辑表弹框
 */
const commonVariablesDialog = ref()
const openCommonVariablesDialog = (operate: string, row = {}, type) => {
  commonVariablesDialog.value.open(operate, row, type)
}

/**
 * 删除
 * @param id
 */
const fontendVxeTable=ref()
const backendVxeTable=ref()
const handleDelCommonVar = async (type,id: number) => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    // 发起删除
    await CfgApi.deleteCommonVar(id)
    message.success('删除成功')
    // 刷新列表
    refreshTable(type)
  } catch {}
}

/**
 * 前端变量分页接口
 * @param paramter
 */
const getFrontVars=(paramter)=>{
  const params={
    type:'frontend'
  }
  return CfgApi.getCommonVarPage(params)
}
/**
 * 后端变量分页接口
 * @param paramter
 */
const getBackendVars=(paramter)=>{
  const params={
    type:'backend'
  }
  return CfgApi.getCommonVarPage(params)
}
const refreshTable=(formData,type)=>{
  if(type==='backend'){
    backendVxeTable.value.refresh()
  }else{
    fontendVxeTable.value.refresh()
  }
}
</script>

<style scoped lang="scss">
.subtitle {
  display: inline-block;
  width: 100%;
  border-bottom: 1px solid #e9e4e4;
  margin: 5px 0 15px;
  padding: 5px 0 5px 8px;
  position: relative;
  &::before {
    content: '';
    position: absolute;
    width: 6px;
    height: 16px;
    background: #40a9ff;
    top: 9px;
    left: -3px;
  }
}
.tab-content {
  .btn {
    margin-bottom: 10px;
  }
  :deep(.j-vxe-table){
    height: calc(100vh - 290px);
  }
}
</style>
