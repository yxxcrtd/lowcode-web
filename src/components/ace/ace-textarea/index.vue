<template>
  <el-input
    v-model="curValue"
    type="textarea"
    :placeholder="placeholder"
    :disabled="disabled"
    :maxlength="maxlength"
    :clearable="clearable"
    :rows="rows"
    :show-word-limit="showWordLimit"
    @change="handleChange"
    @input="handleInput"
    @focusout="handleBlur"
    @focus="handleFocus"
    @clear="handleClear"
  ></el-input>
</template>

<script setup lang="ts">
import { propTypes } from '@/utils/propTypes'
import {useFormItem} from "element-plus";

// 普通输入框
defineOptions({ name: 'AceTextArea' })

const props = defineProps({
  modelValue: propTypes.string.def(''),
  placeholder:propTypes.string.def('请输入'),
  disabled:propTypes.bool,
  maxlength:propTypes.number.def(1200),
  clearable:propTypes.bool,
  rows:propTypes.number.def(2),
  showWordLimit:propTypes.bool.def(true)
})

// form一般用不到，只是想告诉你它返回这两个值，一个是当前表单实例，一个是formItem实例
const { form, formItem } = useFormItem()

const emit = defineEmits(['update:modelValue','change','input','blur','focus','clear'])
const curValue = computed({
  get: () => {
    return props.modelValue
  },
  set: (val: string) => {
    emit('update:modelValue', val)
  }
})

const handleChange=(e)=>{
  emit('change',e)
  // 触发trigger包含blur的校验规则
  formItem?.validate?.('change');
}
const handleInput=(e)=>{
  emit('input',e)
}
const handleBlur=(e)=>{
  emit('blur',e)
  // 触发trigger包含blur的校验规则
  formItem?.validate?.('blur');
}
const handleFocus=(e)=>{
  emit('focus',e)
}
const handleClear=(e)=>{
  emit('clear',e)
}

</script>

<style scoped lang="scss">
:deep(.el-input-group__prepend) {
  padding: 0;
}
</style>
