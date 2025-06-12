import request from '@/config/axios'

// 获取已成立子产品接口
export const getProdBasicInfo = (params) => {
  return request.post({ url: '/ibps/product/prodBasicInfo/remoteList', params })
}



