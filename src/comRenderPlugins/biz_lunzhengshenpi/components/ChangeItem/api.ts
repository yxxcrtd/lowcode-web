import request from '@/config/axios'

export const getNoStandardTableData = async (data: any) => {
  return await request.post({ url: '/ibps/asset/noStandardAssetManage/list ', data })
}
export const getStandardTableData = async (data: any) => {
  return await request.post({ url: '/ibps/asset/noStandardAssetManage/list ', data })
}
export const getInternalTableData = async (data: any) => {
  return await request.post({ url: '/ibps/asset/noStandardAssetManage/list ', data })
}
