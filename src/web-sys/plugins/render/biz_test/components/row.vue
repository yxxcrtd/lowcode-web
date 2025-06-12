<script setup lang="ts">
import {propTypes} from "@/utils/propTypes";

const props=defineProps({
  row:propTypes.object,
  column:propTypes.object
})
</script>

<template>
  行内插槽{{row[column.field]}}
</template>

<style scoped lang="scss">
.button-content{
  margin: 10px 0;
  padding: 8px 10px;
}
</style>
