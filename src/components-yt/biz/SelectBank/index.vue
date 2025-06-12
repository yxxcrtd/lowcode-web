<template>
  <ace-select-table
    v-model="selValue"
    v-model:show-label="selText"
    :data-url="dataUrl"
    :columns="tableColumns"
    :multiple="multiple"
    query-key-name="query"
    label-key="branchInstitutionName"
    @change="handleChange"
    value-key="id"
  ></ace-select-table>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'

// ==================== Props 定义 ====================
const props = defineProps({
  // v-model绑定值
  modelValue: {
    type: [Array, String, Number],
    default: undefined
  },
  modelText: {
    type: [Array, String, Number],
    default: undefined
  },
  // 是否多选模式
  multiple: {
    type: Boolean,
    default: false
  }
})

// ==================== Emits 定义 ====================
const emit = defineEmits(['update:modelValue','update:modelText', 'change'])

const tableColumns = [
  {
    type:'seq',
    title: '序号',
    width: '60',
  },
  {
    field: 'branchInstitutionName',
    title: '机构名称'
  }
]
const dataUrl = '/ibps/fina/bra/getPageList'

// ==================== 计算属性 ====================
/**
 * 内部值处理,用于v-model双向绑定
 */
const selValue = computed({
  get() {
    return props.modelValue
  },
  set(val) {
    emit('update:modelValue', val)
  }
})
const selText = computed({
  get() {
    return props.modelText
  },
  set(val) {
    emit('update:modelText', val)
  }
})
const handleChange=(val,option)=>{
  console.log(val,option)
  emit('change',val,option)
}
</script>

<style lang="scss" scoped>
// ================ 基础样式 ================
.ace-select-wrapper {
  width: 100%;
  display: inline-block;
}
.list-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  & > span:nth-child(2) {
    font-size: 12px;
    color: #918f8f;
  }
}
</style>
