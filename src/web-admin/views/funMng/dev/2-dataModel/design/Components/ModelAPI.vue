<template>
  <div class="btn-action">
<!--    <el-button type="primary" @click="openForm('create')"> <Icon icon="ep:plus" /> 新建服务 </el-button>-->
  </div>
  <JVxeTable ref="jVxeTable" :columns="apiColumns" :row-height="58" :data-source="formData.apiList || []" :tablePageConfig="{ enabled: false }">
    <template #action_default="{ row }">
      <div class="table-action">
        <el-link type="primary" @click="handleView(row)">查看</el-link>
<!--        <el-divider direction="vertical" />-->
<!--        <el-link type="primary" @click="handleEdit(row)">编辑</el-link>-->
<!--        <el-divider direction="vertical" />-->
<!--        <el-link type="primary">删除</el-link>-->
      </div>
    </template>
  </JVxeTable>
  <ModelApiParam ref="modelApiParamRef"></ModelApiParam>
</template>
<script lang="ts" setup>
import { ref } from 'vue'
import { cloneDeep } from 'lodash-es'
import { apiColumns } from '../../data'
import {propTypes} from "@/utils/propTypes";
import ModelApiParam from "../../../3-APIMng/Components/ModelApiParam.vue"

defineOptions({ name: 'EditDialog' })

const message = useMessage() // 消息弹窗
const formData=defineModel()
const handleView=(row)=>{
  openParamDrawer('view',row)
}
const modelApiParamRef=ref()
const openParamDrawer=(type,row)=>{
  modelApiParamRef.value.open(type,row)
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
