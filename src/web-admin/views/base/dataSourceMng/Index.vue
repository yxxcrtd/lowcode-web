<script setup lang="ts">
import CustomListPage from "@/web-admin/components/PageTemplate/CustomListPage.vue";
import { columns } from './data';
import { pageApi, getDataSourceConfig, deleteDataSourceConfig} from "./api";
import AddDialog from "./AddDialog.vue"
import {ref} from 'vue'
const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化
const pageApiUrl=pageApi

const addDialog=ref()
const openForm=(type,data)=>{
  addDialog.value.open(type,data)
}

const customListPage = ref()
const getList=() =>{
  customListPage.value.search()
}
const handleEdit =async (row)=>{
  const res = await getDataSourceConfig(row.id)
  addDialog.value.open('edit',res)
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

onMounted(async ()=>{})
</script>

<template>
  <CustomListPage ref="customListPage" :columns="columns" :data-url="pageApiUrl">
    <template #searchItems="{queryParams}">
      <el-form-item label="数据源名称">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入数据源名称"
          clearable
          class="!w-240px"
        />
      </el-form-item>
    </template>
    <template #buttonItems>
      <el-button type="primary" @click="openForm('create', '')"> <Icon icon="ep:plus" /> 新增 </el-button>
    </template>
    <template #action_default="{row}">
      <div class="table-action" v-if="row.code !== 'master'">
        <el-link type="primary" @click="handleEdit(row)">编辑</el-link>
        <el-divider direction="vertical" />
        <el-link type="primary" @click="handleDel(row)">删除</el-link>
      </div>
    </template>
  </CustomListPage>
  <AddDialog ref="addDialog" :callback="getList"/>
</template>
