import {unityServerApi,getModuleApiParamInfo} from "@/comRender/api"
import {useRouteParamStore} from "@/store/modules/routeParams";

/**
 * 按钮事件处理
 * @param btnItem
 * @param row
 * @param rowIndex
 */
export const btnEvent=async (btnItem,context,externalJsModule,row)=>{
  console.log(btnItem,row,context,externalJsModule)
  //查询服务API参数
  btnItem.apiParams=null
  if(btnItem.showButtonActionCfg && btnItem.showButtonActionCfg.modelServerId){
    const apiParamsRes=await getModuleApiParamInfo(btnItem.showButtonActionCfg.modelServerId)
    btnItem.apiParams=apiParamsRes.filter(item=>item.paramType==='请求参数')
  }
  //优先按照按钮动作执行；
  if(btnItem.showButtonActionCfg && btnItem.showButtonActionCfg.actionType){
    btnAction(btnItem,context,externalJsModule,row)
    return;
  }
  //如果没有动作配置，按照按钮类型执行
  //新增
  if(btnItem.operationType==='create'){
    addBtn(btnItem,context,row);
    return;
  }
  //批量删除
  if(btnItem.operationType==='batchDelete'){
    batchDelete(btnItem,context);
    return;
  }
  //删除
  if(btnItem.operationType==='delete'){
    singleDelete(btnItem,context,row);
    return;
  }
  //批量导出
  if(btnItem.operationType==='export'){
    exportTable(btnItem,context);
  }
  //单行编辑
  if(btnItem.operationType==='edit'){
    editBtn(btnItem,context,row);
  }
  //单行详情
  if(btnItem.operationType==='detail'){
    detailBtn(btnItem,context,row);
  }
}
/**
 * 新增按钮
 * @param btnItem
 * @param context
 */
export const addBtn=(btnItem,context)=>{
  const message=useMessage()
  console.log('ddd',context)
  if(!btnItem.showButtonActionCfg){
    message.warning("按钮动作配置缺少参数")
    return;
  }
  const {customMethod,relevancePage,serverParams,openWay}=btnItem.showButtonActionCfg
  //优先执行自定义方法
  if(customMethod){
    try{
      externalJsModule && externalJsModule[customMethod](btnItem,context,row)
    }catch(e){
      console.error("方法名错误，请检查自定义方法名是否和外部js一致")
    }
    return;
  }
  //确定打开方式
  if(openWay==='dialog' || openWay==='dialog-fullscreen'){
    context.refs.editContentRef.open('dialog','create',relevancePage)
  }else if(openWay==='drawer'){
    context.refs.editContentRef.open('drawer','create',relevancePage)
  }else if(openWay==='cur-tab'){

  }else{
    //new-tab
    const allRoutes=context.exposed.router.getRoutes()
    const pageRoute=allRoutes.find(item=>item.meta?.pageId===relevancePage)
    if(pageRoute){
      context.exposed.router.push({
        path: pageRoute.path,
        query: {
          pageType:'add'
        }
      })
    }else{
      message.error('未找到页面，请检查按钮页面配置')
    }
  }
}
/**
 * 编辑按钮
 * @param btnItem
 * @param context
 */
export const editBtn=(btnItem,context,data)=>{
  const message=useMessage()
  if(!btnItem.showButtonActionCfg){
    message.warning("按钮动作配置缺少参数")
    return;
  }
  const {customMethod,relevancePage,serverParams,openWay}=btnItem.showButtonActionCfg
  //优先执行自定义方法
  if(customMethod){
    try{
      externalJsModule && externalJsModule[customMethod](btnItem,context,row)
    }catch(e){
      console.error("方法名错误，请检查自定义方法名是否和外部js一致")
    }
    return;
  }
  //确定打开方式
  if(openWay==='dialog' || openWay==='dialog-fullscreen'){
    context.refs.editContentRef.open('dialog','edit',relevancePage,data)
  }else if(openWay==='drawer'){
    context.refs.editContentRef.open('drawer','edit',relevancePage,data)
  }else if(openWay==='cur-tab'){

  }else{
    //new-tab
    const allRoutes=context.exposed.router.getRoutes()
    const pageRoute=allRoutes.find(item=>item.meta?.pageId===relevancePage)
    const queryParams=serverParams.reduce((acc,cur)=>{
      acc[cur]=data[cur]
      return acc
    },{})
    if(pageRoute){
      context.exposed.router.push({
        path: pageRoute.path,
        query: {
          pageType:'edit',
          ...queryParams
        }
      })
    }else{
      message.error('未找到页面，请检查按钮页面配置')
    }
  }
}

/**
 * 编辑按钮
 * @param btnItem
 * @param context
 */
export const detailBtn=(btnItem,context,data)=>{
  const message=useMessage()
  if(!btnItem.showButtonActionCfg){
    message.warning("按钮动作配置缺少参数")
    return;
  }
  const {customMethod,relevancePage,serverParams,openWay}=btnItem.showButtonActionCfg
  //优先执行自定义方法
  if(customMethod){
    try{
      externalJsModule && externalJsModule[customMethod](btnItem,context,row)
    }catch(e){
      console.error("方法名错误，请检查自定义方法名是否和外部js一致")
    }
    return;
  }
  //确定打开方式
  if(openWay==='dialog' || openWay==='dialog-fullscreen'){
    context.refs.editContentRef.open('dialog','detail',relevancePage,data)
  }else if(openWay==='drawer'){
    context.refs.editContentRef.open('drawer','detail',relevancePage,data)
  }else if(openWay==='cur-tab'){

  }else{
    //new-tab
    const allRoutes=context.exposed.router.getRoutes()
    const pageRoute=allRoutes.find(item=>item.meta?.pageId===relevancePage)
    const queryParams=serverParams.reduce((acc,cur)=>{
      acc[cur]=data[cur]
      return acc
    },{})
    if(pageRoute){
      context.exposed.router.push({
        path: pageRoute.path,
        query: {
          pageType:'detail',
          ...queryParams
        }
      })
    }else{
      message.error('未找到页面，请检查按钮页面配置')
    }
  }
}
/**
 * 批量删除
 * @param btnItem
 * @param context
 */
export const batchDelete=(btnItem,context)=>{
  const message = useMessage() // 消息弹窗
  if(!btnItem.showButtonActionCfg){
    message.warning("按钮动作配置缺少参数")
    return;
  }
  //获取选中的hang
  const selectRows=context.exposed.getCheckedRows()
  if(!selectRows || selectRows.length==0){
    message.warning("请至少选择一行")
    return;
  }
  console.log(selectRows)
  message.delConfirm().then(async e=>{
    
    const params = {
      serviceId: btnItem.showButtonActionCfg.modelServerId,
      params: btnItem.apiParams.reduce((acc,cur)=>{
        acc[cur.fieldName]=selectRows.map(rowItem=>rowItem[cur.fieldName])
        return acc
      },{})
    }
    //调用模型的单行删除接口
    const res=await unityServerApi(btnItem.showButtonActionCfg.modelServerId,params)
    context.exposed.search()
  }).catch(e=>{
    console.error(e)
  })
}

export const singleDelete=(btnItem,context,row)=>{
  const message = useMessage() // 消息弹窗
  if(!btnItem.showButtonActionCfg){
    message.warning("按钮动作配置缺少参数")
    return;
  }
  message.delConfirm().then(async e=>{
    const params = {
      serviceId: btnItem.showButtonActionCfg.modelServerId,
      params: btnItem.apiParams.reduce((acc,cur)=>{
        acc[cur.fieldName]=row[cur.fieldName]
        return acc
      },{})
    }
    //调用模型的单行删除接口
    const res=await unityServerApi(btnItem.showButtonActionCfg.modelServerId,params)
    context.exposed.search()
  }).catch(e=>{
    console.error(e)
  })
}

/**
 * 表格导出
 * @param type
 * @param btnItem
 * @param context
 */
export const exportTable=(type,btnItem,context)=>{
  
}

/**
 * 按钮动作配置
 * @param btnItem
 * @param context
 * @param data
 */
export const btnAction=(btnItem,context,externalJsModule,row)=>{
  const actionType=btnItem.showButtonActionCfg.actionType
  if(actionType=="serverApi"){
    callServiceApi(btnItem,context,externalJsModule,row)
  }else if(actionType=="openPage"){
    openPage(btnItem,context,externalJsModule,row)
  }else if(actionType=="customEvent"){
    runCustomEvents(btnItem,context,externalJsModule,row)
  }else{
    runCustomScript(btnItem,context,externalJsModule,row)
  }
}
/**
 * 按钮动作-打开页面
 * @param btnItem
 * @param context
 * @param data
 */
export const openPage=(btnItem,context,externalJsModule,data)=>{
  const message=useMessage()
  const routeParamStore=useRouteParamStore()
  if(!btnItem.showButtonActionCfg){
    message.warning("按钮动作配置缺少参数")
    return;
  }
  const {relevancePage,serverParams,openWay}=btnItem.showButtonActionCfg
  let paramKey=null
  if(btnItem.buttonType!='row'){
    paramKey=routeParamStore.setRouteParams(data)
  }
  //确定打开方式
  if(openWay==='dialog' || openWay==='dialog-fullscreen'){
    context.refs.editContentRef.open('dialog',btnItem.operationType,relevancePage,data)
  }else if(openWay==='drawer'){
    context.refs.editContentRef.open('drawer',btnItem.operationType,relevancePage,data)
  }else if(openWay==='cur-tab'){
    //new-tab
    const allRoutes=context.exposed.router.getRoutes()
    const pageRoute=allRoutes.find(item=>item.meta?.pageId===relevancePage)
    const queryParams=serverParams?.reduce((acc,cur)=>{
      acc[cur]=data[cur]
      return acc
    },{})
    if(pageRoute){
      context.exposed.router.replace({
        path: pageRoute.path,
        query: {
          pageType:btnItem.operationType,
          ...queryParams
        }
      })
    }else{
      message.error('未找到页面，请检查按钮页面配置')
    }
  }else{
    //new-tab
    const allRoutes=context.exposed.router.getRoutes()
    const pageRoute=allRoutes.find(item=>item.meta?.pageId===relevancePage)
    const queryParams=serverParams?.reduce((acc,cur)=>{
      acc[cur]=data[cur]
      return acc
    },{})
    if(pageRoute){
      context.exposed.router.push({
        path: pageRoute.path,
        query: {
          pageType:btnItem.operationType,
          paramKey:paramKey,
          ...queryParams
        }
      })
    }else{
      message.error('未找到页面，请检查按钮页面配置')
    }
  }
}

export const callServiceApi=async (btnItem,context,externalJsModule,row)=>{
  const message = useMessage() // 消息弹窗
  if(!btnItem.showButtonActionCfg){
    message.warning("按钮动作配置缺少参数")
    return;
  }
  let queryParams={}
  if(row){
    queryParams=btnItem.apiParams.reduce((acc,cur)=>{
      acc[cur.fieldName]=row[cur.fieldName]
      return acc
    },{})
  }
  if(!row && ['batchDelete','delete'].includes(btnItem.operationType)){
    //获取选中的hang
    const selectRows=context.exposed.getCheckedRows()
    if(!selectRows || selectRows.length==0){
      message.warning("请至少选择一行")
      return;
    }
    queryParams=btnItem.apiParams.reduce((acc,cur)=>{
      acc[cur.fieldName]=selectRows.map(rowItem=>rowItem[cur.fieldName])
      return acc
    },{})
    await message.delConfirm()
  }
  const params = {
    serviceId: btnItem.showButtonActionCfg.modelServerId,
    params: queryParams
  }
  //调用模型的单行删除接口
  const res=await unityServerApi(btnItem.showButtonActionCfg.modelServerId,params)
  context.exposed.search()
}

export const runCustomEvents=(btnItem,context,externalJsModule,row)=>{
  const message=useMessage()
  console.log('ddd',context)
  if(!btnItem.showButtonActionCfg){
    message.warning("按钮动作配置缺少参数")
    return;
  }
  const {customMethod}=btnItem.showButtonActionCfg
  //优先执行自定义方法
  if(customMethod){
    try{
      externalJsModule && externalJsModule[customMethod](btnItem,context,row)
    }catch(e){
      console.error("方法名错误，请检查自定义方法名是否和外部js一致")
    }
    return;
  }
}

export const runCustomScript=(btnItem,context,externalJsModule,row)=>{
  
}
