import request from "@/config/axios";

export const dataSourceList = () => {
  return request.get({ url: '/infra/data-source-config/list' })
}
export const getTablePage = (params: PageParam) => {
  return request.get({ url: '/cfg/table-definition/page', params })
}
export const getTableFields = (params: PageParam) => {
  return request.get({ url: 'cfg/column-definition/page', params })
}

// 服务API
export const getModuleApiPage = (params) => {
  return request.get({ url: '/cfg/module-api/page', params })
}

// 查询组件列表
export const getComponentTablePage = (params: PageParam) => {
  return request.get({ url: '/cfg/component-table/page', params })
}

// 查询组件详情
export const getComponent = (id: string) => {
  return request.get({ url: '/cfg/component-table/get?id=' + id })
}

// 查询组件详情
export const getComponentByCode = (componentCode: string) => {
  return request.get({ url: '/cfg/component-table/getBycomponentCode?componentCode=' + componentCode })
}

// 查询字典列表
export const getDictTypeList = (params) => {
  return request.get({ url: '/system/dict-type/page', params })
}

export const getModelSourceListPage = (params: PageParam) => {
  return request.get({ url: '/cfg/module-info/page', params })
}
// 获取模型视图
export const getPageModuleInfo = (params) => {
  return request.get({ url: '/cfg/module-info/get', params })
}
export const getModelPageList = (params) => {
  return request.get({ url: '/cfg/page-info/page', params })
}

export const getModuleList = (params) => {
  return request.get({ url: '/cfg/module-info/list-module', params })
}

// 获取模型API
export const getModuleApiInfo = (id: number) => {
  return request.get({ url: '/cfg/module-api/get?id=' + id })
}

//保存参数配置
export const saveConfig = (data) => {
  return request.post({ url: '/infra/config/save',data })
}

//获得分组下参数配置
export const getByCategory = (params) => {
  return request.get({ url: '/infra/config/get-by-category', params })
}

//导出
export const modelExport = (params) => {
  return request.get({ url: '/infra/config/get-by-category', params })
}

//导入
export const modelImport = (params) => {
  return request.get({ url: '/infra/config/get-by-category', params })
}
//锁定
export const modelLock = (params) => {
  return request.get({ url: '/infra/config/get-by-category', params })
}
//解锁
export const modelUnlock = (params) => {
  return request.get({ url: '/infra/config/get-by-category', params })
}
//备份
export const modelBackup = (params) => {
  return request.get({ url: '/infra/config/get-by-category', params })
}
//还原
export const modelRestore = (params) => {
  return request.get({ url: '/infra/config/get-by-category', params })
}

//日志
export const modelLog = (params) => {
  return request.get({ url: '/infra/config/get-by-category', params })
}
