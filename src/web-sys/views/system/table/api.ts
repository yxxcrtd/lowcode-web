import request from '@/config/axios'

export interface DataSourceConfigVO {
  id: number
  type: number
  source: number
  code: string
  name: string
  ip: string
  url: string
  username: string
  password: string
  remark: string
}
export const pageApi="/infra/data-source-config/list";
export const api="/infra/data-source-config/";

// 查询数据源配置列表
export const getDataSourceConfigList = (params: PageParam) => {
  return request.get({ url: '/infra/data-source-config/list', params })
}

// 查询数据源配置
export const getDataSourceConfig = (id: number) => {
  return request.get({ url: api+'get?id=' + id })
}

// 新增数据源配置
export const createDataSourceConfig = (data: DataSourceConfigVO) => {
  return request.post({ url: api+'create', data })
}

// 修改数据源配置
export const updateDataSourceConfig = (data: DataSourceConfigVO) => {
  return request.put({ url: api+'update', data })
}

// 删除数据源配置
export const deleteDataSourceConfig = (id: number) => {
  return request.delete({ url: api+'delete?id=' + id })
}
