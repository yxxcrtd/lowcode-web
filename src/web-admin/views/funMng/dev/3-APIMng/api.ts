import request from '@/config/axios'

export const getModuleApiPageUrl="/cfg/module-api/page"
// 查询用户管理列表
export const getModuleApiPage = (params: PageParam) => {
  return request.get({ url: '/cfg/module-api/page', params })
}

// 查询用户详情
export const getModuleApiInfo = (id: number) => {
  return request.get({ url: '/cfg/module-api/get?id=' + id })
}

// 新增用户
export const createModuleApi = (data) => {
  return request.post({ url: '/cfg/module-api/create', data })
}

// 修改用户
export const updateModuleApi = (data) => {
  return request.put({ url: '/cfg/module-api/update', data })
}

// 删除用户
export const deleteModuleApi = (id: number) => {
  return request.delete({ url: '/cfg/module-api/delete?id=' + id })
}

export const getModuleApiParamInfo = (id: number) => {
  return request.get({ url: '/cfg/module-api/param/list?apiId=' + id })
}
