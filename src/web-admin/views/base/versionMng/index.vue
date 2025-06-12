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
      <el-button type="primary" @click="openImportForm"> <Icon icon="ep:plus" /> 导入脚本 </el-button>
      <el-button @click="openExportForm"> <Icon icon="ep:plus" /> 导出脚本 </el-button>
    </template>
    <template #fileUrl_default="{row}">
      {{row.fileUrl}}
    </template>
    <template #result_default="{row}">
      {{row.result}}
    </template>
  </CustomListPage>
  <ExportDialog ref="exportDialog" :callback="getList"/>
  <ImportDialog ref="importDialog" :callback="getList"/>
</template>
<script setup lang="ts">
import CustomListPage from "@/web-admin/components/PageTemplate/CustomListPage.vue";
import { columns } from './data';
import { pageApi, getDataSourceConfig, deleteDataSourceConfig} from "./api";
import ExportDialog from "./ExportDialog.vue"
import ImportDialog from "./ImportDialog.vue";
import {ref} from 'vue'
const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化
const pageApiUrl=pageApi

const customListPage = ref()
const getList=() =>{
  customListPage.value.search()
}


const exportDialog=ref()
const openExportForm=(type,data)=>{
  exportDialog.value.open(type,data)
}
const importDialog=ref()
const openImportForm=(type,data)=>{
  importDialog.value.open(type,data)
}
onMounted(async ()=>{})
</script>
