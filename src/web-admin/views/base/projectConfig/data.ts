export const cfgGroup={
  'Cfg_Common':'通用配置',
  'Cfg_Theme':'主题配置',
  'Cfg_Database':'数据库配置',
  'Cfg_PageRules':'页面规范',
  'Cfg_Variable':'全局变量'
}

//列表数据
export const sysFieldColumns = [
  {
    title: '序号',
    align: 'center',
    type: 'seq',
    width: 60,
  },
  {
    title: '数据库类型',
    align: 'left',
    minWidth: 180,
    field: 'typeSource',
  },
  {
    title: '字段名',
    align: 'left',
    minWidth: 180,
    field: 'columnName',
  },
  {
    title: '字段注释',
    align: 'left',
    minWidth: 180,
    field: 'columnComment',
  },
  {
    title: '顺序',
    align: 'left',
    minWidth: 180,
    field: 'columnPosition'
  },
  {
    title: '字段类型',
    align: 'center',
    field: 'columnType',
    minWidth: 130
  },
  {
    title: '长度',
    align: 'center',
    field: 'columnLength',
    width: 180
  },
  {
    title: '是否主键',
    align: 'center',
    field: 'primaryKey',
    width: 180,
  },
  {
    title: '是否可空',
    align: 'center',
    field: 'notNull',
    width: 180,
  },
  {
    title: '默认值',
    align: 'center',
    field: 'defaultValue',
    width: 180,
  },
  {
    title: '备注',
    align: 'center',
    field: 'remark',
    width: 180,
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


export const fieldTypeColumns = [
  {
    title: '序号',
    align: 'center',
    type: 'seq',
    width: 60,
  },
  {
    title: '类型名',
    align: 'left',
    minWidth: 180,
    field: 'dataType'
  },
  {
    title: '数据库类型',
    align: 'left',
    minWidth: 180,
    field: 'dbType',
  },
  {
    title: '长度',
    align: 'center',
    field: 'dataLength',
    minWidth: 130,
  },
  {
    title: '小数位',
    align: 'center',
    field: 'dataScale',
    width: 180,
  },
  {
    title: '备注',
    align: 'center',
    field: 'remark',
    width: 180,
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


export const sysParamterColumns = [
  {
    title: '序号',
    align: 'center',
    type: 'seq',
    width: 60,
  },
  {
    title: '参数名',
    align: 'left',
    minWidth: 180,
    dataIndex: 'name',
    field: 'name',
    edit:true,
    editType:'input'
  },
  {
    title: '参数编码',
    align: 'left',
    minWidth: 180,
    dataIndex: 'key',
    field: 'key',
    edit:true,
    editType:'input'
  },
  {
    title: '值',
    align: 'left',
    minWidth: 180,
    dataIndex: 'value',
    field: 'value',
    edit:true,
    editType:'input'
  },
  {
    title: '备注',
    align: 'center',
    dataIndex: 'remark',
    field: 'remark',
    width: 180,
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



export const commonModelColumns = [
  {
    title: '序号',
    align: 'center',
    type: 'seq',
    width: 60,
  },
  {
    title: '模型名',
    align: 'left',
    minWidth: 180,
    dataIndex: 'modelName',
    field: 'modelName',
    edit:true,
    editType:'input'
  },
  {
    title: '模型编码',
    align: 'left',
    minWidth: 180,
    dataIndex: 'modelCode',
    field: 'modelCode',
    edit:true,
    editType:'input'
  },
  {
    title: '备注',
    align: 'center',
    dataIndex: 'remark',
    field: 'remark',
    width: 180,
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

export const variableColumns = [
  {
    title: '序号',
    align: 'center',
    type: 'seq',
    width: 60,
  },
  {
    title: '字段名',
    align: 'left',
    minWidth: 180,
    dataIndex: 'fieldName',
    field: 'fieldName',
    edit:true,
    editType:'input'
  },
  {
    title: '缓存类型',
    align: 'center',
    dataIndex: 'cacheType',
    field: 'cacheType',
    width: 180,
  },
  {
    title: '字段描述',
    align: 'left',
    minWidth: 180,
    dataIndex: 'fieldDescribe',
    field: 'fieldDescribe',
    edit:true,
    editType:'input'
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

export const dbFieldType=[
  {
    label:'整数类型',
    value:'整数类型',
    options:[
      {
        label:'TINYINT',
        value:'TINYINT'
      },
      {
        label:'INT',
        value:'INT'
      },{
        label:'BIGINT',
        value:'BIGINT'
      }
    ]
  },{
    label:'浮点数类型',
    value:'浮点数类型',
    options:[
      {
        label:'FLOAT',
        value:'FLOAT'
      },{
        label:'DOUBLE',
        value:'DOUBLE'
      }
    ]
  },{
    label:'定点数类型',
    value:'定点数类型',
    options:[
      {
        label:'DECIMAL',
        value:'DECIMAL'
      }
    ]
  },{
    label:'位类型',
    value:'位类型',
    options:[
      {
        label:'BIT',
        value:'BIT'
      }
    ]
  },{
    label:'日期与时间类型',
    value:'日期与时间类型',
    options:[
/*      {
        label:'YEAR',
        value:'YEAR'
      },{
        label:'TIME',
        value:'TIME'
      },*/
      {
        label:'DATE',
        value:'DATE'
      },{
        label:'DATETIME',
        value:'DATETIME'
      },{
        label:'TIMESTAMP',
        value:'TIMESTAMP'
      }
    ]
  },{
    label:'字符串类型',
    value:'字符串类型',
    options:[
      {
        label:'CHAR',
        value:'CHAR'
      },{
        label:'VARCHAR',
        value:'VARCHAR'
      },{
        label:'TEXT',
        value:'TEXT'
      },{
        label:'MEDIUMTEXT',
        value:'MEDIUMTEXT'
      },{
        label:'LONGTEXT',
        value:'LONGTEXT'
      }
    ]
  },{
    label:'二进制类型',
    value:'二进制类型',
    options:[
      {
        label:'BINARY',
        value:'BINARY'
      },{
        label:'VARBINARY',
        value:'VARBINARY'
      },{
        label:'BLOB',
        value:'BLOB'
      }
    ]
  }
]
