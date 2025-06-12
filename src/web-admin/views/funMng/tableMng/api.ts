import request from '@/config/axios'

export interface SysFieldParam {
  pageSize?: number
  pageNo?: number
  datasourceId: number
}

export interface tableVO {
  id: string
  datasourceId: string
  datasourceName?: string
  tableName: string
  tableComment: string
  remark: string
  isSys: boolean
  tableType:string
  createTime?: Date
}

export interface tableVO {
  id: string
  datasourceId: string
  datasourceName?: string
  tableName: string
  tableComment: string
  remark: string
  createTime?: Date
}
export interface fieldVO {
  id: string
  tableId: string
  columnName: string
  columnComment: string
  dataDomainId: string
  defaultValue: string
  primaryKey: string
  notNull: string
  autoIncrement: string
  remark: string
  createTime?: Date
}
export interface indexDefinition {
  id:number
  tableId:number
  indexName:string
  indexColumns:string
  isUniqueKey:boolean
  createTime:string
}
// 表数据分页
export const getTablePage = (params: PageParam) => {
  return request.get({ url: '/cfg/table-definition/page', params })
}

// 表详情
export const detailTable = (id: number) => {
  return request.get({ url: '/cfg/table-definition/get?id=' + id })
}

// 新增表
export const addTable = (data: tableVO) => {
  return request.post({ url: '/cfg/table-definition/create', data })
}

// 修改表
export const updateTable = (data: tableVO) => {
  return request.post({ url: '/cfg/table-definition/update', data })
}

// 删除表
export const deleteTable = (id) => {
  return request.post({ url: '/cfg/table-definition/delete?id=' + id })
}

// 导出表
export const exportUser = (params) => {
  return request.download({ url: '/cfg/table-definition/export-excel', params })
}

// 下载表模板
export const importUserTemplate = () => {
  return request.download({ url: '/system/user/get-import-template' })
}


export const reloadTableApi = (tableId: number) => {
  return request.get({ url: '/cfg/column-definition/reload-table?tableId=' + tableId })
}

// 表数据分页
export const getFieldPage = (params: PageParam) => {
  return request.get({ url: '/cfg/column-definition/page', params })
}

// 新增表
export const saveField = (data) => {
  return request.post({ url: '/cfg/column-definition/save', data })
}

// 新增表
export const saveTempField = (data) => {
  return request.post({ url: '/cfg/column-definition/temp-save', data })
}

// 查询字段类型
export const getSysConfigList = (params) => {
  return request.get({ url: '/infra/config/get-by-category', params })
}
// 查询字段类型
export const getSysFieldPage = (params: SysFieldParam) => {
  return request.get({ url: '/cfg/db-system-column/page', params })
}
// 查询字段类型
export const getDataDomainPage = (params: PageParam) => {
  return request.get({ url: '/cfg/db-data-domain/page', params })
}

//获得索引定义分页
export const getIndexDefinitionPage = (params) => {
  return request.get({ url: '/cfg/index-definition/page', params })
}
//创建索引定义
export const createIndexDefinition = (data) => {
  return request.post({ url: '/cfg/index-definition/create', data })
}
// 删除索引定义
export const deleteIndexDefinition = (id) => {
  return request.post({ url: '/cfg/index-definition/delete?id=' + id })
}
//更新索引定义
export const updateIndexDefinition = (data) => {
  return request.post({ url: '/cfg/index-definition/update', data })
}
// 获得索引定义
export const detailIndexDefinition = (id: number) => {
  return request.get({ url: '/cfg/index-definition/get?id=' + id })
}
// 导出索引定义 Excel
export const exportIndexDefinition = (params) => {
  return request.download({ url: '/cfg/index-definition/export-excel', params })
}

export const pageApi="/infra/data-source-config/list";

export const dataSourceList = () => {
  return request.get({ url: '/infra/data-source-config/list' })
}

export const getModelSourceListPage = (params: PageParam) => {
  return request.get({ url: '/cfg/module-info/page', params })
}

export const getColumnType = (dataSourceId: number) => {
  return request.get({ url: '/cfg/column-definition/type?dataSourceId='+dataSourceId })
}

// 查询组件列表
export const getComponentTablePage = (params: PageParam) => {
  return request.get({ url: '/cfg/component-table/page', params })
}

// 查询组件详情
export const getComponent = (id: string) => {
  return request.get({ url: '/cfg/component-table/get?id=' + id })
}
