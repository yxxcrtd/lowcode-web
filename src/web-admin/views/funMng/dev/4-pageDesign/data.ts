import {eventType,callType} from "../data"
//列表数据
export const columns = [
  {
    title: '序号',
    align: 'center',
    type: 'seq',
    width: 60,
  },
  {
    title: '页面类型',
    width: 120,
    align: 'center',
    field: 'pageType',
    slots: {
      default: 'pageType_default',
    },
  },
  {
    title: '页面名称',
    align: 'left',
    minWidth: 180,
    field: 'pageName',
  },
  {
    title: '页面编码',
    align: 'left',
    field: 'pageCode',
    minWidth: 130,
  },
  {
    title: '状态',
    align: 'center',
    field: 'pageState',
    width: 100,
    slots: {
      default: 'pageState_default',
    },
  },
  {
    title: '描述',
    align: 'center',
    field: 'remark',
    minWidth: 130,
  },
  {
    title: '上次修改人',
    align: 'center',
    field: 'updater',
    width: 180,
  },
  {
    field: 'updateDate',
    title: '操作',
    align: 'center',
    fixed: 'right',
    width: 230,
    slots: {
      default: 'action_default',
    },
  },
];




export const eventColumns = [
  {
    title: '序号',
    align: 'center',
    type: 'seq',
    width: 60,
  },
  {
    title: '事件类型',
    align: 'left',
    minWidth: 180,
    field: 'eventType',
    formatter:({cellValue,row,column})=>eventColumnsFormat(cellValue,row,column)
  },
  {
    title: '执行时间点',
    align: 'center',
    field: 'runTime',
    minWidth: 130,
    formatter:({cellValue,row,column})=>eventColumnsFormat(cellValue,row,column)
  },
  {
    title: '是否拦截主操作',
    align: 'center',
    field: 'isIntercept',
    minWidth: 130,
    formatter:({cellValue})=>cellValue==1?'是':'否'
  },
  {
    title: '调用类型',
    align: 'center',
    field: 'callType',
    width: 180,
    formatter:({cellValue,row,column})=>eventColumnsFormat(cellValue,row,column)
  },
  {
    title: '接口',
    align: 'center',
    field: 'interfaceName',
    minWidth: 130,
  },
  {
    title: '方法',
    align: 'center',
    field: 'methodName',
    minWidth: 130,
  },
  {
    title: '代码',
    align: 'center',
    field: 'executableCode',
    minWidth: 130,
    slots: {
      default: 'executableCode_default',
    },
  },
  {
    title: '排序',
    align: 'center',
    field: 'sort',
    minWidth: 130,
  },
  {
    title: '操作',
    align: 'center',
    fixed: 'right',
    width: 210,
    slots: {
      default: 'action_default',
    },
  },
];

export const eventColumnsFormat=(cellValue,row,column)=>{
  if(column.field==='callType'){
    const callTypeItem=callType.find(item=>item.value===cellValue)
    return callTypeItem?.label
  }
  const eventTypeOption=eventType.find(item=>item.value==row.eventType)
  if(column.field==='eventType'){
    return eventTypeOption?.label
  }
  if(column.field==='runTime'){
    const runTimeItem=eventTypeOption?.children.find(item=>item.value==cellValue)
    return runTimeItem?.label
  }
}

export const paramterColumns = [
  {
    title: '序号',
    align: 'center',
    type: 'seq',
    width: 60,
  },
  {
    title: '参数名称',
    align: 'left',
    minWidth: 180,
    field: 'pageName'
  },
  {
    title: '参数字段',
    align: 'center',
    field: 'pageCode',
    minWidth: 130,
  },
  {
    title: '是否必填',
    align: 'center',
    field: 'pageState',
    width: 180,
  },
  {
    title: '描述',
    align: 'center',
    field: 'remark',
    minWidth: 130,
  },
  {
    title: '操作',
    align: 'center',
    fixed: 'right',
    width: 210,
    slots: {
      default: 'action_default',
    },
  },
];


// 日志列表 
export const logTableColumns = [
  {
    title: '序号',
    align: 'center',
    field: 'id',
    minWidth: 60
  },
  {
    title: '级别',
    align: 'center',
    field: 'level',
    minWidth: 100
  },
  {
    title: '内容',
    align: 'left',
    field: 'message',
    minWidth: 300
  },
  {
    title: '修改时间',
    align: 'center',
    field: 'timestamp',
    minWidth: 180
  },
  {
    title: '修改人',
    align: 'center',
    field: 'user',
    minWidth: 180
  },
  {
    title: '操作',
    align: 'center',
    fixed: 'right',
    width: 100,
    slots: {
      default: 'action_default',
    },
  },
]