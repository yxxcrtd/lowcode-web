/**
 * 表单联动规则
 * 初始化联动：批量执行；
 * 运行时联动：表单录入过程中联动；
 */
import { watch, ref } from 'vue'
import {checkRules, validateCondition} from "@/comRender/Core/linkage";
import {setComponentProps} from './components'
import {cloneDeep} from "lodash-es";
import {replaceMethodField} from "@/comRender/utils";
import * as renderUtil from '@/comRender/utils/renderUtil'

/**
 * 批量执行联动规则 用于执行初始化或编辑页面的运行时联动
 * @param linkageType
 * @param formGroups
 * @param formData
 */
export const runAllLinkage=(linkageType,formGroups,formData,ctx)=>{
  formGroups.forEach(formGroup => {
    //分组显隐
    if(formGroup.showConfig){
      formGroup.showConfig?.filter(sceneItem=>sceneItem.type==linkageType).forEach((sceneItem) => {
        if((sceneItem.ruleStr && sceneItem.setType==1) || (sceneItem.script && sceneItem.setType==2)){
          //分组显隐
          const ruleResult=checkLinkageRules(sceneItem,formData,ctx)
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
            const ruleResult=checkLinkageRules(sceneItem,formData,ctx)
            child.isHidden=!ruleResult
          })
        }
        child.formItems.forEach((formItem) => {
          checkItemLinkage(formItem,formData,linkageType,ctx)
        })
      })
    }
    formGroup.formItems.forEach(formItem => {
      //子表显隐
      if(formItem.isTableItem){
        formItem.showConfig?.filter(sceneItem=>sceneItem.type==linkageType).forEach((sceneItem) => {
          if(sceneItem.ruleStr){
            //子表显隐
            const ruleResult=checkLinkageRules(sceneItem,formData,ctx)
            formItem.isHidden=!ruleResult
          }
        })
        formItem.tableItems.forEach(tableItem => {
          checkItemLinkage(tableItem,formData,linkageType,ctx)
        })
      }else{
        checkItemLinkage(formItem,formData,linkageType,ctx)
      }
    })
  })
}


/**
 * 绑定需要监听字段的联动
 * 批量监听存在重复执行和性能问题
 * 需要监听对应的字段，执行对应的场景，防止未变化的字段导致联动重复执行
 * 将字段与场景id绑定，对应字段联动，执行对应场景
 */
export const bindFormLinkage=(pageInfo,formGroups,attachmentGroup,formData,tableId,ctx)=>{
  const fieldLinkageList=getFieldSceneList(pageInfo,tableId) || {}
  console.log('fieldLinkageList',pageInfo,tableId,fieldLinkageList)
  Object.keys(fieldLinkageList).forEach((key)=>{
    const item=fieldLinkageList[key]
    if(formData[item.moduleTableId]){
      watch(
        ()=>formData[item.moduleTableId][key],
        ()=>{
          //console.log('key',key,item)
          runFormLinkage(formGroups,attachmentGroup,formData,item.sceneList,ctx,tableId)
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
const runFormLinkage=(formGroups,attachmentGroup,formData,sceneList,ctx,tableId)=>{
  formGroups.forEach(formGroup => {
    //分组显隐
    if(formGroup.showConfig){
      formGroup.showConfig?.filter(sceneItem=>sceneList.includes(sceneItem.id)).forEach((sceneItem) => {
        if((sceneItem.ruleStr && sceneItem.setType==1) || (sceneItem.script && sceneItem.setType==2)){
          //分组显隐
          const ruleResult=checkLinkageRules(sceneItem,formData,ctx)
          formGroup.isHidden=!ruleResult
        }
      })
    }
    //子分组显隐
    if(formGroup.children?.length){
      formGroup.children.forEach(child=>{
        //分组显隐
        if(child.showConfig){
          child.showConfig?.filter(sceneItem=>sceneList.includes(sceneItem.id)).forEach((sceneItem) => {
            //分组显隐
            const ruleResult=checkLinkageRules(sceneItem,formData,ctx)
            child.isHidden=!ruleResult
          })
        }
        child.formItems.forEach((formItem) => {
          checkItemLinkage(formItem,formData,sceneList,ctx,tableId)
        })
      })
    }
    formGroup.formItems.forEach(formItem => {
      //子表显隐
      if(formItem.isTableItem){
        formItem.showConfig?.filter(sceneItem=>sceneList.includes(sceneItem.id)).forEach((sceneItem) => {
          if(sceneItem.ruleStr){
            //子表显隐
            const ruleResult=checkLinkageRules(sceneItem,formData,ctx)
            formItem.isHidden=!ruleResult
          }
        })
        formItem.tableItems.forEach(tableItem => {
          checkItemLinkage(tableItem,formData,sceneList,ctx,tableId)
        })
      }else{
        checkItemLinkage(formItem,formData,sceneList,ctx,tableId)
      }
    })
  })

  //检查附件联动
  //console.log('attachmentGroup',attachmentGroup)
  if(attachmentGroup && attachmentGroup.uploadFileList){
    attachmentGroup.uploadFileList.forEach(item=>{
      checkAttachmentLinkage(item,formData,sceneList,ctx)
    })
  }
}



/**
 * 执行具体表单项的联动规则
 * @param formItem
 * @param formData
 * @param linkageType
 */
const checkItemLinkage=(formItem,formData,sceneList,ctx,tableId)=>{
  if(formItem.pageLinkageRespVOS){
    formItem.pageLinkageRespVOS.forEach(linkageItem => {
      const curSceneList=linkageItem.sceneList?.filter(sceneItem=>sceneList.includes(sceneItem.id))
      if(curSceneList && curSceneList.length){
        const rightSceneList=curSceneList.filter((sceneItem) => {
          return checkLinkageRules(sceneItem, formData,ctx,tableId)
        })
        const ruleResult=!!(rightSceneList && rightSceneList.length)
        const sceneItem=ruleResult ? rightSceneList[rightSceneList.length-1] :null
        //console.log('ruleResult',linkageItem.linkageType,ruleResult,formItem)
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
        if(linkageItem.linkageType==='fill'){
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
const checkAttachmentLinkage=(attachmentItem,formData,sceneList,ctx)=>{
  if(attachmentItem.pageLinkageRespVOS){
    attachmentItem.pageLinkageRespVOS.forEach(linkageItem => {
      const curSceneList=linkageItem.sceneList?.filter(sceneItem=>sceneList.includes(sceneItem.id))
      if(curSceneList && curSceneList.length){
        const rightSceneList=curSceneList.filter((sceneItem) => {
          return checkLinkageRules(sceneItem, formData,ctx)
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
  if(!ruleResult && formData[formItem.moduleTableId] && formData[formItem.moduleTableId][formItem.field]){
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
const checkLinkageRules=(sceneItem,formData,ctx,tableId?)=>{
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
  //获取分组的规则
  apiInfo.pageGroups.forEach(item=>{
    if(item.showConfig && item.showConfig.length){
      item.showConfig.forEach((sceneItem) => {
        if(sceneItem.type=='RUN'){
          if(sceneItem.setType==1){
            sceneFieldList.push(...loopAssCondition(pageFieldList,sceneItem.id, sceneItem.condition))
          }else{
            sceneFieldList.push(...getScriptField(pageFieldList,sceneItem.id,sceneItem.script))
          }
        }
      })
    }
  })
  //如果是主表，不监听子表的联动
  //如果是子表，只处理对应子表的数据
  pageFieldList.filter(item=>{
    if(tableId){
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
  //获取子表的显隐规则
  if(apiInfo.tableLayoutConfig){
    apiInfo.tableLayoutConfig.forEach(item=>{
      if(item.showConfig && item.showConfig.length){
        item.showConfig.forEach((sceneItem) => {
          if(sceneItem.type=='RUN'){
            if(sceneItem.setType==1){
              sceneFieldList.push(...loopAssCondition(pageFieldList,sceneItem.id, sceneItem.condition))
            }else{
              sceneFieldList.push(...getScriptField(pageFieldList,sceneItem.id,sceneItem.script))
            }
          }
        })
      }
    })
  }

  //获取附件的联动规则
  if(pageInfo.attachmentInfo && pageInfo.attachmentInfo.uploadFileList){
    pageInfo.attachmentInfo.uploadFileList.forEach(item=>{
      if(item.pageLinkageRespVOS && item.pageLinkageRespVOS.length){
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
  }
  //合并字段
  const moduleFieldList={}
  sceneFieldList.forEach(item=>{
    if(moduleFieldList[item.field]){
      moduleFieldList[item.field].sceneList.push(item.sceneId)
    }else{
      moduleFieldList[item.field]={
        moduleTableId:item.moduleTableId,
        sceneList:[item.sceneId]
      }
    }
  })
  return moduleFieldList
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
  const sceneFieldList=[]
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
