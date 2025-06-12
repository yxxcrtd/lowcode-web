import request from '@/config/axios'

// 查询邮件日志列表
export const getToken = async (params) => {
  return await request.post({ url: '/system/openAuth/getToken', params })
}
