import {replaceMethodField} from "@/comRender/utils";
import * as renderUtil from "@/comRender/utils/renderUtil";

export class customScriptAction{
  context:any=null
  formData:any=null
  btnCfg:any=''
  data:any=null
  pageListConfigs:any=null
  constructor(context,btnCfg,data,formData,pageListConfigs) {
    this.context=context
    this.btnCfg=btnCfg
    this.formData=formData
    this.data=data
    this.pageListConfigs=pageListConfigs || this.context.props.formLayouts?.pageListConfigs
  }
  async actionEvent(){
    if(!this.btnCfg.showButtonActionCfg || !this.btnCfg.showButtonActionCfg.dataScript){
      console.warn(`Event not found script`)
      return;
    }
    //执行事件代码
    const customMethodScript =replaceMethodField(this.btnCfg.showButtonActionCfg.dataScript,this.pageListConfigs,this.context);
    //console.log('customMethodScript',customMethodScript)
    try{
      const customFunc=new Function(customMethodScript)
      //执行自定义校验函数，自定义函数是一个字符串，先通过Function转为函数，再传参执行方法；
      customFunc()(this.context,this.btnCfg,this.formData,this.data,renderUtil)
    } catch (e){
      console.warn('eventInfo.script',customMethodScript)
      console.error('自定义方法执行异常:',e)
    }
  }
}
