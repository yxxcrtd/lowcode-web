import request from '@/config/axios'

export interface TemplateGroupVO {
  id?: number
  groupName: string
  numSort?: number
  parentId?: number
}

export interface TemplateInfoVO {
  id: number,
  groupId: number,
  templateCode: string,
  templateName: string,
  templateAddress: string,
  templateImage: string
}

export interface TemplateContentVO {
  id: number,
  templateId: number,
  apiCode: string,
  apiName: string,
  apiType: string,
  parameterName: any,
  parameterCode: any,
  parameterType: any,
  remark: string
}
export const api="/cfg/template-group/";



// 查询分组树形列表
export const getTree = () => {
  return request.get({ url: api + 'getTree' })
}

// 查询分组详情
export const getTemplateGroup = (id: number) => {
  return request.get({ url: api + 'get?id=' + id })
}

// 新增分组
export const createTemplateGroup = (data: TemplateGroupVO) => {
  return request.post({ url: api + 'create', data })
}

// 修改分组
export const updateTemplateGroup = (data: TemplateGroupVO) => {
  return request.post({ url: api + 'update', data })
}

// 删除分组
export const deleteTemplateGroup = (id: number) => {
  return request.post({ url: api + 'delete?id=' + id })
}

// 查询组件列表
export const getTemplateInfoPage = (params: PageParam) => {
  return request.get({ url: '/cfg/template-info/page', params })
}

// 查询组件列表
export const getTemplateInfoList = (params: PageParam) => {
  return request.get({ url: '/cfg/template-info/list', params })
}

// 查询组件详情
export const getTemplateInfo = (id: number) => {
  return request.get({ url: '/cfg/template-info/get?id=' + id })
}
// 保存组件详情
export const createTemplateInfo = (data: TemplateInfoVO) => {
  return request.post({ url: '/cfg/template-info/create', data })
}
// 修改组件详情
export const updateTemplateInfo = (data: TemplateInfoVO) => {
  return request.post({ url: '/cfg/template-info/update', data })
}

// 删除模块
export const deleteTemplateInfo = (id: number) => {
  return request.post({ url: '/cfg/template-info/delete?id=' + id })
}
