<template>
  <TreeListPage ref="queryFormRef" :columns="columns" :row-height="58" :data-fun="getList">
    <template #left>
      <ComponentsTree @data-received="handleDataFromChild" />
    </template>
    <template #searchItems="{queryParams}">
      <el-row>
        <el-col :span="8">
          <el-form-item label="模板名称">
            <el-input
              v-model="queryParams.templateName"
              placeholder="请输入模板名称"
              clearable
              @keyup.enter="handleQuery"
              class="!w-240px"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="创建时间">
            <el-date-picker
              v-model="queryParams.createTime"
              value-format="YYYY-MM-DD HH:mm:ss"
              type="datetimerange"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              class="!w-100%"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </template>
    <template #buttonItems>
      <el-button
        type="primary"
        @click="openForm('create')"
      >
        <Icon icon="ep:plus" /> 新增
      </el-button>
    </template>
    <template #templateType_default="{row}">
      <el-tag type="primary" v-if="row.templateType=='list'">列表页</el-tag>
      <el-tag type="success" v-if="row.templateType==='form'">表单页</el-tag>
    </template>
    <template #templateName_default="{row}">
      <el-popover
        placement="bottom-start"
        :width="200"
        trigger="hover"
      >
        <template #default>
          <div class="table-image">
            <el-image src="https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg" fit="contain" />
          </div>
        </template>
        <template #reference>
         <el-button type="primary" link>{{row.templateName}}</el-button>
        </template>
      </el-popover>
    </template>
    <template #action_default="{ row }">
      <div class="table-action">
        <el-link type="primary" @click="updateTemplate('edit', row)">编辑</el-link>
        <el-divider direction="vertical" />
        <el-link type="primary" @click="delTemplate(row)">删除</el-link>
      </div>
    </template>
  </TreeListPage>

  <!-- 添加或修改用户对话框 -->
  <ComponentForm ref="formRef" @success="handleQuery"/>
</template>
<script lang="ts" setup>
import { columns } from '../pageTemplate/data';
import * as api from "./api";
import TreeListPage from "@/web-admin/components/PageTemplate/TreeListPage.vue"
import ComponentForm from './ComponentForm.vue'
import ComponentsTree from './ComponentsTree.vue'
import {ref} from "vue";

defineOptions({ name: 'ComponentTable' })
const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化
let listQ = ref([])
const getTestList = async () => {
  const {list} = await api.getTree()
  listQ.value = list
}
const queryFormRef = ref() // 搜索的表单

const dataFromChild = ref('');
const groupId = ref()
const handleDataFromChild = (data) => {
  dataFromChild.value = data;
  groupId.value = data
  handleQuery()
};

/** 查询列表 */
const getList = (queryParams) => {
  if (groupId.value) {
    queryParams = { ...queryParams, groupId: groupId.value };
  }
  if (!queryParams) {
    queryParams = {}
    queryParams.pageNo = 1
    queryParams.pageSize = 10;
  }else if (!queryParams.pageNo) {
    queryParams.pageNo = 1
    queryParams.pageSize = 10;
  }
  return api.getTemplateInfoPage(queryParams)
}

const delTemplate =async (row)=>{
  try {
    // 删除的二次确认
    await message.delConfirm()
    // 发起删除
    await api.deleteTemplateInfo(row.id)
    message.success(t('common.delSuccess'))
    queryFormRef.value.search()
  } catch {}
}
/** 搜索按钮操作 */
const handleQuery = () => {
  queryFormRef.value.search()
}

/** 添加/修改操作 */
const formRef = ref()
const openForm = (type: string, id?: number) => {
  formRef.value.open(type, id)
}

const updateTemplate = (type: string, data) => {
  formRef.value.open(type, data.id)
}

onMounted(() => {
  getTestList()
  queryFormRef.value.search()
})
</script>
<style lang="scss" scoped>
.table-image{
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  align-items: center;
  .el-image{
    width: 100px;
    height: 100%;
    padding: 5px;
  }
}
</style>
