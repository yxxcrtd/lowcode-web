/**
 * 接口处理器
 * 兼容不同平台接口。默认表单平台，其他平台带上对应的前缀；
 * 如：业务系统是ibps开头，接口带上/ibps/作为统一前缀，处理器会根据前缀使用对应的服务；
 */
import { service } from './service'
import {service as businessService} from './businessService'

import { config } from './config'

const { default_headers } = config

const request = (option: any) => {
  const { url, method, params, data, responseType, ...config } = option
  let {headersType}=option
  //console.log('option',headersType)
  let serviceMethod=service;
  if(url.indexOf('ibps/')>-1){
    serviceMethod=businessService
    if(!headersType){
      headersType='application/x-www-form-urlencoded'
    }
  }
  return serviceMethod({
    url: url,
    method,
    params,
    data,
    ...config,
    responseType: responseType,
    headers: {
      'Content-Type': headersType || default_headers
    }
  })
}
export default {
  get: async <T = any>(option: any) => {
    const res = await request({ method: 'GET', ...option })
    return (res.data || res.result) as unknown as T
  },
  post: async <T = any>(option: any) => {
    const res = await request({ method: 'POST', ...option })
    return (res.data || res.result) as unknown as T
  },
  postOriginal: async (option: any) => {
    const res = await request({ method: 'POST', ...option })
    return res
  },
  delete: async <T = any>(option: any) => {
    const res = await request({ method: 'DELETE', ...option })
    return (res.data || res.result)  as unknown as T
  },
  put: async <T = any>(option: any) => {
    const res = await request({ method: 'PUT', ...option })
    return (res.data || res.result)  as unknown as T
  },
  download: async <T = any>(option: any) => {
    const res = await request({ method: 'GET', responseType: 'blob', ...option })
    return res as unknown as Promise<T>
  },
  upload: async <T = any>(option: any) => {
    option.headersType = 'multipart/form-data'
    const res = await request({ method: 'POST', ...option })
    return res as unknown as Promise<T>
  }
}
