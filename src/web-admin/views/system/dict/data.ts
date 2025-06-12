//列表数据
export const columns = [
  {
    title: '序号',
    align: 'center',
    type: 'seq',
    width: 60,
  },
  {
    title: '字典编号',
    align: 'center',
    minWidth: 180,
    dataIndex: 'id',
    field: 'id'
  },
  {
    title: '字典名称',
    align: 'center',
    dataIndex: 'name',
    field: 'name',
    minWidth: 130,
  },
  {
    title: '字典类型',
    align: 'center',
    dataIndex: 'type',
    field: 'type',
    minWidth: 130,
  },
  {
    title: '状态',
    align: 'center',
    dataIndex: 'status',
    field: 'status',
    width: 180,
    slots: {
      default: 'action_default_tag',
    },
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

