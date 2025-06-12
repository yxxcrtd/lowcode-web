import request from '@/config/axios'

export interface ModuleApiVO {
  id: number
  serviceName: string
  serviceCode: string
  tableId: string
  serviceType: string
  remark: string
}

export const getModuleApiPageUrl = '/cfg/module-api/page'

// 查询模型信息
export const getModuleApi = async (id: number) => {
  return await request.get({ url: `/cfg/module-api/get?id=` + id })
}

// 新增示模型信息
export const createModuleApi = async (data: ModuleApiVO) => {
  return await request.post({ url: `/cfg/module-api/create`, data })
}

// 修改模型信息
export const updateModuleApi = async (data: ModuleApiVO) => {
  return await request.post({ url: `/cfg/module-api/update`, data })
}

// 删除模型信息
export const deleteModuleApi = async (id: number) => {
  return await request.post({ url: `/cfg/module-api/delete?id=` + id })
}
