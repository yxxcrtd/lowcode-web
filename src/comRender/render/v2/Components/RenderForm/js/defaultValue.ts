import {useUserStore} from "@/store/modules/user";
import {useAppStore} from "@/store/modules/app";
import dayjs from "dayjs";
import {replaceMethodField} from "@/comRender/utils";
import * as renderUtil from '@/comRender/utils/renderUtil'

/**
 * 设置组件默认值
 * @param apiInfo
 * @param formData
 */
export const setDefValue = (ctx,formGroup,pageInfo,formData,isTableItem) => {
  formGroup.forEach((groupItem) => {
    setGroupItemDefaultValue(groupItem,formData,ctx,pageInfo)
    if(formGroup.children?.length){
      formGroup.children.forEach(child=>{
        setGroupItemDefaultValue(child,formData,ctx,pageInfo)
      })
    }
  })
}
const setGroupItemDefaultValue=(groupItem,formData,ctx,pageInfo)=>{
  groupItem.formItems.forEach(formItem => {
    //子表显隐
    if(formItem.isTableItem){
      // formItem.tableItems.forEach(tableItem => {
      //   setFormItemDefValue(tableItem,formData,ctx)
      // })
    }else{
      setFormItemDefValue(formItem,formData,ctx,pageInfo)
    }
  })
}

const setFormItemDefValue=(item,formData,ctx,pageInfo)=>{
  if(item.defValue){
    formData[item.moduleTableId][item.columnName + '_' + item.moduleTableId] = getDefValue(ctx,item,formData,pageInfo,item.defValue)
  }
}
/**
 * 获取默认值
 * @param defVal
 * @returns {*}
 */
export const getDefValue = (ctx,fieldItem,formData,pageInfo,defVal) => {
  const userStore = useUserStore()
  const appStore = useAppStore()
  let defVariable=defVal
  let inputDefValue=defVal
  if(defVal.indexOf('function')>-1){
    const pageListConfig=pageInfo.pageApiRespVOS.find(item=>item.apiCode=='form-create').pageListConfigs
    if(pageListConfig){
      inputDefValue= runCustomScript(defVal,ctx,fieldItem,pageListConfig,formData)
    }else{
      inputDefValue= ''
    }
  }if(defVal.indexOf('query')>-1){
    const paramName=getRouteParamName(defVal)
    if(paramName){
      inputDefValue= getRouteValue(paramName,ctx)
    }else{
      inputDefValue= ''
    }
  }else if(defVal.indexOf('${')>-1){
    const math = defVal.match(/\${(.*?)}/);
    if (math) {
      defVariable = math[1];
    }
    inputDefValue= defValueMap[defVariable] && defValueMap[defVariable](userStore,appStore) || ''
  }
  return inputDefValue
}
/**
 * 获取系统变量默认值
 * @param defVal
 * @returns {*}
 */
export const getSysParamterValue = (defVal) => {
  const userStore = useUserStore()
  const appStore = useAppStore()
  let defVariable=defVal

  const math = defVal.match(/\${(.*?)}/);
  if (math) {
    defVariable = math[1];
  }
  return defValueMap[defVariable] && defValueMap[defVariable](userStore,appStore) || ''
}
/**
 * 获取路由参数值
 * @param paramName
 */
export const getRouteValue=(paramName,ctx)=>{
  let route=useRoute()
  if(!route && ctx){
    route=ctx.exposed.route
  }
  return route?.query[paramName]
}
/**
 * 默认值map
 * @type {{curUserId: (function(*): string), curTime: (function(*): string), curDeptId: (function(*): string), curJobId: (function(*): string), curUserName: (function(*): string), curDeptName: (function(*): string), curOrgName: (function(*): string), curDate: (function(*): string), curOrgId: (function(*): string), curDateTime: (function(*): string), curJobName: (function(*): string), curUserLoginName: (function(*): string)}}
 */
const defValueMap = {
  curUserName: (userStore) => {
    //return userStore.getUser.name
    return userStore.getBusinessUser.userName
  },
  curUserLoginName: (userStore) => {
    return userStore.getUser.name
  },
  curUserId: (userStore) => {
    //return userStore.getUser.id
    return userStore.getBusinessUser.userId
  },
  curOrgName: (userStore) => {
    return userStore.getUser.name
  },
  curOrgId: (userStore) => {
    return userStore.getUser.name
  },
  curDeptName: (userStore) => {
    return userStore.getUser.name
  },
  curDeptId: (userStore) => {
    //return userStore.getUser.name
    return userStore.getBusinessUser.departId
  },
  curJobName: (userStore) => {
    return userStore.getUser.name
  },
  curJobId: (userStore) => {
    return userStore.getUser.name
  },
  curDate: (userStore) => {
    return dayjs().format('YYYY-MM-DD')
  },
  curTime: (userStore) => {
    return dayjs().format('HH:mm:ss')
  },
  curDateTime: (userStore) => {
    return dayjs().format('YYYY-MM-DD HH:mm:ss')
  }
}
const runCustomScript=(script,ctx,formItem,pageListConfigs,formData)=>{
  //执行事件代码
  const customMethodScript =replaceMethodField(script,pageListConfigs);
  //console.log('customMethodScript',customMethodScript)
  try{
    const customFunc=new Function(customMethodScript)
    //执行自定义校验函数，自定义函数是一个字符串，先通过Function转为函数，再传参执行方法；
    return customFunc()(ctx,formItem,formData,renderUtil)
  } catch (e){
    console.log('自定义方法执行异常:',e)
  }
}
const getRouteParamName=(paramName)=>{
  const match = paramName.match(/\$\{query\.(\w+)\}/);
  return match ? match[1] : null;
}
