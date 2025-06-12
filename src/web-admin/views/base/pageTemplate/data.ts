import {formatDate} from '@/utils/formatTime'
//列表数据
export const columns = [
  {
    title: '序号',
    align: 'center',
    type: 'seq',
    width: 60,
  },
  {
    title: '模板名称',
    align: 'left',
    minWidth: 180,
    dataIndex: 'templateName',
    field: 'templateName',
    slots: {
      default: 'templateName_default',
    },
  },
  {
    title: '模板编码',
    align: 'center',
    dataIndex: 'templateCode',
    field: 'templateCode',
    minWidth: 130,
  },
  {
    title: '模板类型',
    align: 'center',
    width: 100,
    field: 'templateType',
    slots: {
      default: 'templateType_default',
    },
  },
  {
    title: '模板地址',
    align: 'center',
    dataIndex: 'templateAddress',
    field: 'templateAddress',
    minWidth: 130,
  },
  {
    title: '创建时间',
    align: 'center',
    dataIndex: 'createTime',
    field: 'createTime',
    width: 180,
    formatter ({ cellValue }) {
      return formatDate(cellValue, 'YYYY-MM-DD HH:mm:ss')
    }
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
