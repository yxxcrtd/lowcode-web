import request from "@/config/axios";

export const getModelDataList = (params: any) => {
  return request.get({ url: '/cfg/module-info/page', params })
}

export const pageInfoPageUrl="/cfg/process-design/page"

// 查询列表
export const getProcessDesignList = (params) => {
  return request.get({ url: '/cfg/process-design/page', params })
}

// 新增
export const addProcessDesign = (data) => {
  return request.post({ url: '/cfg/process-design/create', data })
}

// 修改流程
export const updateProcessDesign = (data) => {
  return request.post({ url: '/cfg/process-design/update', data })
}

// 查询流程详情
export const getProcessDesign = (id: number) => {
  return request.get({ url: '/cfg/process-design/get?id=' + id })
}

// 删除流程
export const deleteProcessDesign = (id: number) => {
  return request.post({ url: '/cfg/process-design/delete?id=' + id })
}

