import request from '@/config/axios'

export const createSuperviseReport = async (data: any) => {
  return await request.post({ url: '/ibps/asset/noStandardAssetManage/list ', data })
}

export const createReportFile = async (data: any) => {
  return await request.postOriginal({
    url: `/ibps/project/biz/ctr/ctrPreviousReportInformatio/exportJson`,
    data,
    method: 'POST',
    headersType: 'multipart/form-data'
  })
}
// 生成申请书
export const exportApplicationWord = async (data: any, headersType) => {
  return await request.postOriginal({
    url: `/ibps/project/biz/ctr/ctrPreviousReportInformatio/exportApplicationWord`,
    data,
    method: 'POST',
    headersType: headersType,
    responseType: 'blob'
  })
}
// 批量预登记生成json
export const exportBatchJson = async (data: any, headersType) => {
  return await request.postOriginal({
    url: `/ibps/project/biz/ctr/ctrPreviousReportInformatio/exportBatchJson`,
    data,
    method: 'POST',
    headersType: headersType,
    responseType: 'blob'
  })
}
