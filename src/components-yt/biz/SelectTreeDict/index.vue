<template>
  <el-cascader :props="cascaderProps" />
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
  treeType:{
    type: String,
    default:'rhdjrinfor_0026'
  },
  excludes:{
    type:[Array,String],
  },
  filter:{
    type:[Array,String],
  },
  // 是否多选模式
  multiple: {
    type: Boolean,
    default: false
  },
})

// ==================== Emits 定义 ====================
const emit = defineEmits(['update:modelValue', 'change'])


const cascaderProps = {
  lazy: true,
  multiple:props.multiple,
  lazyLoad(node, resolve) {
    const { level,data } = node
    
  },
}
// ==================== 计算属性 ====================
/**
 * 内部值处理,用于v-model双向绑定
 */
const selUserId = computed({
  get() {
    return props.modelValue
  },
  set(val) {
    emit('update:modelValue', val)
    emit('change', val)
  }
})

const loadTreeDictData=()=>{
  
}
</script>

<style lang="scss" scoped>
// ================ 基础样式 ================
.ace-select-wrapper {
  width: 100%;
  display: inline-block;
}
.list-option{
  display:flex;
  justify-content: space-between;
  align-items: center;
  &>span:nth-child(2){
    font-size: 12px;
    color:#918f8f;
  }
}

</style>
