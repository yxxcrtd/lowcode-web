<template>
  <CustomListPage ref="customListPage" :columns="columns" :data-url="pageApiUrl">
    <template #searchItems="{queryParams}">
      <el-form-item label="岗位名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入岗位名称"
          clearable
          class="!w-240px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="岗位编码" prop="code">
        <el-input
          v-model="queryParams.code"
          placeholder="请输入岗位编码"
          clearable
          class="!w-240px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select class="!w-120px" v-model="queryParams.status" placeholder="请选择状态" clearable>
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.COMMON_STATUS)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
    </template>
    <template #buttonItems>
      <el-button type="primary" @click="openForm('create')"> <Icon icon="ep:plus" /> 新增 </el-button>
    </template>
    <template #action_default_tag="{row}">
      <dict-tag :type="DICT_TYPE.COMMON_STATUS" :value="row.status" />
    </template>
    <template #action_default="{row}">
      <div class="table-action" v-if="row.code !== 'master'">
        <el-link type="primary" @click="openForm('update', row.id)">编辑</el-link>
        <el-divider direction="vertical" />
        <el-link type="primary" @click="handleDelete(row.id)">删除</el-link>
      </div>
    </template>
  </CustomListPage>

  <!-- 表单弹窗：添加/修改 -->
  <PostForm ref="formRef" @success="getList" :callback="getLists"/>
</template>
<script lang="ts" setup>
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import * as PostApi from '@/api/system/post'
import PostForm from './PostForm.vue'
import { columns } from './data';
import CustomListPage from "@/web-admin/components/PageTemplate/CustomListPage.vue";

defineOptions({ name: 'SystemPost' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化
const pageApiUrl=PostApi.api

const loading = ref(true) // 列表的加载中
const total = ref(0) // 列表的总页数
const list = ref([]) // 列表的数据
const queryFormRef = ref() // 搜索的表单
const customListPage = ref()

/** 查询岗位列表 */
const getList = async (queryParams) => {
  loading.value = true
  try {
    const data = await PostApi.getPostPage(queryParams)
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

const getLists = () => {
  customListPage.value.search()
}

/** 搜索按钮操作 */
const handleQuery = () => {
    getLists()
}

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value.resetFields()
  handleQuery()
}

/** 添加/修改操作 */
const formRef = ref()
const openForm = (type: string, id?: number) => {
  formRef.value.open(type, id)
}

/** 删除按钮操作 */
const handleDelete = async (id: number) => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    // 发起删除
    await PostApi.deletePost(id)
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
