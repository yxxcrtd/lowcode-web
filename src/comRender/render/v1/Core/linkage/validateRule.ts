import * as renderUtil from '@/comRender/utils/renderUtil'

/**
 * 校验联动规则
 * @param linkageItem
 * @param formData
 */
export const checkRules=(sceneItem,formData,ctx,ruleType='normal',formItem)=>{
  let ruleResult=false
  const ruleField='ruleStr_'+ruleType
  try{
    if(!formData){
      return false
    }
    if(sceneItem.setType=='1'){
      //console.log('linkageItem-ruleStr',ruleType,ruleField,sceneItem[ruleField],formData)
      ruleResult = sceneItem[ruleField] ? eval(sceneItem[ruleField]) : false
    }else{
      //执行script
      //执行脚本
      const scriptStr=sceneItem.scriptStr
      if(scriptStr){
        //console.log('customMethodScript',customMethodScript)
        try{
          const customFunc=new Function(scriptStr)
          //执行自定义校验函数，自定义函数是一个字符串，先通过Function转为函数，再传参执行方法；
          ruleResult=customFunc()(ctx,formItem,formData,renderUtil)
        } catch (e){
          console.error(scriptStr)
          console.error('自定义方法执行异常:',e)
        }
      }
    }
  }catch(e){
    console.error('ruleStr:',ruleType,sceneItem[ruleField])
    console.error('执行联动报错',e)
  }
  return ruleResult
}
