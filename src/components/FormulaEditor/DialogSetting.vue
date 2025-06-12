<template>
  <Dialog v-model="dialogVisible" :title="title" width="800">
    <div class="dialog-content">
      <FormulaEditor
        v-if="isLoad"
        :formulaList="list"
        ref="formulaEditor"
        :formulaConf="formulaConf"
        :loading="true"
        :fieldList="fieldList"
      ></FormulaEditor>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </div>
    </template>
  </Dialog>
</template>
<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { cloneDeep } from 'lodash-es'
import FormulaEditor from './index.vue'
import formulaObj from './formula'

defineOptions({ name: 'FormulaEditorDialogSetting' })

const message = useMessage() // 消息弹窗
const dialogVisible = ref(false)

const bizType = ref('create')
const title = ref('配置公式')

const list = ref([])
const formulaConf = ref({})
const fieldList = ref([])
const isLoad = ref(false)

/** 打开弹窗 */
const open = async (data, curFieldList) => {
  dialogVisible.value = true
  isLoad.value = false
  list.value = formulaObj.map((ObjInstance) => new ObjInstance())
  fieldList.value = curFieldList || []
  formulaConf.value = data
  isLoad.value = true
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

onMounted(() => {})

const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
const formulaEditor = ref()
const submitForm = () => {
  const validMsg=formulaEditor.value.getValid()
  if(!validMsg.error){
    const data = formulaEditor.value.getData()
    dialogVisible.value = false
    emit('success', cloneDeep(data), bizType.value)
  }else{
    message.warning("公式错误:"+validMsg.message)
  }
}
</script>
<style lang="scss" scoped>
.dialog-content {
  height: 500px;
}
.show-config-item {
  :deep(.el-form-item__label) {
    height: 52px;
    line-height: 52px;
  }
}
</style>
