import request from '@/config/axios'

// 查询用户管理列表
export const getModuleMenuList = (params: PageParam) => {
  return request.get({ url: '/system/menu/list', params })
}
// 获取菜单详情
export const getMenu = (id: number) => {
  return request.get({ url: '/system/menu/get?id=' + id })
}

// 新增菜单
export const createMenu = (data) => {
  return request.post({ url: '/system/menu/create', data })
}

// 修改菜单
export const updateMenu = (data) => {
  return request.put({ url: '/system/menu/update', data })
}

// 删除菜单
export const deleteMenu = (id: number) => {
  return request.delete({ url: '/system/menu/delete?id=' + id })
}
export const getSimpleMenusList = (moduleType?: number) => {
  return request.get({ url: '/system/menu/simple-list?moduleType=' + (moduleType === undefined ? '' : moduleType) })
}

// 新增按钮
export const batchAddBtn = (data) => {
  return request.post({ url: '/system/menu/button/create', data })
}
export const getPageInfoPage = (params) => {
  return request.get({ url: '/cfg/page-info/page', params })
}
