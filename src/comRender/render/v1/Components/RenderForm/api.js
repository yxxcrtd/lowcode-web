import request from "@/config/axios";

export const getFlowNodeCfg = (params) => {
  return request.get({ url: '/cfg/process-design/getInfo', params })
}

export const getBusinessAttachment = (data) => {
  return request.post({ url: '/ibps/sys/commFileInfo/listAnonymous', data })
}
