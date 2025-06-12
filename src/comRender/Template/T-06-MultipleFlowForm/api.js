import request from "@/config/axios";

export const getFlowInfo = (params) => {
  return request.get({ url: '/cfg/process-design/getInfo', params })
}
