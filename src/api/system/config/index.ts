import request from '@/config/axios'

// 获得公共变量分页
export const getCommonVarPage = (params) => {
  return request.get({ url: '/cfg/common-var/page', params })
}
