export class customEventAction{
  context:any=null
  actionInfo:any=null
  pageType:any=''
  data:any=null
  externalJsModule:any=null
  constructor(context,pageType,btnActionInfo,data,externalJsModule) {
    this.context=context
    this.pageType=pageType
    this.actionInfo=btnActionInfo
    this.data=data
    this.externalJsModule=externalJsModule
  }
  async actionEvent(){
    const message=useMessage()
    //如果没有按钮动作配置，根据按钮类型，走默认配置
    if(!this.actionInfo.showButtonActionCfg){
      message.warning('缺少按钮动作配置');
      return
    }
    const {customMethod}=this.actionInfo.showButtonActionCfg
    //优先执行自定义方法
    if(customMethod){
      try{
        this.externalJsModule && this.externalJsModule[customMethod](this.actionInfo,this.context,this.data)
      }catch(e){
        console.error("方法名错误，请检查自定义方法名是否和外部js一致")
      }
      return;
    }
  }
}
