<template>
  <el-cascader class="area-cascader" v-model="curValue" :props="cascaderProps" :options="options" @change="handleChange" />
</template>

<script setup>
import { ref, onMounted } from 'vue'
import areaData from './area.json'

const props = defineProps({
  modelValue: {
    type:[String,Array]
  }
})
const emit = defineEmits(['update:modelValue','change'])
const curValue = computed({
  get: () => {
    return props.modelValue
  },
  set: (val) => {
    emit('update:modelValue', val)
  }
})

const cascaderProps={
  emitPath:false,
  label:'name',
  value:'code',
  children: 'children'
}
const options = ref([])
const handleChange = (value) => {
  console.log(value)
}
onMounted(() => {
  options.value = areaData
})
</script>

<style lang="scss">
.area-cascader{
  width: 100%;
}
</style>
