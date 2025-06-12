<template>
  <div class="page-container">
    <div class="table-info">
      <div class="icon">
        <el-icon><Wallet /></el-icon>
      </div>
      <div class="table-content">
        <span class="table-title">
          <el-tag type="warning" size="small" effect="dark" class="datasource-tag">{{ tableInfo.datasourceName }}</el-tag>
          {{ tableInfo.tableComment }}
          <span class="table-code">{{ tableInfo.tableName }}</span>
        </span>
        <span class="table-remark">{{ tableInfo.remark }}</span>
      </div>
    </div>
    <div>
      <el-button type="primary" @click="submitForm(true)" class="mb-10px" title="暂存不会生成或改变表结构,暂存的字段可修改"> <Icon icon="ep:plus" /> 暂存 </el-button>
      <el-button type="primary" @click="submitForm(false)" class="mb-10px" title="保存并执行会改变表结构,执行后字段不可修改"> <Icon icon="ep:plus" /> {{ tableInfo.tableType !== 'virtual_table' ? '保存并执行' : '保存' }} </el-button>
    </div>
    <el-tabs v-model="activeName" v-if="tableInfo.datasourceId">
      <el-tab-pane label="表设计" name="model">
        <TableModel ref="tableModelRef" :table-id="tableId" :tableType="tableInfo.tableType" :tableSql="tableInfo.tableSql"  :data-source-id="tableInfo.datasourceId" :fieldRules="fieldRules"/>
      </el-tab-pane>
      <el-tab-pane label="索引管理" v-if="tableInfo.tableType !== 'virtual_table'" name="tableIndex">
        <TableIndex :table-id="tableId" :indexRules="indexRules"/>
      </el-tab-pane>
      <el-tab-pane label="sql调试" v-if="tableInfo.tableType !== 'virtual_table'" name="SqlTest"> 4 </el-tab-pane>
      <el-tab-pane label="sql" v-else name="Sql"> 
      </el-tab-pane>
      <el-row v-if="activeName ==='Sql'">
        <el-col :span="24" style="padding: 5px 0;">
          <CodeEditor style="width: auto;max-height: 500px;" mode="text/x-sql" v-model="tableInfo.tableSql"></CodeEditor>
        </el-col>
      </el-row>
    </el-tabs>
  </div>
</template>
<script lang="ts" setup>
import { Wallet } from '@element-plus/icons-vue'
import { detailTable,getSysConfigList } from '../api'
import TableModel from './Components/TableModel.vue'
import TableIndex from './Components/TableIndex.vue'
import {ref} from "vue";

defineOptions({ name: 'DataModelDesign' })
const route = useRoute()
const activeName = ref('model') // 列表的加载中
const tableInfo = ref({})
const tableId=route.query.id
const fieldRules=ref({})
const indexRules=ref({})
const sqlData = ref('')
const param={
  category:'Cfg_Database'
}
getSysConfigList(param).then(res=>{
  res.forEach(item=>{
    if(['field_name_prefix','field_name_rule'].includes(item.key) ){
      fieldRules.value[item.key]=item.value
    }
    if(['index_name_prefix','index_name_rule'].includes(item.key) ){
      indexRules.value[item.key]=item.value
    }
  })
})

detailTable(tableId).then((response) => {
  tableInfo.value = response || {}
  // tableInfo.value.tableType = 'virtual_table'
})

const tableModelRef = ref()
const submitForm = (type) => {
  tableModelRef.value.submitForm(type)
}
/** 初始化 */
onMounted(() => {})
</script>
<style lang="scss" scoped>
.table-info {
  display: flex;
  align-items: center;
  margin: 2px 0px 10px 0px;
  background: #f5f8ff;
  padding: 16px 18px;
  border-radius: 6px;
  .icon {
    i {
      font-size: 24px;
      color: #40a9ff;
    }
    margin-right: 10px;
  }
  .table-content {
    display: flex;
    flex-direction: column;
    .table-title {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 6px;
    }
    .table-code {
      margin: 0 10px 0 6px;
      font-size: 14px;
      color: #1e83e9;
    }
    .datasource-tag{
      font-size: 12px;
      font-weight: 500;
      margin-right: 8px;
    }
    .table-remark {
      font-size: 12px;
      color: #7d7d7d;
    }
  }
}
</style>
