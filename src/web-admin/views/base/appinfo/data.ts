import {getDictLabel, DICT_TYPE} from '@/utils/dict'
//列表数据
export const columns = [
  {
    title: '序号',
    align: 'center',
    type: 'seq',
    width: 60,
  },
  {
    title: '应用名称',
    align: 'center',
    minWidth: 180,
    dataIndex: 'appName',
    field: 'appName'
  },
  {
    title: '应用编码',
    align: 'center',
    dataIndex: 'appCode',
    field: 'appCode',
    minWidth: 130,
  },
  {
    title: '应用地址',
    align: 'center',
    dataIndex: 'appAddress',
    field: 'appAddress',
    minWidth: 130,
  },
  {
    title: '容器  ',
    align: 'center',
    dataIndex: 'container',
    field: 'container',
    width: 180,
  },
  {
    title: '状态  ',
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
