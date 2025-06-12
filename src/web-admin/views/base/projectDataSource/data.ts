//列表数据
export const columns = [
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
    dataIndex: 'deptId',
    field: 'deptId'
  },
  {
    title: '数据类型',
    align: 'center',
    dataIndex: 'deptName',
    field: 'deptName',
    minWidth: 130,
  },
  {
    title: '长度',
    align: 'center',
    dataIndex: 'deptName',
    field: 'deptName',
    minWidth: 130,
  },
  {
    title: '小数位',
    align: 'center',
    dataIndex: 'deptName',
    field: 'deptName',
    minWidth: 130,
  },
  {
    title: '备注',
    align: 'center',
    dataIndex: 'mobile',
    field: 'mobile',
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
