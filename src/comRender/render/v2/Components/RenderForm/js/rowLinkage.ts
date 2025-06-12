/**
 * 表格行内 联动规则
 * 初始化联动：批量执行；
 * 运行时联动：表单录入过程中联动；
 */
import { watch } from 'vue'
import {checkRules} from "@/comRender/Core/linkage";
import {setComponentProps} from './components'
import {cloneDeep} from "lodash-es";
import * as renderUtil from '@/comRender/utils/renderUtil'

/**
 * 批量执行联动规则 用于执行初始化或编辑页面的运行时联动
 * @param linkageType
 * @param formGroups
 * @param formData
 */
export const runRowAllLinkage=(ctx,linkageType,formGroups,tableId,formData,row)=>{
  formData={
    [tableId]:row,
    ...formData
  }
  formGroups.tableItems.forEach(formItem => {
    checkItemLinkage(ctx,linkageType,formItem,formData,row,null)
  })
}


/**
 * 绑定需要监听字段的联动
 * 批量监听存在重复执行和性能问题
 * 需要监听对应的字段，执行对应的场景，防止未变化的字段导致联动重复执行
 * 将字段与场景id绑定，对应字段联动，执行对应场景
 */
export const bindRowFormLinkage=(ctx,pageInfo,formGroups,tableId,formData,row)=>{
  const {formFieldLinkageList,rowFieldLinkageList}=getFieldSceneList(pageInfo,tableId) || {}
  console.log('row-fieldLinkageList',pageInfo,formFieldLinkageList,rowFieldLinkageList)
  //添加对外层主表单数据的监听
  Object.keys(formFieldLinkageList).forEach((key)=>{
    const item=formFieldLinkageList[key]
    if(formData){
      watch(
        ()=>formData[key],
        ()=>{
          console.log('formFieldLinkageList-key',key,item)
          runFormLinkage(ctx,'RUN',formGroups,formData,row,item.sceneList)
        }
      )
    }
  })
  //添加对行内字段变化的监听
  Object.keys(rowFieldLinkageList).forEach((key)=>{
    const item=rowFieldLinkageList[key]
    if(row){
      console.log('rrrrrr',key,row[key])
      watch(
        ()=>row[key],
        ()=>{
          console.log('rowFieldLinkageList-key',key,item)
          runFormLinkage(ctx,'RUN',formGroups,formData,row,item.sceneList)
        }
      )
    }
  })
}
/**
 * 执行指定联动
 * @param formGroups
 * @param formData
 * @param sceneList
 */
const runFormLinkage=(ctx,linkageType,formGroups,formData,row,sceneList)=>{
  formGroups.tableItems.forEach(formItem => {
    checkItemLinkage(ctx,linkageType,formItem,formData,row,sceneList)
  })
}



/**
 * 执行具体表单项的联动规则
 * @param formItem
 * @param formData
 * @param linkageType
 */
const checkItemLinkage=(ctx,linkageType,formItem,formData,row,sceneList)=>{
  if(formItem.pageLinkageRespVOS){
    formItem.pageLinkageRespVOS.forEach(linkageItem => {
      const curSceneList=linkageItem.sceneList?.filter(sceneItem=> sceneList ? sceneList.includes(sceneItem.id) : sceneItem.linkageType==linkageType)
      if(curSceneList && curSceneList.length){
        const rightSceneList=curSceneList.filter((sceneItem) => {
          return checkLinkageRules(sceneItem, formData,ctx)
        })
        const ruleResult=!!(rightSceneList && rightSceneList.length)
        const sceneItem=ruleResult ? rightSceneList[rightSceneList.length-1] :null
        console.log('ruleResult',linkageItem.linkageType,ruleResult,formItem)
        //必填
        if(linkageItem.linkageType==='require'){
          requiredLinkage(ruleResult,formItem,row)
        }
        //显隐联动
        if(!formItem.nodeIsHidden && linkageItem.linkageType==='hidden'){
          showHiddenLinkage(ruleResult,formItem,row)
        }
        //置灰联动
        if(!formItem.nodeIsDisabled && linkageItem.linkageType==='disabled'){
          disabledLinkage(ruleResult,formItem,row)
        }
        //加载数据
        if(linkageItem.linkageType==='reloadData'){
          reloadDataLinkage(ruleResult,formItem,row)
        }
        //赋值
        if(linkageItem.linkageType==='fill'){
          fillLinkage(ruleResult,sceneItem,formItem,row)
        }
        //切换输入类型
        if(linkageItem.linkageType==='changeInputType'){
          changeInputTypeLinkage(ruleResult,sceneItem,formItem,row)
        }
      }
    })
  }
}
/**
 * 校验必填联动
 * @param linkageType
 * @param linkageItem
 * @param formItem
 * @param formData
 */
const requiredLinkage=(ruleResult,formItem,row)=>{
  row._isRequired=!ruleResult
}
/**
 * 显隐联动
 * @param ruleResult
 * @param formItem
 */
const showHiddenLinkage=(ruleResult,formItem,row)=>{
  //显隐联动隐藏是，清空对应数据
  if(!ruleResult && row && row[formItem.field]){
    //console.log('showHiddenLinkage',formItem,formData,formData[formItem.moduleTableId][formItem.field])
    row[formItem.field]=null
    //如果是日期区间，需要清空对应开始、结束日期
    if(['ace-date-range-picker','ace-datetime-range-picker'].includes(formItem.columnDisplayComponent)){
      row[formItem.startDateField]=null
      row[formItem.endDateField]=null
    }
  }
  row._isHidden=!ruleResult
}
/**
 * 置灰联动
 * @param ruleResult
 * @param formItem
 */
const disabledLinkage=(ruleResult,formItem,row)=>{
  row._isDisabled=ruleResult
}
/**
 * 重新加载数据
 * @param ruleResult
 * @param formItem
 */
const reloadDataLinkage=(ruleResult,formItem,row)=>{
  if(ruleResult){
    row._props.reloadTag=Math.random()
  }
}
/**
 * 赋值联动
 * @param ruleResult
 * @param linageItem
 * @param formItem
 * @param formData
 */
const fillLinkage=(ruleResult,sceneItem,formItem,row)=>{
  if(ruleResult){
    if(row[formItem.moduleTableId]){
      row[formItem.field]=sceneItem.fillValue
      row._isLinkageFillValue=true
    }
  }else{
    //联动赋值，如果取消联动，清空之前的联动赋值
    if(row.isLinkageFillValue){
      row[formItem.field]=null
      row._isLinkageFillValue=false
    }
  }
}
/**
 * 切换输入类型联动
 * @param ruleResult
 * @param formItem
 */
const changeInputTypeLinkage=(ruleResult,sceneItem,formItem,row)=>{
  //console.log(ruleResult,sceneItem,formItem)
  if(ruleResult){
    if(!row._isChangeInput){
      //记录老的组件类型和属性
      row._oriColumnDisplayComponent=row._columnDisplayComponent
      row._oriProps=cloneDeep(row._props)
    }
    //设置新的组件
    row._columnDisplayComponent=sceneItem.columnDisplayComponent
    row._props=setComponentProps(formItem,sceneItem.columnDisplayComponent,sceneItem.columnComponentAttributeDO)
    row._isChangeInput=true
  }else{
    if(row.oriColumnDisplayComponent){
      //还原组件
      row._columnDisplayComponent=row._oriColumnDisplayComponent
      row._props=cloneDeep(row._oriProps)
      row._isChangeInput=false
    }
  }
}
/**
 * 校验联动规则
 * @param linkageType
 * @param sceneItem
 * @param formData
 */
const checkLinkageRules=(sceneItem,formData,ctx)=>{
  //判断是公式 还是 脚本
  let ruleResult=false
  if(sceneItem.setType==1){
    ruleResult=checkRules(sceneItem,formData)
  }else{
    //执行脚本
    const scriptStr=sceneItem.scriptStr
    if(scriptStr){
      //console.log('customMethodScript',customMethodScript)
      try{
        const customFunc=new Function(scriptStr)
        //执行自定义校验函数，自定义函数是一个字符串，先通过Function转为函数，再传参执行方法；
        ruleResult=customFunc()(ctx,null,formData,renderUtil)
      } catch (e){
        console.error(scriptStr)
        console.error('自定义方法执行异常:',e)
      }
    }
    
  }
  return ruleResult
}

const getFieldSceneList=(pageInfo,tableId)=>{
  console.log('pageInfo',pageInfo)
  const apiInfo=pageInfo.pageApiRespVOS.find(item=>item.apiCode=='form-create')
  const pageFieldList=apiInfo.pageListConfigs
  const sceneFieldList:any=[]
  //如果是主表，不监听子表的联动
  //如果是子表，只处理对应子表的数据
  pageFieldList.filter(item=>{
    if(item.childTableId){
      return item.moduleTableId==tableId
    }else{
      return true
    }
  }).forEach(item=>{
    if(item.pageLinkageRespVOS){
      item.pageLinkageRespVOS.forEach((linkageItem) => {
        linkageItem.sceneList?.forEach((sceneItem) => {
          if(sceneItem.type=='RUN'){
            if(sceneItem.setType==1){
              sceneFieldList.push(...loopAssCondition(pageFieldList,sceneItem.id, sceneItem.condition))
            }else{
              sceneFieldList.push(...getScriptField(pageFieldList,sceneItem.id,sceneItem.script))
            }
          }
        })
      })
    }
  })

  //合并字段
  const formFieldLinkageList={}
  const rowFieldLinkageList={}
  sceneFieldList.forEach(item=>{
    if(formFieldLinkageList[item.field]){
      formFieldLinkageList[item.field].sceneList.push(item.sceneId)
    }else if(rowFieldLinkageList[item.field]){
      rowFieldLinkageList[item.field].sceneList.push(item.sceneId)
    }else{
      if(item.moduleTableId===tableId){
        rowFieldLinkageList[item.field]={
          moduleTableId:item.moduleTableId,
          sceneList:[item.sceneId]
        }
      }else{
        formFieldLinkageList[item.field]={
          moduleTableId:item.moduleTableId,
          sceneList:[item.sceneId]
        }
      }
    }
  })
  //分解成两个数组
  return {
    formFieldLinkageList:formFieldLinkageList,
    rowFieldLinkageList:rowFieldLinkageList
  }
}
/**
 * 根据表单配置，循环拼接表达式
 * @param formItemList
 * @param rules
 */
const loopAssCondition = (pageFieldList,scendId, conditionItem) => {
  //console.log('loopAssCondition',conditionItem)
  const sceneFieldList = conditionItem?.conditions.map((item) => {
    const conditionFormItem=pageFieldList.find(formItem=>formItem.fieldId===item.field)
    //校验规则不支持配置子表字段，子表是多条，无法确定数据，对子表进行过滤。子表字段的规则不处理；todo
    if(conditionFormItem){
      return {
        sceneId:scendId,
        moduleTableId:conditionFormItem.moduleTableId,
        field:conditionFormItem.columnName+'_'+conditionFormItem.moduleTableId
      }
    }else{
      return null
    }
  }).filter(item=>item)
  if (conditionItem.groups && conditionItem.groups.length) {
    conditionItem.groups.forEach((item) => {
      const childSceneFieldList=loopAssCondition(pageFieldList,scendId, item)
      if(childSceneFieldList){
        sceneFieldList.push(childSceneFieldList)
      }
    })
  }
  //console.log('conditStrList：',conditStrList,conditStrList.join(' '+curOperator+' '))
  return sceneFieldList
}

const getScriptField=(pageFieldList,scendId,script)=>{
  const sceneFieldList:any=[]
  pageFieldList.forEach(item=>{
    if(script.indexOf(item.columnName)>-1){
      sceneFieldList.push(
        {
          sceneId:scendId,
          moduleTableId:item.moduleTableId,
          field:item.columnName+'_'+item.moduleTableId
        }
      )
    }
  })
  return sceneFieldList
}
