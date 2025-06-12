<template>
  <component
    v-if="fieldItem"
    :is="fieldItem.name"
    v-model="componentVal"
    v-bind="fieldItem.props"
  >
  </component>
</template>

<script setup lang="ts">
/**
 * 配置组件统一渲染组件，用于区分是详情或编辑显示不同状态
 */
defineOptions({ name: 'ComponentRender' })

const props = defineProps({
  modelValue:{
    type:[String, Number],
  },
  fieldItem: {
    type:Object,
    default:()=>{}
  }
})

const emit = defineEmits(['update:modelValue'])
const componentVal = computed({
  get: () => {
    return props.modelValue
  },
  set: (val: string) => {
    emit('update:modelValue', val)
  }
})
</script>

<style scoped lang="scss">
</style>
