import request from "@/config/axios";
import {getModuleApiParamInfo} from "@/comRender/api";
import {isEmptyObj} from "@/utils/is";

export class callService{
  context:any=null
  actionInfo:any=null
  pageType=''
  data:any=null
  constructor(context,pageType,btnActionInfo,data) {
    this.context=context
    this.pageType=pageType
    this.actionInfo=btnActionInfo
    this.data=data
  }
  async actionEvent(){
    const message=useMessage()
    //如果没有按钮动作配置，根据按钮类型，走默认配置
    if(!this.actionInfo.showButtonActionCfg){
      message.warning('缺少按钮动作配置');
      return
    }
    let apiUrl=''
    let apiType='post'
    let apiParams:any={}
    let otherParams={}
    //判断服务类型  modelService:模型服务  api:接口服务
    if(this.actionInfo.serviceType==='api'){
      apiUrl=this.actionInfo.showButtonActionCfg.apiUrl
      apiType=this.actionInfo.showButtonActionCfg.apiType
      apiParams=this.actionInfo.showButtonActionCfg.apiModelParams
      otherParams=this.actionInfo.showButtonActionCfg.apiOtherParams
    }else{
      if(!this.actionInfo.modelServerId){
        message.warning('缺少服务');
        return
      }
      apiUrl='/cfg/low-code-api/' + this.actionInfo.modelServerId
      apiType='post'
      //如果是模型服务，查询服务所需请求参数
      const apiParamsRes=await getModuleApiParamInfo(this.actionInfo.showButtonActionCfg.modelServerId)
      apiParams=apiParamsRes.filter(item=>item.paramType==='请求参数').map(item=>item.fieldName)
    }
    //判断必选
    if(!isEmptyObj(apiParams) && !this.data){
      if(this.pageType==='list'){
        message.warning("请至少选择一行")
        return;
      }
    }
    //组装参数
    if(this.data){
      if(Array.isArray(this.data)){
        apiParams.list=this.data.map(item=>{
          return apiParams.reduce((acc,cur)=>{
            acc[cur.fieldName]=item[cur.fieldName]
            return acc
          },{})
        })
      }else{
        apiParams=apiParams.reduce((acc,cur)=>{
          acc[cur.fieldName]=this.data[cur.fieldName]
          return acc
        },{})
      }
    }
    //添加其他参数
    const queryParams={...apiParams,...otherParams};
    //调用
    if(apiType==='get'){
      await request.get({url:apiUrl,params:queryParams})
    }else{
      await request.post({url:apiUrl,data:queryParams})
    }
    //列表页刷新页面
    this.context.exposed.pageRefresh && this.context.exposed.pageRefresh()
  }
}
