<template>
  <el-drawer
      v-model="dialogVisible"
      :title="dialogTitle"
      size="70%"
      direction="rtl"
    >
    <div class="page-container">
      <div class="top-content">
        <div class="search-items">
          <div class="button-content">
            <el-button type="primary" @click="openForm('create')"> <Icon icon="ep:plus" /> 新增 </el-button>
          </div>  
        </div>
        <div class="search-action">
          <el-form
            class="-mb-15px"
            :model="queryParams"
            ref="queryFormRef"
            :inline="true"
            label-width="68px"
            @submit.prevent
          >
            <el-form-item prop="label">
              <el-input
                v-model="queryParams.label"
                class="!w-240px"
                @blur="handleQuery"
                clearable
                placeholder="请输入字典标签"
                :prefix-icon="Search"
              />
            </el-form-item>
          </el-form>
           <div class="search-button">
            <el-button type="primary" @click="handleQuery"><Icon icon="ep:search" />搜索</el-button>
            <el-button @click="resetQuery"><Icon icon="ep:refresh" />重置</el-button>
          </div>
        </div>
      </div>
      <!-- 列表 -->
      <div class="content">
        <JVxeTable ref="jVxeTable" :columns="columns" :row-height="58" :data-source="list">
          <template #action_default="{row}">
          <div class="table-action">
            <el-link type="primary" @click="openForm('update', row.id)">编辑</el-link>
            <el-divider direction="vertical" />
            <el-link type="primary" @click="handleDelete(row.id)">删除</el-link>
          </div>
        </template>
        <template #createTime="{ row }">
          {{ formatDate(row.createTime) }}
        </template>
        </JVxeTable>
      </div>
    </div>
  <!-- 表单弹窗：添加/修改 -->
  <DictDataForm ref="formRef" @success="getList" />
</el-drawer>
</template>
<script lang="ts" setup>
import { Search } from '@element-plus/icons-vue'
import { formatDate } from '@/utils/formatTime'
import download from '@/utils/download'
import * as DictDataApi from '@/api/system/dict/dict.data'
import * as DictTypeApi from '@/api/system/dict/dict.type'
import DictDataForm from './DictDataForm.vue'
import { columns } from './data'

defineOptions({ name: 'SystemDictData' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化
const route = useRoute() // 路由

const loading = ref(true) // 列表的加载中
const total = ref(0) // 列表的总页数
const list = ref([]) // 列表的数据
const dialogTitle = ref('') // 弹窗的标题
const dialogVisible = ref(false) // 弹窗的是否展示
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  label: '',
  status: undefined,
  dictType: route.params.dictType
})
const queryFormRef = ref() // 搜索的表单
const exportLoading = ref(false) // 导出的加载中
const dictTypeList = ref<DictTypeApi.DictTypeVO[]>() // 字典类型的列表

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await DictDataApi.getDictDataPage(queryParams)
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

/** 搜索按钮操作 */
const handleQuery = () => {
  getList()
}

/** 重置按钮操作 */
const resetQuery = (queryParams) => {
  queryFormRef.value.resetFields()
  handleQuery()
}

/** 添加/修改操作 */
const formRef = ref()
const openForm = (type: string, id?: number) => {
  formRef.value.open(type, id, queryParams.dictType)
}

/** 删除按钮操作 */
const handleDelete = async (id: number) => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    // 发起删除
    await DictDataApi.deleteDictData(id)
    message.success(t('common.delSuccess'))
    // 刷新列表
    await getList()
  } catch {}
}

/** 打开弹窗 */
const open = async (type: string, id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = '数据详情'
  queryParams.dictType = type
  getList()
}

const props = defineProps({
  callback: Function,
})

defineExpose({ open }) // 提供 open 方法，用于打开弹窗

/** 导出按钮操作 */
const handleExport = async () => {
  try {
    // 导出的二次确认
    await message.exportConfirm()
    // 发起导出
    exportLoading.value = true
    const data = await DictDataApi.exportDictData(queryParams)
    download.excel(data, '字典数据.xls')
  } catch {
  } finally {
    exportLoading.value = false
  }
}

/** 初始化 **/
onMounted(async () => {
  await getList()
  // 查询字典（精简)列表
  dictTypeList.value = await DictTypeApi.getSimpleDictTypeList()
})
</script>
<style lang="scss" scoped>
  .top-content{
    background: #ffffff;
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 10px;
    display: flex;
    .search-items{
      flex: 1;
    }
    .search-action{
      // width: 160px;
      display: flex;
      justify-content: center;
      align-items: center;
      .el-button{
        margin-left: 10px !important;
        margin-bottom: 10px;
      }
    }
    .search-button{
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }
</style>
