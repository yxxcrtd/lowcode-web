<script setup lang="ts">
import {ref} from 'vue'

const props=defineProps({
  modelValue:Object
})
const queryFormRef = ref(null);
const queryForm = ref(props.modelValue || {});
const emits=defineEmits(["update:modelValue","search"])
const handleQuery=()=>{
  emits("search",queryForm.value)
}

const resetQuery=()=>{
  queryForm.value = {};
  emits("update:modelValue", queryForm.value); 
  emits("search",queryForm.value)
}
</script>

<template>
  <div class="search-content">
    <div class="search-items">
      <el-form
        class="-mb-15px"
        :model="queryForm"
        ref="queryFormRef"
        label-width="110px"
      >
        <slot></slot>
      </el-form>
    </div>
    <div class="search-action">
      <el-button type="primary" @click="handleQuery"><Icon icon="ep:search" />搜索</el-button>
      <el-button @click="resetQuery"><Icon icon="ep:refresh" />重置</el-button>
    </div>
  </div>
</template>

<style scoped lang="scss">
</style>
