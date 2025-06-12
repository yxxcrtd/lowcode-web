import {getCommonVar} from '@/utils/commVars'
/**
 * 组件联动通用
 *
 * @Author: hujinge
 * @Date: 2025-2-6
 * @Description: 处理低码页面组件之间联动关系
 *
 */

//联动公式判断 计算符
const operatorMap = {
  and: '&&',
  or: '||'
}
/**
 * 根据运算符将公式转为数学公式
 */
const operatorOptionsMap = {
  //等于
  eq: function (a, b,componentType) {
    if(isDateTimeComponet(componentType)){
      return `new Date(${a})==new Date('${b}')`
    }else{
      return b ? `${a}=='${b}'` : `!${a}`
    }
  },
  //不等于
  ne: function (a, b,componentType) {
    if(isDateTimeComponet(componentType)){
      return `new Date(${a})!=new Date('${b}')`
    }else{
      return b ? `${a}!='${b}'` : `!!${a}`
    }
  },
  //大于
  gt: function (a, b,componentType) {
    if(isDateTimeComponet(componentType)){
      return `new Date(${a})>new Date('${b}')`
    }else{
      return `${a}>${b}`
    }
  },
  //大于等于
  gte: function (a, b,componentType) {
    if(isDateTimeComponet(componentType)){
      return `new Date(${a})>=new Date('${b}')`
    }else{
      return `${a}>=${b}`
    }
  },
  //小于
  lt: function (a, b,componentType) {
    if(isDateTimeComponet(componentType)){
      return `new Date(${a})<new Date('${b}')`
    }else{
      return `${a}<${b}`
    }
  },
  //小于等于
  lte: function (a, b,componentType) {
    if(isDateTimeComponet(componentType)){
      return `new Date(${a})<=new Date('${b}')`
    }else{
      return `${a}<=${b}`
    }
  },
  //属于
  in: function (a, b) {
    const bStr=JSON.stringify(b)
    return `${bStr}.some(item=>item==${a})`
  },
  //不属于
  ni: function (a, b) {
    const bStr=JSON.stringify(b)
    return `!${bStr}.some(item=>item==${a})`
  },
  //包含
  co: function (a, b) {
    const bStr=JSON.stringify(b)
    if(isWrappedInBrackets(bStr)){
      return `${bStr}.some(item => (${a} || []).includes(item.toString()))`;
    }else{
      return `[${bStr}].some(item => (${a} || []).includes(item.toString()))`;
    }
  },
  //不包含
  nco: function (a, b) {
    const bStr=JSON.stringify(b)
    if(isWrappedInBrackets(bStr)){
      return `!${bStr}.some(item => (${a} || []).includes(item.toString()))`;
    }else{
      return `![${bStr}].some(item => (${a} || []).includes(item.toString()))`;
    }
  }
}
const isDateTimeComponet=(componentType)=>{
  return ['ace-date-picker','ace-datetime-picker'].includes(componentType)
}
const isWrappedInBrackets=(str)=> {
  return /^\[.*\]$/.test(str);
}
const ruleTypeMap={
  normal:'normal',
  mergeTable:'mergeTable',
  noTable:'noTable',
}
/**
 * 生成表达式，表达式生成三种
 * 1.normal   主表默认，子表字段数据合并
 * 2.mergeTable  主表、子表合并到同级对象
 * 3.noTable   只有主表，不包含子表
 * @param formItemList
 * @param rules
 */
export const convertCondition = (formItemList, rules, ruleType) => {
  if(rules){
    //根据条件拼接表达式
    return loopAssCondition(formItemList, rules,ruleType)
  }else{
    return null
  }
}
/**
 * 根据表单配置，循环拼接表达式
 * @param formItemList
 * @param rules
 */
const loopAssCondition = (formItemList, rules,ruleType) => {
  //console.log('rules',rules)
  const curOperator = operatorMap[rules.operator]
  const conditStrList = rules.conditions.map((item) => {
    const conditionFormItem=formItemList.find(formItem=>formItem.fieldId===item.field)
    //校验规则不支持配置子表字段，子表是多条，无法确定数据，对子表进行过滤。子表字段的规则不处理；todo
    if(conditionFormItem){
      if(ruleType==ruleTypeMap.noTable && conditionFormItem.childTableId){
        return null
      }
      //console.log('conditionFormItem',conditionFormItem,conditionFormItem.columnComent,rules.conditions,item.operator)
      let formDataField= ''
      if(ruleType==ruleTypeMap.mergeTable){
        formDataField=`(formData['${conditionFormItem.moduleTableId}'] && formData['${conditionFormItem.moduleTableId}']['${conditionFormItem.columnName+'_'+conditionFormItem.moduleTableId}'])`
      }else{
        if(conditionFormItem.childTableId){
          formDataField=`(formData['list_${conditionFormItem.moduleTableId}'] && formData['list_${conditionFormItem.moduleTableId}'].map(item=> item['${conditionFormItem.moduleTableId}'] && item['${conditionFormItem.moduleTableId}']['${conditionFormItem.columnName+'_'+conditionFormItem.moduleTableId}']))`
        }else{
          formDataField=`(formData['${conditionFormItem.moduleTableId}'] && formData['${conditionFormItem.moduleTableId}']['${conditionFormItem.columnName+'_'+conditionFormItem.moduleTableId}'])`
        }
      }
      let tempValue=item.value
      if(item.valueType==='2'){
        tempValue=getCommonVar(tempValue.replace(/^#+|#+$/g, ''))
      }
      return operatorOptionsMap[item.operator](formDataField, tempValue,conditionFormItem.columnDisplayComponent)
    }else{
      return null
    }
  }).filter(item=>item)
  if (rules.groups && rules.groups.length) {
    rules.groups.forEach((item) => {
      const conditStrItem=loopAssCondition(formItemList, item,ruleType)
      if(conditStrItem){
        conditStrList.push('('+conditStrItem+')')
      }
    })
  }
  //console.log('conditStrList：',conditStrList,conditStrList.join(' '+curOperator+' '))
  return conditStrList && conditStrList.length ? conditStrList.join(' '+curOperator+' ') : null
}
