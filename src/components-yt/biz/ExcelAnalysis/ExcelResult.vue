<template>
  <div class="excel-result">
    <div class="parse-action">
      <el-button type="primary" @click="handleParse" :disabled="!props.fileList?.length">
        <el-icon><Document /></el-icon>
        数据解析
      </el-button>
    </div>
    <el-card class="result-card">
      <template #header>
        <div class="card-header">
          <span>
            <el-icon><InfoFilled style="color: #ff9900;" /></el-icon>
            &nbsp;&nbsp;本次总计解析数据{{ totalCount }}条，其中新增数据{{ newCount }}条
          </span>
        </div>
      </template>
      <div v-if="hasData && showTable" class="has-data">
        <el-radio-group v-model="activeSheet" style="margin-bottom: 10px">
          <el-radio-button 
            v-for="sheet in sheetList" 
            :key="sheet.name" 
            :label="sheet.name"
          >
            {{ sheet.name }}
          </el-radio-button>
        </el-radio-group>
        <el-table 
          :data="getCurrentSheetData" 
          border 
          style="width: 100%" 
          max-height="500"
        >
          <el-table-column
            v-for="(value, key) in getTableColumns(getCurrentSheetData)"
            :key="key"
            :prop="key"
            :label="value"
            show-overflow-tooltip
          />
        </el-table>
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

// Props 定义
const props = defineProps({
  fileList: {
    type: Array,
    default: () => []
  }
})
const activeSheet = ref('') 
const sheetList = ref([]) 
const showTable = ref(false)
// 常量
const emptyDescription = '暂无数据，请先上传Excel文件并点击"数据解析"按钮'
// 计算属性
const hasData = computed(() => sheetList.value.length > 0)
const totalCount = computed(() => 
  sheetList.value.reduce((total, sheet) => total + (sheet.data?.length || 0), 0)
)
const newCount = computed(() => totalCount.value)
const getCurrentSheetData = computed(() => 
  sheetList.value.find(sheet => sheet.name === activeSheet.value)?.data || []
)
// 工具函数
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))
// 表格列配置方法
const getTableColumns = (data) => {
  const firstRow = data?.[0] || {}
  return Object.fromEntries(Object.keys(firstRow).map(key => [key, key]))
}
// Excel解析方法
const parseExcel = async (file) => {
  try {
    const buffer = await file.arrayBuffer()
    const workbook = XLSX.read(buffer, { type: 'array' })
    return workbook.SheetNames
      .map(sheetName => ({
        name: sheetName,
        data: XLSX.utils.sheet_to_json(workbook.Sheets[sheetName])
      }))
      .filter(sheet => sheet.data.length > 0)
  } catch (error) {
    throw new Error(`Excel文件解析失败: ${error.message}`)
  }
}
// 解析处理方法
const handleParse = async () => {
  if (!props.fileList?.length) {
    ElMessage.warning('请先上传Excel文件')
    return
  }
  const loading = ElLoading.service({
    lock: true,
    text: '正在解析文件...',
    spinner: 'el-icon-loading',
    background: 'rgba(0, 0, 0, 0.7)',
    customClass: 'excel-loading'
  })
  try {
    const startTime = Date.now()
    const sheets = await parseExcel(props.fileList[0].raw)
    console.log(sheets,props.fileList,'props.fileLis')
    if (!sheets.length) {
      throw new Error('未找到有效数据')
    }
    sheetList.value = sheets
    activeSheet.value = sheets[0].name
    // 让loading显示至少2秒
    const remainingTime = 2000 - (Date.now() - startTime)
    if (remainingTime > 0) {
      await delay(remainingTime)
    }
    ElMessage.success({
      message: '数据解析成功',
      duration: 2000
    })
    showTable.value = true
  } catch (error) {
    console.error('Excel解析错误:', error)
    ElMessage.error({
      message: `数据解析失败：${error.message}`,
      duration: 3000
    })
  } finally {
    loading.close()
  }
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