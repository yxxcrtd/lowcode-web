import request from '@/config/axios'

export const getModuleInfoPageUrl="/cfg/module-info/page"

// 查询用户管理列表
export const getModuleInfoPage = (params: PageParam) => {
  return request.get({ url: '/cfg/module-info/page', params })
}


export const getModuleInfo = (id: number) => {
  return request.get({ url: '/cfg/module-info/get?id=' + id })
}

// 新增用户
export const addModuleInfo = (data) => {
  return request.post({ url: '/cfg/module-info/create', data })
}

// 修改用户
export const updateModuleInfo = (data) => {
  return request.post({ url: '/cfg/module-info/update', data })
}

// 删除用户
export const deleteModuleInfo = (id: number) => {
  return request.post({ url: '/cfg/module-info/delete?id=' + id })
}


export const getModuleApiInfo = (id: number) => {
  return request.get({ url: '/cfg/module-api/get?id=' + id })
}
/**
 * 刷新模型
 * @param id
 */
export const refreshModule = (id: number) => {
  return request.get({ url: '/cfg/module-info/refresh?id=' + id })
}
/**
 * 复制模型
 * @param id
 */
export const copyModule = (id: number) => {
  return request.get({ url: '/cfg/module-info/copy?id=' + id })
}
