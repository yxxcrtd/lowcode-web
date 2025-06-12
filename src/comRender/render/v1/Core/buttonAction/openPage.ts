import {useRouteParamStore} from "@/store/modules/routeParams";

export class openPageAction{
  context:any=null
  actionInfo:any=null
  pageType:any=''
  data:any={}
  constructor(context,pageType,btnActionInfo,data) {
    this.context=context
    this.pageType=pageType
    this.actionInfo=btnActionInfo
    this.data=data || {}
  }
  async actionEvent(){
    const message=useMessage()
    //如果没有按钮动作配置，根据按钮类型，走默认配置
    if(!this.actionInfo.showButtonActionCfg){
      return
    }
    const routeParamStore=useRouteParamStore()
    const {relevancePage,serverParams,openWay}=this.actionInfo.showButtonActionCfg
    //组装参数
    let params:any={}
    if(this.data && serverParams){
      if(Array.isArray(this.data)){
        params.list=this.data.map(item=>{
          return serverParams.reduce((acc,cur)=>{
            acc[cur.fieldName]=item[cur.fieldName]
            return acc
          },{})
        })
      }else{
        params=serverParams.reduce((acc,cur)=>{
          acc[cur.fieldName]=this.data[cur.fieldName]
          return acc
        },{})
      }
    }
    //默认所有参数保存到store中，根据参数类型及数据量 判断是否用url传参
    //判断打开方式
    if(['dialog','dialog-fullscreen'].includes(openWay)){
      const queryParams={
        data:params,
      }
      this.context.refs.editContentRef.open('dialog',this.actionInfo.operationType,relevancePage,queryParams)
    }else if(openWay==='drawer'){
      const queryParams={
        data:params,
      }
      this.context.refs.editContentRef.open('drawer',this.actionInfo.operationType,relevancePage,queryParams)
    }else if(openWay==='cur-tab'){
      //new-tab
      const allRoutes=this.context.exposed.router.getRoutes()
      const pageRoute=allRoutes.find(item=>item.meta?.pageId===relevancePage)
      const queryParams=serverParams?.reduce((acc,cur)=>{
        acc[cur]=this.data[cur]
        return acc
      },{})
      if(pageRoute){
        this.context.exposed.router.replace({
          path: pageRoute.path,
          query: {
            pageType:this.actionInfo.operationType,
            ...queryParams
          }
        })
      }else{
        message.error('未找到页面，请检查按钮页面配置')
      }
    }else{
      //new-tab
      const paramKey=routeParamStore.setRouteParams(params)
      const allRoutes=this.context.exposed.router.getRoutes()
      const pageRoute=allRoutes.find(item=>item.meta?.pageId===relevancePage)
      const queryParams=serverParams?.reduce((acc,cur)=>{
        acc[cur]=this.data[cur]
        return acc
      },{})
      if(pageRoute){
        this.context.exposed.router.push({
          path: pageRoute.path,
          query: {
            pageType:this.actionInfo.operationType,
            paramKey:paramKey,
            ...queryParams
          }
        })
      }else{
        message.error('未找到页面，请检查按钮页面配置')
      }
    }
  }
}
