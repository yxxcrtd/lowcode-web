import * as FileApi from '@/api/infra/file'
import { UploadRequestOptions } from 'element-plus/es/components/upload/src/upload'
import axios from 'axios'
import { useSysConfigStore } from '@/store/modules/sysConfig'


// 重写ElUpload上传方法
export const uploadMethod = async (options: UploadRequestOptions,params:any) => {
  // 获取上传服务等信息
  const sysConfigStore = useSysConfigStore()
  //泛微上传文件请求
  if(sysConfigStore.getSysParamter?.uploadService === '泛微'){
    //获取上传token
    const res = await axios.post(sysConfigStore.getSysParamter?.getUploadTokenFwUrl || '', {}, {
      headers: {
        'appid':sysConfigStore.getSysParamter?.fwAppid,
        'secret':'111'
      }
    })
    const token = res.data.token
    // 重写 el-upload httpRequest 文件上传成功会走成功的钩子，失败走失败的钩子
    return new Promise((resolve, reject) => {
      axios.post(sysConfigStore.getSysParamter?.fwUploadUrl || '', {}, {
        headers: {
          'appid':sysConfigStore.getSysParamter?.fwAppid,
          'token':token,
          'userid':'111'
        }
      })
      .then((res) => {
        if (res.code === 0) {
          resolve(res)
        } else {
          reject(res)
        }
      })
      .catch((res) => {
        reject(res)
      })
    })
  }else if(sysConfigStore.getSysParamter?.uploadService === '业务' || 1==1){
    return new Promise((resolve, reject) => {
      FileApi.updateFileBusiness({ file: options.file,...params })
        .then((res) => {
          if (res.code === 200) {
            resolve(res)
          } else {
            reject(res)
          }
        })
        .catch((res) => {
          reject(res)
        })
    })
  }else{
    //本地上传文件方式
    return new Promise((resolve, reject) => {
      FileApi.updateFile({ file: options.file })
        .then((res) => {
          if (res.code === 0) {
            resolve(res)
          } else {
            reject(res)
          }
        })
        .catch((res) => {
          reject(res)
        })
    })
  }
}



