<template>
  <el-button type="primary" class="operate-btn" :disabled="disabled" :icon="Money" @click="openDialog">{{ dialogType === 'KB'?'选择资产':'选择产品'}}</el-button>
  <SelectTableDialog ref="selectTableDialogRef" v-bind="getProps" @success="handleCallBack"/>
</template>
<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import {Money} from '@element-plus/icons-vue'
import SelectTableDialog from "./SelectTableDialog.vue";

// ==================== Props 定义 ====================
const props = defineProps({
  // 是否多选模式
  multiple: {
    type: Boolean,
    default: false
  },
  // 数据源Url
  dataUrl: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  },
  columns: {
    type: Array
  },
  searchParams:{
    type:[Object,String]
  },
  pageListConfigs:{
    type:Array
  },
  formData:{
    type:Object
  },
  titleTip:{
    type:String,
    default:'批量开户仅适用于标准化家信产品;仅允许同一品牌的信托产品进行批量开户:'
  },
  dialogType:{
    type: String,
    default: 'YDJ'
  }
})
// ==================== Emits 定义 ====================
const emit = defineEmits(['btnEvent'])
const getProps = computed(() =>{
  const delArr = ['modelValue', 'modelText']
  const obj = { ...props }
  for (const key in obj) {
    if (delArr.indexOf(key) !== -1) {
      delete obj[key]
    }
  }
  return obj
})
const selectTableDialogRef = ref()
const openDialog = () => {
  selectTableDialogRef.value.open();
}

const handleCallBack = (selectedRow) => {
  emit('btnEvent',selectedRow)
}
</script>

<style lang="scss" scoped>
.operate-btn{
  margin-right: 10px;
}
</style>

