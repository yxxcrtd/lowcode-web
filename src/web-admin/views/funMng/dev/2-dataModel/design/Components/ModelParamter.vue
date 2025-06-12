<template>
  <div class="datamodel-header">
    <el-button type="primary" @click="addRow()" class="mb-10px"> <Icon icon="ep:plus" /> 新增参数 </el-button>
  </div>
  <vxe-table
    border
    :edit-config="{ mode: 'row', trigger: 'click', showIcon: false }"
    :row-class-name="setRowCls"
    @current-change="currentChange"
    :data="paramTableData"
  >
    <vxe-column type="seq" title="序号" width="60" align="center">
      <template #default="{ rowIndex, row }">
        <div class="sort">
          <span class="sort-number">{{ rowIndex + 1 }}</span>
          <span class="sort-action" v-if="!row.isGroup">
                    <el-icon><CirclePlusFilled /></el-icon>
                    <el-icon><RemoveFilled /></el-icon>
                  </span>
        </div>
      </template>
    </vxe-column>
    <vxe-column field="subIndex" width="60" :edit-render="{}" tree-node>
      <template #default="{ rowIndex, row }">
        <div class="sort" v-if="row.isGroup">
          <span class="sort-number">{{ rowIndex + 1 }}</span>
          <span class="sort-action">
                    <el-icon><CirclePlusFilled /></el-icon>
                    <el-icon><RemoveFilled /></el-icon>
                  </span>
        </div>
      </template>
    </vxe-column>
    <vxe-column field="modelCode" title="入参字段" width="180" :edit-render="{}">
      <template #edit="{ row }">
        <el-select v-model="row.modelCode" />
      </template>
    </vxe-column>
    <vxe-column field="fieldCode" title="字段名称" width="180" :edit-render="{}">
      <template #edit="{ row }">
        <el-input v-model="row.name" />
      </template>
    </vxe-column>
    <vxe-column field="fieldName" title="参数类型" width="180" :edit-render="{}">
      <template #edit="{ row }">
        <el-input v-model="row.num" />
      </template>
    </vxe-column>
    <vxe-column field="fieldAlias" title="是否必填" width="180" :edit-render="{}">
      <template #edit="{ row }">
        <el-input v-model="row.name" />
      </template>
    </vxe-column>
    <vxe-column field="relationFields" title="默认值" width="180" :edit-render="{}">
      <template #edit="{ row }">
        <el-input v-model="row.relationFields" />
      </template>
    </vxe-column>
  </vxe-table>
</template>
<script lang="ts" setup>
import { ref } from 'vue'
import { CirclePlusFilled, RemoveFilled } from '@element-plus/icons-vue'
import { cloneDeep } from 'lodash-es'

defineOptions({ name: 'EditDialog' })

const message = useMessage() // 消息弹窗
const paramTableData=[
  {
    id: 1,
    modelCode: 'id',
    modelType: 'main',
    fieldCode: 'id',
    fieldName: '字符串',
    fieldAlias: '是',
    component: '下拉框',
    defaultValue: '',
    remark: ''
  },
  {
    id: 1,
    modelCode: 'name',
    modelType: 'main',
    fieldCode: '名称',
    fieldName: '字符串',
    fieldAlias: '是',
    component: '下拉框',
    defaultValue: '',
    remark: ''
  },
  {
    id: 1,
    modelCode: '销售表',
    modelType: 'main',
    fieldCode: 'clientId',
    fieldName: '客户Id',
    fieldAlias: 'clientName',
    component: '下拉框',
    defaultValue: '',
    remark: ''
  },
  {
    id: 1,
    modelCode: '销售表',
    modelType: 'main',
    fieldCode: 'clientId',
    fieldName: '客户Id',
    fieldAlias: 'clientName',
    component: '下拉框',
    defaultValue: '',
    remark: ''
  },
  {
    id: 1,
    modelCode: '销售表',
    modelType: 'right-join',
    fieldCode: 'clientId',
    fieldName: '客户Id',
    fieldAlias: 'clientName',
    component: '下拉框',
    defaultValue: '',
    remark: ''
  },
  {
    id: 1,
    modelCode: '销售表',
    modelType: 'left-join',
    fieldCode: 'clientId',
    fieldName: '客户Id',
    fieldAlias: 'clientName',
    component: '下拉框',
    defaultValue: '',
    remark: ''
  },
  {
    id: 1,
    modelCode: '客户表',
    modelType: 'left-join',
    fieldCode: 'clientName',
    fieldName: '客户名称',
    fieldAlias: 'clientName',
    relationFields: 'clientId',
    component: '下拉框',
    defaultValue: '',
    remark: ''
  }
]
const refChooseFields=ref()
const chooseFields=(type)=>{
  refChooseFields.value.open(type)
}
</script>
<style lang="scss" scoped>
.sort {
  .sort-number {
    //display: none;
  }
  .sort-action {
    display: none;
    i {
      font-size: 16px;
      cursor: pointer;
      &:nth-child(1) {
        margin-right: 5px;
      }
      &:hover {
        color: #f50909;
      }
    }
  }
}
:deep(.vxe-body--row) {
  height: 56px;
  &:hover {
    .sort-number {
      display: none;
    }
    .sort-action {
      display: block;
    }
  }
}
.table-group-row {
}
:deep(.table-row) {
  .vxe-cell--tree-node,
  .vxe-tree-cell {
    padding-left: 0px !important;
  }
}
.datamodel-content {
  display: flex;
}
.main-icon {
  background: #1e83e9;
  color: #fff;
  font-size: 12px;
  padding: 2px;
  border-radius: 4px;
  margin-right: 6px;
}
.custom-tree-node{
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin-right:10px;
  a{
    font-size: 12px;
    color: #1e83e9;
    cursor: pointer;
  }
}
.left-tree{
  border-right: 1px solid #e9e4e4;
  margin: 0 10px;
}
</style>
