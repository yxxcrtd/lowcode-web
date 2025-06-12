<script setup lang="ts">
import type { EndNode} from '../nodes/type'
import ExecutionListeners from './ExecutionListeners.vue'

const props =  defineProps<{
  activeData: EndNode
}>()

const emit = defineEmits(['update:activeData'])
const curActiveData=computed({
  get: () => {
    return props.activeData
  },
  set: (val: EndNode) => {
    emit('update:activeData', val)
  }
})
</script>

<template>
  <el-form label-position="top" label-width="90px">
    <el-form-item prop="outProcessNodeId" label="外部流程节点ID（多个逗号分隔）">
      <el-input
        v-model="curActiveData.outProcessNodeId"
        :maxlength="255"
        clearable
        placeholder="请输入外部流程ID"
      />
    </el-form-item>
    <el-form-item prop="executionListeners" label="执行监听器">
      <ExecutionListeners :node="activeData" />
    </el-form-item>
  </el-form>
</template>

<style scoped lang="scss"></style>
