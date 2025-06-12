/**
 * @file 部门选择器状态管理
 * @description 管理部门树形数据的获取、缓存和查询
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getDeptPage } from '@/api/system/dept'
import { handleTree } from '@/utils/tree'

// ==================== 类型定义 ====================

/**
 * 部门节点基础接口
 */
interface BaseDeptNode {
  id: number | string      // 部门ID
  name: string            // 部门名称
  parentId: number | string // 父部门ID
  [key: string]: any      // 其他属性
}

/**
 * 部门树节点接口
 * 扩展基础节点，添加子节点属性
 */
export interface DeptItem extends BaseDeptNode {
  children?: DeptItem[]   // 子部门
  value?: number | string // 选择器使用的值
}

/**
 * API 响应数据类型
 */
type ApiResponse = Omit<DeptItem, 'children' | 'value'>[]

// ==================== Store 定义 ====================

export const useDeptStore = defineStore('selectDept', () => {
  // ================ 状态定义 ================
  const deptList = ref<DeptItem[]>([])    // 部门树形数据
  const loading = ref(false)              // 加载状态
  const initialized = ref(false)          // 初始化状态

  // ================ 私有方法 ================
  
  /**
   * 处理API返回的数据
   * @param data API返回的原始数据
   * @returns 处理后的树形结构数据
   */
  const processApiData = (data: ApiResponse): DeptItem[] => {
    // 添加 value 字段，用于选择器
    const processedData = data.map(item => ({
      ...item,
      value: item.id
    }))
    
    // 转换为树形结构
    return handleTree(processedData) || []
  }

  // ================ 公共方法 ================

  /**
   * 获取部门列表
   * @param force 是否强制刷新，默认false
   * @returns 部门树形数据
   */
  const getDeptList = async (force = false): Promise<DeptItem[]> => {
    // 使用缓存数据
    if (initialized.value && !force && deptList.value.length > 0) {
      return deptList.value
    }

    try {
      loading.value = true
      const res = await getDeptPage({})

      if (!Array.isArray(res)) {
        throw new Error('Invalid API response')
      }

      const result = processApiData(res)
      deptList.value = result
      initialized.value = true
      return result

    } catch (error) {
      console.error('获取部门列表失败：', error)
      return []
    } finally {
      loading.value = false
    }
  }

  /**
   * 递归查找部门
   * @param id 部门ID
   * @param list 部门列表
   * @returns 找到的部门或null
   */
  const findDept = (id: string | number, list: DeptItem[]): DeptItem | null => {
    for (const item of list) {
      if (item.id === id) return item
      if (item.children?.length) {
        const found = findDept(id, item.children)
        if (found) return found
      }
    }
    return null
  }

  /**
   * 根据ID获取部门
   * @param id 部门ID
   * @returns 部门信息或null
   */
  const getDeptById = (id: string | number): DeptItem | null => {
    return findDept(id, deptList.value)
  }

  /**
   * 获取指定部门及其子部门
   * @param id 部门ID
   * @returns 部门树形数据
   */
  const getDeptTreeById = (id: string | number): DeptItem[] => {
    const dept = getDeptById(id)
    return dept ? [dept] : []
  }

  /**
   * 刷新部门列表
   * @returns 刷新后的部门列表
   */
  const refreshDeptList = () => getDeptList(true)

  /**
   * 清空部门列表
   */
  const clearDeptList = () => {
    deptList.value = []
    initialized.value = false
  }

  // ================ 返回 Store 接口 ================
  return {
    // 状态
    deptList,
    loading,
    initialized,
    
    // 方法
    getDeptList,
    refreshDeptList,
    clearDeptList,
    getDeptById,
    getDeptTreeById
  }
})