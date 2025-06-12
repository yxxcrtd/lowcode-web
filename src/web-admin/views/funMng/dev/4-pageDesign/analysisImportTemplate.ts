import * as XLSX from 'xlsx'
import {getPageModuleInfo, getTemplateInfo} from "@/web-admin/views/funMng/dev/4-pageDesign/api";
import {getComponentTablePage} from "../api"
import {generateUUID, getPinyin} from "@/utils";
import {isNumber} from "@/utils/is";

export class AnalysisImportTemplate {
  menuId:string=''
  formData:any=null
  workbook:any=null
  modelInfo:any=null
  componentList:any=null
  
  constructor(menuId,formData,workbook) {
    this.menuId=menuId
    this.formData=formData
    this.workbook=workbook
  }
  async convertExcel2PageData(){
    if(!this.workbook.Sheets.hasOwnProperty('节点要素')){
      return {
        error:'模板错误，缺少【节点要素】sheet页'
      }
    }
    const worksheet = this.workbook.Sheets['节点要素'];
    //加载模型信息
    this.modelInfo=await loadModelInfo(this.formData.modelId)
    //加载组件信息
    this.componentList=await loadComponetList()
    //获取表单项配置sheet
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    console.log(jsonData);
    const {flowNodeList,fieldList,groupList,attachmentInfo}=this.parseExcelData(jsonData)
    console.log('flowNodeList,fieldList',flowNodeList,fieldList)
    if(!(fieldList && fieldList.length)){
      return {
        error:'模板错误:缺少字段，请检查表单元素、表名、字段名是否填写；'
      }
    }
    //绑定tableiId和fieldId
    let isNoMathField=true
    fieldList.forEach(item=>{
      const matchTableItem=this.modelInfo.tableList.find(tableItem=>tableItem.tableName===item.tableName)
      if(matchTableItem){
        item.moduleTableId=matchTableItem.id
        item.childTableId=matchTableItem.isChild ? matchTableItem.tableId:null
        item.moduleId=matchTableItem.moduleId
        item.tableId=matchTableItem.tableId
        const matchFieldItem=matchTableItem.fieldList.find(fieldItem=>fieldItem.columnName===item.columnName)
        if(matchFieldItem){
          isNoMathField=false
          item.fieldId=matchFieldItem.fieldId
        }
      }
    })
    if(isNoMathField){
      return {
        error:'模板错误:表名或列明与模型不一致'
      }
    }
    //流程节点的表单字段绑定
    if(flowNodeList && flowNodeList.length){
      flowNodeList.forEach(nodeItem=>{
        nodeItem.fieldList.forEach(fieldItem=>{
          const matchFieldItem=fieldList.find(item=>item.tableName==fieldItem.tableName && item.columnName===fieldItem.columnName)
          fieldItem=Object.assign(fieldItem,matchFieldItem)
        })
      })
    }
    //组装数据包括：表单页数据、列表页数据、流程数据
    const pageData={
      formPageData:await this.assemblyFormPage(fieldList,groupList),
      listPageData:await this.assemblyListPage(fieldList),
      flowData:await this.assemblyFlowData(flowNodeList),
    }
    if(attachmentInfo){
      pageData.formPageData.isSupportAttachment=1
      pageData.formPageData.attachmentInfo=attachmentInfo
    }
    console.log('pageData',pageData)
    return pageData
  }

  /**
   * Excel内列名与字段对应关系
   */
  excelColMap={
    GroupName:'表单信息',
    SonGroupName:'子分组',
    FieldShowName:'表单元素名称',
    TableName:'表名',
    FieldName:'字段名',
    Component:'输入形式（需求填写）',
    LinkageCfg:'联动配置',
    RuleCfg:'校验规则',
    Dict:'字典编码（需求填写）',
    ColSpan:'列数',
    MaxLen:'长度',
    Tips:'提示语（需求填写）',
    Unit:'单位（需求填写）',
    IsMulti:'是否多选',
    Placeholder:'占位符',
    FormTag:'表单标签',
    FormIsShow:'是否展示',
    FormIsEdit:'是否可编辑',
    FormIsRequire:'是否必填',
  }
  /**
   * 解析excel数据，提取字段信息、流程节点信息
   * @param excelData
   */
  parseExcelData(excelData:any){
    let flowNodeList:any[]=[]
    const fieldList:any[]=[]
    const groupList:any[]=[]
    const attachmentInfo:any=null
    const fieldIndexMap:any=Object.values(this.excelColMap).reduce((pre,cur)=>{
      return {
        ...pre,
        [cur]:''
      }
    },{})
    const attachmentMap={
      '普通附件模式':'commonAttachment',
      '指定类型模式':'appointAttachment',
      '自选类型上传':'selectAttachment'
    }
    excelData.forEach((item,index)=>{
      if(index==0){
        //根据第一行 确定节点信息
        flowNodeList=Object.values(item).map(str=>{
          return {
            nodeId:generateUUID(),
            nodeName:str,
            fieldIndexMap:{
              isEdit:'',
              isRequire:'',
              isShow:''
            },
            fieldList:[]
          }
        })
      }else if(index==1){
        //根据第二行，确定节点的角色信息
        const nodeRoleList:string[]=[]
        const nodeIdList:string[]=[]
        Object.values(item).forEach((str:string)=>{
          if(str.indexOf('参与角色：')>-1){
            nodeRoleList.push(str.replace('参与角色：',''))
          }
          if(str.indexOf('外部Id：')>-1){
            nodeIdList.push(str.replace('外部Id：',''))
          }
        })
        nodeRoleList.forEach((str,index)=>{
          flowNodeList[index].nodeRole=str
          flowNodeList[index].outFlowNodeId=nodeIdList[index]
        })
      }else if(index==2){
        //根据第三行，确定需要数据所在列的索引，并记录，后续根据索引绑定数据
        let nodeIndex=0
        console.log('index=2',item)
        for (const [key, value] of Object.entries(item)) {
          // @ts-ignore
          if(Object.keys(fieldIndexMap).includes(value)){
            // @ts-ignore
            fieldIndexMap[value]=key
          }
          let isNodePerm=false
          if(value===this.excelColMap.FormIsShow){
            flowNodeList[nodeIndex].fieldIndexMap.isShow=key
          }
          if(value===this.excelColMap.FormIsEdit){
            flowNodeList[nodeIndex].fieldIndexMap.isEdit=key
          }
          if(value===this.excelColMap.FormIsRequire){
            flowNodeList[nodeIndex].fieldIndexMap.isRequire=key
            isNodePerm=true
          }
          if(isNodePerm){
            nodeIndex++
          }
        }
      }else{
        //绑定具体字段数据
        //判断是否为附件信息
        if(item[this.excelColMap.GroupName]==='附件' && attachmentMap[item[this.excelColMap.Component]]){
          attachmentInfo.attachmentType=attachmentMap[item[this.excelColMap.Component]]
          return
        }
        //分组只在第一个字段行，每次取到记录下拉
        if(item[this.excelColMap.GroupName]){
          groupList.push({
            groupCode:generateUUID(),
            groupName:item[this.excelColMap.GroupName],
            groupSort:groupList.length,
            children:[]
          })
        }
        let groupItem=groupList[groupList.length-1]
        if(item[this.excelColMap.SonGroupName]){
          const curSonItem={
            PCode:groupItem.groupCode,
            groupCode:generateUUID(),
            groupName:item[this.excelColMap.GroupName],
            groupSort:groupList.length,
          }
          groupItem.children.push(curSonItem)
          groupItem=curSonItem
        }
        if(item[fieldIndexMap[this.excelColMap.FieldShowName]] && item[fieldIndexMap[this.excelColMap.FieldName]]){
          const componentItem=this.convertComponent(item[fieldIndexMap[this.excelColMap.Component]])
          fieldList.push({
            tableName:item[fieldIndexMap[this.excelColMap.TableName]],
            columnName:item[fieldIndexMap[this.excelColMap.FieldName]],
            columnComment:item[fieldIndexMap[this.excelColMap.FieldShowName]],
            groupName:groupItem.groupName,
            groupCode:groupItem.groupCode,
            columnDisplayComponent:componentItem.componentCode,
            columnDictTypeName:item[fieldIndexMap[this.excelColMap.Dict]],
            columnSpan:item[fieldIndexMap[this.excelColMap.ColSpan]],
            maxLength:isNumber(item[fieldIndexMap[this.excelColMap.MaxLen]]) ? parseInt(item[fieldIndexMap[this.excelColMap.MaxLen]]) : null,
            columnHeadTips:item[fieldIndexMap[this.excelColMap.Tips]],
            unit:item[fieldIndexMap[this.excelColMap.Unit]],
            linkageCfg:item[fieldIndexMap[this.excelColMap.LinkageCfg]],
            ruleCfg:item[fieldIndexMap[this.excelColMap.RuleCfg]],
            isMulti:item[fieldIndexMap[this.excelColMap.IsMulti]],
            placeHolder:item[fieldIndexMap[this.excelColMap.Placeholder]],
            formTag:item[fieldIndexMap[this.excelColMap.FormTag]],
          })
          flowNodeList.forEach(nodeItem=>{
            nodeItem.fieldList.push({
              tableName:item[fieldIndexMap[this.excelColMap.TableName]],
              columnName:item[fieldIndexMap[this.excelColMap.FieldName]],
              columnComment:item[fieldIndexMap[this.excelColMap.FieldShowName]],
              isEdit:item[nodeItem.fieldIndexMap.isEdit]=='是',
              isRequire:item[nodeItem.fieldIndexMap.isRequire]=='是',
              isShow:item[nodeItem.fieldIndexMap.isShow]=='是'
            })
          })
        }
      }
      
    })
    
    return {flowNodeList,fieldList,groupList,attachmentInfo}
  }
  convertComponent(componentName){
    let componentItem=this.componentList.find(item=>item.componentName===componentName)
    //console.log('componentItem',this.componentList,componentName,componentItem)
    if(!componentItem){
      componentItem=this.componentList.find(item=>item.componentName==='普通输入框')
    }
    return componentItem
  }

  /**
   * 组装form表单页数据
   * @param fieldList
   * @param groupList
   */
  async assemblyFormPage(fieldList,groupList){
    //加载模板信息
    const templateInfo=await loadTemplateInfo(this.formData.formTemplateId)
    const formPageData={
      menuId:this.menuId,
      pageType:'form',
      pageName:this.formData.pageName+'-表单页',
      pageCode:getPinyin(this.formData.pageName,'BD-'),
      pageState:'1',
      pageTemplate:templateInfo.id,
      attachmentInfo:{},
      isSupportAttachment:1,
      columnSpan:8,
      labelWidth:120,
      labelPosition:'right',
      pageApiRespVOS:[],
      pageButtons:this.getFormPageButtons()
    }
    formPageData.pageApiRespVOS=templateInfo.apiList.map(item=>{
      return {
        apiId:item.id,
        apiCode:item.apiCode,
        apiName:item.apiName,
        moduleId:this.modelInfo.id,
        serverId:this.modelInfo.apiList.find(apiItem=>apiItem.serviceCode===this.apiMap[item.apiCode])?.id,
        pageListConfigs:this.getFormTableColumns(fieldList),
        pageGroups:groupList,
        tableLayoutConfig:item.tableLayoutConfig
      }
    })
    return formPageData
  }
  /**
   * 组装表单页字段数据
   * @param fieldList
   */
  getFormTableColumns(fieldList){
    const tableColumns:any[]=[]
    this.modelInfo.tableList.forEach((tableItem,tableIndex)=>{
      tableItem.fieldList.filter(item=>!item.isSys).map((fieldItem,fieldIndex)=>{
        const curFieldItem=fieldList.find(item=>item.tableId===tableItem.tableId && item.fieldId===fieldItem.fieldId)
        if(curFieldItem){
          tableColumns.push({
            moduleTableId:tableItem.id,
            childTableId:tableItem.isChild ? tableItem.tableId:null,
            tableName:tableItem.tableName,
            moduleId:tableItem.moduleId,
            tableId:tableItem.tableId,
            fieldId:fieldItem.fieldId,
            columnName:fieldItem.columnName,
            columnComment:fieldItem.columnComment,
            columnNameAlias:fieldItem.columnComment,
            columnType:fieldItem.columnType,
            relationTableId: tableItem.id,
            columnDisplayComponent:"ace-input",
            columnDisplayComponentName:'普通输入框',
            isRequire:fieldItem.required?1:0,
            isRequireDisabled:!!fieldItem.required,
            columnSpan:8,
            groupCode:'base',
            isVisible:1,
            sort:tableIndex*10+fieldIndex,
            componentProp:{
              multiple:curFieldItem.isMulti,
              placeholder:curFieldItem.placeholder,
              rate:this.getRate(curFieldItem.unit),
            },
            ...curFieldItem
          })
        }
      })
    })
    return tableColumns
  }

  /**
   * 组装表单页按钮数据
   */
  getFormPageButtons(){
    return [
      {
        operationType: "save",
        buttonName: "保存",
        buttonStyle: "primary",
        permissionSign: "save",
      },
      {
        operationType: "submit",
        buttonName: "提交",
        buttonStyle: "primary",
        permissionSign: "submit",
      },
      {
        operationType: "cancel",
        buttonName: "取消",
      }
    ]
  }

  getRate(unit){
    const rateMap={
      '万元':10000,
      '万':10000,
      '亿元':100000000,
      '亿':100000000,
      '%':100,
    }
    return rateMap[unit] || null
  }
  
  getRuleCfg(ruleCfg){
    //判断是否是范围
    const regex = /^[\[\]()].*[\[\]()]$/;
    if(regex.test(ruleCfg)){
      const realRuleCfgStr=ruleCfg.slice(1, -1); // 去掉首尾字符
      const realRuleCfgArr=realRuleCfgStr.split(/[，,]/)
      const ruleItem={
        checkName:'区间校验',
        validateType:'range',
        isSelect:false,
        condition:{
          min:realRuleCfgArr[0],
          max:realRuleCfgArr[1]
        },
        toolTips:''
      }
      return ruleItem
    }
  }
  
  apiMap={
    'form-create':'CREATE',
    'form-update':'UPDATE',
    'form-detail':'GET_BY_ID',
    'form-start-detail':'MAPPING_GET_BY_ID',
    'page-list':'PAGE_LIST',
  }
  /**
   * 组装列表页数据
   * @param fieldList
   */
  async assemblyListPage(fieldList){
    //加载模板信息
    const templateInfo=await loadTemplateInfo(this.formData.listTemplateId)
    const listPageData={
      menuId:this.menuId,
      pageType:'list',
      pageName:this.formData.pageName+'-列表页',
      pageCode:getPinyin(this.formData.pageName,'LB-'),
      pageState:'1',
      pageTemplate:templateInfo.id,
      pageApiRespVOS:[],
      pageButtons:this.getListPageButtons()
    }
    listPageData.pageApiRespVOS=templateInfo.apiList.map(item=>{
      return {
        apiId:item.id,
        apiCode:item.apiCode,
        apiName:item.apiName,
        moduleId:this.modelInfo.id,
        serverId:this.modelInfo.apiList.find(apiItem=>apiItem.serviceCode===this.apiMap[item.apiCode])?.id,
        pageListConditions:this.getListSearchItems(fieldList),
        pageListConfigs:this.getListTableColumns(fieldList),
        tableLayoutConfig:item.tableLayoutConfig
      }
    })
    return listPageData
  }

  /**
   * 提取列表页查询条件
   * @param fieldList
   */
  getListSearchItems(fieldList){
    console.log(fieldList)
    return []
  }
  /**
   * 组装列表页字段数据
   * @param fieldList
   */
  getListTableColumns(fieldList){
    const tableColumns:any[]=[]
    this.modelInfo.tableList.forEach((tableItem,tableIndex)=>{
      tableItem.fieldList.filter(item=>!item.isSys).map((fieldItem,fieldIndex)=>{
        const curFieldItem=fieldList.find(item=>item.tableId===tableItem.tableId && item.fieldId===fieldItem.fieldId) || {}
        tableColumns.push({
          moduleTableId:tableItem.id,
          tableId:tableItem.tableId,
          tableName:tableItem.tableName,
          moduleId:tableItem.moduleId,
          fieldId:fieldItem.fieldId,
          columnName:fieldItem.columnName,
          columnComment:fieldItem.columnComment,
          columnNameAlias:fieldItem.columnComment,
          columnType:fieldItem.columnType,
          isVisible:1,
          sort:tableIndex*10+fieldIndex,
          ...curFieldItem
        })
      })
    })
    return tableColumns
  }

  /**
   * 组装列表页按钮数据
   */
  getListPageButtons(){
    return [
      {
        buttonType: "left",
        buttonStyle: "primary",
        openWay: "default",
        operationType: "create",
        buttonName: "新增",
        permissionSign: "create",
        buttonShape: "primary",
        buttonIcon: "ep:arrow-left-bold",
        showButtonActionCfg: {
          actionType: "openPage",
          openWay: "new-tab",
          relevancePage: "need-replace",
          customMethod: "",
          dataScript: ""
        }
      },
      {
        buttonType: "row",
        buttonStyle: "primary",
        openWay: "default",
        operationType: "edit",
        buttonName: "编辑",
        permissionSign: "edit",
        apiCode: "page-list",
        moduleId: this.modelInfo.id,
        showButtonActionCfg: {
          actionType: "openPage",
          openWay: "new-tab",
          relevancePage: "need-replace",
          serverParams: [
            "id"
          ]
        }
      },
      {
        buttonType: "row",
        buttonStyle: "primary",
        openWay: "default",
        operationType: "detail",
        buttonName: "详情",
        permissionSign: "detail",
        apiCode: "page-list",
        moduleId: this.modelInfo.id,
        showButtonActionCfg: {
          actionType: "openPage",
          openWay: "new-tab",
          relevancePage: "need-replace",
          customMethod: "",
          dataScript: "",
          serverParams: [
            "id"
          ]
        }
      },
      {
        buttonType: "row",
        buttonStyle: "danger",
        openWay: "default",
        operationType: "delete",
        buttonName: "删除",
        permissionSign: "delete",
        apiCode: "page-list",
        moduleId: this.modelInfo.id,
        showButtonActionCfg: {
          actionType: "serverApi",
          modelServerId: this.modelInfo.apiList.find(apiItem=>apiItem.serviceCode==='DELETE')?.id
        }
      }
    ]
  }
  async assemblyFlowData(flowNodeList){
    const flowInfo={
      processName: this.formData.pageName+'-表单流程',
      pageId: "need-replace",
      remark: "导入模板生成",
      processType: "2",
      menuId: this.menuId,
      process: this.getFlowProcess(flowNodeList)
    }
    return flowInfo
  }
  getFlowProcess(flowNodeList){
    return this.buildLinkedNode(flowNodeList,0)
  }
  buildLinkedNode(flowNodeList,index,pid?){
    if(index>flowNodeList.length){
      return null
    }
    const item=index<flowNodeList.length ? flowNodeList[index] :{}
    const curId=generateUUID()
    const node={
      id:curId,
      type:index==0 ? 'start':(index==flowNodeList.length ? 'end':'approval'),
      name:index==0 ? '发起人':(index==flowNodeList.length ? '流程结束':item.nodeName), 
      executionListeners:[],
      formProperties:index<flowNodeList.length ? this.getFlowFormProperties(item.fieldList) :null,
      outProcessNodeId:item.outFlowNodeId,
      pid:pid,
      assigneeType:'user',
      multi:(index>0 && index<flowNodeList.length) ? 'sequential' : null,
      multiPercent:(index>0 && index<flowNodeList.length) ? 100 : null,
      nobody:(index>0 && index<flowNodeList.length) ? 'pass' : null,
      child:this.buildLinkedNode(flowNodeList,index+1,curId)
    }
    return node;
  }
  getFlowFormProperties(fieldList){
    return fieldList.map(item=>{
      return {
        id:item.fieldId,
        fieldId: item.fieldId,
        name: item.columnComment,
        readonly: !item.isEdit,
        hidden: !item.isShow,
        required: item.isRequire
      }
    })
  }

}
const loadModelInfo=async (modelId)=>{
  const params = {
    id:modelId
  }
  const res = await getPageModuleInfo(params)
  return res
}
const loadTemplateInfo=async (templateId)=>{
  const params = {
    id:templateId
  }
  const res=await getTemplateInfo(params)
  return res
}
const loadComponetList=async ()=>{
  const params = {
    pageSize:100
  }
  const res=await getComponentTablePage(params)
  return res.list
}
