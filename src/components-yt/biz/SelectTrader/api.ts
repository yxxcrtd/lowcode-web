import request from '@/config/axios'

// 查询分组树形列表
export const getRoleUser = (params) => {
  return request.get({ url: '/system/user/role/user/page', params })
}



