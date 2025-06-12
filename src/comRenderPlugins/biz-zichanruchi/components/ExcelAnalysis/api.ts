import request from '@/config/axios'

export const importExcel = async (data: any) => {
  return await request.upload({ url: '/cfg/business/importExcel ', data })
}
