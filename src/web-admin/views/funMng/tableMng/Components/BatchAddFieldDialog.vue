<template>
  <Dialog :title="title" v-model="dialogVisible" width="600">
    <div class="dialog-wrap">
      <span>按照【字段名|名称|类型|长度】格式批量录入字段，多个字段换行</span>
      <el-input
        v-model="batchFieldStr"
        type="textarea"
        :rows="18"
        placeholder="格式：
字段名|名称|类型
字段名|名称|类型
..."
      ></el-input>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitForm">确 定</el-button>
      </span>
    </template>
  </Dialog>
</template>
<script lang="ts" setup>
import { ref } from 'vue'

defineOptions({ name: 'BatchAddFieldDialog' })

let title = '批量录入字段'
const dialogVisible = ref(false)
const batchFieldStr = ref('')

/** 打开弹窗 */
const open = async () => {
  dialogVisible.value = true
  batchFieldStr.value = ''
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
const submitForm = () => {
  emit('success', batchFieldStr.value)
  dialogVisible.value = false
}
</script>
<style scoped lang="scss">
.dialog-wrap{
  height: 400px;
}
</style>
