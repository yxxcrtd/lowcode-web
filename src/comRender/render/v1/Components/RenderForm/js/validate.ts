import request from "@/config/axios";
import {replaceMethodField} from "@/comRender/utils";
import { useUserStore } from '@/store/modules/user';
import * as renderUtil from '@/comRender/utils/renderUtil'

/**
 * 初始化表单权限
 * @param formGroups
 * @param renderFormData
 * @param apiInfo
 */
export const initFormRules=(ctx,formGroups,renderFormData,apiInfo)=>{
  formGroups.forEach((groupItem)=>{
    setGroupItemRules(ctx,groupItem,renderFormData,apiInfo)
    if(groupItem.children && groupItem.children.length){
      groupItem.children.forEach(childGroupItem=>{
        setGroupItemRules(ctx,childGroupItem,renderFormData,apiInfo)
      })
    }
  })
}
/**
 * 初始化具体分组的校验规则
 * @param groupItem
 * @param renderFormData
 * @param apiInfo
 */
const setGroupItemRules=(ctx,groupItem,renderFormData,apiInfo)=>{
  if(groupItem.formItems && groupItem.formItems.length){
    groupItem.formItems.forEach((formItem)=>{
      if(formItem.isTableItem){
        formItem.tableItems.forEach((tableItem) => {
          //如果是表格类，只给小于6个的行内编辑 添加校验规则 
          tableItem.rules=setFormItemRules(ctx,tableItem,renderFormData,apiInfo,formItem.tableItems.length)
        })
      }else{
        formItem.rules=setFormItemRules(ctx,formItem,renderFormData,apiInfo,groupItem.formItems.length)
      }
    })
  }
}
/**
 * 初始化具体表单项的规则
 * @param formItem
 * @param renderFormData
 * @param apiInfo
 */
export const setFormItemRules=(ctx,formItem,renderFormData,apiInfo,tableItemsLength = null)=>{
  const rulesList:any = []
  if (formItem.isRequire) {
    rulesList.push({ required: true, message: '请输入' + formItem.columnComment, trigger: ['blur', 'change'] })
  }
  if (formItem.validateRulesRespVOS && formItem.validateRulesRespVOS.length) {
    formItem.validateRulesRespVOS.forEach((ruleItem) => {
      //判断是否必填
      if (ruleItem.validateType === 'require') {
        rulesList.push({ required: true, message: ruleItem.toolTips || '请输入' + formItem.columnComment, trigger: ['blur', 'change'] })
      }
      //判断是否长度校验
      if (ruleItem.validateType === 'length') {
        const maxLen=parseInt(ruleItem.condition.maxLength || 1000)
        rulesList.push({ max:maxLen, message: ruleItem.toolTips || '长度不能超过'+maxLen, trigger: 'blur' })
      }
      //判断区间校验
      if (ruleItem.validateType === 'range') {
        if(ruleItem.rangeType === 'var'){
          rulesList.push(setFormItemVarRange(ruleItem,formItem,renderFormData))
        }else{
          rulesList.push({ validator: async (rule, value, callback) => {
              if (!value) {
                callback()
              }else{
                const min = + ruleItem.condition.min
                const max = + ruleItem.condition.max
                if (+ value < min || + value > max) {
                  callback(new Error(ruleItem.toolTips || `请输入指定范围数据[${min}-${max}]`))
                } else {
                  callback()
                }
              }
            }, trigger: 'blur' })
        }
      }
      //正则校验
      if (ruleItem.validateType === 'regular') {
        rulesList.push({ pattern: ruleItem.condition.regularType, message: ruleItem.toolTips || formItem.columnComment+'格式不正确', trigger: ['blur', 'change'] })
      }
      //接口校验
      if (ruleItem.validateType === 'api') {
        rulesList.push({ validator: async (rule, value, callback) => {
            try{
              if (!value) {
                callback()
              }else{
                const res = await request.post({ url: ruleItem.condition.apiUrl, params:{value} })
                if (!res) {
                  callback(new Error(ruleItem.toolTips || '请输入正确的数据'))
                } else {
                  callback()
                }
              }
            } catch (e){
              callback(new Error(ruleItem.toolTips || '请输入正确的数据'));
            }
          }, trigger: 'blur' })
      }
      //自定义方法校验
      if (ruleItem.validateType === 'customValidate') {
        const customMethodScript =replaceMethodField(ruleItem.condition.methodScript,apiInfo.pageListConfigs);
        //console.log('customMethodScript',customMethodScript)
        if(formItem.childTableId){
          //子表自定义校验走子表组件内部方法，此处无法拿到行内数据 但在此处转换脚本
          formItem.ruleCustomValidateScript=customMethodScript 
          if(tableItemsLength && tableItemsLength>5){
            rulesList.push({ validator: async (rule, value, callback) => {
              try{
                const customFunc=new Function(customMethodScript)
                //执行自定义校验函数，自定义函数是一个字符串，先通过Function转为函数，再传参执行方法；
                customFunc()(rule,value,callback,renderFormData,ctx,renderUtil)
              } catch (e){
                console.log(e)
                callback(new Error('自定义方法校验失败'));
              }
            }, trigger: ['blur','change'] })
          }
        }else{
          rulesList.push({ validator: (rule, value, callback) => {
              try{
                const customFunc=new Function(customMethodScript)
                //执行自定义校验函数，自定义函数是一个字符串，先通过Function转为函数，再传参执行方法；
                customFunc()(rule,value,callback,renderFormData,ctx,renderUtil)
              } catch (e){
                console.log(e)
                callback(new Error('自定义方法校验失败'));
              }
            }, trigger: ['blur','change'] })
        }
      }
    })
  }
  return rulesList
}

const setFormItemVarRange=(ruleItem,formItem,renderFormData)=>{
  //console.log('setFormItemVarRange',ruleItem,formItem,renderFormData)
  formItem.props = formItem.props || {}

  if(formItem.columnDisplayComponent.indexOf('date')>-1){
    formItem.props['disabledDate'] = (value) => {
      const minDate = renderFormData[formItem.moduleTableId]?.[ruleItem.condition.min] || null
      const maxDate = renderFormData[formItem.moduleTableId]?.[ruleItem.condition.max] || null
      return dateRules(value,minDate,maxDate,ruleItem)
    }
    return { validator: (rule, value, callback) => {
        if (!value) {
          callback()
        }else{
          const minDate = renderFormData[formItem.moduleTableId]?.[ruleItem.condition.min] || null
          const maxDate = renderFormData[formItem.moduleTableId]?.[ruleItem.condition.max] || null
          const vaild = dateRules(new Date(value),minDate,maxDate,ruleItem,formItem.columnDisplayComponent.indexOf('datetime') !== -1)
          if(vaild){
            callback(new Error(ruleItem.toolTips || '请选择指定范围数据'))
          }else{
            callback()
          }
        }
      }, message: ruleItem.toolTips || '请选择指定范围数据', trigger: ['blur', 'change'] }
  }else{
    return { validator: async (rule, value, callback) => {
        if (!value) {
          callback()
        }else{
          const min = renderFormData[formItem.moduleTableId]?.[ruleItem.condition.min] || null
          const max = renderFormData[formItem.moduleTableId]?.[ruleItem.condition.max] || null
          if ((min!=null && Number(value)<min) || (max!=null && Number(value)<max)) {
            callback(new Error(ruleItem.toolTips || `请输入指定范围数据[${min}-${max}]`))
          } else {
            callback()
          }
        }
      }, trigger: 'blur' }
  }
  
}

/**
 * 表单项校验规则处理
 * @param item
 * @returns {*[]}
 */
export const getFormRules = (item,renderFormData,apiInfo) => {
  console.log('getFormRules',item,renderFormData)
  const rulesList:any = []
  if (item.isRequire) {
    rulesList.push({ required: true, message: '请输入' + item.columnComment, trigger: ['blur', 'change'] })
  }
  if (item.validateRulesRespVOS && item.validateRulesRespVOS.length) {
    item.validateRulesRespVOS.forEach((ruleItem) => {
      //判断是否必填
      if (ruleItem.validateType === 'require') {
        rulesList.push({ required: true, message: ruleItem.toolTips || '请输入' + item.columnComment, trigger: ['blur', 'change'] })
      }
      //判断是否长度校验
      if (ruleItem.validateType === 'length') {
        const maxLen=parseInt(ruleItem.condition.maxLength || 1000)
        rulesList.push({ max:maxLen, message: ruleItem.toolTips || '长度不能超过'+maxLen, trigger: 'blur' })
      }
      //判断区间校验
      if (ruleItem.validateType === 'range') {
        rulesList.push({ validator: async (rule, value, callback) => {
            if (!value) {
              callback()
            }else{
              const min = + ruleItem.condition.min
              const max = + ruleItem.condition.max
              if (+ value < min || + value > max) {
                callback(new Error(ruleItem.toolTips || `请输入指定范围数据[${min}-${max}]`))
              } else {
                callback()
              }
            }
          }, trigger: 'blur' })
      }
      //正则校验
      if (ruleItem.validateType === 'regular') {
        rulesList.push({ pattern: ruleItem.condition.regularType, message: ruleItem.toolTips || item.columnComment+'格式不正确', trigger: ['blur', 'change'] })
      }
      //接口校验
      if (ruleItem.validateType === 'api') {
        rulesList.push({ validator: async (rule, value, callback) => {
            try{
              if (!value) {
                callback()
              }else{
                const res = await request.post({ url: ruleItem.condition.apiUrl, params:{value} })
                if (!res) {
                  callback(new Error(ruleItem.toolTips || '请输入正确的数据'))
                } else {
                  callback()
                }
              }
            } catch (e){
              callback(new Error(ruleItem.toolTips || '请输入正确的数据'));
            }
          }, trigger: 'blur' })
      }
      //自定义方法校验
      if (ruleItem.validateType === 'customValidate') {
        const customMethodScript =replaceMethodField(ruleItem.condition.methodScript,apiInfo.pageListConfigs);
        //console.log('customMethodScript',customMethodScript)
        if(!item.childTableId){
          rulesList.push({ validator: async (rule, value, callback) => {
              try{
                const customFunc=new Function(customMethodScript)
                //执行自定义校验函数，自定义函数是一个字符串，先通过Function转为函数，再传参执行方法；
                customFunc()(rule,value,callback,renderFormData)
              } catch (e){
                console.log(e)
                callback(new Error('自定义方法校验失败'));
              }
            }, trigger: ['blur','change'] })
        }else{
          //子表自定义校验走子表组件内部方法，此处无法拿到行内数据 但在此处转换脚本
          item.ruleCustomValidateScript=customMethodScript
        }
      }
    })
  }
  return rulesList
}
/**
 * 日期校验
 */
const makeRange = (start, end) => {
  const result = []
  for (let i = start; i <= end; i++) {
    result.push(i)
  }
  return result
}
const dateTimeRules = (type,minDate,maxDate,value) => {
  let min1,valueDate1,max1
  if(minDate && value && maxDate){
    const min = new Date(minDate)
    const max = new Date(maxDate)
    const valueDate = new Date(value)
    if(type === 'hours'){
      min1 = (new Date(minDate)).setHours(0, 0, 0, 0)
      valueDate1 = (new Date(value)).setHours(0, 0, 0, 0)
      max1 = (new Date(max)).setHours(0, 0, 0, 0)
    }else if(type === 'minutes'){
      min1 = (new Date(minDate)).setMinutes(0, 0, 0)
      valueDate1 = (new Date(value)).setMinutes(0, 0, 0)
      max1 = (new Date(max)).setMinutes(0, 0, 0)
    }else if(type === 'seconds'){
      min1 = (new Date(minDate)).setSeconds( 0, 0)
      valueDate1 = (new Date(value)).setSeconds(0, 0)
      max1 = (new Date(max)).setSeconds(0, 0)
    }
    if(min1 === valueDate1){
      if(type === 'hours'){
        return makeRange(0,min.getHours()-1)
      }else if(type === 'minutes'){
        return makeRange(0,min.getMinutes()-1)
      }else if(type === 'seconds'){
        return makeRange(0,min.getSeconds()-1)
      }
    }else if(min1>valueDate1 || valueDate1>max1){
      if(type === 'hours'){
        return makeRange(0,23)
      }else {
        return makeRange(0,59)
      }
    }else if(min1<valueDate1 && valueDate1<max1){
      return []
    }else if(max1 === valueDate1){
      if(type === 'hours'){
        return makeRange(max.getHours()+1,23)
      }else if(type === 'minutes'){
        return makeRange(max.getMinutes()+1,59)
      }else if(type === 'seconds'){
        return makeRange(max.getSeconds()+1,59)
      }
    }
  }
  if(minDate && value){
    const min = new Date(minDate)
    const valueDate = new Date(value)
    if(type === 'hours'){
      min1 = (new Date(minDate)).setHours(0, 0, 0, 0)
      valueDate1 = (new Date(value)).setHours(0, 0, 0, 0)
    }else if(type === 'minutes'){
      min1 = (new Date(minDate)).setMinutes(0, 0, 0)
      valueDate1 = (new Date(value)).setMinutes(0, 0, 0)
    }else if(type === 'seconds'){
      min1 = (new Date(minDate)).setSeconds( 0, 0)
      valueDate1 = (new Date(value)).setSeconds(0, 0)
    }
    if(min1 === valueDate1){
      if(type === 'hours'){
        return makeRange(0,min.getHours()-1)
      }else if(type === 'minutes'){
        return makeRange(0,min.getMinutes()-1)
      }else if(type === 'seconds'){
        return makeRange(0,min.getSeconds()-1)
      }
    }else if(min1>valueDate1){
      if(type === 'hours'){
        return makeRange(0,23)
      }else {
        return makeRange(0,59)
      }
    }else if(min1<valueDate1){
      return []
    }
  }
  if(maxDate && value){
    const max = new Date(maxDate)
    const valueDate = new Date(value)
    if(type === 'hours'){
      valueDate1 = (new Date(value)).setHours(0, 0, 0, 0)
      max1 = (new Date(max)).setHours(0, 0, 0, 0)
    }else if(type === 'minutes'){
      valueDate1 = (new Date(value)).setMinutes(0, 0, 0)
      max1 = (new Date(max)).setMinutes(0, 0, 0)
    }else if(type === 'seconds'){
      valueDate1 = (new Date(value)).setSeconds(0, 0)
      max1 = (new Date(max)).setSeconds(0, 0)
    }
    if(valueDate1>max1){
      if(type === 'hours'){
        return makeRange(0,23)
      }else {
        return makeRange(0,59)
      }
    }else if(valueDate1<max1){
      return []
    }else if(max1 === valueDate1){
      if(type === 'hours'){
        return makeRange(max.getHours()+1,23)
      }else if(type === 'minutes'){
        return makeRange(max.getMinutes()+1,59)
      }else if(type === 'seconds'){
        return makeRange(max.getSeconds()+1,59)
      }
    }
  }
}

/**
 * 置灰不可选日期
 * @param value
 * @param minDate
 * @param maxDate
 * @param ruleItem
 * @param isDatetimeValid
 */
const dateRules = (value,minDate,maxDate,ruleItem,isDatetimeValid = false) => {
  !isDatetimeValid && value.setHours(0, 0, 0, 0)
  if (minDate && maxDate) {
    const endTime = new Date(maxDate)
    const startTime = new Date(minDate)
    !isDatetimeValid && startTime.setHours(0, 0, 0, 0);
    if (endTime.toString() !== "Invalid Date" && startTime.toString() !== "Invalid Date") {
      return !(value.getTime() >= startTime.getTime() && value.getTime() <= endTime.getTime())
    } else {
      // 代表传入的值有问题
      return false
    }
  }
  if (minDate) {
    const startTime = new Date(minDate)
    !isDatetimeValid && startTime.setHours(0, 0, 0, 0);
    if (startTime.toString() !== "Invalid Date") {
      return !(startTime.getTime() <= value.getTime())
    } else {
      return false
    }
  }
  if (maxDate) {
    const endTime = new Date(maxDate)
    if (endTime.toString() !== "Invalid Date") {
      return !(value.getTime() < endTime.getTime())
    } else {
      return false
    }
  }
}
