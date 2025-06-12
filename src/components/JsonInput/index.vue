<template>
  <el-link type="primary" @click="dialogVisible = true" :icon="EditPen" :class="curValue ? 'isSetting':''"> {{title}} </el-link>
  <Dialog
    v-model="dialogVisible"
    :title="title"
    width="800"
  >
    <div class="dialog-content">
      <JsonEditor v-model="curValue" ></JsonEditor>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="dialogVisible = false">关闭</el-button>
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { propTypes } from '@/utils/propTypes'
import {EditPen} from '@element-plus/icons-vue'

// 普通输入框
defineOptions({ name: 'JSONInput' })

const props = defineProps({
  title:propTypes.string.def('配置'),
  modelValue: propTypes.string.def('')
})
const emit = defineEmits(['update:modelValue'])
const curValue = computed({
  get: () => {
    return props.modelValue
  },
  set: (val: string) => {
    emit('update:modelValue', val)
  }
})
const dialogVisible = ref(false)
</script>

<style scoped lang="scss">
.dialog-content{
  text-align: left;
  height: 388px;
}
.fun{
  color:#b478cf;
}
.fun-name{
  color:#70c0e8;
}
.fun-params{
  color:#70c0e8;
}
.isSetting{
  color: #008000;
}
</style>
