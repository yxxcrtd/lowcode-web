//列表数据
export const columns = [
  {
    title: '序号',
    align: 'center',
    type: 'seq',
    width: 60,
  },
  {
    title: '数据集类型',
    align: 'center',
    dataIndex: 'type',
    field: 'type',
    width: 120,
    slots: {
      default: 'type_default',
    },
  },
  {
    title: '数据集名称',
    align: 'left',
    minWidth: 100,
    dataIndex: 'name',
    field: 'name'
  },
  {
    title: '数据集编码',
    align: 'left',
    dataIndex: 'code',
    field: 'code',
    minWidth: 100,
  },
  {
    title: '备注',
    align: 'left',
    dataIndex: 'remark',
    field: 'remark',
    minWidth: 180,
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
