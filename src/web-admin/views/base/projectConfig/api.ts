import request from '@/config/axios'

// 查询字段类型
export const getSysConfigList = (params) => {
  return request.get({ url: '/infra/config/get-by-category', params })
}
// 查询字段类型
export const saveSysConfig = (data) => {
  return request.post({ url: '/infra/config/save', data })
}



// 查询字段类型
export const getDataDomainPage = (params: PageParam) => {
  return request.get({ url: '/cfg/db-data-domain/page', params })
}

// 新增字段类型
export const addDataDomain = (data) => {
  return request.post({ url: '/cfg/db-data-domain/create', data })
}

// 修改字段类型
export const updateDataDomain = (data) => {
  return request.post({ url: '/cfg/db-data-domain/update', data })
}

// 删除字段类型
export const deleteDataDomain = (id: number) => {
  return request.post({ url: '/cfg/db-data-domain/delete?id=' + id })
}



// 查询字段类型
export const getSysFieldPage = (params: PageParam) => {
  return request.get({ url: '/cfg/db-system-column/page', params })
}

// 新增字段类型
export const addSysField = (data) => {
  return request.post({ url: '/cfg/db-system-column/create', data })
}

// 修改字段类型
export const updateSysField = (data) => {
  return request.post({ url: '/cfg/db-system-column/update', data })
}

// 删除字段类型
export const deleteSysField = (id: number) => {
  return request.post({ url: '/cfg/db-system-column/delete?id=' + id })
}

//创建系统参数
export const createParam = (data) => {
  return request.post({ url: '/infra/config/param/create',data })
}
//创建基础配置
export const createBase = (data) => {
  return request.post({ url: '/infra/config/base/create',data })
}
//创建安全配置
export const createSecurity = (data) => {
  return request.post({ url: '/infra/config/security/create',data })
}

//获取安全配置
export const getSecurity = () => {
  return request.get({ url: '/infra/config/security/get'})
}

//获取基础配置
export const getBase = () => {
  return request.get({ url: '/infra/config/base/get' })
}

//获取系统参数分页
export const getParamPage = (params: PageParam) => {
  return request.post({ url: '/infra/config/page', params })
}
//创建系统参数
export const updateParam = (data) => {
  return request.put({ url: '/infra/config/update',data })
}
//创建系统参数
export const deleteParam = (id) => {
  return request.delete({ url: '/infra/config/delete?id='+id })
}

//保存参数配置
export const saveConfig = (data) => {
  return request.post({ url: '/infra/config/save',data })
}

//获得分组下参数配置
export const getByCategory = (params) => {
  return request.get({ url: '/infra/config/get-by-category', params })
}

// 查询系统参数
export const getSysParamterList = (params) => {
  return request.get({ url: '/infra/config/page', params})
}

// 创建公共模型
export const createCommonModel = (data) => {
  return request.post({ url: '/cfg/common-model/create', data })
}


// 更新公共模型
export const updateCommonModel = (data) => {
  return request.post({ url: '/cfg/common-model/update', data })
}

// 删除公共模型
export const deleteCommonModel = (id) => {
  return request.delete({ url: '/cfg/common-model/delete?id=' + id })
}

// 获得公共模型
export const getCommonModel = (id) => {
  return request.get({ url: '/cfg/common-model/get?id=' + id })
}

// 获得公共模型分页
export const getCommonModelPage = (params) => {
  return request.get({ url: '/cfg/common-model/page', params })
}

// 导出公共模型 Excel
export const exportCommonModelExcel = (params) => {
  return request.download({ url: '/cfg/common-model/export-excel', params })
}


// 创建公共变量
export const createCommonVar = (data) => {
  return request.post({ url: '/cfg/common-var/create', data })
}


// 更新公共变量
export const updateCommonVar = (data) => {
  return request.post({ url: '/cfg/common-var/update', data })
}


// 删除公共变量
export const deleteCommonVar = (id) => {
  return request.delete({ url: '/cfg/common-var/delete?id=' + id })
}


// 获得公共变量
export const getCommonVar = (id) => {
  return request.get({ url: '/cfg/common-var/get?id=' + id })
}

// 获得公共变量分页
export const getCommonVarPage = (params) => {
  return request.get({ url: '/cfg/common-var/page', params })
}

// 导出公共变量 Excel
export const exportCommonVarExcel = (params) => {
  return request.download({ url: '/cfg/common-var/export-excel', params })
}
