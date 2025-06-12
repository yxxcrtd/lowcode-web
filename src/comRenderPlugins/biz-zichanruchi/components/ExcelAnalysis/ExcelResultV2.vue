<template>
  <div class="excel-result">
    <div class="parse-action">
      <el-button type="primary" @click="handleParse" :disabled="!props.fileList?.length">
        <el-icon><Document /></el-icon>
        数据解析
      </el-button>
    </div>
    <el-card class="result-card" v-loading="isLoadData" element-loading-text="解析数据中">
      <template #header>
        <div class="card-header">
          <span>
            <el-icon><InfoFilled style="color: #ff9900;" /></el-icon>
            &nbsp;&nbsp;本次总计解析数据{{ totalCount }}条，其中新增数据{{ newCount }}条
          </span>
        </div>
      </template>
      <div v-if="showTable" class="has-data">
        <el-radio-group v-model="activeTableId" style="margin-bottom: 10px" @change="handleTable">
          <el-radio-button 
            v-for="table in tableList" 
            :key="table.tableId" 
            :label="table.tableName"
            :value="table.tableId"
          >
          </el-radio-button>
        </el-radio-group>
        <JVxeTable
          v-if="activeTable"
          :columns="activeTable.columns"
          ref="jVxeTableRef"
          height="360px"
          :dataSource="dataSource"
          :isShowRightButton="false"
          :row-config="{ isHover: true }"
          :rowHeight="38"
        >
        </JVxeTable>
      </div>

      <div v-else class="no-data">
        <el-empty :description="emptyDescription" />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Document, InfoFilled } from '@element-plus/icons-vue'
import * as XLSX from 'xlsx'
import { ElMessage, ElLoading } from 'element-plus'
import {importExcel} from "@/comRenderPlugins/biz-zichanruchi/components/ExcelAnalysis/api";

const renderFormData=defineModel()
// Props 定义
const props = defineProps({
  formGroups:{
    type:Array
  },
  fileList: {
    type: Array,
    default: () => []
  }
})
const showTable = computed(()=>{
  return tableList.value.some(item=>renderFormData.value['list_'+item.tableId].length)
})
// 常量
const emptyDescription = '暂无数据，请先上传Excel文件并点击"数据解析"按钮'

const tableList=ref([])
const activeTableId = ref('')
const activeTable=ref([])
const jVxeTableRef=ref()
/**
 * 根据模型组装表格列
 */
const assemblyTable=()=>{
  console.log('props.formGroups',props.formGroups)
  //获取模型的所有子表
  const childTables=props.formGroups.reduce((pre,cur)=>{
    return pre.concat(cur.formItems.filter(item=>item.isTableItem))
  },[])
  tableList.value=childTables.map(item=>{
    item.tableId=item.tableId
    item.tableName=item.tableConfig?.tableTitle || item.tableId
    item.columns=item.tableItems.map(tableItem=>{
      return {
        title:tableItem.columnNameAlias || tableItem.columnComment,
        field:tableItem.field,
        fieldId:tableItem.fieldId,
        columnName:tableItem.columnName,
        minWidth:180,
      }
    })
    return item
  })
  if(tableList.value && tableList.value.length){
    activeTableId.value=tableList.value[0].tableId
    activeTable.value=tableList.value[0]
  }
  console.log('tableList',tableList)
}
assemblyTable()
/**
 * 切换表格
 * @param tableId
 */
const handleTable=(tableId)=>{
  activeTable.value=tableList.value.find(item=>item.tableId===tableId)
  console.log('activeTable',activeTable.value)
  nextTick(()=>{
    jVxeTableRef.value.loadColumn()
  })
}
/**
 * 获取数据源
 * @type {ComputedRef<unknown>}
 */
const dataSource=computed(()=>{
  return renderFormData.value['list_'+activeTableId.value] || []
})

const isLoadData=ref(false)
const totalCount = ref(0)
const newCount = ref(0)
/**
 * 解析excel
 * @returns {Promise<void>}
 */
const handleParse = async () => {
  if (!props.fileList?.length) {
    ElMessage.warning('请先上传Excel文件')
    return
  }
  isLoadData.value=true
  const paramData={
    file:props.fileList[0].raw
  }
  const res=await importExcel(paramData)
  if(res && res.data){
    tableList.value.forEach(item=>{
      if(res.data[item.tableName]){
        renderFormData.value['list_'+item.tableId]=res.data[item.tableName].map(dataItem=>{
          return Object.keys(dataItem).reduce((pre,key)=>{
            pre[key.toUpperCase()+'_'+item.tableId]=dataItem[key]+''
            return pre
          },{})
        })
      }
    })
  }
  isLoadData.value=false
  nextTick(()=>{
    jVxeTableRef.value?.refresh()
  })
}
</script>

<style lang="scss" scoped>
.excel-loading {
  .el-loading-spinner {
    .el-loading-text {
      color: #fff;
      font-size: 16px;
      margin-top: 15px;
      font-weight: bold;
    }
    .circular {
      width: 50px;
      height: 50px;
    }
  }
}
.excel-result {
  .parse-action {
    margin: 20px 0;
  }

  .result-card {
    .card-header {
      font-weight: bold;
      font-size: 14px;
    }
  }

  .has-data {
    .el-radio-group {
      margin-bottom: 16px;
    }
  }

  .no-data {
    padding: 40px 0;
    
    :deep(.el-empty__description) {
      color: #909399;
    }
  }

  :deep(.el-radio-button) {
    &.is-active .el-radio-button__inner {
      background: transparent;
      color: var(--el-color-primary, #419dfe);
    }
    
    &:first-child .el-radio-button__inner {
      border-radius: 0;
    }
  }
  
  :deep(.el-table) {
    thead th {
      background: #f5f7f9;
      height: 40px;
      color: #454545;
    }
  }
}
</style>
