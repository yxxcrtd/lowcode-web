import request from '@/config/axios'

/**
 * 获取流程列表
 * @param data
 */
export const getFlowList = async (data: any) => {
  return await request.post({ url: '/ibps/fwoa/process/getProjFlowInfo', data })
}

