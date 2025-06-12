/**
 * @file 用户选择器状态管理
 * @description 用户树形数据的获取、缓存和查询
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getUserTree } from '@/api/system/user'

/**
 * 基础节点接口
 * 包含用户和部门共有的属性
 */
interface BaseNode {
  id?: string | number
  deptId?: string | number
  name?: string
  deptName?: string
  nickname?: string
}

/**
 * 用户节点接口
 * 扩展基础节点，添加用户特有属性
 */
interface UserNode extends BaseNode {
  userId: string | number  // 用户唯一标识
}

/**
 * 部门节点接口
 * 扩展基础节点，添加部门特有属性
 */
interface DeptNode extends BaseNode {
  children?: TreeNode[]    // 子部门
  users?: UserNode[]       // 部门下的用户
}

/**
 * 转换后的树节点接口
 * 符合 el-tree-select 组件要求的数据结构
 */
export interface TreeNode {
  value: string            // 节点值
  label: string           // 节点标签
  disabled: boolean       // 是否禁用
  children?: TreeNode[]   // 子节点
  [key: string]: any     // 其他属性
}

/**
 * 用户选择器 Store
 */
export const useSelectUserStore = defineStore('selectUser', () => {
  // 状态定义
  const userTreeData = ref<TreeNode[]>([])  // 用户树数据
  const loading = ref(false)                // 加载状态
  const initialized = ref(false)            // 初始化状态

  /**
   * 创建用户节点
   * @param user 用户数据
   * @returns 转换后的用户节点
   */
  const createUserNode = (user: UserNode): TreeNode => ({
    value: String(user.id || user.userId),
    label: user.name || user.nickname || '',
    deptId:user.deptId,
    disabled: false  // 用户节点可选
  })

  /**
   * 创建部门节点
   * @param dept 部门数据
   * @returns 转换后的部门节点
   */
  const createDeptNode = (dept: DeptNode): TreeNode => ({
    value: String(dept.id || 'dept-'+dept.deptId),
    label: dept.name || dept.deptName || '',
    disabled: true,  // 部门节点禁用
    deptId: dept.deptId  // 保留部门ID用于查找
  })

  /**
   * 转换树形数据结构
   * @param data 原始部门数据
   * @returns 转换后的树形结构
   */
  const transformTreeData = (data: DeptNode[]): TreeNode[] => {
    return data.filter(node=>node.users && node.users.length).map(node => {
      // 创建部门节点
      const deptNode = createDeptNode(node)
      const children: TreeNode[] = []

      // 处理用户数据
      if (node.users?.length) {
        children.push(...node.users.map(createUserNode))
      }

      // 递归处理子部门
      if (node.children?.length) {
        children.push(...transformTreeData(node.children))
      }

      // 只在有子节点时添加 children
      if (children.length > 0) {
        deptNode.children = children
      }

      return deptNode
    })
  }

  /**
   * 获取用户树数据
   * @param force 是否强制刷新
   * @returns 用户树数据
   */
  const getUserTreeData = async (force = false) => {
    // 使用缓存数据
    if (initialized.value && !force && userTreeData.value.length > 0) {
      return userTreeData.value
    }

    try {
      loading.value = true
      const res = await getUserTree()

      if (!Array.isArray(res)) {
        return []
      }

      const transformedData = transformTreeData(res)
      userTreeData.value = transformedData
      initialized.value = true
      return transformedData

    } catch (error) {
      console.error('获取用户树数据失败：', error)
      return []
    } finally {
      loading.value = false
    }
  }

  /**
   * 根据部门ID获取用户树
   * @param deptId 部门ID
   * @returns 指定部门的用户树
   */
  const getUserTreeByDeptId = (deptId: string | number): TreeNode[] => {
    const findDeptTree = (list: TreeNode[]): TreeNode[] => {
      for (const item of list) {
        if (item.deptId == deptId) return [item]
        if (item.children?.length) {
          const found = findDeptTree(item.children)
          if (found.length) return found
        }
      }
      return []
    }

    return findDeptTree(userTreeData.value)
  }

  // 返回 store 接口
  return {
    // 状态
    userTreeData,
    loading,
    initialized,

    // 方法
    getUserTreeData,
    refreshUserTree: () => getUserTreeData(true),
    clearUserTree: () => {
      userTreeData.value = []
      initialized.value = false
    },
    getUserTreeByDeptId
  }
})
