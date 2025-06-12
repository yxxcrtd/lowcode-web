<script setup lang="ts">
import {propTypes} from "@/utils/propTypes";

const props=defineProps({
  column:propTypes.object
})
</script>

<template>
  表头插槽{{column.title}}
</template>

<style scoped lang="scss">
</style>
