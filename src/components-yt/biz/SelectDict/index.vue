<template>
<!--    :showLabel="dictName"-->
  <ace-select-tabs-table-v2
    :tabsList="tabList"
    :tablePageConfig="{pageSize:20}"
    :multiple="false"
    :showLabel="dictName"
    v-model="dictType"
  />
</template>

<script setup lang="ts">
// 普通输入框
import { propTypes } from '@/utils/propTypes'

defineOptions({ name: 'BizSelectDict' })

const props = defineProps({
  modelValue: propTypes.string.def(''),
  dictName: propTypes.string.def(''),
  showLabel:propTypes.string,
})
const emit = defineEmits(['update:modelValue', 'update:dictName',])

const tabList=[
  {
    value:'字典',
    label:'字典',
    labelKey:'name',
    valueKey:'type',
    apiUrl:'/system/dict-type/page',
    columns:[
      {
        title: '字典名称',
        align: 'left',
        width: '180',
        field: 'name'
      },
      {
        title: '字典类型',
        align: 'left',
        width: '240',
        field: 'type'
      },
      {
        title: '状态',
        align: 'center',
        // width: '100',
        field: 'status',
        formatter: ({ cellValue }) => (cellValue === 0 ? '开启' : '停止')
      }
    ]
  },
  {
    value:'数据集',
    label:'数据集',
    labelKey:'name',
    valueKey:'id',
    apiUrl:'/infra/data-set-config/list',
    columns:[
      {
        title: '数据集名称',
        align: 'left',
        width: '180',
        field: 'name'
      },
      {
        title: '数据集类型',
        align: 'left',
        width: '240',
        field: 'type'
      },
      {
        title: '数据集编码',
        align: 'center',
        // width: '100',
        field: 'code',
      }
    ]
  }
]
const dictType = computed({
  get: () => {
    return props.modelValue
  },
  set: (val: string) => {
    emit('update:modelValue', val)
  }
})

onBeforeUnmount(() => {
})
</script>

<style scoped lang="scss"></style>
