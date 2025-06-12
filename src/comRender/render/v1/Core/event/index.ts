import {replaceMethodField} from "@/comRender/utils";
import * as renderUtil from '@/comRender/utils/renderUtil'

/**
 * 组件事件处理
 * @param eventType
 * @param formItem
 * @param ctx
 * @param formData
 * @param data
 */
export async function handleEvent(eventType, formItem,ctx,formData, data,pageListConfigs,isTable) {
  //console.log(eventType,formItem,ctx,formData,data);
  if (!formItem.eventConfigRespVOS) {
    return;
  }
  const eventInfo=formItem.eventConfigRespVOS.find(item=>item.eventType===eventType)
  if(!eventInfo){
    console.warn(`Event type ${eventType} not found`)
    return;
  }
  if(!eventInfo.script){
    console.warn(`Event type ${eventType} not found script`)
    return;
  }
  //执行事件代码
  const customMethodScript =replaceMethodField(eventInfo.script,pageListConfigs,ctx,isTable);
  //console.log('customMethodScript',customMethodScript)
  try{
    const customFunc=new Function(customMethodScript)
    //执行自定义校验函数，自定义函数是一个字符串，先通过Function转为函数，再传参执行方法；
    customFunc()(ctx,formItem,formData,data,renderUtil)
  } catch (e){
    console.error('eventInfo.script',customMethodScript)
    console.error('自定义方法执行异常:',e)
  }
}

/**
 * 执行页面的自定义事件
 * @param runTime
 * @param ctx
 * @param pageInfo
 * @param apiInfo
 * @param formData
 * @param flowNodeInfo
 */
export async function customEvent(runTime,ctx,pageInfo,apiInfo,formData,flowNodeInfo,filterFun) {
  //console.log(runTime,ctx,pageInfo,apiInfo,formData)
  if (!pageInfo.eventList) {
    return;
  }
  let eventList=pageInfo.eventList.filter(item=>item.runTime===runTime)
  //添加特殊过滤方法
  if(filterFun){
    eventList=eventList.filter(item=>filterFun(item))
  }
  let eventResult=true
  if(eventList && eventList.length){
    //对事件进行排序
    eventList.sort((a,b)=>{
      return b.sort<a.sort
    })
    for(let i=0;i<eventList.length;i++){
      const eventInfo=eventList[i]
      if(!eventInfo || !eventInfo.executableCode){
        continue;
      }
      //执行事件代码
      const customMethodScript =replaceMethodField(eventInfo.executableCode,ctx.props.formLayouts.pageListConfigs,ctx);
      // console.log('customMethodScript',customMethodScript)
      try{
        const customFunc=new Function(customMethodScript)
        //执行自定义校验函数，自定义函数是一个字符串，先通过Function转为函数，再传参执行方法；
        const customFuncResult=await customFunc()(ctx,apiInfo,formData,flowNodeInfo,renderUtil)
        console.log('customFuncResult',customFuncResult)
        if(eventInfo.isIntercept){
          eventResult=customFuncResult
        }
      } catch (e){
        if(e==='cancel'){
          console.log('确认弹框结果:',e)
          if(eventInfo.isIntercept){
            eventResult=false
            break;
          }
        }else{
          console.error('eventInfo.executableCode',eventInfo.executableCode)
          console.error('自定义事件执行异常:',e)
          eventResult=false
          break;
        }
      }
    }
  }
  //特殊处理：如果最后结果为undefined，说明没有阻止，但也没有返回值，默认通过；
  if(eventResult===undefined){
    eventResult=true
  }
  return eventResult
}
