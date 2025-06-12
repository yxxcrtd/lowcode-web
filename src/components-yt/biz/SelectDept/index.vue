<!--
 * @description 部门选择器组件，支持单选、多选、搜索等功能
 * @Author: miffy
 * @Date: 2024-12-20
 * 
-->

<template>
  <div class="select-dept">
    <!-- 悬浮提示 -->
    <el-tooltip
      :content="tooltipContent"
      placement="top"
      :show-after="200"
      :hide-after="200"
      :visible="showTooltip && shouldShowTooltip && !!tooltipContent"
      popper-class="dept-tree-tooltip"
    >
      <template #default>
        <div 
          class="tooltip-trigger" 
          @mouseenter="handleMouseEnter" 
          @mouseleave="handleMouseLeave"
        >
          <!-- 树形选择器 -->
          <el-tree-select
            ref="treeSelectRef"
            v-model="selectedValue"
            :data="treeData"
            :props="defaultProps"
            :disabled="disabled"
            :check-strictly="checkStrictly"
            :multiple="multiple"
            :show-checkbox="multiple"
            :placeholder="placeholder"
            :filter-method="filterNode"
            :render-after-expand="false"
            clearable
            filterable
          />
        </div>
      </template>
    </el-tooltip>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useDeptStore } from '@/store/modules/selectDept'
import { useUserStore } from '@/store/modules/user'
import type { DeptItem } from '@/store/modules/selectDept'

// ==================== 类型定义 ====================

/**
 * 选择器值类型
 */
type SelectValue = string | number | (string | number)[] | null | undefined

// ==================== 组件定义 ====================
defineOptions({ 
  name: 'BizSelectDept',
  inheritAttrs: false
})

// ==================== Props 定义 ====================
interface Props {
  modelValue?: SelectValue               // 选中值
  placeholder?: string                   // 占位文本
  multiple?: boolean                     // 是否多选
  checkStrictly?: boolean               // 是否严格的遵循父子不互相关联
  leafOnly?: boolean                    // 是否只能选择叶子节点
  specificDeptId?: string | number | null // 指定部门ID
  currentUserDept?: boolean             // 是否只显示当前用户部门
  showTooltip?: boolean                 // 是否显示悬浮提示
  disabled?:boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: undefined,
  placeholder: '请选择',
  multiple: false,
  checkStrictly: false,
  leafOnly: true,
  specificDeptId: null,
  currentUserDept: false,
  disabled:false,
  showTooltip: true
})

// ==================== Emits 定义 ====================
const emit = defineEmits<{
  'update:modelValue': [value: SelectValue]  // 更新选中值
  'change': [value: SelectValue]            // 选中值变化
}>()

// ==================== Store ====================
const deptStore = useDeptStore()
const userStore = useUserStore()
const { deptList } = storeToRefs(deptStore)

// ==================== Refs ====================
const treeSelectRef = ref<any>()
const treeData = ref<DeptItem[]>([])
const sourceData = ref<DeptItem[]>([])
const shouldShowTooltip = ref(false)

// ==================== 配置项 ====================
const defaultProps = {
  label: 'name',      // 显示文本字段
  value:'id',
  children: 'children' // 子节点字段
}

// ==================== 计算属性 ====================

/**
 * 选中值的双向绑定
 */
const selectedValue = computed({
  get: () => !isNaN(props.modelValue) ? Number(props.modelValue) : null,
  set: (val: SelectValue) => {
    emit('update:modelValue', val)
    emit('change', val)
  }
})

/**
 * 悬浮提示内容
 */
const tooltipContent = computed(() => {
  const value = selectedValue.value
  if (!value) return ''

  // 递归查找节点名称
  const findNodeName = (id: string | number): string => {
    const findNode = (nodes: DeptItem[]): string => {
      for (const node of nodes) {
        if (node.id === id) return node.name
        if (node.children) {
          const found = findNode(node.children)
          if (found) return found
        }
      }
      return ''
    }
    return findNode(treeData.value)
  }

  // 处理多选和单选情况
  if (props.multiple && Array.isArray(value)) {
    return value
      .map(id => findNodeName(id))
      .filter(Boolean)
      .join('\n')
  }

  return findNodeName(value as string | number)
})

// ==================== 方法定义 ====================

/**
 * 节点过滤方法
 * @param value 搜索关键字
 */
const filterNode = (value: string) => {
  if (!value) {
    treeData.value = [...sourceData.value]
    return
  }

  const searchTree = (nodes: DeptItem[]): DeptItem[] => {
    return nodes.reduce((acc: DeptItem[], node) => {
      const newNode = { ...node }
      const isMatch = newNode[defaultProps.label]
        .toLowerCase()
        .includes(value.toLowerCase())
      
      // 处理子节点
      if (node.children?.length) {
        const matchedChildren = searchTree(node.children)
        if (matchedChildren.length) {
          newNode.children = matchedChildren
          acc.push(newNode)
          return acc
        }
      }
      
      // 处理当前节点
      if (isMatch) {
        if (node.children?.length) {
          newNode.children = [...node.children]
        }
        acc.push(newNode)
      }
      
      return acc
    }, [])
  }

  treeData.value = searchTree(sourceData.value)
}

/**
 * 初始化树数据
 */
const initTreeData = async () => {
  try {
    // 获取部门数据
    await deptStore.getDeptList()

    // 根据配置获取对应数据
    let data: DeptItem[] = []
    if (props.specificDeptId) {
      data = deptStore.getDeptTreeById(props.specificDeptId)
    } else if (props.currentUserDept) {
      const userDeptId = userStore.getUser.deptId
      data = userDeptId ? deptStore.getDeptTreeById(userDeptId) : []
    } else {
      data = deptList.value
    }

    // 安全赋值
    if (Array.isArray(data) && data.length > 0) {
      sourceData.value = data
      treeData.value = [...data]
    }
  } catch (error) {
    console.error('初始化部门树失败：', error)
  }
}

/**
 * Tooltip 相关方法
 */
const handleMouseEnter = () => {
  if (!props.showTooltip) return
  if (selectedValue.value && (Array.isArray(selectedValue.value) ? selectedValue.value.length > 0 : true)) {
    shouldShowTooltip.value = true
  }
}

const handleMouseLeave = () => {
  shouldShowTooltip.value = false
}

// ==================== 生命周期 ====================
onMounted(() => {
  initTreeData()
})

// ==================== 对外暴露方法 ====================
const refresh = async () => {
  await deptStore.refreshDeptList()
  await initTreeData()
}

defineExpose({
  refresh,
  getTreeSelect: () => treeSelectRef.value
})
</script>

<style lang="scss" scoped>
// ================ 基础样式 ================
.select-dept {
  width: 100%;
  
  :deep(.el-select) {
    width: 100%;

    // 选择框样式
    //.el-select__selection {
    //  overflow: hidden;
    //  flex-wrap: nowrap !important;
    //}

    // 标签样式
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
}

// ================ Tooltip 样式 ================
:deep(.dept-tree-tooltip) {
  max-width: 500px;
  line-height: 1.5;
  white-space: pre-line;
}
</style>
