/**
 * 批量执行联动
 */
import {checkRules, validateCondition} from "@/comRender/render/v1/Core/linkage";
import {setComponentProps} from './components'
import {cloneDeep} from "lodash-es";
import {replaceMethodField} from "@/comRender/utils";
import * as renderUtil from '@/comRender/utils/renderUtil'


/**
 * 联动规则配置
 * @param pageFieldList
 * @param formItem
 * @returns {null}
 */
export const getLinkageRule = (pageFieldList, formItem,isFilterTable=false,ruleField='ruleStr') => {
  if (formItem.pageLinkageRespVOS) {
    formItem.pageLinkageRespVOS.forEach((linkageItem) => {
      linkageItem.sceneList?.forEach((sceneItem) => {
        if(sceneItem.setType==1){
          sceneItem[ruleField] = validateCondition(pageFieldList, sceneItem.condition,isFilterTable)
        }
        if(sceneItem.setType==2) {
          sceneItem.scriptStr=replaceMethodField(sceneItem.script,pageFieldList);
        }
      })
    })
  } else {
    return null
  }
}

/**
 * 联动规则配置
 * @param pageFieldList
 * @param formItem
 * @returns {null}
 */
export const initAttacementLinkageRule = (pageFieldList, attachmentItem) => {
  if (attachmentItem.pageLinkageRespVOS) {
    attachmentItem.pageLinkageRespVOS.forEach((linkageItem) => {
      linkageItem.sceneList?.forEach((sceneItem) => {
        if(sceneItem.setType==1){
          sceneItem.ruleStr = validateCondition(pageFieldList, sceneItem.condition)
        }
        if(sceneItem.setType==2) {
          sceneItem.scriptStr=replaceMethodField(sceneItem.script,pageFieldList);
        }
      })
    })
  } else {
    return null
  }
}
/**
 * 联动规则配置
 * @param pageFieldList
 * @param formItem
 * @returns {null}
 */
export const getGroupLinkageRule = (groupItem,pageFieldList) => {
  if (groupItem.showConfig) {
    groupItem.showConfig?.forEach((sceneItem) => {
      if(sceneItem.setType=='1'){
        sceneItem.ruleStr = validateCondition(pageFieldList, sceneItem.condition)
      }else{
        sceneItem.scriptStr=replaceMethodField(sceneItem.script,pageFieldList);
      }
    })
  } else {
    return null
  }
}
/**
 * 初始化表格联动规则配置
 * @param pageFieldList
 * @param formItem
 * @returns {null}
 */
export const getTableLinkageRule = (tableItem,apiInfo) => {
  if(apiInfo.tableLayoutConfig){
    const curTableConfig=apiInfo.tableLayoutConfig.find(item=>item.tableId==tableItem.tableId)
    if(curTableConfig){
      if (curTableConfig.showConfig) {
        tableItem.showConfig=curTableConfig.showConfig
        tableItem.showConfig?.forEach((sceneItem) => {
          sceneItem.ruleStr = validateCondition(apiInfo.pageListConfigs, sceneItem.condition)
        })
      } else {
        return null
      }
    }
  }
}
/**
 * 执行联动规则
 * @param linkageType
 * @param formGroups
 * @param formData
 */
export const formLinkage=(linkageType,formGroups,attachmentGroup,formData,tableId)=>{
  //console.log('linkageType',linkageType,formGroups,formData)
  formGroups.forEach(formGroup => {
    //分组显隐
    if(formGroup.showConfig){
      formGroup.showConfig?.filter(sceneItem=>sceneItem.type==linkageType).forEach((sceneItem) => {
        if((sceneItem.ruleStr && sceneItem.setType==1) || (sceneItem.script && sceneItem.setType==2)){
          //分组显隐
          const ruleResult=checkLinkageRules(sceneItem,formData)
          formGroup.isHidden=!ruleResult
        }
      })
    }
    //子分组显隐
    if(formGroup.children?.length){
      formGroup.children.forEach(child=>{
        //分组显隐
        if(child.showConfig){
          child.showConfig?.filter(sceneItem=>sceneItem.type==linkageType).forEach((sceneItem) => {
            //分组显隐
            const ruleResult=checkLinkageRules(sceneItem,formData)
            child.isHidden=!ruleResult
          })
        }
        child.formItems.forEach((formItem) => {
          checkItemLinkage(formItem,formData,linkageType)
        })
      })
    }
    formGroup.formItems.forEach(formItem => {
      //子表显隐
      if(formItem.isTableItem){
        formItem.showConfig?.filter(sceneItem=>sceneItem.type==linkageType).forEach((sceneItem) => {
          if(sceneItem.ruleStr){
            //子表显隐
            const ruleResult=checkLinkageRules(sceneItem,formData)
            formItem.isHidden=!ruleResult
          }
        })
        formItem.tableItems.forEach(tableItem => {
          checkItemLinkage(tableItem,formData,linkageType,tableId)
        })
      }else{
        checkItemLinkage(formItem,formData,linkageType,tableId)
      }
    })
  })
  //检查附件联动
  if(attachmentGroup && attachmentGroup.uploadFileList){
    attachmentGroup.uploadFileList.forEach(item=>{
      checkAttachmentLinkage(item,formData,linkageType)
    })
  }
}
const checkItemLinkage=(formItem,formData,linkageType,tableId?)=>{
  if(formItem.pageLinkageRespVOS){
    formItem.pageLinkageRespVOS.forEach(linkageItem => {
      const curSceneList=linkageItem.sceneList?.filter(sceneItem=>sceneItem.type==linkageType)
      if(curSceneList && curSceneList.length){
        const rightSceneList=curSceneList.filter((sceneItem) => {
          return checkLinkageRules(sceneItem, formData,tableId)
        })
        const ruleResult=!!(rightSceneList && rightSceneList.length)
        const sceneItem=ruleResult ? rightSceneList[rightSceneList.length-1] :null
        //console.log('ruleResult',formItem.columnComment,formItem,ruleResult,sceneItem)
        //必填
        if(linkageItem.linkageType==='require'){
          requiredLinkage(ruleResult,formItem)
        }
        //显隐联动
        if(!formItem.nodeIsHidden && linkageItem.linkageType==='hidden'){
          showHiddenLinkage(ruleResult,formItem,formData)
        }
        //置灰联动
        if(!formItem.nodeIsDisabled && linkageItem.linkageType==='disabled'){
          disabledLinkage(ruleResult,formItem)
        }
        //加载数据
        if(linkageItem.linkageType==='reloadData'){
          reloadDataLinkage(ruleResult,formItem)
        }
        //赋值
        if(!formItem.childTableId && linkageItem.linkageType==='fill'){
          fillLinkage(ruleResult,sceneItem,formItem,formData)
        }
        //切换输入类型
        if(linkageItem.linkageType==='changeInputType'){
          changeInputTypeLinkage(ruleResult,sceneItem,formItem)
        }
      }
    })
  }
}
const checkAttachmentLinkage=(attachmentItem,formData,linkageType)=>{
  if(attachmentItem.pageLinkageRespVOS){
    attachmentItem.pageLinkageRespVOS.forEach(linkageItem => {
      const curSceneList=linkageItem.sceneList?.filter(sceneItem=>sceneItem.type==linkageType)
      if(curSceneList && curSceneList.length){
        const rightSceneList=curSceneList.filter((sceneItem) => {
          return checkLinkageRules(sceneItem, formData)
        })
        const ruleResult=!!(rightSceneList && rightSceneList.length)
        //console.log('ruleResult',ruleResult,sceneItem)
        //必填
        if(linkageItem.linkageType==='require'){
          attachmentRequiredLinkage(ruleResult,attachmentItem,formData)
        }
        //显隐联动
        if(linkageItem.linkageType==='hidden'){
          attachmentShowHiddenLinkage(ruleResult,attachmentItem,formData)
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
const requiredLinkage=(ruleResult,formItem)=>{
  if(ruleResult){
    formItem.rules.push({ required: true, message: '请输入' + formItem.columnComment, trigger: ['blur', 'change'] })
  }else{
    formItem.rules=formItem.rules.filter(rule => !rule.required)
  }
}
/**
 * 显隐联动
 * @param ruleResult
 * @param formItem
 */
const showHiddenLinkage=(ruleResult,formItem,formData)=>{
  //显隐联动隐藏是，清空对应数据
  if(!ruleResult && !formItem.isHidden && formData[formItem.moduleTableId] && formData[formItem.moduleTableId][formItem.field]){
    //console.log('showHiddenLinkage',formItem,formData,formData[formItem.moduleTableId][formItem.field])
    formData[formItem.moduleTableId][formItem.field]=null
    //如果是日期区间，需要清空对应开始、结束日期
    if(['ace-date-range-picker','ace-datetime-range-picker'].includes(formItem.columnDisplayComponent)){
      formData[formItem.moduleTableId][formItem.startDateField]=null
      formData[formItem.moduleTableId][formItem.endDateField]=null
    }
  }
  formItem.isHidden=!ruleResult
}
/**
 * 置灰联动
 * @param ruleResult
 * @param formItem
 */
const disabledLinkage=(ruleResult,formItem)=>{
  formItem.isDisabled=ruleResult
}
/**
 * 重新加载数据
 * @param ruleResult
 * @param formItem
 */
const reloadDataLinkage=(ruleResult,formItem)=>{
  if(ruleResult){
    formItem.props.reloadTag=Math.random()
  }
}
/**
 * 赋值联动
 * @param ruleResult
 * @param linageItem
 * @param formItem
 * @param formData
 */
const fillLinkage=(ruleResult,sceneItem,formItem,formData)=>{
  if(ruleResult){
    if(formData[formItem.moduleTableId]){
      formData[formItem.moduleTableId][formItem.field]=sceneItem.fillValue
      formItem.isLinkageFillValue=true
    }
  }else{
    //联动赋值，如果取消联动，清空之前的联动赋值
    if(formItem.isLinkageFillValue){
      formData[formItem.moduleTableId][formItem.field]=null
      formItem.isLinkageFillValue=false
    }
  }
}


/**
 * 校验必填联动
 * @param linkageType
 * @param linkageItem
 * @param formItem
 * @param formData
 */
const attachmentRequiredLinkage=(ruleResult,formItem,formData)=>{
  if(formData.attachmentList){
    const targetAttachmentItem=formData.attachmentList.find(item=>item.oriAttachmentId===formItem.id)
    if(targetAttachmentItem){
      if(ruleResult){
        targetAttachmentItem.isRequire=true
      }else{
        targetAttachmentItem.isRequire=false
      }
    }
  }
}
/**
 * 显隐联动
 * @param ruleResult
 * @param formItem
 */
const attachmentShowHiddenLinkage=(ruleResult,formItem,formData)=>{
  const targetAttachmentItem=formData.attachmentList?.find(item=>item.oriAttachmentId===formItem.id)
  if(targetAttachmentItem){
    targetAttachmentItem.isHidden=!ruleResult
  }
}
/**
 * 切换输入类型联动
 * @param ruleResult
 * @param formItem
 */
const changeInputTypeLinkage=(ruleResult,sceneItem,formItem)=>{
  //console.log(ruleResult,sceneItem,formItem)
  if(ruleResult){
    if(!formItem.isChangeInput){
      //记录老的组件类型和属性
      formItem.oriColumnDisplayComponent=formItem.columnDisplayComponent
      formItem.oriProps=cloneDeep(formItem.props)
    }
    //设置新的组件
    formItem.columnDisplayComponent=sceneItem.columnDisplayComponent
    formItem.props=setComponentProps(formItem,sceneItem.columnDisplayComponent,sceneItem.columnComponentAttributeDO)
    formItem.isChangeInput=true
  }else{
    if(formItem.oriColumnDisplayComponent){
      //还原组件
      formItem.columnDisplayComponent=formItem.oriColumnDisplayComponent
      formItem.props=cloneDeep(formItem.oriProps)
      formItem.isChangeInput=false
    }
  }
}
/**
 * 校验联动规则
 * @param linkageType
 * @param sceneItem
 * @param formData
 */
const checkLinkageRules=(sceneItem,formData,tableId?)=>{
  //判断是公式 还是 脚本
  let ruleResult=false
  if(sceneItem.setType==1){
    ruleResult=checkRules(sceneItem,formData,true,tableId)
  }else{
    //执行脚本
    const scriptStr=sceneItem.scriptStr
    if(scriptStr){
      //console.log('customMethodScript',customMethodScript)
      try{
        const customFunc=new Function(scriptStr)
        //执行自定义校验函数，自定义函数是一个字符串，先通过Function转为函数，再传参执行方法；
        ruleResult=customFunc()(formData,renderUtil)
      } catch (e){
        console.error(scriptStr)
        console.error('自定义方法执行异常:',e)
      }
    }
    
  }
  return ruleResult
}
