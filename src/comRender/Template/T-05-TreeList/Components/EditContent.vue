<template>
  <Dialog v-if="dialogType === 'dialog'" :title="title" v-model="dialogVisible" top="50px" width="60vw">
    <div class="dig-content">
      <CommonFormPage v-if="isLoadPage" :pageInfo="pageInfo"></CommonFormPage>
    </div>
  </Dialog>
  <el-drawer v-if="dialogType === 'drawer'" destroy-on-close :title="title" v-model="dialogVisible" class="drawer-content" size="50%" :before-close="handleClose">
    <div class="drawer-content" v-loading="loading">
      <CommonFormPage v-if="isLoadPage" :pageInfo="pageInfo"></CommonFormPage>
    </div>
  </el-drawer>
</template>
<script lang="ts" setup>
import { ref } from 'vue'
import { getPageInfo } from '@/web-sys/views/Redirect/api'
//抽屉和弹框使用默认表单模板
import CommonFormPage from "@/comRender/Template/T-01-Form/index.vue"

defineOptions({ name: 'EditDialog' })

let title = ref('创建')
const message = useMessage() // 消息弹窗
const dialogVisible = ref(false)
const dialogType = ref('dialog')
const bizType = ref('create')
const loading=ref(false)

/** 打开弹窗 */
const open = async (digType, actionType, pageId, data) => {
  console.log('open', dialogType, actionType, pageId, data)
  loading.value=true
  bizType.value = actionType
  dialogType.value = digType
  dialogVisible.value = true
  title.value = actionType === 'create' ? '创建' : '编辑'
  await nextTick()
  await loadPageInfo(pageId)
  loading.value=false
}

const pageInfo = ref({})
const isLoadPage = ref(false)
const loadPageInfo = async (pageId) => {
  const res = await getPageInfo(pageId)
  console.log(res)
  pageInfo.value = res
  isLoadPage.value = true
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

const handleClose = (done) => {
  isLoadPage.value = false
  done()
}
</script>
<style scoped lang="scss">
.dig-content {
  max-height: 70vh;
  overflow: auto;
}
.drawer-content{
  height: 100%;
  overflow: auto;
}
:deep(.drawer-content) {
  width: 50vw;
}

:deep(.el-drawer__header){
  margin-bottom: 0 !important;
}
:deep(.el-drawer__body){
  padding: 0 !important;
}
</style>
<style lang="scss">
.el-dialog__header{
  
}
</style>
