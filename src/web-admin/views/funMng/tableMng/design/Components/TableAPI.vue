<template>
  <div class="btn-action">
    <el-button type="primary" @click="openForm('create')">
      <Icon icon="ep:plus" /> 新建服务
    </el-button>
  </div>
  <JVxeTable ref="jVxeTable" :columns="apiColumns" :row-height="58" :data-source="apiData">
    <template #action_default="{ row }">
      <div class="table-action">
        <el-link type="primary" @click="handleEdit(row)">编辑</el-link>
        <el-divider direction="vertical" />
        <el-link type="primary">删除</el-link>
      </div>
    </template>
  </JVxeTable>
</template>
<script lang="ts" setup>
import {apiColumns} from "../../data";

defineOptions({ name: 'DataModelDesign' })

const message = useMessage() // 消息弹窗

const apiData=[
  {
    apiName:'新增',
    apiCode:'joyin-table-add',
    remark:'对table表的新增'
  }
]
/** 初始化 */
onMounted(() => {})
</script>
<style lang="scss" scoped>
.datamodel-header {
  display: flex;
  justify-content: start;
  align-items: center;
}
</style>
