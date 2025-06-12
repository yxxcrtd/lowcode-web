<template>
  <CustomListPage ref="customListPage" :columns="columns" :dataUrl="pageApiUrl">
    <template #searchItems="{ queryParams }">
      <el-row>
        <el-col :span="8">
          <el-form-item label="字典名称" prop="name">
            <el-input
              v-model="queryParams.name"
              placeholder="请输入字典名称"
              clearable
              class="!w-240px"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="字典类型">
            <el-input
              v-model="queryParams.type"
              class="!w-240px"
              clearable
              placeholder="请输入字典类型"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="状态">
            <el-select
              v-model="queryParams.status"
              class="!w-240px"
              clearable
              placeholder="请选择字典状态"
            >
              <el-option
                v-for="dict in getIntDictOptions(DICT_TYPE.COMMON_STATUS)"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="创建时间">
            <el-date-picker
              v-model="queryParams.createTime"
              :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"
              class="!w-240px"
              end-placeholder="结束日期"
              start-placeholder="开始日期"
              type="daterange"
              value-format="YYYY-MM-DD HH:mm:ss"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </template>
    <template #buttonItems>
      <el-button type="primary" @click="openForm('create')"> <Icon icon="ep:plus" /> 新增 </el-button>
    </template>
    <template #action_default_tag="{row}">
      <dict-tag :type="DICT_TYPE.COMMON_STATUS" :value="row.status" />
    </template>
    <template #action_default="{row}">
      <div class="table-action">
        <el-link type="primary" @click="openForm('update', row.id)">编辑</el-link>
        <el-divider direction="vertical" />
          <el-link type="primary" @click="openData(row.type, row.id)">数据</el-link>
        <el-divider direction="vertical" />
        <el-link type="primary" @click="handleDelete(row.id)">删除</el-link>
      </div>
    </template>
  </CustomListPage>
  <!-- 表单弹窗：添加/修改 -->
  <DictTypeForm ref="formRef" @success="getList" :callback="getLists" />

  <!-- 数据抽屉 -->
   <DictFormData ref="dictFromDataRef"> </DictFormData>
</template>

<script setup lang="ts">
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import CustomListPage from "@/web-admin/components/PageTemplate/CustomListPage.vue";
import { columns } from './data';
import * as DictTypeApi from '@/api/system/dict/dict.type'
import DictFormData from './data/DictFormData.vue'
import DictTypeForm from './DictTypeForm.vue'
defineOptions({ name: 'SystemDictType' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化
const customListPage = ref()
const pageApiUrl=DictTypeApi.getDictTypeList
const loading = ref(true) // 列表的加载中
const total = ref(0) // 列表的总页数
const list = ref([]) // 字典表格数据

/** 查询字典类型列表 */
const getList = async (queryParams) => {
  loading.value = true
  try {
    const data = await DictTypeApi.getDictTypePage(queryParams)
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

const getLists=() =>{
  customListPage.value.search()
}

/** 搜索按钮操作 */
const handleQuery = () => {
  getLists()
}

/** 添加/修改操作 */
const formRef = ref()
const openForm = (type: string, id?: number) => {
  formRef.value.open(type, id)
}

const dictFromDataRef = ref()
const openData = (type: string, id?: number) => {
    dictFromDataRef.value.open(type, id)
}

/** 删除按钮操作 */
const handleDelete = async (id: number) => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    // 发起删除
    await DictTypeApi.deleteDictType(id)
    message.success(t('common.delSuccess'))
    // 刷新列表
    getLists()
  } catch {}
}

/** 初始化 **/
onMounted(() => {
  getLists()
})
</script>
