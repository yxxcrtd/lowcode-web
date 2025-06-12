//列表数据
export const columns = [
  {
    title: '序号',
    align: 'center',
    type: 'seq',
    width: 60,
  },
  {
    title: '字典编码',
    align: 'center',
    minWidth: 180,
    dataIndex: 'id',
    field: 'id'
  },
  {
    title: '字典标签',
    align: 'center',
    dataIndex: 'label',
    field: 'label',
    minWidth: 130,
  },
  {
    title: '字典键值',
    align: 'center',
    dataIndex: 'value',
    field: 'value',
    minWidth: 130,
  },
  {
    title: '字典排序',
    align: 'center',
    dataIndex: 'sort',
    field: 'sort',
    width: 180,
  },
  {
    title: '备注',
    align: 'center',
    dataIndex: 'remark',
    field: 'remark',
    width: 180,
  },
  {
    title: '创建时间',
    align: 'center',
    dataIndex: 'createTime',
    field: 'createTime',
    width: 180,
    slots: { default: 'createTime' }
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
