<template>
  <div class="prefixed-input">
    <el-input
      v-model="inputValue"
      class="composite-input-container"
      :placeholder="placeholder"
      :maxlength="maxlength"
      :disabled="disabled"
      :clearable="clearable"
      @change="handleChange"
      @input="handleInput"
      @blur="handleBlur"
      @focus="handleFocus"
      @clear="handleClear"
    >
      <!-- 左侧前缀输入框（不可编辑） -->
      <template #prepend>
        <el-input
          class="prefix-section"
          :model-value="prefixValue"
          disabled
        />
      </template>
    </el-input>
  </div>
</template>

<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import { propTypes } from '@/utils/propTypes'

// 带前缀的组合输入框
defineOptions({ name: 'PrefixedInput' })

const props = defineProps({
  modelValue: propTypes.string.def(''),
  placeholder: propTypes.string.def('请输入'),
  disabled: propTypes.bool.def(false),
  maxlength: propTypes.number.def(200),
  clearable: propTypes.bool.def(true),
  prefixField: propTypes.string.def(''),
  formData: propTypes.object.def({}),  
  prefixWidth: propTypes.number.def(100),
  pageListConfigs: propTypes.array.def([])
})

// 获取未在 props 中声明的所有属性
const attrs = useAttrs()

let prefixedFiled = ref({})

const prefixField = attrs.prefixFiled || props.prefixField
const fieldItems = prefixField && props.pageListConfigs.filter(formItem => {
  return String(prefixField).includes(formItem.columnName)
}) || []
const fieldItem = fieldItems && fieldItems[0]
prefixedFiled.value = fieldItem || {}

const emit = defineEmits(['update:modelValue', 'change', 'input', 'blur', 'focus', 'clear'])

const inputValue = computed({
  get: () => props.modelValue,
  set: (val: string) => {
    emit('update:modelValue', val)
  },
})

const prefixValue = computed(() => {
  console.log(prefixedFiled.value)
  const result = prefixedFiled.value && props.formData[`${prefixedFiled.value.moduleTableId}`][`${prefixedFiled.value.columnName}_${prefixedFiled.value.moduleTableId}`] || ''
  return result
})

const handleChange = (e) => {
  emit('change', e)
}

const handleInput = (e) => {
  emit('input', e)
}

const handleBlur = (e) => {
  emit('blur', e)
}

const handleFocus = (e) => {
  emit('focus', e)
}

const handleClear = (e) => {
  emit('clear', e)
}
</script>

<style scoped lang="scss">
.prefixed-input {
  width: 100%;
  display: flex;
  align-items: center;
}

.composite-input-container {
  width: 100%;
  
  :deep(.el-input-group__prepend) {
    width: v-bind('prefixWidth + "px"'); /* 使用固定宽度，而不是百分比 */
    padding: 0;
    overflow: hidden;
    flex-shrink: 0; /* 防止缩小 */
  }
  
  :deep(.el-input__wrapper) {
    flex: 1; /* 自动占据剩余空间 */
  }
}

.prefix-section {
  width: 100%;
  pointer-events: none;
  background-color: #f5f7fa;
  color: #909399;
  .el-input__inner {
    text-align: center;
  }
}
</style>