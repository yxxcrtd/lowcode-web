import {formatDate} from "@/utils/formatTime";

export type dataSourceItem ={
  id:string,
  dataSourceType:string,
  dataSourceName:string
}
//列表数据
export const columns = [
  {
    title: '序号',
    align: 'center',
    type: 'seq',
    width: 60,
  },
  {
    title: '表名',
    align: 'left',
    minWidth: 180,
    field: 'tableName'
  },
  {
    title: '名称',
    align: 'left',
    minWidth: 180,
    field: 'tableComment'
  },
  {
    title: '表类型',
    align: 'center',
    field: 'tableType',
    width: 100,
    slots: {
      default: 'tableType_default',
    }
  },
  {
    title: '数据源',
    align: 'center',
    field: 'datasourceName',
    width: 180,
  },
  {
    title: '状态',
    align: 'center',
    field: 'status',
    width: 100,
    slots: {
      default: 'status_default',
    }
  },
  {
    title: '描述',
    align: 'center',
    field: 'remark',
    minWidth: 130,
  },
  {
    title: '更新时间',
    align: 'center',
    field: 'updateTime',
    minWidth: 130,
    formatter({ cellValue }) {
      return formatDate(cellValue, 'YYYY-MM-DD HH:mm:ss')
    }
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

export const apiColumns = [
  {
    title: '序号',
    align: 'center',
    type: 'seq',
    width: 60,
  },
  {
    title: '服务名称',
    align: 'left',
    minWidth: 180,
    field: 'apiName'
  },
  {
    title: '服务编码',
    align: 'left',
    minWidth: 180,
    field: 'apiCode'
  },
  {
    title: '说明',
    align: 'left',
    field: 'remark',
    minWidth: 130,
  },
  {
    title: '操作',
    align: 'center',
    fixed: 'right',
    width: 180,
    slots: {
      default: 'action_default',
    },
  },
];

export const fieldColumns = [
  {
    title: '',
    align: 'center',
    type: 'checkbox',
    width: 60,
  },
  {
    title: '序号',
    align: 'center',
    type: 'seq',
    width: 60,
  },
  {
    title: '字段',
    align: 'left',
    minWidth: 180,
    field: 'fieldCode'
  },
  {
    title: '名称',
    align: 'left',
    minWidth: 180,
    field: 'fieldName'
  },
  {
    title: '说明',
    align: 'left',
    field: 'remark',
    minWidth: 130,
  },
];


export const loadTableColumns = [
  {
    title: '',
    align: 'center',
    type: 'checkbox',
    width: 60,
  },
  {
    title: '序号',
    align: 'center',
    type: 'seq',
    width: 60,
  },
  {
    title: '表名称',
    align: 'left',
    minWidth: 180,
    field: 'tableName'
  },
  {
    title: '表描述',
    align: 'left',
    minWidth: 180,
    field: 'tableComment'
  },
  {
    title: '创建时间',
    align: 'left',
    field: 'createTime',
    minWidth: 130,
  },
  {
    title: '更新时间',
    align: 'left',
    field: 'updateTime',
    minWidth: 130,
  },
];

// 字段列表列
export const fieldListColumns = [
  {
    type: 'seq',
    title: '序号',
    width: 60,
    align: 'center',
    slots: { default: 'seq' }
  },
  {
    field: 'columnName',
    title: '字段名',
    minWidth: 180,
    slots: { default: 'columnName' }
  },
  {
    field: 'columnComment',
    title: '名称',
    minWidth: 180,
    slots: { default: 'columnComment' }
  },
  {
    field: 'dataDomainId',
    title: '数据类型',
    width: 180,
    slots: { default: 'dataDomainId' }
  },
  {
    field: 'columnLength',
    title: '长度',
    width: 180,
    slots: { default: 'columnLength' }
  },
  {
    field: 'columnScale',
    title: '小数位',
    width: 180,
    slots: { default: 'columnScale' }
  },
  {
    field: 'component',
    title: '控件类型',
    width: 220,
    slots: { default: 'component' }
  },
  {
    field: 'isNotNull',
    title: '不为空',
    width: 80,
    slots: { default: 'isNotNull' }
  },
  {
    field: 'defaultValue',
    title: '默认值(字符单引号包裹)',
    width: 180,
    slots: { default: 'defaultValue' }
  }
]
