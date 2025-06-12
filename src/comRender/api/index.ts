import request from "@/config/axios";

/**
 * 调用低码统一服务
 * @param serverId
 * @param data
 */
export const unityServerApi = (serverId,data) => {
  return request.post({ url: '/cfg/low-code-api/' + serverId,data })
}
/**
 * 查询流程节点信息
 * @param params
 */
export const getFlowNodeCfg = (params) => {
  return request.get({ url: '/cfg/process-design/getInfo', params })
}

// 查询流程详情
export const getProcessDesign = (id: number) => {
  return request.get({ url: '/cfg/process-design/get?id=' + id })
}
/**
 * 获取页面配置数据
 * @param id
 */
export const getPageInfo = (id: number) => {
  return request.get({ url: '/cfg/page-info/get?id=' + id })
}
/**
 * 获取模型服务参数
 * @param id
 */
export const getModuleApiParamInfo = (id) => {
  return request.get({ url: '/cfg/module-api/param/list?apiId=' + id })
}
/**
 * 根据userId获取userList数据
 * @param id
 */
export const getUserListByIds = (ids) => {
  return request.get({ url: '/comm/sysuser/getUserList?idList=' + ids })
}
