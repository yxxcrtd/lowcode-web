import request from '@/config/axios'

export interface DataSetConfigVO {
  id: string
  type: string
  code: string
  name: string
  sourceCode: string
  remark: string
  jsonData: string
  sqlData: string
}
export const pageApi="/infra/data-set-config/list";
export const api="/infra/data-set-config/";

// 查询数据集配置列表
export const getDataSourceConfigList = (params: PageParam) => {
  return request.get({ url: '/infra/data-set-config/list', params })
}

// 查询数据集配置
export const getDataSourceConfig = (id: number) => {
  return request.get({ url: api+'get?id=' + id })
}

// 新增数据集配置
export const createDataSourceConfig = (data: DataSetConfigVO) => {
  return request.post({ url: api+'create', data })
}

// 修改数据集配置
export const updateDataSourceConfig = (data: DataSetConfigVO) => {
  return request.post({ url: api+'update', data })
}

// 删除数据集配置
export const deleteDataSourceConfig = (id: number) => {
  return request.delete({ url: api+'delete?id=' + id })
}

// 查询数据源列表
export const dataSourceList = () => {
  return request.get({ url: '/infra/data-source-config/list' })
}

// 查询数据集
export const getcode = (params) => {
  return request.get({ url: '/infra/data-set-config/getcode',params})
}
