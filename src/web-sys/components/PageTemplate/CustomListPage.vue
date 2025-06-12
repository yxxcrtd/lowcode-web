<template>
  <div class="page-container">
    <SearchContent v-model="queryParams" @search="search">
      <slot name="searchItems" :queryParams="queryParams"/>
    </SearchContent>
    <div class="content">
      <ButtonContent>
        <slot name="buttonItems"></slot>
      </ButtonContent>
      <TableContent ref="tableContentRef" v-bind="$attrs" :searchParams="queryParams">
        <template v-for="(index, name) in $slots" #[name]="{ row, rowIndex }">
          <slot :name="name" v-bind="{ row, rowIndex }"></slot>
        </template>
      </TableContent>
    </div>
  </div>
</template>

<script setup lang="ts">
import SearchContent from './Components/SearchContent.vue'
import ButtonContent from './Components/ButtonContent.vue'
import TableContent from './Components/TableContent.vue'
import { ref } from 'vue'

const queryParams = ref({})
const tableContentRef=ref()
const search=()=>{
  tableContentRef.value.refreshTable();
}

defineExpose({ search }) // 提供 open 方法，用于打开弹窗

onMounted(async () => {
})
</script>

<style scoped lang="scss">
.content{
  background-color: white;
}
</style>
