<script setup lang="ts">
import type { TimerNode} from '../nodes/type'
import type {Ref} from "vue";
const props=defineProps<{
  activeData: TimerNode
}>()

const { isOutProcess } = inject<{
  isOutProcess?: Ref<boolean>
}>('flowDesign', { isOutProcess: ref(false) })
const emit = defineEmits(['update:activeData'])
const curActiveData=computed({
  get: () => {
    return props.activeData
  },
  set: (val: TimerNode) => {
    emit('update:activeData', val)
  }
})
</script>

<template>
  <el-form label-position="top">
    <el-form-item prop="outProcessNodeId" label="外部流程节点ID" v-if="isOutProcess">
      <el-input
        v-model="curActiveData.outProcessNodeId"
        :maxlength="255"
        clearable
        placeholder="请输入外部流程ID,多个逗号分隔"
      />
    </el-form-item>
    <el-form-item prop="waitType" label="等待方式">
      <el-radio-group v-model="curActiveData.waitType">
        <el-radio-button label="固定时长" value="duration" />
        <el-radio-button label="固定时间" value="date" />
      </el-radio-group>
    </el-form-item>
    <el-form-item prop="duration" label="等待时长" v-if="curActiveData.waitType === 'duration'">
      <el-input
        v-model.number="curActiveData.duration"
        :min="0"
        :max="9999999"
        type="number"
        style="max-width: 230px"
        class="input-with-select"
      >
        <template #append>
          <el-select v-model="curActiveData.unit" placeholder="Select" style="width: 80px">
            <el-option label="秒" value="PT%sS"></el-option>
            <el-option label="分钟" value="PT%sM"></el-option>
            <el-option label="小时" value="PT%sH"></el-option>
            <el-option label="天" value="P%sD"></el-option>
            <el-option label="周" value="P%sW"></el-option>
            <el-option label="月" value="P%sM"></el-option>
          </el-select>
        </template>
      </el-input>
    </el-form-item>
    <el-form-item prop="duration" label="指定时间" v-if="curActiveData.waitType === 'date'">
      <el-date-picker
        v-model="curActiveData.timeDate"
        type="datetime"
        format="YYYY-MM-DD HH:mm:ss"
        value-format="YYYY-MM-DD HH:mm:ss"
        placeholder="请选择等待时间"
      />
    </el-form-item>
  </el-form>
</template>

<style scoped lang="scss">
:deep(.el-tabs__content){
  padding: 0 8px;
}
:deep(.el-form-item__label){
  font-size: 12px;
  font-weight: 600;
}
:deep(.el-form-item--label-top) {
  display: block;
  padding-bottom: 10px;
  border-bottom: 1px solid #efefef;
}
</style>
