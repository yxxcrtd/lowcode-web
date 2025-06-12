import {formatDate} from "@/utils/formatTime";


const formaterData=({cellValue})=>{
  return formatDate(cellValue)
}

/**
 * 选择流程抽屉表格
 */
export const columns=[
  { type: 'checkbox', title: '', width: 50 },
  {field: 'processNumber',title: '流程编号',align:'left',minWidth: 80},
  {field: 'instanceTitle',title: '流程标题',align:'left',minWidth:300},
  {field: 'startUserAsText',title: '发起人',align:'left',minWidth: 150},
  {field: 'instanceStateAsText',title: '流程状态',align:'left',minWidth: 150},
  {field: 'dealUserAsText',title: '当前处理人',align:'left',minWidth: 150},
  {field: 'initialDate',title: '发起时间',align:'left',minWidth: 200,formatter:formaterData},
  {field: 'finishDate',title: '结束时间',align:'left',minWidth: 200,formatter:formaterData},
]
