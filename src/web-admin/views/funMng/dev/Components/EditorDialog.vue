<template>
  <Dialog v-model="dialogVisible" :title="title" width="800">
    <div class="dialog-content">
      <div class="tips" v-if="tips">{{ tips }}</div>
      <CodeEditor class="editor" v-if="mode === 'sql'" :maxLength="512" v-model="formula" mode="text/x-sql" :readOnly="bizType === 'view'"></CodeEditor>
      <JsonEditor class="editor"  v-else-if="mode === 'json'" :isFormat="bizType !== 'view'" v-model="formula" :readOnly="bizType === 'view'"></JsonEditor>
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

defineOptions({ name: 'sqlEditorDialogSetting' })

const props = defineProps({
  mode: {
    type: String,
    default: 'sql'
  },
  tips: {
    type: String,
    default: ''
  },
  title: {
    type: String,
    default: ''
  }
})
const dialogVisible = ref(false)

const bizType = ref('create')
const title = props.title

const formula = ref('')

/** 打开弹窗 */
const open = async (data) => {
  dialogVisible.value = true
  formula.value = data
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

onMounted(() => {})

const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
const submitForm = () => {
  dialogVisible.value = false
  emit('success', formula.value, bizType.value)
}
</script>
<style lang="scss" scoped>
.dialog-content {
  height: 350px;
  display: flex;
  flex-direction: column;
  .tip{
    flex: 1;
  }
  .editor{
    flex: auto;
  }
}
.show-config-item {
  :deep(.el-form-item__label) {
    height: 52px;
    line-height: 52px;
  }
}
</style>
