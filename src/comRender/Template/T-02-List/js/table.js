import {getDictLabel} from "@/utils/dict"
import {formatToDateTime} from "@/utils/dateUtil";
import {formatCurrency, formatNum, formatNumber} from "@/utils/formatter";
import {validateRowCondition} from "@/comRender/render/v1/Core/linkage";
/**
 * 组装表格参数
 * @returns {{}}
 */
export const getTableProps=()=>{
  let tableProps={

  }
  return tableProps
}
/**
 * 组装表格列
 * @param pageInfo
 * @returns {{field: string, minWidth: number, title: *, align: *}[]}
 */
export const getTableColumns=(pageInfo,tableButtons)=>{
  let pageFieldList=pageInfo.pageListConfigs || [];
  pageFieldList=pageFieldList.filter(item=>!item.childTableId)
  pageFieldList.sort((a,b)=>{
    return a.sort-b.sort
  })
  let columns= pageFieldList.map((item) => {
    let col={
      title: item.columnNameAlias || item.columnComment,
      align: item.columnAlignment,
      field:item.columnName+'_'+item.moduleTableId,
      sortable:item.isColumnSort,
      fixed:item.isColumnFixed==='none' ? null :item.isColumnFixed,
      minWidth: item.columnFixedWidth || 180,
      //width:item.columnFixedWidth || 180,
      params:{
        slot:item.columnSlot,
        headSlot:item.columnHeadSlot,
        titleTips:item.columnHeadTips,
      },
      slots:{
        header:item.columnName+'_'+item.tableId+'_header'
      }
    }
    //对于是需要对数据进行转换的操作，添加插槽
    if(item.dataConversionRespVOS || item.dataFormatRespVOS || item.columnSlot){
      col.slots.default = item.columnName+'_'+item.tableId+'_default'
    }
    return col;
  })
  //添加序号列
  columns.unshift({
    title: '序号',
    align: 'center',
    type: 'seq',
    fixed:'left',
    width: 60,
  })
  //添加复选框列
  columns.unshift({
    align: 'center',
    type: 'checkbox',
    fixed:'left',
    width: 50,
  })
  //添加操作列
  if(tableButtons && tableButtons.length>0){
    //添加操作列
    columns.push({
      field: 'action',
      title: '操作',
      align: 'center',
      fixed: 'right',
      width: tableButtons.length*60 + 50,
      slots: {
        default: 'action_default',
      },
    })
  }
  return columns
}
/**
 * 获取表格所有插槽
 * @param columns
 * @returns {*}
 */
export const getColumnsSlots=(columns)=>{
  const slots=columns.reduce((pre,cur)=>{
    if(cur.field!='action' && cur.slots){
      Object.keys(cur.slots).forEach((key)=>{
        pre.push(cur.slots[key])
      })
    }
    return pre
  },[])
  return slots;
}
/**
 * 表格内数据格式化
 * @param item
 */
export const columnFormater=(apiInfo,row,rowIndex,column)=>{
  const {field} =column
  const columnInfo=apiInfo.pageListConfigs.find(item=>(item.columnName+'_'+item.moduleTableId)==field)
  let columnText=row[column.field]
  if(columnInfo){
    const {dataConversionRespVOS,dataFormatRespVOS}=columnInfo
    //判断数据是否需要转换
    if(dataConversionRespVOS && columnText){
      columnText=columnDataConvert(dataConversionRespVOS,columnText)
    }
    if(dataFormatRespVOS){
      columnText=columnDataFormat(dataFormatRespVOS,columnText)
    }
  }
  return columnText
}
/**
 * 列数据转换
 * @param convertDataConfig
 * @param val
 * @returns {*|string}
 */
const columnDataConvert=(convertDataConfig,val)=>{
  const {dataType,dataContent,dataRegular,dataScript}=convertDataConfig
  if(dataType==='dict'){
    return getDictLabel(dataContent,val)
  }
  if(dataType==='regular'){
    const regex=new RegExp(dataRegular,'g');
    return val.replace(regex,val)
  }
}
/**
 * 列数据格式化
 * @param formatCfg
 * @param val
 * @returns {*}
 */
const columnDataFormat=(formatCfg,val)=>{
  const {formatType,prefix,suffix}=formatCfg
  let text=val
  switch(formatType){
    case 'number':
      text=formatNum(val,true,formatCfg)
      break;
    case 'amt':
      text=formatNum(val,true,formatCfg)
      break;
    case 'rate':
      text=formatNum(val,true,formatCfg)
      break;
    case 'datetime':
      text=formatToDateTime(val,formatCfg.dateFormat)
      break;
    case 'img':
    case 'link':
    case 'regular':
      if(val){
        const regex=new RegExp(formatCfg.regularExpression,'g');
        text=val.replace(regex,val)
      }
      break;
    case 'script':
      break;
  }
  //添加前缀后缀
  if(prefix){
    text=prefix+text
  }
  if(suffix){
    text=text+suffix
  }
  return text;
}

export const rowBtnEvent=(btnItem,row,rowIndex)=>{
  //编辑-判断
  if(btnItem.btnType==='edit'){//编辑

  }else if(btnItem.btnType==='delete'){//删除
    const message = useMessage() // 消息弹窗
    message.delConfirm().then(e=>{
      //调用模型的单行删除接口

    }).catch(e=>{
      console.error(e)
    })
  }
}

/**
 * 组装表格按钮 并将显示条件转换为可执行js字符串
 * @param pageButtons
 * @param apiCode
 * @param tableColumns
 * @returns {*}
 */
export const getTableButtons=(pageButtons,apiCode,tableColumns)=>{
  const tableRowButtons=pageButtons?.filter((item) => item.apiCode === apiCode && item.buttonType === 'row') || []
  //拼接显示条件
  tableRowButtons.forEach(item=>{
    if(item.conditionalTableRespVO && item.conditionalTableRespVO.condition){
      item.showRuleStr=validateRowCondition(tableColumns,item.conditionalTableRespVO.condition)
    }
  })
  return tableRowButtons
}
