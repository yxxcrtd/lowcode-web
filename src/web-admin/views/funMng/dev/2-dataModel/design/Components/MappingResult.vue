<template>
  <Dialog title="匹配结果" v-model="dialogVisible" width="80vw">
    <el-alert title="仅展示名称(忽略大小写)可以匹配上,但类型无法匹配或匹配出多个的结果,可以根据结果手动匹配，名称都无法匹配的请手动选择!" type="success" />
    <div class="dialog-wrap">
      <div class="table-content">
        <vxe-table
          ref="vxeTableRef"
          border="inner"
          :row-height="58"
          height="420px"
          align="center"
          :data="selectTableList"
        >
          <vxe-column field="msg" title="失败信息" >
            <template #default="{ row }">
              {{ row.msg }}
            </template>
          </vxe-column>
          <vxe-column field="tableName" title="表名" >
            <template #default="{ row }">
             {{ row.tableName }}
            </template>
          </vxe-column>
          <vxe-column field="columnName" title="字段" >
            <template #default="{ row }">
              {{ row.columnName }}
            </template>
          </vxe-column>
          <vxe-column field="jdbcType" title="Java字段类型" >
            <template #default="{ row }">
              {{ row.javaType }}
            </template>
          </vxe-column>
          <vxe-column field="mappingTableName" title="映射表名">
            <template #default="{ row }">
              {{ row.mappingTableName }}
            </template>
          </vxe-column>
          <vxe-column field="mappingColumnName" title="映射字段名" >
            <template #default="{ row }">
              {{ row.mappingColumnName }}
            </template>
          </vxe-column>
            <vxe-column field="mappingJdbcType" title="映射Java字段类型" >
              <template #default="{ row }">
                {{ row.mappingJavaType }}
              </template>
          </vxe-column>
        </vxe-table>
      </div>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">关 闭</el-button>
      </span>
    </template>
  </Dialog>
</template>
<script lang="ts" setup>
import {  ref } from 'vue'


defineOptions({ name: 'EditDialog' })

const message = useMessage() // 消息弹窗
const dialogVisible = ref(false)

const selectTableList = ref([])
const vxeTableRef = ref()
/** 打开弹窗 */
const open = async (table:[]) => {
  dialogVisible.value = true
  selectTableList.value = table
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

</script>
<style lang="scss" scoped>
.dialog-wrap {
  height: 500px;
  .action-content {
    margin-bottom: 10px;
  }
  .table-content {
    .relation-table-item {
      display: flex;
      align-items: center;
      > div {
        margin-right: 10px;
      }
      .relation-table-action > i {
        cursor: pointer;
      }
    }
  }
}
</style>
