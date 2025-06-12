import {callService} from "./callService";
import {openPageAction} from "./openPage"
import {customEventAction} from "./customEvent"
import {customScriptAction} from './customScript'

const bizMap={
  'create':()=>{
    return {
      actionType: 'openPage'
    }
  },
  'batchDelete':()=>{
    return {
      actionType: 'serverApi'
    }
  },
  'delete':()=>{
    return {
      actionType: 'serverApi'
    }
  },
  'export':()=>{
    return {
      actionType: 'serverApi'
    }
  },
  'edit':()=>{
    return {
      actionType: 'openPage'
    }
  },
  'detail':()=>{
    return {
      actionType: 'openPage'
    }
  }
}
/**
 * 低码页面按钮统一处理事件
 * @param btnItem
 * @param pageType
 * @param context
 * @param externalJsModule
 * @param row
 */
export const btnEvent=(btnItem,pageType,context,externalJsModule,data,formData,pageListConfigs)=>{
  console.log('btnaction',btnItem,pageType,context,externalJsModule,data)
  //如果未配置动作，按按钮默认类型处理
  if(!btnItem.showButtonActionCfg && bizMap[btnItem.operationType]){
    btnItem.showButtonActionCfg=bizMap[btnItem.operationType]()
  }
  //
  if(btnItem.showButtonActionCfg && btnItem.showButtonActionCfg.actionType){
    const actionType=btnItem.showButtonActionCfg.actionType
    if(actionType=="serverApi"){
      const callServiceCls=new callService(context,pageType,btnItem,data)
      callServiceCls.actionEvent()
    }else if(actionType=="openPage"){
      const openPageCls=new openPageAction(context,pageType,btnItem,data)
      openPageCls.actionEvent()
    }else if(actionType=="customEvent"){
      const customEventCls=new customEventAction(context,pageType,btnItem,data,externalJsModule)
      customEventCls.actionEvent()
    }else{
      const customScriptCls=new customScriptAction(context,btnItem,data,formData,pageListConfigs)
      customScriptCls.actionEvent()
    }
  }
}
