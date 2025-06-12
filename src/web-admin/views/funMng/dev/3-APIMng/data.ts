//列表数据
export const columns = [
  {
    title: '序号',
    align: 'center',
    type: 'seq',
    width: 60,
  },
  {
    title: '数据模型',
    align: 'left',
    minWidth: 180,
    field: 'moduleName'
  },
  {
    title: '服务名称',
    align: 'left',
    minWidth: 180,
    field: 'serviceName'
  },
  {
    title: '服务编码',
    align: 'left',
    field: 'serviceCode',
    minWidth: 130,
  },
  {
    title: '服务类型',
    align: 'center',
    field: 'serviceType',
    width: 180,
    formatter:({cellValue})=>serviceType.find(item=>item.value==cellValue)?.label
  },
  {
    title: '说明',
    align: 'left',
    field: 'remark',
    width: 220,
  },
  {
    title: '操作',
    align: 'center',
    fixed: 'right',
    width: 120,
    slots: {
      default: 'action_default',
    },
  },
];

const serviceType=[
  {label:'默认服务',value:1},
  {label:'HTTP服务',value:2},
  {label:'SQL服务',value:1},
  {label:'JAVA服务',value:1},
]

export const apiParamColumns = [
  {
    title: '序号',
    align: 'center',
    type: 'seq',
    width: 60,
  },
  // {
  //   title: '参数类型',
  //   align: 'left',
  //   minWidth: 140,
  //   field: 'paramType'
  // },
  {
    title: '参数名称',
    align: 'left',
    minWidth: 140,
    field: 'fieldComment'
  },
  {
    title: '参数字段',
    align: 'left',
    minWidth: 240,
    field: 'fieldName'
  },
  {
    title: '字段类型',
    align: 'left',
    minWidth: 120,
    field: 'dataType'
  },
  {
    title: '是否必填',
    align: 'left',
    field: 'required',
    minWidth: 80,
    formatter:({cellValue})=>cellValue?'是':'否',
  }
];
