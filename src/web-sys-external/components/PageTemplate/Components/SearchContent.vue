<script setup lang="ts">
import {ref} from 'vue'

const props=defineProps({
  modelValue:Object
})
const queryForm = ref(props.modelValue || {});
const emits=defineEmits(["update:modelValue","search"])
const handleQuery=()=>{
  emits("search",queryForm.value)
}

const resetQuery=()=>{
  queryForm.value={}
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
        :inline="true"
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
.search-content{
  background: #ffffff;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 10px;
  display: flex;
  .search-items{
    flex: 1;
    position: relative;
    &::after{
      content: '';
      display: block;
      width: 1px;
      height: 100%;
      position: absolute;
      top: 0;
      right: 32px;
      border-right: 1px solid #8a909c;
    }
  }
  .search-action{
    width: 80px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    .el-button{
      //margin-left: 10px !important;
      margin-bottom: 10px;
    }
    .el-button+.el-button{
      margin-left: auto;
    }
  }
}
</style>
