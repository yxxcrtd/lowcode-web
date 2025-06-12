<template>
  <div class="monaco-editor-container">
    <!-- 编辑器容器 -->
    <div ref="editorRef" class="monaco-editor"></div>
  </div>
</template>

<script lang="ts" setup>
import * as monaco from 'monaco-editor'
import { ref, onMounted, watch, onBeforeUnmount, defineProps, defineEmits, defineExpose } from 'vue'

// 定义组件名称
defineOptions({ name: 'MonacoEditor' })

// 接收外部传入的 props
const props = defineProps({
  modelValue: String, // v-model 绑定的值
  initCode: String, // 初始化代码
  language: {
    type: String,
    default: 'javascript' // 默认语言为 JavaScript
  },
  theme: {
    type: String,
    default: 'vs-dark' // 默认主题为暗色
  },
  readOnly: {
    type: [Boolean, String],
    default: false
  },
  placeholder: String,
  maxLength: Number
})

// 定义事件
const emit = defineEmits(['update:modelValue'])

// 定义编辑器 DOM 容器的引用
const editorRef = ref<HTMLElement | null>(null)

// 编辑器实例
let editor: monaco.editor.IStandaloneCodeEditor | null = null

// 编辑器内容响应式绑定
const code = ref(props.modelValue || props.initCode || '')

// 编辑器初始化方法
const initEditor = () => {
  if (!editorRef.value) return

  editor = monaco.editor.create(editorRef.value, {
    value: code.value,
    language: props.language,
    theme: props.theme,
    readOnly: props.readOnly === true || props.readOnly === 'true',
    fontSize: 14,
    fontFamily: 'Consolas, "Courier New", monospace',
    lineHeight: 22,
    tabSize: 4, // 缩进为 4 个空格
    insertSpaces: true,
    automaticLayout: true, // 自动适应容器大小
    minimap: { enabled: false },
    wordWrap: 'on',
  })

  // 监听内容变更，触发 v-model 更新
  editor.onDidChangeModelContent(() => {
    const val = editor?.getValue() || ''
    if (props.maxLength && val.length > props.maxLength) {
      const truncated = val.substring(0, props.maxLength)
      editor?.setValue(truncated)
      emit('update:modelValue', truncated)
    } else {
      emit('update:modelValue', val)
    }
  })

  // 设置 placeholder（通过装饰）
  if (props.placeholder && !code.value) {
    const model = editor.getModel()
    if (model) {
      monaco.editor.setModelMarkers(model, 'placeholder', [
        {
          startLineNumber: 1,
          startColumn: 1,
          endLineNumber: 1,
          endColumn: 1,
          message: props.placeholder,
          severity: monaco.MarkerSeverity.Hint
        }
      ])
    }
  }
}

// 当 props.modelValue 更新时同步到编辑器中
watch(
  () => props.modelValue,
  (val) => {
    // 如果 modelValue 为空，使用 initCode 作为默认值
    const valueToSet = val || props.initCode || '' // 先使用 modelValue, 如果为空则使用 initCode
    if (valueToSet !== editor?.getValue()) {
      editor?.setValue(valueToSet)
      // 手动触发 v-model 更新
      emit('update:modelValue', valueToSet)
    }
  }
)

// 插入内容到光标位置
const insertAtCursor = (text: string) => {
  if (!editor) return
  const selection = editor.getSelection()
  const id = { major: 1, minor: 1 }
  const op = {
    identifier: id,
    range: selection!,
    text,
    forceMoveMarkers: true
  }
  editor.executeEdits('insert-text', [op])
}

// 对外暴露方法
defineExpose({ insertAtCursor })

// 组件挂载后初始化编辑器
onMounted(() => {
  initEditor()
})

// 卸载时销毁编辑器实例
onBeforeUnmount(() => {
  editor?.dispose()
})
</script>

<style scoped>
.monaco-editor-container {
  display: flex;
  flex-grow: 1;
  /* width: 100%; */
  /* min-width: 400px; */
  height: 100%;
  min-height: 300px;
  border: 1px solid #ccc;
}

.monaco-editor {
  width: 100%;
  height: 100%;
}
</style>
