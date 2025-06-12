/**
 * @file 路由参数仓库 持久化
 */

import { defineStore } from 'pinia'
import {generateUUID} from "@/utils";

/**
 * 路由参数接口
 */
interface routeParamInfo {
  paramKey: string  // 用户唯一标识
  paramData: any
  routePath: string
}
interface routeParamState {
  routeParamsList: routeParamInfo
}

export const useRouteParamStore = defineStore('routeParams', {
  state: (): routeParamState => {
    return {
      routeParamsList: []
    }
  },
  getters: {
    getRouteParams(): routeParamInfo {
      return this.routeParamsList
    }
  },
  actions: {
    setRouteParams(paramData,routeFullPath?){
      if(!this.routeParamsList){
        this.routeParamsList=[]
      }
      const paramKey=generateUUID()
      this.routeParamsList.push({
        paramKey:paramKey,
        paramData:paramData,
        routePath:routeFullPath,
      })
      return paramKey
    },
    getUrlParam(paramKey){
      return this.routeParamsList.find(item=>item.paramKey === paramKey)
    },
    removeRouteParams(paramKey){
      const index = this.routeParamsList.findIndex(item=>item.paramKey === paramKey)
      this.routeParamsList.splice(index, 1);
    },
  },
  persist: {
    key: 'route-params-',
    storage: sessionStorage
  }
})
