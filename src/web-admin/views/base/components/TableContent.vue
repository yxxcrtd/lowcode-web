<script setup lang="ts">
withDefaults(defineProps<{
  tableData: Array<any>,
  tableColumn: Array<any>,
}>(), {
  isShowArrow: false,
  // tableData: () => [],
  tableColumn: () => []
})
</script>

<template>
  <div class="content">
    <JVxeTable ref="jVxeTable" :columns="tableColumn" :row-height="58" :data-source="tableData">
      <template #action_default="{ row }">
        <slot name="action_default" :row="row"></slot>
      </template>
    </JVxeTable>
  </div>
</template>

<style scoped lang="scss">
.header {
  display: flex;
  justify-content: space-between;
  height: 80px;

  .mr-5px {
    margin-left: 5px;
  }

  .el-dropdown {
    margin-right: 12px;
    //background-color: #3b3e55;
  }

  .el-button {
    &:hover {
      outline: none;
    }
  }

  .right {
    display: flex;
    align-items: center;

    .input {
      display: flex;
      align-items: center;
      padding-right: 120px;

      span {
        min-width: 50px;
      }
    }
  }
}
</style>
