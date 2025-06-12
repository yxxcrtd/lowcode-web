import request from '@/config/axios'

// 查询表分组
export const getDbTableGroup = () => {
  return request.get({ url: 'infra/data-source-config/list' })
}
