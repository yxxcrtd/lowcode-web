//列表数据
export const columns = [
  {
    title: '序号',
    align: 'center',
    type: 'seq',
    width: 60,
  },
  {
    title: '数据源编码',
    align: 'center',
    minWidth: 180,
    dataIndex: 'code',
    field: 'code'
  },
  {
    title: '数据源名称',
    align: 'center',
    dataIndex: 'name',
    field: 'name',
    minWidth: 130,
  },
  {
    title: 'ip',
    align: 'center',
    dataIndex: 'ip',
    field: 'ip',
    minWidth: 130,
  },
  {
    title: '类型',
    align: 'center',
    dataIndex: 'typeSource',
    field: 'typeSource',
    width: 180,
  },
  {
    title: '备注',
    align: 'center',
    dataIndex: 'remark',
    field: 'remark',
    width: 300,
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
