<script setup lang="ts">
import CustomListPage from "@/web-admin/components/PageTemplate/CustomListPage.vue";
import { columns } from './data';
import {ArrowDown} from "@element-plus/icons-vue";
import {pageApi} from "./api";
import AddDialog from "./AddDialog.vue"
import ViewDialog from "./ViewDialog.vue"
import {ref} from 'vue'
import {deleteDataSourceConfig} from "./api";
const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化
const pageApiUrl=pageApi

const addDialog=ref()
const viewDialog=ref()
const options=ref()
const customListPage=ref()
// 新增
const handleAdd=(e)=>{
  addDialog.value.open('create',e)
}
// 表格行-编辑
const handleEdit = (row)=>{
  addDialog.value.open('edit',row)
}
// 表格行-预览
const handleView=(row)=>{
  // addDialog.value.open('view',row)
  viewDialog.value.open('view',row)
}
const getList=() =>{
  customListPage.value.search()
}
const handleDel =async (row)=>{
  try {
    // 删除的二次确认
    await message.delConfirm()
    // 发起删除
    await deleteDataSourceConfig(row.id)
    message.success(t('common.delSuccess'))
    getList()
  } catch {}
}
</script>

<template>
  <CustomListPage ref="customListPage" :columns="columns" :data-url="pageApiUrl">
    <template #searchItems="{queryParams}">
      <el-row>
        <el-col :span="8">
          <el-form-item label="数据集名称" prop="name">
            <el-input v-model="queryParams.name" placeholder="请输入数据集名称" clearable/>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="数据集类型" prop="type">
            <el-select v-model="queryParams.type">
              <el-option label="SQL" value="sql" />
              <el-option label="JSON" value="json" />
              <el-option label="HTTP" value="http" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
    </template>
    <template #buttonItems>
      <div class="btn-action">
        <el-dropdown @command="handleAdd">
          <el-button type="primary">
            新增<el-icon class="el-icon--right"><arrow-down /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="sql">SQL</el-dropdown-item>
              <el-dropdown-item command="json">JSON</el-dropdown-item>
              <el-dropdown-item command="http">HTTP</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </template>
    <template #type_default="{row}">
      <el-tag>{{ row.type && row.type.toUpperCase() || row.type }}</el-tag>
    </template>
    <template #action_default="{row}">
      <div class="table-action">
        <el-link type="primary" @click="handleEdit(row)">编辑</el-link>
        <el-divider direction="vertical" />
        <el-link type="primary" @click="handleView(row)">预览</el-link>
        <el-divider direction="vertical" />
        <el-link type="primary" @click="handleDel(row)">删除</el-link>
      </div>
    </template>
  </CustomListPage>
  <AddDialog ref="addDialog" @success="getList"/>
  <ViewDialog ref="viewDialog" />
</template>
