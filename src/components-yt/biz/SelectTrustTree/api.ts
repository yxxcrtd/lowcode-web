import request from '@/config/axios'

export interface ComponentGroupVO {
  id?: number
  groupName: string
  numSort?: number
  parentId?: number
}

export interface ComponentTableVO {
  id: number,
  groupId: number,
  componentName: string,
  componentCode: string,
  status: number,
}

export interface ComponentAttributeVO {
  id: number,
  componentId: number,
  attributeName: string,
  attributeType: string,
  attributeValue: string,
  addComponentAttribute: any,
  updateComponentAttribute: any,
  delComponentAttribute: any,
}
export const api="/cfg/component-group/";



// 查询分组树形列表
export const getTree = () => {
  return request.get({ url: api + 'getTree' })
}

// 查询分组详情
export const getComponentGroup = (id: number) => {
  return request.get({ url: api + 'get?id=' + id })
}

// 新增分组
export const createComponentGroup = (data: ComponentGroupVO) => {
  return request.post({ url: api + 'create', data })
}

// 修改分组
export const updateComponentGroup = (data: ComponentGroupVO) => {
  return request.put({ url: api + 'update', data })
}

// 删除分组
export const deleteComponentGroup = (id: number) => {
  return request.delete({ url: api + 'delete?id=' + id })
}

// 查询用户管理列表
export const getUserPage = (params: PageParam) => {
  return request.get({ url: '/system/user/page', params })
}

// 查询组件列表
export const getComponentTablePage = (params: PageParam) => {
  return request.get({ url: '/cfg/component-table/page', params })
}

// 查询组件列表
export const getComponentTableList = (params: PageParam) => {
  return request.get({ url: '/cfg/component-table/list', params })
}

// 查询组件详情
export const getComponentTable = (id: number) => {
  return request.get({ url: '/cfg/component-table/get?id=' + id })
}

// 新增组件
export const createComponentTable = (data: ComponentTableVO) => {
  return request.post({ url: '/cfg/component-table/create', data })
}

// 修改组件
export const updateComponentTable = (data: ComponentTableVO) => {
  return request.put({ url: '/cfg/component-table/update', data })
}

// 删除组件
export const deleteComponentTable = (id: number) => {
  return request.delete({ url: '/cfg/component-table/delete?id=' + id })
}

// 新增组件
export const createComponentAttributeList = (data: ComponentAttributeVO) => {
  return request.post({ url: '/cfg/component-attribute/createList', data })
}