import request from '@/config/axios'

// 刷新缓存
export const refreshCache = () => {
  return request.get({ url: '/cfg/module-info/refreshCache'})
}
