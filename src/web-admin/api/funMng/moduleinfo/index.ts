import request from '@/config/axios'

export interface ModuleInfoVO {
  id: number
  moduleName: string
  moduleCode: string
  moduleType: string
  moduleSql: string
  moduleBean: string
  moduleMethod: string
  remark: string
  menuId: number
}

export const getModuleInfoPageUrl = '/cfg/module-info/page'

// 查询模型信息
export const getModuleInfo = async (id: number) => {
  return await request.get({ url: `/cfg/module-info/get?id=` + id })
}

// 新增示模型信息
export const createModuleInfo = async (data: ModuleInfoVO) => {
  return await request.post({ url: `/cfg/module-info/create`, data })
}

// 修改模型信息
export const updateModuleInfo = async (data: ModuleInfoVO) => {
  return await request.post({ url: `/cfg/module-info/update`, data })
}

// 删除模型信息
export const deleteModuleInfo = async (id: number) => {
  return await request.post({ url: `/cfg/module-info/delete?id=` + id })
}
