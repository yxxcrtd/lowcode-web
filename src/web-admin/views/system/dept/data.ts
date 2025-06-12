//列表数据
import {formatDate} from '@/utils/formatTime'
import * as UserApi from "@/api/system/user";
const userList = await UserApi.getSimpleUserList()
export const columns = [
  {
    title: '序号',
    align: 'center',
    type: 'seq',
    width: 60,
  },
  {
    title: '部门名称',
    align: 'center',
    minWidth: 100,
    dataIndex: 'name',
    field: 'name',
    treeNode: true,
  },
  {
    title: '负责人',
    align: 'center',
    dataIndex: 'leaderUserId',
    field: 'leaderUserId',
    minWidth: 130,
    formatter ({ cellValue }) {
      return userList.find((user) => user.id === cellValue)?.nickname
    }
  },
  {
    title: '排序',
    align: 'center',
    dataIndex: 'sort',
    field: 'sort',
    width: 100,
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
    width: 210,
    slots: {
      default: 'action_default',
    },
  },
];
