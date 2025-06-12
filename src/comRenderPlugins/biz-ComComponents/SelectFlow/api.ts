import request from '@/config/axios'

/**
 * 获取流程列表
 * @param data
 */
export const getFlowList = async (data: any) => {
  return await request.post({ url: '/ibps/fwoa/process/getProjFlowInfo', data })
}


export const getProjApprovalLaterPage = async (data: any) => {
  return await request.post({ url: '/ibps/projectCenter/projBasicInfo/getProjApprovalLaterPage', data })
}

//成立条件验证-后补事项审批这块选择相关流程
export const getApprovalLaterInfoPage = async (data: any) => {
  return await request.post({ url: '/ibps/projectCenter/projBasicInfo/getApprovalLaterInfoPage', data })
}
