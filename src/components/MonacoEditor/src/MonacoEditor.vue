<template>
    <el-form label-width="80px" :model="form">
        <el-row 
            :gutter="5"
            class="filter-item-rule"
            >
            <el-col :span="8">
                <el-form-item label="选择字段">
                    <trigger
                        ref="triggerRef"
                        :options="filterFields.filter((e) => e.value !== undefined)"
                        v-model="form.field"
                        @update:model-value="changeFieldId"
                        :multiple="false"
                    />
                </el-form-item>
            </el-col>
            <el-col :span="8">
                <el-form-item label="选择方法">
                    <ace-select v-model="form.methods" placeholder="请选择" :data-source="methodsOptions" @change="methodsChange"></ace-select>
                </el-form-item>
            </el-col>
            <el-col :span="8">
                <el-form-item label="选择代码块">
                    <ace-select v-model="form.codes" placeholder="请选择" :data-source="codeOptions"></ace-select>
                </el-form-item>
            </el-col>
        </el-row>
    </el-form>
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
    maxLength: Number,
    // 字段
    filterFields:{
        type: Array,
        default: () => [] 
    }
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

//脚本辅助change事件
const form = ref({})

const methodsOptions = [
    {
        label:'表单内触发切换流程id',
        value:'changeFlow',
        desc:
`    /**
     * 表单内触发切换流程id
     * @param ctx   表单组件上下文，可以使用组件内部定义的变量和方法（方法必须defineExpose）
     * @param flowId 需要切换的flowId
     */
    renderUtil.changeFlow(ctx,flowId,nodeId)
`
    },
    {
        label:'请求',
        value:'defRequest',
        desc:
`    /**
     * 请求
     * @param url 请求url
     * @param params 请求参数
     * @param type 不传位默认post 
     * @param headersType 请求头参数
     */
    renderUtil.defRequest(url,params,type,headersType)
`
    },
    {
        label:'附件必填根据表单数据切换',
        value:'fileValidate',
        desc:
`    /**
     * 附件必填根据表单数据切换
     * @param ctx   表单组件上下文，可以使用组件内部定义的变量和方法（方法必须defineExpose）
     * @param formData 表单数据
     * @param fileTypeList
     * @param typeObj
     */
    renderUtil.fileValidate(ctx,formData,fileTypeList,typeObj)
`
    },
    {
        label:'获取当前时间',
        value:'getCurDate',
        desc:
`    /**
     * 获取当前时间
     * @param format   时间格式 不传默认为YYYY-MM-DD hh:mm:ss
     */
    renderUtil.getCurDate(format)
`
    },
    {
        label:'获取当前登陆人的部门id',
        value:'getDeptId',
        desc:
`    /**
     * 获取当前登陆人的部门id
     */
    renderUtil.getDeptId()
`
    },
    {
        label:'子表获取 formData',
        value:'getFormData',
        desc:
`    /**
     * 子表获取 formData
     */
    renderUtil.getFormData()
`
    },
    {
        label:'弹出信息提示框',
        value:'messageUtil',
        desc:
`    /**
     * 弹出信息提示框
     * @param fun 提示框类型
     * @param content 提示语
     * @param tips 提示tips
     */
    renderUtil.messageUtil(fun,content,tips)
`
    }
]

const codeOptions = [
    
]

const changeFieldId=async ()=>{
    await nextTick()
    const fieldItem:any=props.filterFields.find((e) => e.id === form.value.field)
    console.log(fieldItem,'----fieldItem');
    if(!fieldItem){
        return 
    }
    let desc = ''
    if(fieldItem.tableName.indexOf('子表') !== -1){
        desc = `
    //操作${fieldItem.tableName}
    formData['${fieldItem.tableId}'].forEach(item => {
        //${fieldItem.label}
        item['${fieldItem.columnName}_${fieldItem.tableId}']
    })
`
    }else{
        desc = `
    //${fieldItem.label}
    formData['${fieldItem.tableId}']['${fieldItem.columnName}_${fieldItem.tableId}']
`
    }
    const val = editor?.getValue() || ''
    const truncated = removeLastClosingBrace(val).concat(desc + '}').substring(0, props.maxLength)
    editor?.setValue(truncated)
    emit('update:modelValue', truncated)
}

//用于移除字符串中最后一个出现的右花括号
const removeLastClosingBrace = (str) => {
  const lastIndex = str.lastIndexOf('}')
  if (lastIndex !== -1) {
    return str.slice(0, lastIndex) + str.slice(lastIndex + 1)
  }
  return str // 如果没有找到右花括号，返回原字符串
}

const methodsChange = (e) => {
    console.log(e);
    const desc = methodsOptions.find(item => item.value === e)?.desc || ''
    const val = editor?.getValue() || ''
    const truncated = removeLastClosingBrace(val).concat(desc + '}').substring(0, props.maxLength)
    editor?.setValue(truncated)
    emit('update:modelValue', truncated)
}

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
    max-height: 600px;
    border: 1px solid #ccc;
}

.monaco-editor {
    width: 100%;
    height: 100%;
}
</style>
