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
      return b ? `${a}!='${b}'` : `!${a}`
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
    return `${bStr}.some(item => (${a} || []).includes(item.toString()))`;
  },
  //不包含
  nco: function (a, b) {
    const bStr=JSON.stringify(b)
    return `!${bStr}.some(item => (${a} || []).includes(item.toString()))`;
  }
}
const isDateTimeComponet=(componentType)=>{
  return ['ace-date-picker','ace-datetime-picker'].includes(componentType)
}
/**
 * 校验联动规则
 * @param linkageItem
 * @param formData
 */
export const checkRules=(linkageItem,formData,defReturn=true,tableId?)=>{
  try{
    if(!formData){
      return false
    }
    if(linkageItem.setType==='1'){
      const ruleField=tableId ? 'tableRuleStr':'ruleStr'
      //console.log('linkageItem-ruleStr',linkageItem[ruleField],formData)
      return linkageItem[ruleField] ? eval(linkageItem[ruleField]) : false
    }else{
      //执行script
      return defReturn
    }
  }catch(e){
    console.log('ruleStr:',linkageItem.ruleStr)
    console.error('执行联动报错',e)
  }
}
/**
 * 拼接表达式
 * @param formItemList
 * @param rules
 */
export const validateCondition = (formItemList, rules,isFilterTable) => {
  if(rules){
    //根据条件拼接表达式
    return loopAssCondition(formItemList, rules,isFilterTable)
  }else{
    return null
  }
}
/**
 * 根据表单配置，循环拼接表达式
 * @param formItemList
 * @param rules
 */
const loopAssCondition = (formItemList, rules,isFilterTable) => {
  //console.log('rules',rules)
  const curOperator = operatorMap[rules.operator]
  const conditStrList = rules.conditions.map((item) => {
    const conditionFormItem=formItemList.find(formItem=>formItem.fieldId===item.field)
    //校验规则不支持配置子表字段，子表是多条，无法确定数据，对子表进行过滤。子表字段的规则不处理；todo
    if(conditionFormItem){
      if(isFilterTable && conditionFormItem.childTableId){
        return null
      }
      //console.log('conditionFormItem',conditionFormItem,conditionFormItem.columnComent,rules.conditions,item.operator)
      const formDataField=`(formData['${conditionFormItem.moduleTableId}'] && formData['${conditionFormItem.moduleTableId}']['${conditionFormItem.columnName+'_'+conditionFormItem.moduleTableId}'])`
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
      const conditStrItem=loopAssCondition(formItemList, item,isFilterTable)
      if(conditStrItem){
        conditStrList.push('('+conditStrItem+')')
      }
    })
  }
  //console.log('conditStrList：',conditStrList,conditStrList.join(' '+curOperator+' '))
  return conditStrList && conditStrList.length ? conditStrList.join(' '+curOperator+' ') : null
}

export const tableRowCheckRules=(row,rules)=>{
  //console.log('row',row)
  if(rules){
    return eval(rules)
  }else{
    return true
  }
}
/**
 * 拼接行内按钮菜单表达式
 * @param validateRowCondition
 * @param rules
 */
export const validateRowCondition = (tableColumns, rules) => {
  if(rules.conditions && rules.conditions.length > 0){
    //根据条件拼接表达式
    return loopRowAssCondition(tableColumns, rules)
  }else{
    return null
  }
}
const loopRowAssCondition = (tableColumns, rules) => {
  const curOperator = operatorMap[rules.operator]
  const conditStrList = rules.conditions.map((item) => {
    const conditionFormItem=tableColumns.find(tableItem=>tableItem.fieldId===item.field) 
    if(conditionFormItem){
      const formDataField=`row['${conditionFormItem.columnName+'_'+conditionFormItem.moduleTableId}']`
      return operatorOptionsMap[item.operator](formDataField, item.value)
    }else{
      return null
    }
  }).filter(item=>item)
  if (rules.groups && rules.groups.length) {
    rules.groups.forEach((item) => {
      conditStrList.push('('+loopRowAssCondition(tableColumns, item)+')')
    })
  }
  return conditStrList.join(' '+curOperator+' ')
}
