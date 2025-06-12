import request from '@/config/axios'

// 调用试算接口
export const getTryBalance = (params) => {
  return request.get({ url: '/system/user/role/user/page', params })
}



