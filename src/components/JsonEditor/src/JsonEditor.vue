<template>
  <div style="display: flex;width: 100%;height: 100%;min-height:300px;">
    <div class="code-edit-container">
      <CodeEditor
        v-if="isLoad"
        v-model="code"
        ref="cmRef"
        width="100%"
        language="json"
        height="100%"
        class="codemirror"
      >
      </CodeEditor>
      
    </div>
    <el-button v-if="isFormat" type="primary" size="small" @click="formatJSON">格式化</el-button>
  </div>
</template>
<script lang="ts" setup>
import { ref, onMounted } from 'vue'

const message = useMessage() // 消息弹窗
defineOptions({ name: 'CodeEditor' })

const props = defineProps({
  modelValue: String,
  initCode:String,
  placeholder:String,
  language: {
    type: String,
    default: 'json'
  },
  theme: {
    type: String,
    default: 'juejin'
  },
  readOnly:{
    type:[Boolean,String],
    default:false
  },
  isFormat:{
    type:[Boolean,String],
    default:false
  }
})

const emit = defineEmits(['update:modelValue'])
const code = computed({
  get: () => {
    return props.modelValue
  },
  set: (val: string) => {
    emit('update:modelValue', val)
  }
})
const isLoad=ref(false)

const cmRef = ref()

const formatJSON = () => {
  try {
    emit('update:modelValue', JSON.stringify(JSON.parse(code.value), null ,2))
  } catch (e) {
    console.log(e);
    
    message.error(e.message)
  }
}

const insertAtCursor=(text)=> {
  cmRef.value.insertAtCursor(text)
}
defineExpose({insertAtCursor})
onMounted(() => {
  //如果初始无代码，加载初始化代码
  if(props.initCode && !code.value){
    code.value=props.initCode
  }
  isLoad.value=true
})
</script>
<style scoped lang="scss">
.code-edit-container {
  border: 1px solid #ccc;
  width: 100%;
  min-width:400px;
  height: 100%;
  min-height:300px;
  margin-right: 5px;
  .codemirror{
    height: 100% !important;
    min-height:300px;
  }
  :deep(.CodeMirror){
    font-family: Consolas, "Courier New", monospace;
    font-weight: normal;
    font-size: 14px;
    line-height: 19px;
    letter-spacing: 0px;
    .cm-comment{
      font-size: 12px;
    }
    
  }
}
</style>
