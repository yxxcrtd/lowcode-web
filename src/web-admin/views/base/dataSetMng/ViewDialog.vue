<template>
  <Dialog :title="title" v-model="dialogVisible" width="900">
    <div class="dialog-wrap" style="max-height: 65vh;">
      <JsonEditor v-model="jsonData" :readOnly="bizType === 'view'"></JsonEditor>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
      </span>
    </template>
  </Dialog>
</template>
<script lang="ts" setup>
import { ref } from 'vue'
import {getcode} from './api'

let title = '创建数据集'
const dialogVisible = ref(false)
const bizType=ref('view') // 操作类型 create新增 edit修改 view预览
const jsonData = ref();

/** 打开弹窗 */
const open = async (type: string, tableInfo) => {
  bizType.value=type
  dialogVisible.value = true
  title = tableInfo.name
  getDataSource(tableInfo.code)
}

const getDataSource = async (code) => {
  console.log(code)
  const res = await getcode({code:code})
  jsonData.value = JSON.stringify(res, null ,2)
}

defineExpose({ open }) // 提供 open 方法，用于打开弹窗


</script>
<style lang="scss" scoped>
.table-content{
  :deep(.el-form-item--default){
    margin-bottom: 0px !important;
  }
}
</style>
