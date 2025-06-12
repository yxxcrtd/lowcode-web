import request from "@/config/axios";

export const getPageInfo = (id: number) => {
  return request.get({ url: '/cfg/page-info/get?id=' + id })
}
export const getFlow = (pageId,flowId,pageDataId) => {
  const params={
    pageId:pageId,
    flowId:flowId,
    pageDataId:pageDataId,
  }
  return request.get({ url: `/cfg/page-info/getflow`, params })
}
