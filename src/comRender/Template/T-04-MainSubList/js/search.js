/**
 * 初始化表单项
 * @param pageInfo
 * @returns {{groupName: *, groupId, groupCode: *}[]}
 */
export const setFormItem=(apiInfo,formData)=>{
  //将表单项按照分组进行重组数据
  let formItemList=apiInfo.pageListConditions?.map(item => {
    //字段格式统一为‘字段名+表名’
    item.field=item.columnName+'_'+item.tableId
    item.label=item.columnNameAlias || item.columnComment
    //组装校验规则
    item.rules=getFormRules(item)
    //组装组件相关属性
    item.props=setComponentProps(item)

    formData.value[item.field] = item.columnDefault || ''
    return item
  })
  formItemList && formItemList.sort((a, b) => {
    return a.sort - b.sort
  })
  return formItemList
}
export const setComponentProps=(formItem)=>{
  let propsData=formItem.props || {};
  if(formItem.columnDictType){
    propsData.dict=formItem.columnDictType
  }
  return propsData
}
/**
 * 表单项校验规则处理
 * @param item
 * @returns {*[]}
 */
const getFormRules=(item)=>{
  let rulesList=[]
  if(item.isColumnRequire==1){
    rulesList.push({ required: true, message: '请输入' + item.columnComment, trigger: ['blur', 'change'] })
  }
  if(item.validateRulesRespVOS && item.validateRulesRespVOS.length){
    item.validateRulesRespVOS.forEach(ruleItem=>{
      //判断是否必填
      if(ruleItem.ruleType==='require'){
        rulesList.push({ required: true, message: '请输入' + item.columnComment, trigger: ['blur', 'change'] })
      }
      //判断是否长度校验

      //判断区间校验
      if(ruleItem.ruleType==='range'){
        rulesList.push({ min: rangeItem.min, max: rangeItem.max, message: '请输入指定范围数据', trigger: 'blur' })
      }
      //正则校验
      //接口校验
      //自定义方法校验
    })
  }
  return rulesList
}

export const assemblySearchField=(formData,apiInfo)=>{
  let queryField=[]
  Object.keys(formData).forEach((key)=>{
    const formItem=apiInfo.pageListConditions.find(item=>(item.columnName+'_'+item.tableId)==key)
    if(formItem && formData[key]){
      queryField.push({
        field:key,
        value:formData[key],
        queryOperator:formItem.columnQueryOperator,
        jdbcType:formItem.jdbcType
      })
    }
    console.log(formItem,queryField)
  })
  return queryField
}
