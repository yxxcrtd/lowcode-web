<template>
  <ace-select v-model="selUserId" :data-source="dataSourceList" :multiple="multiple">
    <template #default="{option}">
      <div class="list-option">
        <span>{{option.label}}</span>
        <span>{{option.deptName}}</span>
      </div>
    </template>
  </ace-select>
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
  roleId:{
    type: [Array, String, Number],
    default:'2'
  },
  // 是否多选模式
  multiple: {
    type: Boolean,
    default: false
  },
})

// ==================== Emits 定义 ====================
const emit = defineEmits(['update:modelValue', 'change'])

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
const dataSourceList=ref([])
const getRoleUserList=async ()=>{
  const params={
    pageNo: 1,
    pageSize: 100
  }
  const res=await getRolePage(params)
  if(res && res.list){
    dataSourceList.value=res.list.map(item=>{
      return {
        label:item.name,
        value:item.id,
        ...item
      }
    })
  }
}
getRoleUserList()
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
