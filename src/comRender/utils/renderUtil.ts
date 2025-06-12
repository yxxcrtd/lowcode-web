import request from "@/config/axios";
import dayjs from 'dayjs'
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import {useUserStore} from "@/store/modules/user";
import { computedBalance } from "@/comRenderPlugins/biz-ComComponents/TryBalance/computed";
import BigNumberUtils from '@/utils/bigNumberUtil';
import { digitUppercase } from "@/utils/formatter";

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);


export const dayjsUtil=dayjs
export const BigNumberUtil=BigNumberUtils
export const digitUppercaseUtil = digitUppercase

export const testM=()=>{
  return '33333333'
}

/**
 * 表单内触发切换流程id
 * @param ctx   表单组件上下文，可以使用组件内部定义的变量和方法（方法必须defineExpose）
 * @param flowId 需要切换的flowId
 */
export const changeFlow=(ctx,flowId,nodeId)=>{
  console.log('changeFlow',flowId,nodeId)
  const message=useMessage()
  if(!flowId){
    message.warning('flowId错误，无法切换流程')
    return
  }
  ctx.exposed.changeFlow && ctx.exposed.changeFlow(flowId,nodeId)
}

/**
 * 请求
 * @param url 请求url
 * @param params 请求参数
 * @param type 不传位默认post 
 * @param headersType 请求头参数
 */
export const defRequest=async (url,params,type='post',headersType)=>{
  //加载url请求
  const res=type === 'get' ?
    await request.get({url: url,headersType,params:params}) : await request.post({url: url,headersType,data:params})
  return res
}

/**
 * 附件必填根据表单数据切换
 * @param ctx   表单组件上下文，可以使用组件内部定义的变量和方法（方法必须defineExpose）
 * @param formData 表单数据
 * @param fileTypeList
 * @param typeObj
 */
export function fileValidate(ctx,formData,fileTypeList,typeObj){
  (formData.attachmentList || []).forEach(item => {
    if(fileTypeList && fileTypeList.length && fileTypeList.includes(item.fileType)){
      typeObj.isRequire !== undefined && (item.isRequire = typeObj.isRequire)
      if(typeObj.isHidden !== 1 || !item.fileName){
        typeObj.isHidden !== undefined && (item.isHidden = typeObj.isHidden)
      }
    }
    if(typeObj.oriAttachmentId && item.oriAttachmentId === typeObj.oriAttachmentId){
      item.fileType = typeObj.fileType
      item.fileTypeText = typeObj.fileTypeText
      item.isRequire = typeObj.isRequire
    }
  })
  ctx.exposed.updateFormItem()
}

/**
 * 获取当前时间
 * @param format
 */
export const getCurDate=(format='YYYY-MM-DD hh:mm:ss')=>{
  return dayjs().format(format)
}

/**
 * 获取当前登陆人的部门id
 */
export const getDeptId=()=>{
  const userStore=useUserStore()
  const businessUserInfo=userStore.getBusinessUser || {}
  return businessUserInfo.departId
}

// 子表获取 formData
export const getFormData=(ctx)=>{
  return ctx.exposed.getFormData()
}

/**
 * 弹出信息提示框
 * @param fun 提示框类型
 * @param content 提示语
 * @param tips 提示tips
 */
export const messageUtil=(fun,content,tips)=>{
  const message=useMessage()
  return message[fun](content,tips)
}


//根据账户性质 账户类别自动生成表格数据
export const generateTableData=(ctx,formData,data1,data2,formObj,type)=>{
  console.log(data1,data2,'90++++++');
  console.log(formData,'90-----');
  let data2List = data2 ? data2.split(',') : []
  if(data1 && data2List && data2List.length){
    if(type === 0){
      formData['list_'+formObj['tableId_2']] = []
      formData['list_'+formObj['tableId_3']] = []
      formData['list_'+formObj['tableId_4']] = []
      formData[formObj['formId']]['ACCOUNT_CATEGORY_'+formObj['formId']] = null
    }else if(type === 1){
      formData['list_'+formObj['tableId_'+data1]] = formData['list_'+formObj['tableId_'+data1]].filter(item => {
        if(data2List.includes(item['ACCOUNT_CATEGORY_TYPE_'+formObj['tableId_'+data1]])){
          data2List = data2List.filter(item1 => item1 !== item['ACCOUNT_CATEGORY_TYPE_'+formObj['tableId_'+data1]])
          return true
        }else{
          return false
        }
      })
      if(data2List && data2List.length){
        formData['list_'+formObj['tableId_'+data1]] = [...formData['list_'+formObj['tableId_'+data1]],...data2List.map (item => {
          const obj = {}
          obj['ACCOUNT_CATEGORY_TYPE_'+formObj['tableId_'+data1]] = item
          obj['ACCOUNT_TYPE_'+formObj['tableId_'+data1]] = '券商普通账户'
          obj['SHAREHOLDER_TYPE_'+formObj['tableId_'+data1]] = '机构'
          obj['CURRENCY_'+formObj['tableId_'+data1]] = 'CNY'
          return obj
        })]
      }
    }
  }else{
    if(type === 1){
      formData[formObj['formId']]['ACCOUNT_CATEGORY_'+formObj['formId']] = null
    }
    formData['list_'+formObj['tableId_2']] = []
    formData['list_'+formObj['tableId_3']] = []
    formData['list_'+formObj['tableId_4']] = []
  }
}

export const beforeValidatebalance = (formData,tableId) => {
  const curTableData = formData[tableId]
  const {TRUST_FEE_RATE,ACTUAL_TRUST_RETURN_RATE,REAL_RATE_OF_RETURN,AMOUNT_OF_DAMAGES} = computedBalance(formData,tableId)
  if(TRUST_FEE_RATE !== curTableData[`TRUST_FEE_RATE_${tableId}`] || 
    ACTUAL_TRUST_RETURN_RATE !== curTableData[`ACTUAL_TRUST_RETURN_RATE_${tableId}`] ||
    REAL_RATE_OF_RETURN !== curTableData[`REAL_RATE_OF_RETURN_${tableId}`] ||
    AMOUNT_OF_DAMAGES !== curTableData[`AMOUNT_OF_DAMAGES_${tableId}`]
  ){
    const message=useMessage()
    message.warning('此时需重新点击【试算】按钮计算正确结果')
    return false
  }else{
    return true
  }
  //终止流程校验备份
  // ①累计实收信托=信托本金累计给付额；
  // if((#OVERALL_PROFITABILITY# == '0' || #OVERALL_PROFITABILITY# == '2') && #ACCUMULATED_PAID_IN_TRUST# != #ACCUMULATED_PAYMENT#){
  //     callback('累计实收信托=信托本金累计给付额')
  // }
  // callback()

  // ②实际收益=信托收益累计分配额+信托费用；
  // const value1 = renderUtil.BigNumberUtil.add(#ACCUMULATED_DISTRIBUTION#,#TRUST_FEES#,2)
  // if(#OVERALL_PROFITABILITY# == '0' && #REAL_RETURN# != value1){
  //     callback('实际收益=信托收益累计分配额+信托费用')
  // }else if(#OVERALL_PROFITABILITY# == '2' && #REAL_RETURN# != #TRUST_FEES#){
  //   callback('实际收益=信托费用')
  // }
  // callback()

  // 损失金额
  // const value1 = renderUtil.BigNumberUtil.subtract(#ACCUMULATED_PAID_IN_TRUST#,#ACCUMULATED_PAYMENT#,2)
  // const value2 = renderUtil.BigNumberUtil.subtract(#TRUST_FEES#,#REAL_RETURN#,2)
  // if(#OVERALL_PROFITABILITY# == '1' && #AMOUNT_OF_DAMAGES# != value1){
  //     callback('累计实收信托-信托本金累计给付额=损失金额')
  // }else if(#OVERALL_PROFITABILITY# == '1' && #AMOUNT_OF_DAMAGES# != value2){
  //     callback('信托费用-实际收益=损失金额')
  // }
  // callback()

  // ③信托收益累计分配额=0
  // if((#OVERALL_PROFITABILITY# == '1' || #OVERALL_PROFITABILITY# == '2') && #ACCUMULATED_DISTRIBUTION# != 0){
  //     callback('信托收益累计分配额=0')
  // }
}

export const validateIdNumber = (type, str) => {
  // 去除空格
  str = str.trim();
  //身份证及临时身份证 15位或18位，数字+字母(X)
  if(['0'].includes(type)){
    return {
      valid:/(^\d{15}$)|(^\d{17}(\d|X|x)$)/.test(str),
      message:'身份证号码应为15位数字或18位数字（最后一位可以是X/x）'
    }
  }else if(['5', '12'].includes(type)){
    // 户口簿、组织机构代码 9位数字
    return {
      valid: /^\d{9}$/.test(str),
      message: '户口簿、组织机构代码应为9位数字'
    }
  }else if(['22'].includes(type)){
    // '营业执照号':
    // 15/18位，18位时为数字或大写字母
    return {
      valid: /^\d{15}$|^[A-Z0-9]{18}$/.test(str),
      message: '营业执照号应为15位数字或18位数字/大写字母'
   }
  }else if(['1','6'].includes(type)){
    // '普通护照、外交护照、公务护照、公务普通护照':
    // 1位大写字母+8位数字 或 2位大写字母+7位数字
    return {
      valid: /^[A-Z]\d{8}$|^[A-Z]{2}\d{7}$/.test(str),
      message: '护照号码应为1位大写字母+8位数字或2位大写字母+7位数字'
    }
  }else if(['13'].includes(type)){
    // '统一社会信用代码':
    // 18位数字或字母
    return {
      valid: /^[A-Z0-9]{18}$/.test(str),
      message: '统一社会信用代码应为18位数字或字母'
    }
  }else if(['4'].includes(type)){
    // '港澳居民来往内地通行证':
    // 1位字母(H/M)+8/10位数字
    return {
      valid: /^[HM](\d{8}|\d{10})$/.test(str),
      message: '港澳居民来往内地通行证应为1位字母（H/M）+8位或10位数字'
  };
  }else if(['9'].includes(type)){
    // '台湾居民来往大陆通行证':
    // 新版8位或18位数字;旧版10位数字+英文字母
    return {
      valid: /^\d{8}$|^\d{18}$|^\d{10}[A-Za-z]$/.test(str),
      message: '台湾居民来往大陆通行证应为新版8位或18位数字，或旧版10位数字+英文字母'
    }
  }else if(['26'].includes(type)){
    // '信托产品登记编码':
    // 21/24位，ZXD开头+字母+数字
    return {
      valid: /^ZXD[A-Z0-9]{18,21}$/.test(str),
      message: '信托产品登记编码应为21/24位，以ZXD开头，后跟字母和数字'
    }
  }else{
    // '其他证件类型':
    // 40位以内
    return {
      valid: /^\d{1,40}$/.test(str),
      message: '其他证件类型应为40位以内的数字'
    }
  }
}
