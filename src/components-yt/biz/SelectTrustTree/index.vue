<!--
 * @Description: 信托三分类级联选择器
 * @Author: miffy
 * @Date: 2024-11-13
 * 
-->

<template>
  <div class="select-trust-tree">
    <el-tooltip
      :content="tooltipContent"
      placement="top"
      :show-after="200"
      :hide-after="200"
      :visible="showTooltip && shouldShowTooltip && !!tooltipContent"
      popper-class="trust-tree-tooltip"
    >
      <template #default>
        <div class="tooltip-trigger" @mouseenter="handleMouseEnter" @mouseleave="handleMouseLeave">
          <el-cascader
            class="trust-tree-cascader"
            v-model="selectedValue"
            :options="options"
            :props="cascaderProps"
            :show-all-levels="showAllLevels"
            :filterable="filterable"
            :style="{ width: '100%' }"
            clearable
            @change="handleChange"
          />
        </div>
      </template>
    </el-tooltip>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { propTypes } from '@/utils/propTypes'
import type { CascaderProps } from 'element-plus'
import trustDataJson from './trustData.json'
import {cloneDeep} from "lodash-es";
/**
 * 级联选择器选项的接口定义
 */
interface CascaderOption {
  /** 节点值 */
  value: string | number
  /** 节点标签 */
  label: string
  /** 子节点 */
  children?: CascaderOption[]
  /** 是否禁用 */
  disabled?: boolean
  /** 是否为叶子节点 */
  leaf?: boolean
}

type CascaderValue = string | number | (string | number)[] | null | undefined

// Component Definition
defineOptions({ name: 'BizSelectTrustTree' })

// 是否显示tooltip的状态
const shouldShowTooltip = ref(false)

/**
 * 组件属性定义
 */
const props = defineProps({
  /**
   * 选中项的值
   * @description 支持以下几种值：
   * - ''：空字符串（清空选择）
   * - null：未选择任何值
   * - undefined：未定义
   * - []：空数组（清空多选）
   * - string/number：单选模式下的选中值
   * - Array<string|number>：多选模式下的选中值数组
   * @default null
   */
  modelValue: propTypes.any.def(null),

  /**
   * 是否开启多选模式
   * @description 允许同时选择多个选项
   * @default false
   */
  multiple: propTypes.bool.def(false),

  /**
   * 是否显示完整路径
   * @description 在选择器中显示选中项的完整层级路径
   * @example true: "父级/子级/选中项" | false: "选中项"
   * @default true
   */
  showAllLevels: propTypes.bool.def(true),

  /**
   * 是否返回节点路径值
   * @description 在选择节点时，是否返回节点的完整路径值数组
   * @example true: ['root', 'child', 'leaf'] | false: 'leaf'
   * @default false
   */
  emitPath: propTypes.bool.def(false),

  /**
   * 子菜单触发展开的方式
   * @description 配置如何触发子菜单的展开
   * @values 'click' | 'hover'
   * @default 'click'
   */
  expandTrigger: propTypes.string.def('click'),

  /**
   * 是否开启搜索功能
   * @description 开启后可以通过输入关键字快速查找选项
   * @default true
   */
  filterable: propTypes.bool.def(true),

  /**
   * 是否显示悬浮提示
   * @description 鼠标悬浮在选择框上时是否显示选中项的完整内容
   * @default true
   */
  showTooltip: propTypes.bool.def(true),
  /**
   * 下拉码值置灰
   */
  disabledValue:propTypes.string.def(''),

})

/**
 * 组件事件
 */
const emit = defineEmits<{
  'update:modelValue': [value: CascaderValue]
  change: [value: CascaderValue]
}>()

/**
 * 级联选择器的数据源
 * @type {Ref<CascaderOption[]>}
 */
const options = ref<CascaderOption[]>([])

/**
 * 级联选择器的配置项
 * @type {Ref<Object>}
 */
const cascaderProps = ref<CascaderProps>({
  multiple: props.multiple, // 是否支持多选
  checkStrictly: false, // 父子节点是否关联
  expandTrigger: props.expandTrigger as 'hover' | 'click', // 展开触发方式
  emitPath: props.emitPath // 是否返回节点路径值
})

/**
 * 选中值的计算属性，实现双向绑定
 * @property {Function} get - 获取选中值
 * @property {Function} set - 设置选中值并触发更新
 */
const selectedValue = computed({
  get: () => props.modelValue,
  set: (val: CascaderValue) => emit('update:modelValue', val)
})

/**
 * 处理选择变更事件
 * @param {any} value - 变更后的选中值
 * @emits change - 触发选择变更事件
 */
const handleChange = (value: any) => {
  emit('change', value)
}

/**
 * 获取节点的完整路径标签
 * @param value 节点值
 * @returns 完整的路径标签字符串
 */
const getFullPathLabel = (value: string | number | (string | number)[]): string => {
  // 递归查找节点
  const findNodePath = (nodes: CascaderOption[], targetValue: string | number): string[] => {
    for (const node of nodes) {
      if (node.value === targetValue) {
        return [node.label]
      }
      if (node.children) {
        const childPath = findNodePath(node.children, targetValue)
        if (childPath.length > 0) {
          return [node.label, ...childPath]
        }
      }
    }
    return []
  }

  // 如果是数组，说明是完整路径
  if (Array.isArray(value)) {
    const labels: string[] = []
    let currentNodes = options.value

    for (const val of value) {
      const node = currentNodes.find((n) => n.value === val)
      if (node) {
        labels.push(node.label)
        currentNodes = node.children || []
      }
    }
    return labels.join(' / ')
  }

  // 单个值的情况
  const path = findNodePath(options.value, value as string | number)
  return path.join(' / ')
}

/**
 * 计算tooltip显示的内容
 */
const tooltipContent = computed(() => {
  const value = selectedValue.value
  if (!value) return ''

  // 多选模式
  if (props.multiple && Array.isArray(value)) {
    return value
      .map((item) => {
        // 如果启用了 emitPath，item 是一个数组
        if (Array.isArray(item)) {
          return getFullPathLabel(item)
        }
        // 否则 item 是单个值
        return getFullPathLabel(item)
      })
      .filter(Boolean) // 过滤掉空值
      .join('\n')
  }

  // 单选模式
  if (Array.isArray(value)) {
    return getFullPathLabel(value)
  }

  return getFullPathLabel(value)
})


/**
 * 鼠标进入处理
 */
const handleMouseEnter = () => {
  if (!props.showTooltip) return

  if (selectedValue.value && (Array.isArray(selectedValue.value) ? selectedValue.value.length > 0 : true)) {
    shouldShowTooltip.value = true
  }
}

/**
 * 鼠标离开处理
 */
const handleMouseLeave = () => {
  shouldShowTooltip.value = false
}

/**
 * 初始化树形数据
 * @description 从 JSON 文件中加载初始数据
 */
const initTreeData = () => {
  const arr = cloneDeep(trustDataJson.treeData)
  if(props.disabledValue && props.disabledValue.length){
    const disabledValue = props.disabledValue.split(',')
    options.value = handleTreeDisabled(arr,disabledValue)
  }else{
    options.value = arr
  }
}
const handleTreeDisabled = (list,disabledValue) => {
  return list.map(item => {
    if(disabledValue.includes(item.value+'')){
      item.disabled = true
    }
    if(item.children){
      item.children = handleTreeDisabled(item.children,disabledValue)
    }
    return {...item}
  })
}

// 生命周期钩子：组件挂载时初始化数据
onMounted(() => {
  initTreeData()
})
</script>

<style lang="scss">
/* 使用具体的选择器，但不使用 scoped */
.select-trust-tree {
  width: 100%;

  .tooltip-trigger {
    width: 100%;
    display: inline-block;
  }

  /* Element Plus 级联选择器样式覆盖 */
  .el-cascader {
    width: 100%;
  }

  .el-cascader__tags {
    flex-wrap: nowrap !important;
    overflow: hidden;
  }

  .el-tag {
    display: inline-flex;
    max-width: 100%;

    .el-tag__content {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}

/* Tooltip 样式 */
.trust-tree-tooltip {
  max-width: 400px;
  line-height: 1.5;
  white-space: pre-line;
}
</style>
