<template>
  <div class="page-mng-container">
    <div class="btn-action">
      <el-dropdown @command="handleCommand">
        <el-button type="primary">
          新建页面<el-icon class="el-icon--right"><arrow-down /></el-icon>
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="form">表单页</el-dropdown-item>
            <el-dropdown-item command="list">列表页</el-dropdown-item>
            <el-dropdown-item command="mobile-list">移动列表页</el-dropdown-item>
            <el-dropdown-item command="mobile-form">移动表单页</el-dropdown-item>
            <el-dropdown-item>模块</el-dropdown-item>
            <el-dropdown-item>自由页面</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      <el-button class="ml-10px" @click="openImportTemplateDialog">
        <el-icon class="mr-4px"><MostlyCloudy /></el-icon>导入
      </el-button>
    </div>
    <JVxeTable
      ref="jVxeTable"
      class="table-content"
      height="100%"
      :columns="columns"
      :row-height="58"
      :data-url="pageInfoPageUrl"
      :search-params="queryParams"
    >
      <template #pageType_default="{ row }">
        <el-tag type="primary" v-if="row.pageType == 'list'">列表页</el-tag>
        <el-tag type="success" v-if="row.pageType === 'form'">表单页</el-tag>
        <el-tag type="warning" v-if="row.pageType === 'mobile-form'">移动表单页</el-tag>
      </template>
      <template #pageState_default="{ row }">
        <el-tag type="primary" v-if="row.pageState == '1'">启用</el-tag>
        <el-tag type="danger" v-if="row.pageState === '0'">停用</el-tag>
      </template>
      <template #action_default="{ row }">
        <div class="table-action">
          <el-link type="primary" @click="handleEdit(row)">配置开发</el-link>
          <el-divider direction="vertical" />
          <el-link type="primary" @click="handleDesign(row)">可视化设计</el-link>
          <el-divider direction="vertical" />
          <el-dropdown>
            <span class="el-dropdown-link">
              <el-link type="primary">更多</el-link>
              <el-icon class="el-icon--right">
                <arrow-down />
              </el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>
                  <el-link type="primary" @click="copyTo(row.id)">复制页面</el-link>
                </el-dropdown-item>
                <el-dropdown-item>
                  <el-link type="primary" @click="copyToMobileForm(row.id)">复制移动端页面</el-link>
                </el-dropdown-item>
                <el-dropdown-item>
                  <el-link type="primary" @click="openLogDrawer(row.id)">日志</el-link>
                </el-dropdown-item>
                <el-dropdown-item>
                  <el-link type="primary" @click="handleLock(row.id)">锁定</el-link>
                </el-dropdown-item>
                <el-dropdown-item>
                  <el-link type="primary" @click="handleUnLock(row.id)">解锁</el-link>
                </el-dropdown-item>
                <el-dropdown-item>
                  <el-link type="danger" @click="handleDelete(row.id)">删除</el-link>
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </template>
    </JVxeTable>
  </div>
  <ListPageSetting ref="listPageRef" @success="success" />
  <FormPageSetting ref="formPageRef" @success="success" />
  <MobileFormPage ref="mobileFormPageRef" @success="success" />
  <ImportTemplate ref="importTemplateRef" @success="success" />
  <LogDrawer ref="logDrawerRef" />

</template>
<script lang="ts" setup>
import { columns } from './data'
import {copyPage, deletePageInfo, pageInfoPageUrl, locaAcion} from './api'
import { ArrowDown, MostlyCloudy } from '@element-plus/icons-vue'
import ListPageSetting from './design/pageSetting/listPage/index.vue'
import FormPageSetting from './design/pageSetting/formPage/index.vue'
import MobileFormPage from './design/pageSetting/mobileFormPage/index.vue'
import ImportTemplate from './Component/ImportTemplate.vue'
import LogDrawer from '../Components/LogDrawer.vue'

defineOptions({ name: 'PageDesign-Index' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const route = useRoute()
const menuId = route.query.id
const queryParams = reactive({
  menuId: menuId
})

const handleCommand = (e) => {
  openFormPage('create', e, null)
}

const listPageRef = ref()
const formPageRef = ref()
const mobileFormPageRef = ref()
const openFormPage = (action, pageType, row) => {
  if (pageType === 'list') {
    listPageRef.value.open(action, pageType, row)
    return
  }
  if (pageType === 'form') {
    formPageRef.value.open(action, pageType, row)
    return
  }
  if (pageType === 'mobile-form') {
    mobileFormPageRef.value.open(action, pageType, row)
    return
  }
  message.info('开发中，敬请期待')
}

const handleEdit = async (row) => {
  openFormPage('edit', row.pageType, row)
}
const handleDesign = (row) => {
  openFormPage('edit', row.pageType, row)
}
/** 删除按钮操作 */
const jVxeTable = ref()
const handleDelete = async (id: number) => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    // 发起删除
    await deletePageInfo(id)
    message.success(t('common.delSuccess'))
    // 刷新列表
    jVxeTable.value.refresh()
  } catch {}
}
/**
 * 复制页面
 * @param id
 */
const copyTo=async (id)=>{
  const params={
    id:id,
    type:'0'
  }
  await copyPage(params)
  message.success('复制成功')
  // 刷新列表
  jVxeTable.value.refresh()
}
/**
 * 复制为移动端表单页
 * @param id
 */
const copyToMobileForm=async (id)=>{
  const params={
    id:id,
    type:'1'
  }
  await copyPage(params)
  message.success('复制成功')
  // 刷新列表
  jVxeTable.value.refresh()
}
const success = () => {
  jVxeTable.value.refresh()
}

const importTemplateRef = ref()
const openImportTemplateDialog = () => {
  importTemplateRef.value.open()
}

// 打开日志抽屉
const logDrawerRef = ref()
const openLogDrawer = (id: number | string) => {
  logDrawerRef.value.open(id)
}

// 锁定
const handleLock = (id: number | string) => {
  locaAcion({
    id,
    type: 'lock'
  })
}

// 解锁
const handleUnLock = (id: number | string) => {
  locaAcion({
    id,
    type: 'lock'
  })
}


/** 初始化 */
onMounted(() => {})
</script>

<style scoped lang="scss">
.page-mng-container {
  height: calc(100vh - 160px);
  .table-content {
    height: calc(100vh - 150px);
  }
}
:deep(.vxe-body--row) {
  height: 58px;
}
.el-dropdown-link {
  cursor: pointer;
  color: var(--el-color-primary);
  display: flex;
  align-items: center;
}
</style>
