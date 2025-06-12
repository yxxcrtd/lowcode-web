<template>
  <el-tree-select
    check-strictly
    v-model="curValue"
    clearable
    :data="dataSource"
    :props="treeProps"
  />
</template>
<script setup lang="ts">

const props=defineProps({
  modelValue:{
    type:String
  },
  dataSource:{
    type:Array
  },
  treeProps:{
    type:Object
  }
})
const emit = defineEmits(['update:modelValue','update:modelText','change','clear','visible-change','remove-tag'])
//v-model双向绑定
let curValue = computed({
  get: () => {
    return props.modelValue
  },
  set: (val) => {
    emit('update:modelValue',val)
  }
})
</script>

<style scoped lang="scss">

</style>
