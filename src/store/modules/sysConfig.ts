import { defineStore } from 'pinia'
import { getSysConfigList,getSysParamterList } from "@/web-admin/views/base/projectConfig/api";

export const useSysConfigStore = defineStore('sysConfig', {
  state:()=>{
    return {
      isSetConfig:false,
      baseConfig:{},
      safeConfig:{},
      formConfig:{},
      tableConfig:{},
      dialogConfig:{},
      drawerConfig:{},
      themeConfig:{},
      advancedThemeConfig:{},
      sysParamter:{},
      dataSourceConfig:{}
    }
  },
  getters:{
    getIsSetConfig(): boolean {
      return this.isSetConfig
    },
    getAdvancedThemeConfig(): Object {
      return this.advancedThemeConfig
    },
    getThemeConfig(): Object {
      return this.themeConfig
    },
    getSysParamter(): Object {
      return this.sysParamter
    },
    getDataSourceConfig(): Object {
      return this.dataSourceConfig
    }
  },
  actions:{
    async getSysConfig(){
      this.getSysParamterConfig()
      const categoryMap={
        baseConfig:'baseConfig',
        safeConfig:'safeConfig',
        formStandard:'formStandard',
        tableStandard:'tableStandard',
        dialogStandard:'dialogStandard',
        drawerStandard:'drawerStandard',
        themeConfig:'themeConfig',
        advancedThemeConfig:'advancedThemeConfig',
        dataSourceConfig:'Cfg_Database'
      }
      const param={
        category:Object.values(categoryMap).join(','),
      }
      const res=await getSysConfigList(param)
      this.baseConfig=this.arrayToObject(res.filter(item=>item.category==categoryMap.baseConfig))
      this.safeConfig=this.arrayToObject(res.filter(item=>item.category==categoryMap.safeConfig))
      this.formConfig=this.arrayToObject(res.filter(item=>item.category==categoryMap.formStandard))
      this.tableConfig=this.arrayToObject(res.filter(item=>item.category==categoryMap.tableStandard))
      this.dialogConfig=this.arrayToObject(res.filter(item=>item.category==categoryMap.dialogStandard))
      this.drawerConfig=this.arrayToObject(res.filter(item=>item.category==categoryMap.drawerStandard))
      this.themeConfig=this.arrayToObject(res.filter(item=>item.category==categoryMap.themeConfig))
      this.advancedThemeConfig=this.arrayToObject(res.filter(item=>item.category==categoryMap.advancedThemeConfig))
      this.dataSourceConfig=this.arrayToObject(res.filter(item=>item.category==categoryMap.dataSourceConfig))
      this.isSetConfig=true
    },
    async getSysParamterConfig(){
      const param={
        category:'Sys-Paramter',
        pageNo:1,
        pageSize:100,
      }
      const res=await getSysParamterList(param)
      this.sysParamter=this.arrayToObject(res.list)
    },
    arrayToObject(arr,key='key',valueKey='value') {
      const obj = {};
      arr.forEach(function(item) {
        obj[item[key]] = item[valueKey];
      });
      return obj;
    }
  }
})
