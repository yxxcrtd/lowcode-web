import request from '@/config/axios'

//获取附件目录属性结构
export const getLocalDirTreeInfo = (params) => {
  return request.get({ url: '/ibps/sys/dir/getLocalDirTreeInfo', params })
}



