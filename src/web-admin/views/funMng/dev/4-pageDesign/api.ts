import request from '@/config/axios'

export const pageInfoPageUrl="/cfg/page-info/page"

// 查询列表
export const getPageInfoPage = (params) => {
  return request.get({ url: '/cfg/page-info/page', params })
}

// 新增
export const addPageInfo = (data) => {
  return request.post({ url: '/cfg/page-info/create', data })
}
export const updatePageInfo = (data) => {
  return request.post({ url: '/cfg/page-info/update', data })
}
// 新增
export const addProcessDesign = (data) => {
  return request.post({ url: '/cfg/process-design/create', data })
}
// 查询用户详情
export const getPageInfo = (id: number) => {
  return request.get({ url: '/cfg/page-info/get?id=' + id })
}

// 删除用户
export const deletePageInfo = (id: number) => {
  return request.delete({ url: '/cfg/page-info/delete?id=' + id })
}

// 获取模型视图
export const getPageModuleInfo = (params) => {
  return request.get({ url: '/cfg/module-info/get', params })
}

// 获取模型视图
export const getColumnDefinition = (params) => {
  return request.get({ url: '/cfg/column-definition/get', params })
}

export const getTemplateInfoPage = (params) => {
  return request.get({ url: '/cfg/template-info/page', params })
}
// 获取模型视图
export const getTemplateInfo = (params) => {
  return request.get({ url: '/cfg/template-info/get', params })
}
//获得分组下参数配置
export const getByCategory = (params) => {
  return request.get({ url: '/infra/config/get-by-category', params })
}
//复制页面为移动端
export const copyPage = (params) => {
  return request.get({ url: '/cfg/page-info/copy', params })
}

// 获取日志列表
export const getLogTableData = (params) => {
  return request.get({ url: '/cfg/module-info/get', params })
}

// 锁定与解锁
export const locaAcion = (params) => {
  return request.post({ url: '/cfg/module-info/get', params })
}