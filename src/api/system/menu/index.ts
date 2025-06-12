import request from '@/config/axios'

export interface MenuVO {
  id: number
  name: string
  permission: string
  type: number
  moduleType: number
  sort: number
  parentId: number
  path: string
  icon: string
  component: string
  componentName?: string
  status: number
  visible: boolean
  keepAlive: boolean
  alwaysShow?: boolean
  createTime: Date
}
export interface FunctionInfoVO {
  id: number
  functionName: string
  functionCode: string
  sort: string
  parentId: number
  functionIcon: string
  component: string
  componentName?: string
  status: number
  remark: string
}

// 查询菜单（精简）列表
export const getSimpleMenusList = (moduleType?: number) => {
  return request.get({ url: '/system/menu/simple-list?moduleType=' + (moduleType === undefined ? '' : moduleType) })
}

// 查询菜单列表
export const getMenuList = (params) => {
  return request.get({ url: '/system/menu/list', params })
}

// 获取菜单详情
export const getMenu = (id: number) => {
  return request.get({ url: '/system/menu/get?id=' + id })
}

// 新增菜单
export const createMenu = (data: MenuVO) => {
  return request.post({ url: '/system/menu/create', data })
}

// 修改菜单
export const updateMenu = (data: MenuVO) => {
  return request.put({ url: '/system/menu/update', data })
}

// 删除菜单
export const deleteMenu = (id: number) => {
  return request.delete({ url: '/system/menu/delete?id=' + id })
}

// 查询功能菜单列表
export const getFunctionInfoList = (params) => {
  return request.get({ url: '/cfg/function-info/list', params })
}

// 获取菜单详情
export const getFunctionInfo = (id: number) => {
  return request.get({ url: '/cfg/function-info/get?id=' + id })
}

// 新增菜单
export const createFunctionInfo = (data: FunctionInfoVO) => {
  return request.post({ url: '/cfg/function-info/create', data })
}

// 修改菜单
export const updateFunctionInfo = (data: FunctionInfoVO) => {
  return request.put({ url: '/cfg/function-info/update', data })
}

// 删除菜单
export const deleteFunctionInfo = (id: number) => {
  return request.delete({ url: '/cfg/function-info/delete?id=' + id })
}
// 新增按钮
export const batchAddBtn = (data) => {
  return request.post({ url: '/system/menu/button/create', data })
}
