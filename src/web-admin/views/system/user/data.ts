//列表数据
import {formatDate} from "@/utils/formatTime";

export const columns = [
  {
    title: '序号',
    align: 'center',
    type: 'seq',
    width: 60,
  },
  {
    title: '用户名称',
    align: 'center',
    minWidth: 90,
    dataIndex: 'username',
    field: 'username'
  },
  {
    title: '用户昵称',
    align: 'center',
    dataIndex: 'nickname',
    field: 'nickname',
    minWidth: 100,
  },
  {
    title: '部门',
    align: 'center',
    dataIndex: 'deptName',
    field: 'deptName',
    width: 120,
  },
  {
    title: '手机号码',
    align: 'center',
    dataIndex: 'mobile',
    field: 'mobile',
    width: 120,
  },
  {
    title: '状态',
    align: 'center',
    dataIndex: 'status',
    field: 'status',
    width: 100,
    slots: {
      default: 'status_default',
    },
  },
  {
    title: '创建时间',
    align: 'center',
    dataIndex: 'createTime',
    field: 'createTime',
    width: 180,
    formatter ({ cellValue }) {
      return formatDate(cellValue, 'YYYY-MM-DD')
    }
  },
  {
    title: '操作',
    align: 'center',
    fixed: 'right',
    width: 240,
    slots: {
      default: 'action_default',
    },
  },
];
