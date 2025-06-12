<template>
  <el-drawer v-model="drawerVisible" title="日志" size="900px">
      <JVxeTable
        ref="jVxeTable"
        :columns="logTableColumns"
        :row-height="58"
        style="height: calc(100vh - 290px)"
        height="auto"
        :data-source="tableData"
        :tablePageConfig="{ enabled: false }"
      >
      <template #action_default="{ row }">
        <el-link type="primary" @click="checkJson(row)">查看json</el-link>
      </template>
    </JVxeTable>
  </el-drawer>
</template>
<script lang="ts" setup>
import { logTableColumns } from '../4-pageDesign/data'
import { getLogTableData } from '../4-pageDesign/api'

defineOptions({ name: 'LogDrawerTable' })

const drawerVisible = ref(false) // 抽屉的是否展示

/** 打开弹窗 */
const open = async (pageType,row) => {
  // 展开抽屉
  drawerVisible.value = true
  loadApiInfo(row.id)
}
defineExpose({ open }) // 提供 openModal 方法，用于打开弹窗

const tableData=ref([])

const loadApiInfo = async (id) => {
  const res = await getLogTableData(id)
  tableData.value = res
}

// 查看json
const checkJson = (row) => {
  console.log(row)
}

</script>
<style scoped lang="scss">
:deep(.j-vxe-table){
  height: calc(100vh - 420px);
}
</style>
