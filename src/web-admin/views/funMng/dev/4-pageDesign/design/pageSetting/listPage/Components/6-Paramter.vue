<template>
  <div class="paramter-container">
    <div class="oprate-button-warp-noselect"> 
      <el-button type="primary" @click="addRow()" class="mb-10px"> 新增参数 </el-button>
   </div>
    <!-- <div class="datamodel-header">
    </div> -->
    <div class="table-content">

      <vxe-table border="inner" align="center" height="100%" :data="formData.paramterList">
        <vxe-column type="seq" title="序号" width="60" align="center" />
        <vxe-column field="paramName" title="参数名称" min-width="180">
          <template #default="{ row }">
            <el-input v-model="row.paramName" />
          </template>
        </vxe-column>
        <vxe-column field="paramField" title="参数字段名">
          <template #default="{ row }">
            <el-input v-model="row.paramField" />
          </template>
        </vxe-column>
        <vxe-column field="isRequire" title="是否必填" width="120">
          <template #default="{ row }">
            <el-checkbox v-model="row.isRequire" :true-value="1" :false-value="0"/>
          </template>
        </vxe-column>
        <vxe-column field="remark" title="备注">
          <template #default="{ row }">
            <el-input v-model="row.remark" />
          </template>
        </vxe-column>
        <vxe-column field="action" title="操作" width="180">
          <template #default="{ row,rowIndex }">
            <div class="table-action">
              <el-link type="primary" @click="handleDelete(row,rowIndex)">删除</el-link>
            </div>
          </template>
        </vxe-column>
      </vxe-table>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref } from 'vue'
import { cloneDeep } from 'lodash-es'

defineOptions({name: 'ListPageDesignIndex'})

const formData:any=defineModel()
const emit = defineEmits(['close-click', 'chooseModel'])

const message = useMessage() // 消息弹窗


const addRow = () => {
  formData.value.paramterList.push({
  })
}
const handleDelete=async (row,rowIndex)=>{
  try {
    // 删除的二次确认
    await message.delConfirm()
    formData.value.paramterList.splice(rowIndex,1)
  } catch {}
}
</script>
<style lang="scss" scoped>
.paramter-container{
  height: calc(100vh - 150px);
  .table-content{
    height: calc(100% - 70px);
  }
}
</style>
