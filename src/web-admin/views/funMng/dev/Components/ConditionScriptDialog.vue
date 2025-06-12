<template>
  <Dialog title="条件配置" v-model="dialogVisible" width="700">
    <div class="dialog-wrap">
      <CodeEditor v-model="formData.script" :initCode="initCode"></CodeEditor>
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
import {cloneDeep} from "lodash-es";

defineOptions({ name: 'ConditionScriptDialog' })

const message = useMessage() // 消息弹窗
const dialogVisible = ref(false)
const formRef = ref()
const initCode=` //上下文，可以获取页面的变量、组件、方法
 const ctx=context;
//itemConfig:字段配置参数；itemData:字段绑定值;rowData:行内按钮行内数据
 const ｛itemConfg,itemData,rowData｝=data;
 
 return true;
`
const formData=ref({
  setType: '2',
  script: ''
})

/** 打开弹窗 */
const open = async (data) => {
  formData.value={
    setType: '2',
    script: ''
  }
  dialogVisible.value = true
  if(data){
    formData.value=data
  }
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
const submitForm = () => {
  message.success('提交成功！')
  dialogVisible.value = false
  emit('success',cloneDeep(formData.value))
}
onMounted(() => {})
</script>
<style lang="scss" scoped>
.dialog-wrap {
  height: 300px;
}
</style>
