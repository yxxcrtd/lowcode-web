import request from '@/config/axios'

// 查询分组树形列表
export const uploadAttachment = (data) => {
  return request.post({url: '/cfg/file-info/create',data});
}



