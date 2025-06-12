//列表数据
export const columns = [
  {
    title: '序号',
    align: 'center',
    type: 'seq',
    width: 60,
  },
  {
    title: '版本号',
    align: 'center',
    minWidth: 180,
    field: 'version'
  },
  {
    title: '更新内容',
    align: 'center',
    field: 'updateContent',
    minWidth: 130,
  },
  {
    title: '更新日期',
    align: 'center',
    field: 'createDate',
    minWidth: 130,
  },
  {
    title: '脚本开始时间',
    align: 'center',
    field: 'startDate',
    width: 180,
  },
  {
    title: '脚本结束时间',
    align: 'center',
    field: 'endDate',
    width: 180,
  },
  {
    title: '脚本源文件',
    align: 'center',
    field: 'fileUrl',
    width: 180,
    slots: {
      default: 'fileUrl_default',
    },
  },
  {
    title: '更新结果',
    align: 'center',
    dataIndex: 'remark',
    field: 'result',
    width: 300,
    slots: {
      default: 'result_default',
    },
  }
];
