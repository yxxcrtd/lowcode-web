//列表数据
export const columns = [
  {
    title: '序号',
    align: 'center',
    type: 'seq',
    width: 60,
  },
  {
    title: '岗位编号',
    align: 'center',
    minWidth: 100,
    dataIndex: 'id',
    field: 'id',
    treeNode: true,
  },
  {
    title: '岗位名称',
    align: 'center',
    dataIndex: 'name',
    field: 'name',
    minWidth: 130,
  },
  {
    title: '岗位编码',
    align: 'center',
    dataIndex: 'code',
    field: 'code',
    width: 100,
  },
  {
    title: '岗位顺序',
    align: 'center',
    dataIndex: 'sort',
    field: 'sort',
    width: 100,
  },
  {
    title: '岗位备注',
    align: 'center',
    dataIndex: 'remark',
    field: 'remark',
    width: 180,
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
    title: '操作',
    align: 'center',
    fixed: 'right',
    width: 210,
    slots: {
      default: 'action_default',
    },
  },
];
