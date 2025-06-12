import {setComponentProps} from './components'
import {getGroupLinkageRule, getLinkageRule, getTableLinkageRule,initAttacementLinkageRule} from '../../../Core/linkage/initLinkageRule'
import {getBusinessAttachment} from "../api";
import {cloneDeep} from "lodash-es";

/**
 * 组装表单项
 * @param apiInfo   模板API配置信息
 * @param flowNodeInfo  关联审批节点ID信息
 * @returns {{groupName, groupId, groupCode: any}[]}
 */
export const setGroupFormItem = (apiInfo, flowNodeInfo) => {
  const route=useRoute()
  //将表单项按照分组进行重组数据
  let formGroups = apiInfo.pageGroups.map((item) => {
    const groupItems = {
      ...item,
      groupId: item.groupCode
    }
    groupItems.formItems = apiInfo.pageListConfigs.filter((formItem) => {
      return formItem.groupCode === item.groupCode
    })
    groupItems.formItems.sort((a, b) => {
      return a.sort - b.sort
    })
    return groupItems
    })
    //对分组进行排序
    formGroups.sort((a, b) => {
      return a.groupSort - b.groupSort
    })

  //遍历表单项，对表单数据进行处理，
  formGroups.forEach((item) => {
    const tableMap:any = []
    item.formItems.forEach((formItem, formItemindex) => {
      //查询流程配置
      const flowNodeFormItem = flowNodeInfo?.formProperties?.find(
        (nodeItem) => nodeItem.fieldId == formItem.fieldId
      )
      if (flowNodeFormItem) {
        formItem.nodeIsHidden=flowNodeFormItem.hidden
        formItem.nodeIsRequire=flowNodeFormItem.required
        formItem.nodeIsDisabled=flowNodeFormItem.readonly
        
        formItem.isHidden = formItem.isHidden || flowNodeFormItem.hidden
        formItem.isRequire = flowNodeFormItem.required
        formItem.isDisabled = flowNodeFormItem.readonly
        if(flowNodeFormItem.fieldAlias){
          formItem.columnNameAlias=flowNodeFormItem.fieldAlias
        }
      }
      formItem.columnHeadWidth = formItem.columnHeadWidth
      //字段格式统一为‘字段名+表名’
      formItem.field = formItem.columnName + '_' + formItem.moduleTableId
      
      //添加下拉框等回显字段text   绑定到组件的modelText上，所有组件回显统一使用modelText
      formItem.fieldText=formItem.columnName + '_TEXT_' + formItem.moduleTableId

      //设置详情情况下回显字段
      if(formItem.dataFormatRespVOS && formItem.dataFormatRespVOS.transferLabelField){
        formItem.labelField=formItem.dataFormatRespVOS.transferLabelField + '_' + formItem.moduleTableId
      }else{
        formItem.labelField=formItem.field
      }
      //组装校验规则
      formItem.rules=[]
      //formItem.rules = getFormRules(formItem,renderFormData,apiInfo)
      //组装组件相关属性
      formItem.props = setComponentProps(formItem)
      //如果是日期区间组件，特殊处理，转为两个字段存值，字段在组件属性中配置；
      if(formItem.columnDisplayComponent=='ace-date-range-picker'){
        formItem.field = formItem.columnName
        
        formItem.startDateField=formItem.props.startDateField + '_' + formItem.moduleTableId
        formItem.endDateField=formItem.props.endDateField + '_' + formItem.moduleTableId
      }
      //替换别名
      formItem.columnComment=formItem.columnNameAlias || formItem.columnComment
      formItem.minWidth=setTableMinWidth(formItem)
      //置灰组件，删除占位符
      if(formItem.isDisabled && formItem.props){
        formItem.props.placeholder=''
      }
      //生成联动规则字符串
      getLinkageRule(apiInfo.pageListConfigs, formItem)
      //获取子表数据
      if (formItem.childTableId) {
        const isExits = tableMap.find((tableItem) => tableItem.childTableId === formItem.childTableId)
        if (!isExits) {
          //记录子表，并保存索引，用于排序
          tableMap.push({
            childTableId: formItem.childTableId,
            tableId: formItem.moduleTableId,
            index: formItemindex
          })
        }
      }
      // ###特殊处理  如果是泛微紧急程度、备注字段，只在启流之前展示,根据url是否有nodeId来判断。
      if(route.query.nodeId || route.query.pageType==='detail'){
        if(['FW_REQUESTLEVEL','FW_REMARK'].includes(formItem.columnName)){
          formItem.isHidden=true
        }
      }
      //特殊处理：统一紧急程度、备注字段
      if(['FW_REQUESTLEVEL'].includes(formItem.columnName)){
        formItem.columnComment='紧急程度'
        formItem.columnSpan=8
      }
      if(['FW_REMARK'].includes(formItem.columnName)){
        formItem.columnComment='备注信息'
        formItem.columnSpan=24
      }
    })
    //将子表整理成单独项
    tableMap.forEach((childItem) => {
      const tableFormItems = item.formItems.filter((formItem) => formItem.childTableId === childItem.childTableId) || []
      tableFormItems.forEach(formItem=>{
        formItem.align=setTableColAlign(formItem)
      })
      const tableFormItem = {
        isTableItem: true,
        tableId: childItem.tableId,
        tableItems: tableFormItems,
        sort: tableFormItems && tableFormItems.length ? tableFormItems[0].sort : null,
        tableConfig:apiInfo.tableLayoutConfig?.find(tableItem=>tableItem.tableId === childItem.tableId) || {},
        isHidden: tableFormItems.every((item) => item.isHidden) //如果所有子项都是隐藏的，分组隐藏
      }
      //初始化表格联动显隐规则
      getTableLinkageRule(tableFormItem,apiInfo)
      //子表的排序以第一项的排序为准
      item.formItems.push(tableFormItem)
      //删除原有的子表字段
      item.formItems = item.formItems.filter((formItem) => formItem.childTableId !== childItem.childTableId)
      item.formItems.sort((a, b) => {
        return a.sort - b.sort
      })
    })
    //初始化分组的显隐规则
    getGroupLinkageRule(item,apiInfo.pageListConfigs)
  })
  formGroups=listToTree(formGroups)
  return formGroups
}
const listToTree=(list)=> {
  const map = {};
  const roots = [];
  // 1. 将所有节点存入 map，方便后续查找
  list.forEach(item => {
    map[item.groupCode] = { ...item, children: [] };
  });
  // 2. 遍历列表，将节点挂载到对应的父节点下
  list.forEach(item => {
    if (item.parentId) {
      if (map[item.parentId]) {
        map[item.parentId].children.push(map[item.groupCode]);
      }
    } else {
      // 如果没有 parentId，则认为是根节点
      //@ts-ignore
      roots.push(map[item.groupCode]);
    }
  });

  return roots;
}
const setTableMinWidth=(tableItem)=>{
  if(tableItem.minWidth){
    return tableItem.minWidth;
  }
  return tableItem.columnComment?.length * 25 + 40
}
const setTableColAlign=(tableItem)=>{
  if(tableItem.columnAlignment){
    return tableItem.columnAlignment;
  }
  if(['ace-input-number','ace-input-currency'].includes(tableItem.columnDisplayComponent)){
    return 'right'
  }
  if(tableItem.dataFormatRespVOS && ['rate','number','amt'].includes(tableItem.dataFormatRespVOS.formatType)){
    return 'right'
  }
  return 'left'
}
/**
 * 初始化表单数据，按照表初始化
 * @param pageInfo
 * @returns {{}}
 */
export const initFormData = (apiInfo) => {
  const formData = {}
  try {
    //去重数据获取表单中所有的表
    const tableMap:any = []
    for (const item of apiInfo.pageListConfigs) {
      const isExits = tableMap.find((tableItem) => tableItem.tableId === item.moduleTableId)
      if (!isExits) {
        //记录子表，并保存索引，用于排序
        tableMap.push({
          tableId: item.moduleTableId,
          isList: !!item.childTableId
        })
      }
    }
    //按去重后的表进行初始化，表单内列表特殊处理
    for (const item of tableMap) {
      if (item.isList) {
        formData['list_' + item.tableId] = []
      } else {
        formData[item.tableId] = {}
      }
    }
  } catch (e) {
    console.log(e)
  }
  return formData
}
/**
 * 初始化表格类型表单的表单数据
 * @param groupItem
 */
export const initTableFormData=(groupItem)=>{
  const formData = {
    [groupItem.tableId]:{}
  }
  return formData
}
export const setAttachmentGroup=(pageInfo)=>{
  const apiInfo=pageInfo.pageApiRespVOS.find(item=>item.apiCode=='form-create')
  let attachmentGroup:any={}
  if(pageInfo.attachmentInfo){
    attachmentGroup=cloneDeep(pageInfo.attachmentInfo)
    if(attachmentGroup.uploadFileList && attachmentGroup.uploadFileList.length){
      attachmentGroup.uploadFileList.forEach(item=>{
        //初始化附件联动
        initAttacementLinkageRule(apiInfo.pageListConfigs, item)
      })
    }
  }
  return attachmentGroup
}

export const initAttacementInfo=async (formData,pageInfo,nodeId)=> {
  const apiInfo=pageInfo.pageApiRespVOS.find(item=>item.apiCode=='form-create')
  //再已有附件内容基础上添加节点对应的上传附件
  // attacementInfo.uploadFileList=[
  //   {
  //     fileType:'1',
  //     fileTypeText:'文件类型',
  //     isRequire:1,
  //   }
  // ]
  //查询业务系统的附件
  const mainTableId=apiInfo.moduleTables?.find(item=>item.isMain)?.id
  const businessId=formData[mainTableId]['BUSINESS_ID_'+mainTableId]
  let bizAttachementList = []
  if(businessId && pageInfo.attachmentInfo?.isQueryBusinessFileList){
    try {
      bizAttachementList=await getBizAttachmentList(businessId)
      if(bizAttachementList){
        formData.attachmentList=[...(formData.attachmentList || []),...bizAttachementList]
      }
    } catch (error) {
      console.log(error);
    }
  }
  if(formData.attachmentList && formData.attachmentList.length){
    formData.attachmentList.forEach(item=>{
      delete item._X_ROW_KEY
    })
  }
  //查询业务系统附件，合并到流程中
  if(pageInfo.attachmentInfo && pageInfo.attachmentInfo.uploadFileList && pageInfo.attachmentInfo.uploadFileList.length){
    //显示上传节点为空或节点id为当前指定节点数据
    const allFileOriId=formData.attachmentList && formData.attachmentList.map(item=>item.oriAttachmentId) || []
    const curNodeFileList=pageInfo.attachmentInfo.uploadFileList.filter(item=>{
      //如果已存在到附件中，不再加载记录
      if(allFileOriId.includes(item.id)){
        return false
      }
      //如果业务系统已有该附件数据（主要用于驳回至发起人节点）
      const bizFileCode:any = bizAttachementList.find((item1:any) => item.fileTypeId === item1.fileType)
      if(bizFileCode){
        const attachment = formData.attachmentList.find(item => item.fileId === bizFileCode.fileId)
        attachment.isRequire = item.isRequire
        attachment.oriAttachmentId = item.id
        attachment.isFixed = true
        attachment.fileTypeText = item.fileTypeText || attachment.fileTypeText
        return false
      }
      if(nodeId){
        return item.flowNodeId==nodeId
      }else{
        return !item.flowNodeId
      }
    }).map(item=>{
      return {
        isFixed:true,
        oriAttachmentId:item.id,
        fileType: item.fileTypeId,
        fileTypeText:item.fileTypeText || item.fileTypeId,
        isRequire:item.isRequire,
        isHidden:false,
        isValidFileName:item.isValidFileName,
        validRule:item.validRule,
        fileAllowSuffix:item.fileAllowSuffix,
        uploadTemplateFileId:item.uploadTemplateFileId,
        uploadTemplateFileName:item.uploadTemplateFileName
      }
    })
    console.log('curNodeFileList',curNodeFileList)
    // 排序，将必填的排在最前面
    formData.attachmentList=[...(formData.attachmentList || []),...curNodeFileList].sort((a, b) => {
      return (b.isRequire || 0 )- (a.isRequire || 0) // 降序排列
    })
  }
}


const getBizAttachmentList=async (businessId)=>{
  try{
    const param={
      projectIdEquals:businessId,
      natrualKeyIdEquals:businessId
    }
    const attacementListRes=await getBusinessAttachment(param)
    if(attacementListRes && attacementListRes.records){
      return attacementListRes.records.map(item=>{
        return {
          isBiz:true,
          fileType:item.dirCode,
          isRequire:false,
          fileTypeText:item.fileType,
          fileName: item.fileName,
          fileId:item.id,
          flowNodeId:'',
          fileSize: 0,
          flowNodeText:'发起人',
          uploadUserId:item.operateBy,
          uploadUserText:item.uploadUser,
          uploadDate:item.uploadDate,
        }
      })
    }
    return null
  }catch (e){
    return null
  }

}

/**
 * 切换流程 更新表单项的权限  包括 分组下表单、子分组下表单、子列表
 */
export const updateFormItemByFlow=(formGroups,flowNodeInfo)=>{
  //遍历表单项，对表单数据进行处理，
  formGroups.forEach((item) => {
    updateGroupFormItem(item,flowNodeInfo)
    if(item.children && item.children.length){
      item.children.forEach(childGroupItem=>{
        updateGroupFormItem(childGroupItem,flowNodeInfo)
      })
    }
  })
}
const updateGroupFormItem=(item,flowNodeInfo)=>{
  item.formItems.forEach((formItem) => {
    if(formItem.isTableItem){
      formItem.tableItems.forEach((tableItem) => {
        changeFlowUpdateFormItem(tableItem,flowNodeInfo)
      })
    }else{
      changeFlowUpdateFormItem(formItem,flowNodeInfo)
    }
  })
}
/**
 * 更新分组下各个表单项的显隐
 * @param formItem
 * @param flowNodeInfo
 */
const changeFlowUpdateFormItem=(formItem,flowNodeInfo)=>{
  //查询流程配置
  const flowNodeFormItem = flowNodeInfo?.formProperties?.find(
    (nodeItem) => nodeItem.fieldId == formItem.fieldId
  )
  if (flowNodeFormItem) {
    formItem.isHidden = formItem.isHidden || flowNodeFormItem.hidden
    formItem.isRequire = flowNodeFormItem.required
    formItem.isDisabled = flowNodeFormItem.readonly
  }
}

export const scrollToDom=(domCls, tableWrapperCls = 'vxe-table--body-wrapper')=>{
  const targetEl = document.querySelector(`.${domCls}`);
  if(!targetEl) return;

  // 找到目标元素所在的 el-table 滚动容器（向上查找）
  const scrollContainer = targetEl.closest(`.${tableWrapperCls}`);
  if(scrollContainer) {
    // 不管表格是否在视口内，先滚动表格到视口
    scrollContainer.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
    // 延迟执行表格内部滚动（避免两次滚动冲突）
    setTimeout(() => {
      //计算目标元素相对于滚动容器的位置
      const containerRect = scrollContainer.getBoundingClientRect();
      const targetRect = targetEl.getBoundingClientRect();

      // 计算目标元素相对于滚动容器的横向偏移
      const targetLeftRelativeToContainer = targetRect.left - containerRect.left;

      // console.log('执行表格滚动')
      // console.log('containerRect', containerRect)
      // console.log('targetRect', targetRect)
      // console.log('targetLeftRelativeToContainer', targetLeftRelativeToContainer)
      scrollContainer.scrollTo({
        left: scrollContainer.scrollLeft + targetLeftRelativeToContainer - scrollContainer.clientWidth / 2, // 居中显示
        behavior: 'smooth',
      });
    }, 300); // 适当调整延迟时间（300ms 是典型平滑滚动的持续时间）
  }else {
    targetEl.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  }
}
