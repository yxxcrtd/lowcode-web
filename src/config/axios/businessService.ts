import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestHeaders,
  AxiosResponse,
  InternalAxiosRequestConfig
} from 'axios'

import { ElMessage, ElNotification } from 'element-plus'
import qs from 'qs'
import { config } from '@/config/axios/config'
import errorCode from './errorCode'
import {useCache} from "@/hooks/web/useCache";

const { wsCache } = useCache()
const { result_code,business_url, request_timeout } = config

// 创建axios实例
const service: AxiosInstance = axios.create({
  baseURL: business_url, // api 的 base_url
  timeout: request_timeout, // 请求超时时间
  withCredentials: false // 禁用 Cookie 等信息
})


// request拦截器
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken()
    const SYStYPE = '99'
    if (token) {
      ;(config as Recordable).headers['X-Access-Token'] = token // 让每个请求携带自定义 token 请根据实际情况自行修改
      ;(config as Recordable).headers['X-System-Type'] = SYStYPE || ''
    }
    
    const params = config.params || {}
    const data = config.data || false
    if (
      config.method?.toUpperCase() === 'POST' &&
      (config.headers as AxiosRequestHeaders)['Content-Type'] ===
        'application/x-www-form-urlencoded'
    ) {
      config.data = qs.stringify(data, { arrayFormat: 'repeat' })
    }
    // get参数编码
    if (config.method?.toUpperCase() === 'GET' && params) {
      config.params = {}
      const paramsStr = qs.stringify(params, { allowDots: true })
      if (paramsStr) {
        config.url = config.url + '?' + paramsStr
      }
    }
    return config
  },
  (error: AxiosError) => {
    // Do something with request error
    console.log(error) // for debug
    return Promise.reject(error)
  }
)

// response 拦截器
service.interceptors.response.use(
  async (response: AxiosResponse<any>) => {
    let { data } = response
    if (!data) {
      // 返回“[HTTP]请求没有返回值”;
      throw new Error()
    }
    // 未设置状态码则默认成功状态
    // 二进制数据则直接返回，例如说 Excel 导出
    if (
      response.request.responseType === 'blob' ||
      response.request.responseType === 'arraybuffer'
    ) {
      // 注意：如果导出的响应为 json，说明可能失败了，不直接返回进行下载
      if (response.data.type !== 'application/json') {
        if(response.headers['content-disposition']) {
          const fileName = getFileName(response.headers)
          return {
            ...response,
            fileName
          }
        }
        return response.data
      }
      data = await new Response(response.data).json()
    }
    const code = data.code || result_code
    // 获取错误信息
    const msg = data.message || errorCode[code] || errorCode['default']
    if (code !== 200) {
      ElNotification.error({ title: msg })
      return Promise.reject('error')
    } else {
      if(response.headers['content-disposition']) {
        const fileName = getFileName(response.headers)
        return {
          ...response,
          fileName
        }
      }
      return data
    }
  },
  (error: AxiosError,data) => {
    console.log('err' + error,error.response) // for debug
    let message = error.response?.data?.message || error.message
    if(!message){
      const { t } = useI18n()
      if (message === 'Network Error') {
        message = t('sys.api.errorMessage')
      } else if (message.includes('timeout')) {
        message = t('sys.api.apiTimeoutMessage')
      } else if (message.includes('Request failed with status code')) {
        message = t('sys.api.apiRequestFailed') + message.substr(message.length - 3)
      }
    }
    ElMessage.error(message)
    return Promise.reject(error)
  }
)

const getAccessToken=()=>{
  const tokenObj=JSON.parse(wsCache.get('pro__Access') || '{}')
  return tokenObj.value || '2XC9XrJnCpzGWA6F407CF755445B094D670744879365E'
}
const getFileName = (header: any) => {
  let fileName = '未知附件名称'
  if (header['save-as-name']) {
    fileName = decodeURI(header['save-as-name'])
  } else {
    const filenameRegex = /(filename|fileName)[^;=\n]*=(.+)?/
    const h = Object.keys(header || {}).filter(function (r) {
      return r.toLowerCase() === 'content-disposition'
    });
    if (h.length < 1 && !header[h[0]]) {
      return fileName
    }
    const disposition = decodeURI(header[h[0]]);
    if (disposition && disposition.indexOf('attachment') !== -1) {
      const matches = filenameRegex.exec(disposition);
      if (matches != null && matches[2]) {
        if(matches[2].indexOf('UTF8') > -1) {
          return decodeMimeFilename(matches[2], 'UTF8')
        }
        return matches[2].replace(/['"]/g, '')
      }
    }
  }
  return fileName
}

// 用于解析MIME编码的文件名
function decodeMimeFilename(encodedStr, chartsetStr = 'UTF-8') {
  if (!encodedStr) return '';
  // 移除可能的引号
  encodedStr = encodedStr.trim().replace(/^"|"$/g, '');
  // 处理多部分编码（例如："=?UTF-8?B?xxx?= =?UTF-8?B?yyy?="）
  const parts = encodedStr.split(/\s+(?==\?)/);
  let decoded = '';
  
  for (const part of parts) {
    // 匹配 MIME 编码模式: =?charset?encoding?encoded-text?=
    const match = part.match(/=\?([^?]+)\?([QB])\?([^?]+)\?=/i);
    if (!match) {
      // 不是 MIME 编码部分，直接添加
      decoded += part;
      continue;
    }
    const [, charset, encoding, content] = match;
    
    try {
      if (charset.toUpperCase() === chartsetStr) {
        if (encoding.toUpperCase() === 'B') {
          // Base64 解码
          const bytes = atob(content);
          let text = '';
          for (let i = 0; i < bytes.length; i++) {
            text += String.fromCharCode(bytes.charCodeAt(i));
          }
          // 转换为 UTF-8 字符串
          decoded += decodeURIComponent(escape(text));
        } else if (encoding.toUpperCase() === 'Q') {
          // Quoted-Printable 解码
          const decodedQ = content
            .replace(/_/g, ' ') // 将 _ 替换为空格
            .replace(/=([0-9A-F]{2})/gi, (_, hex) => 
                String.fromCharCode(parseInt(hex, 16))
            );
          decoded += decodeURIComponent(escape(decodedQ));
        }
      } else {
        // 非 UTF-8 字符集（如 GBK、ISO-8859-1 等）
        console.warn(`Unsupported charset: ${charset}`);
        decoded += part; // 无法解码，保留原始内容
      }
    } catch (e) {
      console.error('解码失败:', e);
      decoded += part; // 解码失败时保留原始内容
    }
  }
  
  return decoded;
}

export { service }
