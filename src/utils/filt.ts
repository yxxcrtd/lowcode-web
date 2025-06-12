import axios from 'axios'
import { getAccessToken } from '@/utils/auth'
import { useSysConfigStore } from '@/store/modules/sysConfig'
import * as FileApi from '@/api/infra/file'
import { config } from '@/config/axios/config'
const { business_url } = config
export const openWindow = (
  url: string,
  opt?: {
    target?: '_self' | '_blank' | string
    noopener?: boolean
    noreferrer?: boolean
  }
) => {
  const { target = '__blank', noopener = true, noreferrer = true } = opt || {}
  const feature: string[] = []

  noopener && feature.push('noopener=yes')
  noreferrer && feature.push('noreferrer=yes')

  window.open(url, target, feature.join(','))
}

/**
 * @description: base64 to blob
 */
export const dataURLtoBlob = (base64Buf: string): Blob => {
  const arr = base64Buf.split(',')
  const typeItem = arr[0]
  const mime = typeItem.match(/:(.*?);/)![1]
  const bstr = window.atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  return new Blob([u8arr], { type: mime })
}

/**
 * img url to base64
 * @param url
 */
export const urlToBase64 = (url: string, mineType?: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    let canvas = document.createElement('CANVAS') as Nullable<HTMLCanvasElement>
    const ctx = canvas!.getContext('2d')

    const img = new Image()
    img.crossOrigin = ''
    img.onload = function () {
      if (!canvas || !ctx) {
        return reject()
      }
      canvas.height = img.height
      canvas.width = img.width
      ctx.drawImage(img, 0, 0)
      const dataURL = canvas.toDataURL(mineType || 'image/png')
      canvas = null
      resolve(dataURL)
    }
    img.src = url
  })
}

/**
 * Download online pictures
 * @param url
 * @param filename
 * @param mime
 * @param bom
 */
export const downloadByOnlineUrl = (
  url: string,
  filename: string,
  mime?: string,
  bom?: BlobPart
) => {
  urlToBase64(url).then((base64) => {
    downloadByBase64(base64, filename, mime, bom)
  })
}

/**
 * Download pictures based on base64
 * @param buf
 * @param filename
 * @param mime
 * @param bom
 */
export const downloadByBase64 = (buf: string, filename: string, mime?: string, bom?: BlobPart) => {
  const base64Buf = dataURLtoBlob(buf)
  downloadByData(base64Buf, filename, mime, bom)
}

/**
 * Download according to the background interface file stream
 * @param {*} data
 * @param {*} filename
 * @param {*} mime
 * @param {*} bom
 */
export const downloadByData = (data: BlobPart, filename: string, mime?: string, bom?: BlobPart) => {
  const blobData = typeof bom !== 'undefined' ? [bom, data] : [data]
  const blob = new Blob(blobData, { type: mime || 'application/octet-stream' })

  const blobURL = window.URL.createObjectURL(blob)
  const tempLink = document.createElement('a')
  tempLink.style.display = 'none'
  tempLink.href = blobURL
  tempLink.setAttribute('download', filename)
  if (typeof tempLink.download === 'undefined') {
    tempLink.setAttribute('target', '_blank')
  }
  document.body.appendChild(tempLink)
  tempLink.click()
  document.body.removeChild(tempLink)
  window.URL.revokeObjectURL(blobURL)
}

/**
 * Download file according to file address
 * @param {*} sUrl
 */
export const downloadByUrl = async ({
  fileId,
  target = '_blank',
  fileName
}: {
  fileId: string
  target?: '_self' | '_blank'
  fileName?: string
}): boolean => {
  // 获取上传服务等信息
  const sysConfigStore = useSysConfigStore()
  //泛微下载文件请求
  if(sysConfigStore.getSysParamter?.downloadService === '业务' || 1==1){
    try {
      FileApi.downloadFileBusiness( fileId )
        .then((res) => {
          if (!res) {
            console.log(res?.message || '下载失败！')
            return
          }
          const dom = document.createElement('a')
          dom.href = new URL(business_url).origin + res.result
          dom.download = decodeURIComponent(fileName)
          dom.style.display = 'none'
          document.body.appendChild(dom)
          dom.click()
          dom.parentNode.removeChild(dom)
        })
        .catch((res) => {
          console.log(res);
        })
      
    }catch(e){
      console.log(e)
    }
  }else{
    const isChrome = window.navigator.userAgent.toLowerCase().indexOf('chrome') > -1
    const isSafari = window.navigator.userAgent.toLowerCase().indexOf('safari') > -1

    if (/(iP)/g.test(window.navigator.userAgent)) {
      console.error('Your browser does not support download!')
      return false
    }
    if (isChrome || isSafari) {
      const link = document.createElement('a')
      link.href = url
      link.target = target

      if (link.download !== undefined) {
        link.download = fileName || url.substring(url.lastIndexOf('/') + 1, url.length)
      }

      if (document.createEvent) {
        const e = document.createEvent('MouseEvents')
        e.initEvent('click', true, true)
        link.dispatchEvent(e)
        return true
      }
    }
    if (url.indexOf('?') === -1) {
      url += '?download'
    }

    openWindow(url, { target })
    return true
  }
}
