import request from '@/config/axios'

export interface AppInfoSaveVO {
  id: number
  appName: string
  appCode: string
  appAddress: string
  container: string
  status: string
  remark: string
}
export const pageApi="/cfg/app-info/page";
export const api="/cfg/app-info/";

// 查询数据源配置列表
export const getDataSourceConfigList = (params: PageParam) => {
  return request.get({ url: api + 'list', params })
}

// 查询数据源配置
export const getAppInfo = (id: number) => {
  return request.get({ url: api+'get?id=' + id })
}

// 新增数据源配置
export const createAppInfo = (data: AppInfoSaveVO) => {
  return request.post({ url: api+'create', data })
}

// 修改数据源配置
export const updateAppInfo = (data: AppInfoSaveVO) => {
  return request.put({ url: api+'update', data })
}

// 删除数据源配置
export const deleteAppInfo = (id: number) => {
  return request.delete({ url: api+'delete?id=' + id })
}
