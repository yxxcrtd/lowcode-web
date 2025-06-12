<!--
 * @description 用户选择器组件，支持部门树形结构选择用户
 * @Author: miffy
 * @Date: 2024-12-20
 * 
-->

<template>
  <div class="select-user">
    <!-- 悬浮提示 -->
    <el-tooltip
      :content="tooltipContent"
      placement="top"
      :show-after="200"
      :hide-after="200"
      :visible="showTooltip && shouldShowTooltip && !!tooltipContent"
      popper-class="user-tree-tooltip"
    >
      <div 
        class="tooltip-trigger" 
        @mouseenter="handleMouseEnter" 
        @mouseleave="handleMouseLeave"
      >
        <!-- 树形选择器 -->
        <el-tree-select
          ref="selectRef"
          v-model="selectedValue"
          :data="treeData"
          :props="defaultProps"
          :multiple="multiple"
          :disabled="disabled"
          :placeholder="placeholder"
          :filter-method="filterNode"
          :render-after-expand="false"
          clearable
          filterable
          collapse-tags
        />
      </div>
    </el-tooltip>
  </div>
</template>

<script setup lang="ts">

import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useSelectUserStore } from '@/store/modules/selectUser'
import { useUserStore } from '@/store/modules/user'
import type { TreeNode } from '@/store/modules/selectUser'

// ==================== 类型定义 ====================
/**
 * 选择器值类型
 * 支持单选（string|number）和多选（Array）
 */
type SelectValue = string | number | (string | number)[] | null | undefined

// ==================== 组件定义 ====================
defineOptions({ 
  name: 'BizSelectUser',
  inheritAttrs: false
})

// ==================== Props 定义 ====================
interface Props {
  modelValue?: SelectValue               // 选中项的值
  modelText:string,
  placeholder?: string                   // 占位文本
  multiple?: boolean                     // 是否多选
  disabled:boolean | null
  checkStrictly?: boolean               // 是否严格的遵循父子不互相关联
  specificDeptId?: string | number | null // 指定部门ID
  currentUserDept?: boolean             // 是否只显示当前用户部门的人员
  showTooltip?: boolean                 // 是否显示悬浮提示
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: undefined,
  modelText:undefined,
  placeholder: '请选择',
  multiple: false,
  disabled:false,
  checkStrictly: true,
  specificDeptId: null,
  currentUserDept: false,
  showTooltip: true
})

// ==================== Emits 定义 ====================
const emit = defineEmits(['update:modelValue', 'update:modelText','change'])

// ==================== Store ====================
const selectUserStore = useSelectUserStore()
const userStore = useUserStore()
const { userTreeData } = storeToRefs(selectUserStore)

// ==================== Refs ====================
const selectRef = ref<any>()
const treeData = ref<TreeNode[]>([])
const sourceData = ref<TreeNode[]>([])
const shouldShowTooltip = ref(false)

// ==================== 配置项 ====================
/**
 * 树形选择器配置
 */
const defaultProps = {
  children: 'children',  // 子节点字段名
  label: 'label',       // 显示文本字段名
  disabled: 'disabled-old'  // 禁用状态字段名
}

// ==================== 计算属性 ====================
/**
 * 选中值的双向绑定
 */
const selectedValue = computed({
  get: () => {
    if(props.modelValue){
      if(typeof props.modelValue === 'string' ) {
        return props.modelValue.split(',')
      }else{
        return props.modelValue
      }
    }else{
      return props.modelValue
    }
  },
  set: (val: SelectValue) => {
    emit('update:modelValue', val)
    const selectNode=selectRef.value.getCurrentNode()
    emit('update:modelText', selectNode.label)
    emit('change', val,selectNode)
  }
})
const handleNodeClick=(data,node)=>{
  if(data.deptId){
    return
  }
}
/**
 * 悬浮提示内容
 */
const tooltipContent = computed(() => {
  const value = selectedValue.value
  if (!value) return ''

  // 递归查找节点名称
  const findNodeLabel = (id: string | number): string => {
    const findNode = (nodes: TreeNode[]): string => {
      for (const node of nodes) {
        if (node.value === String(id)) return node.label
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
      .map(id => findNodeLabel(id))
      .filter(Boolean)
      .join('\n')
  }

  return findNodeLabel(value as string | number)
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

  // 递归搜索树节点
  const searchTree = (nodes: TreeNode[]): TreeNode[] => {
    return nodes.reduce((acc: TreeNode[], node) => {
      const newNode = { ...node }
      const isMatch = newNode.label
        .toLowerCase()
        .includes(value.toLowerCase())
      
      if (node.children?.length) {
        const matchedChildren = searchTree(node.children)
        if (matchedChildren.length) {
          newNode.children = matchedChildren
          acc.push(newNode)
          return acc
        }
      }
      
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
  // 初始化空数组
  sourceData.value = []
  treeData.value = []

  // 获取数据
  await selectUserStore.getUserTreeData() 

  // 根据配置获取对应数据
  let data: TreeNode[] = []
  if (props.specificDeptId) {
    data = selectUserStore.getUserTreeByDeptId(props.specificDeptId)
  } else if (props.currentUserDept) {
    const userDeptId = userStore.getBusinessUser.departId || null
    data = userDeptId ? selectUserStore.getUserTreeByDeptId(userDeptId) : []
  } else {
    data = userTreeData.value
  }

  // 安全赋值
  if (Array.isArray(data) && data.length > 0) {
    sourceData.value = data
    treeData.value = [...data]
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
onMounted(async () => {
  await initTreeData()
})

// ==================== 对外暴露方法 ====================
/**
 * 刷新树数据
 */
const refresh = async () => {
  await selectUserStore.refreshUserTree()
  await initTreeData()
}

defineExpose({
  refresh,
  getTreeSelect: () => selectRef.value
})
</script>

<style lang="scss" scoped>
// ================ 基础样式 ================
.select-user {
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
:deep(.user-tree-tooltip) {
  max-width: 500px;
  line-height: 1.5;
  white-space: pre-line;
}
</style>
