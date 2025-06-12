<template>
  <Dialog title="拓展配置" v-model="dialogVisible" width="800">
    <div class="dialog-content">
      <el-form ref="formRef" :model="formData" label-width="110">
        <el-form-item label="JSON数据" prop="expansion">
          <JsonEditor v-model="formData"></JsonEditor>
        </el-form-item>
      </el-form>
    </div>
    <template #footer>
      <div class="dialog-more-footer">
        <div class="left">
          <el-button type="primary" @click="clearCfg" link>清空配置</el-button></div>
        <div class="right">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="submitForm">确 定</el-button></div>
      </div>
    </template>
  </Dialog>
</template>
<script lang="ts" setup>
import { ref } from 'vue'
import {cloneDeep} from "lodash-es";

defineOptions({ name: 'EditDialog' })

const dialogVisible = ref(false)
const formRef = ref()
const formData = ref()
/** 打开弹窗 */
const open = async (_type: string,data) => {
  formData.value=''
  dialogVisible.value = true
  if(data){
    formData.value=data
  }
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
const submitForm = () => {
  dialogVisible.value = false
  emit('success',cloneDeep(formData.value))
}
const clearCfg=()=>{
  dialogVisible.value = false
  emit('success',null)
}
</script>
<style lang="scss" scoped>
.dialog-content{
  height: 368px;
}
</style>
