import {isEmptyObj} from "@/utils/is";
import {useUserStore} from "@/store/modules/user";
import {useAppStore} from "@/store/modules/app";
import dayjs from "dayjs";

/**
 * 根据模板地址拼接完整组件地址
 * @param pageType
 * @param templateAddress
 */
export const getComponentPath = (pageType,templateAddress) => {
  const componentPath='/src/comRender/Template/'
  //如果地址为空，返回默认值
  if(!templateAddress){
    templateAddress=pageType==='list' ? "T-02-List/index.vue" : "T-01-Form/index.vue"
  }
  //如果未写后缀，补充后缀
  if(!templateAddress.endsWith('.vue')){
    templateAddress=templateAddress+'.vue'
  }
  return componentPath+templateAddress;
};

/**
 * 替换后台配置的自定义函数中 #字段名# 为对应表单form下的数据结构
 * @param script
 * @param pageFields
 */
export const replaceMethodField=(script,pageFields=[],ctx?,isTable?)=>{
  //先对方法中 #字段名# 格式的字段进行替换
  const fieldArr: any = []
  script.replace(/#([^#]+)#/g, (match, p1) => {
    fieldArr.push(p1) // 提取捕获组的内容
  })
  const fieldMap = {}
  //处理表单变量
  const fieldItems=pageFields.filter(formItem=>{
    return fieldArr.includes(formItem.columnName)
  })
  fieldItems.forEach(formItem=>{
    if(isTable){
      fieldMap['#'+formItem.columnName+'#'] =
        `row['${formItem.moduleTableId}'].${formItem.columnName}_${formItem.moduleTableId}`
    }else{
      fieldMap['#'+formItem.columnName+'#'] =
        `formData['${formItem.moduleTableId}'].${formItem.columnName}_${formItem.moduleTableId}`
    }
  })
  //处理系统变量
  fieldArr.forEach(field=>{
    if(field.indexOf('SysParam-') > -1){
      fieldMap['#'+field+'#'] = `'${getSysParamterValue(field.replace('SysParam-',''))}'`
    }
  })
  //处理路由变量
  fieldArr.forEach(field=>{
    if(field.indexOf('RouteParam-') > -1){
      fieldMap['#'+field+'#'] = `'${getRouteValue(field.replace('RouteParam-',''),ctx)}'`
    }
  })
  //console.log('fieldArr',fieldArr,fieldItems,fieldMap)
  let newScript =script;
  if(!isEmptyObj(fieldMap)){
    //替换变量
    const regex = new RegExp(Object.keys(fieldMap).join('|'), 'g')
    newScript = script.replace(regex, (match) => fieldMap[match])
  }
  return `return ${newScript}`
}


/**
 * 替换后台配置的自定义函数中 #字段名# 为对应表单form下的数据结构
 * @param script
 * @param pageFields
 */
export const replaceScriptField=(script,pageFields,formData)=>{
  if(!script){
    return {}
  }
  //先对方法中 #字段名# 格式的字段进行替换
  const fieldArr: any = []
  script.replace(/#([^#]+)#/g, (match, p1) => {
    fieldArr.push(p1) // 提取捕获组的内容
  })
  const fieldMap = {}
  const fieldItems=pageFields?.filter(formItem=>{
    return fieldArr.includes(formItem.columnName)
  }) || []
  fieldItems.forEach(formItem=>{
    fieldMap['#'+formItem.columnName+'#'] =
      `( formData['${formItem.moduleTableId}'] && formData['${formItem.moduleTableId}'].${formItem.columnName}_${formItem.moduleTableId} || '')`
  })
  //处理系统变量
  fieldArr.forEach(field=>{
    if(field.indexOf('SysParam-') > -1){
      fieldMap['#'+field+'#'] = `'${getSysParamterValue(field.replace('SysParam-',''))}'`
    }
  })
  //处理路由变量
  fieldArr.forEach(field=>{
    if(field.indexOf('RouteParam-') > -1){
      fieldMap['#'+field+'#'] = `'${getRouteValue(field.replace('RouteParam-',''))}'`
    }
  })
  //console.log('fieldArr',fieldArr,fieldItems,fieldMap)
  let newScript =script;
  if(!isEmptyObj(fieldMap)){
    //替换变量
    const regex = new RegExp(Object.keys(fieldMap).join('|'), 'g')
    newScript = script.replace(regex, (match) => '${'+fieldMap[match]+'}')
  }
  const scriptCode = `
        return \`${newScript}\`
      `
  //console.log('scriptCode',scriptCode,formData,formData['1903295385814560770'].ZXDFFS_ZHLB_1903295385814560770)
  const func = new Function('formData', scriptCode) // 将字符串转换为函数
  const funResult=func(formData)
  //console.log('funResult',funResult)
  let resultObj=null
  try{
    resultObj=JSON.parse(funResult)
  }catch(e){
    console.error('脚本格式错误',e,script)
  }
  console.log('resultObj',resultObj)
  return resultObj
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
 * 默认值map
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
  curDate: () => {
    return dayjs().format('YYYY-MM-DD')
  },
  curTime: () => {
    return dayjs().format('HH:mm:ss')
  },
  curDateTime: () => {
    return dayjs().format('YYYY-MM-DD HH:mm:ss')
  }
}
