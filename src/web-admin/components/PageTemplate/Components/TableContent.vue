<script setup lang="ts">

const jVxeTable=ref()
/**
 * 刷新表格
 */
const refreshTable=(resetPage)=>{
  jVxeTable.value.refresh(resetPage);
}
defineExpose({ refreshTable }) // 提供 open 方法，用于打开弹窗
</script>

<template>
  <div class="content">
    <JVxeTable ref="jVxeTable" :row-height="58" height="100%" v-bind="$attrs">
      <template v-for="(index, name) in $slots" #[name]="{ row, rowIndex }">
        <slot :name="name" v-bind="{ row, rowIndex }"></slot>
      </template>
    </JVxeTable>
  </div>
</template>

<style scoped lang="scss">
</style>
