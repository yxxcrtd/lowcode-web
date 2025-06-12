import {formatDate} from '@/utils/formatTime'
//列表数据
export const columns = [
  {
    title: '序号',
    align: 'center',
    type: 'seq',
    width: 60
  },
  {
    title: '模型名称',
    align: 'left',
    minWidth: 180,
    field: 'moduleName',
    slots: {
      default: 'moduleName_default'
    }
  },
  {
    title: '模型编码',
    align: 'left',
    minWidth: 180,
    field: 'moduleCode'
  },
  {
    title: '模型类型',
    align: 'left',
    minWidth: 180,
    field: 'moduleType',
    slots: {
      default: 'moduleType_default'
    }
  },
  {
    title: '描述',
    align: 'left',
    field: 'remark',
    minWidth: 130
  },
  {
    title: '最近修改人',
    align: 'left',
    width: 180,
    field: 'updater'
  },
  {
    title: '最近修改时间',
    align: 'left',
    width: 180,
    field: 'updateTime',
    formatter({ cellValue }) {
      return formatDate(cellValue, 'YYYY-MM-DD HH:mm:ss')
    }
  },
  {
    title: '操作',
    align: 'center',
    fixed: 'right',
    width: 210,
    slots: {
      default: 'action_default'
    }
  }
]
export const apiColumns = [
  {
    title: '序号',
    align: 'center',
    type: 'seq',
    width: 60,
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
    minWidth: 180,
    field: 'serviceCode'
  },
  {
    title: '服务类型',
    align: 'left',
    minWidth: 180,
    field: 'serviceType'
  },
  {
    title: '说明',
    align: 'left',
    field: 'remark',
    minWidth: 130,
  },
  {
    title: '操作',
    align: 'center',
    fixed: 'right',
    width: 180,
    slots: {
      default: 'action_default',
    },
  },
];

