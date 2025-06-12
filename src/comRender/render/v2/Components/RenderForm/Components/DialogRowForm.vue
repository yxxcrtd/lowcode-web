<template>
  <Dialog :title="title" v-model="dialogVisible" width="50vw" class="renderform-dialog" style="min-height: 30vh" @close="closeDialog">
    <div class="dialog-wrap">
      <RenderForm
        class="dialog-form-wrap"
        v-if="tableFormGroup && isLoadForm"
        ref="renderFormRef"
        :isTableItem="true"
        :tableFormGroup="tableFormGroup"
        :formProps="formProps"
        :is-detail="formIsDetail"
        :tableId="childTableId"
        :mainFormData="mainFormData"
      ></RenderForm>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <template v-if="formIsDetail">
          <el-button @click="dialogVisible = false">关 闭</el-button>
        </template>
        <template v-else>
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="submitForm">确 定</el-button>
        </template>
      </span>
    </template>
  </Dialog>
</template>
<script lang="ts" setup>
import { ref } from 'vue'
import RenderForm from '../index.vue'

defineOptions({ name: 'DialogRowForm' })

let title = '创建'
const message = useMessage() // 消息弹窗
const dialogVisible = ref(false)
const bizType = ref('create')
const isLoadForm=ref(false)

const formProps = ref({
  labelPosition: 'top'
})

const props=defineProps({
  mainFormData:{
    type:Object,
    default:()=>{}
  }
})
const tableFormGroup = ref(null)
const formIsDetail = ref(false)
const childTableId = ref()
/** 打开弹窗 */
const open = async (type: string, tableId,group, data, isDetail) => {
  tableFormGroup.value=group
  childTableId.value=tableId
  bizType.value = type
  dialogVisible.value = true
  formIsDetail.value = isDetail
  isLoadForm.value=true
  if (type === 'add') {
    title = '创建'
  } else {
    title = isDetail ? '查看' : '编辑'
    const formData = {}
    formData[childTableId.value] = data
    await nextTick()
    renderFormRef.value.initForm(formData)
  }
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

const emits = defineEmits(['success'])
const renderFormRef = ref()
const submitForm = async () => {
  const valid = await renderFormRef.value.validateForm()
  if (valid) {
    const curFormData = renderFormRef.value.getFormData()
    emits('success', bizType.value, curFormData[childTableId.value])
    renderFormRef.value.clearForm()
    isLoadForm.value=false
    dialogVisible.value = false
  }
}
const closeDialog=()=>{
  isLoadForm.value=false
}
</script>
<style scoped lang="scss">
.dialog-form-wrap{
  min-height: unset!important;
  :deep(.el-collapse-item__wrap){
    border-bottom: none!important;
  }
  :deep(.el-collapse-item__header){
    display: none;
  }
  :deep(.el-collapse){
    border-top: none;
  }
  :deep(.m-ellipsis){
    max-width: 100% !important;
  }
  :deep(.el-form-item--label-top .el-form-item__label){
    display: inline-flex;
  }
}
</style>

<style lang="scss">
.renderform-dialog{
  .el-dialog__footer{
    text-align: center!important;
  }
}
</style>
