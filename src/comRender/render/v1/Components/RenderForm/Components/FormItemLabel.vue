<template>
  <div class="form-item-label-content">
    <el-tooltip
      v-if="tips"
      popper-class="form-item-label-tooltips"
      placement="top"
    >
      <template #content><div v-html="tips"></div></template>
      <el-icon class="tips-icon mr-4px"><WarningFilled /></el-icon>
    </el-tooltip>
    <ace-ellipsis :maxWidth="maxWidth">{{label}}</ace-ellipsis>
    ：
  </div>
</template>
<script setup lang="ts">
import {WarningFilled} from "@element-plus/icons-vue";

defineOptions({ name: 'FormItemLabel' })
const props=defineProps({
  maxWidth:{
    type:String,
    default:'100px'
  },
  label:{
    type:String
  },
  tips:{
    type:String
  }
})
</script>
<style scoped lang="scss">
.form-item-label-content{
  display:flex;
  align-items: center;
  .tips-icon{
    color: #CFA479;
    margin-left: 2px;
  }
}
</style>
<style lang="scss">
.form-item-label-tooltips{
  max-width: 30vw !important;
}
</style>
