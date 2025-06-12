<!--
 * @Description: 选择组件
 * @Author: miffy
 * @Date: 2024-11-12
 * 
-->

<template>
  <ace-select-tabs-table
    :columns="columns"
    :tabsList="tabsList"
    :sourceUrl="sourceUrl"
    :showLabel="showLabel"
    :multiple="false"
    labelKey="componentName"
    valueKey="componentCode"
    :query-config="{ tabKey: 'groupId', searchKey: 'componentName' }"
    v-model="componentsCode"
  />
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { propTypes } from '@/utils/propTypes'
import { getTree } from './api'

// Types
interface TreeItem {
  id: string | number
  groupName: string
}

// Component Definition
defineOptions({ name: 'BizSelectComponent' })

// Props
const props = defineProps({
  /** 
   * 选中的组件编码
   * @default ''
   */
  modelValue: propTypes.string.def(''),
  /**
   * 选中项的显示文本
   * @description 用于初始化时显示选中项的文本，当无法从数据源获取时使用
   * @default ''
   */
   showLabel: propTypes.string.def('')
})

// Emits
const emit = defineEmits(['update:modelValue'])

/** 组件列表接口地址 */
const sourceUrl = ref('/cfg/component-table/page')
/** 分组标签列表 */
const tabsList = ref<{ label: string; value: string | number }[]>([])

/** 表格列配置 */
const columns = ref([
  {
    title: '组件名称',
    align: 'left',
    width: '180',
    field: 'componentName'
  },
  {
    title: '组件编码',
    align: 'left',
    width: '240',
    field: 'componentCode'
  },
  {
    title: '说明',
    align: 'center',
    field: 'remark'
  }
])

/** 
 * 组件编码双向绑定
 * @property {Function} get 获取选中值
 * @property {Function} set 设置选中值并触发更新事件
 */
const componentsCode = computed({
  get: () => props.modelValue,
  set: (val: string) => emit('update:modelValue', val)
})

/**
 * 获取组件分组数据
 * @description 获取组件分组树形数据并转换为标签页格式
 */
const getComponentTabs = async () => {
  try {
    const res = await getTree()
    tabsList.value = res.map((item: TreeItem) => ({
      label: item.groupName,
      value: item.id,
      params:{
        groupId:item.id
      }
    }))
  } catch (error) {
    console.error('获取组件分类失败:', error)
    tabsList.value = []
  }
}

/** 组件挂载时获取分组数据 */
onMounted(async () => {
  await getComponentTabs()
})
</script>

<style scoped lang="scss"></style>
