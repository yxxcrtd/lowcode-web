/**
 * 初始化联动规则
 */
import { convertCondition} from "./rulesConvert";
import {replaceMethodField} from "@/comRender/utils";


/**
 * 联动规则配置
 * @param pageFieldList
 * @param formItem
 * @returns {null}
 */
export const getLinkageRule = (pageFieldList, formItem) => {
  if (formItem.pageLinkageRespVOS) {
    formItem.pageLinkageRespVOS.forEach((linkageItem) => {
      linkageItem.sceneList?.forEach((sceneItem) => {
        if(sceneItem.setType==1){
          sceneItem['ruleStr_normal'] = convertCondition(pageFieldList, sceneItem.condition,'normal')
          sceneItem['ruleStr_mergeTable'] = convertCondition(pageFieldList, sceneItem.condition,'mergeTable')
          sceneItem['ruleStr_noTable'] = convertCondition(pageFieldList, sceneItem.condition,'noTable')
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
          sceneItem['ruleStr_normal'] = convertCondition(pageFieldList, sceneItem.condition,'normal')
          sceneItem['ruleStr_mergeTable'] = convertCondition(pageFieldList, sceneItem.condition,'mergeTable')
          sceneItem['ruleStr_noTable'] = convertCondition(pageFieldList, sceneItem.condition,'noTable')
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
        sceneItem['ruleStr_normal'] = convertCondition(pageFieldList, sceneItem.condition,'normal')
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
          sceneItem['ruleStr_normal'] = convertCondition(apiInfo.pageListConfigs, sceneItem.condition,'normal')
          sceneItem['ruleStr_mergeTable'] = convertCondition(apiInfo.pageListConfigs, sceneItem.condition,'mergeTable')
          sceneItem['ruleStr_noTable'] = convertCondition(apiInfo.pageListConfigs, sceneItem.condition,'noTable')
        })
      } else {
        return null
      }
    }
  }
}
