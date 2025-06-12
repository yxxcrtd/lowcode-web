<template>
  <ace-select v-model="selectFileId" :data-source="fileList" @visible-change="handleVisible"></ace-select>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import {getRolePage} from "@/api/system/role";

// ==================== Props 定义 ====================
const props = defineProps({
  // v-model绑定值
  modelValue: {
    type: [Array, String, Number],
    default: undefined
  },
  fileType: {
    type: String,
    default: 'vue'
  },
})

// ==================== Emits 定义 ====================
const emit = defineEmits(['update:modelValue', 'change'])

// ==================== 计算属性 ====================
/**
 * 内部值处理,用于v-model双向绑定
 */
const selectFileId = computed({
  get() {
    return props.modelValue
  },
  set(val) {
    emit('update:modelValue', val)
    emit('change', val)
  }
})
let slotFileModules = import.meta.glob('@/comRenderPlugins/**/*.vue')
let jsFileModules = import.meta.glob('@/comRenderPlugins/**/*.ts')
const fileList=ref([])
const isLoadFileList=ref(false)
const loadFileList=()=>{
  const fileModules=props.fileType==='vue' ? Object.keys(slotFileModules) : Object.keys(jsFileModules)
  fileList.value=fileModules.map(key=>{
    const newKey=key.replace('/src/comRenderPlugins','')
    return {
      label:newKey,
      value:newKey,
    }
  })
  isLoadFileList.value=true
}

const handleVisible=(val)=>{
  if(val && !isLoadFileList.value){
    loadFileList()
  }
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
