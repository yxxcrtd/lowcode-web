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
    title: '组件名称',
    align: 'left',
    minWidth: 130,
    dataIndex: 'componentName',
    field: 'componentName'
  },
  {
    title: '组件编码',
    align: 'left',
    dataIndex: 'componentCode',
    field: 'componentCode',
    minWidth: 130,
  },
  {
    title: '所属分组',
    align: 'left',
    field: 'groupId',
    minWidth: 130,
  },
  {
    title: '说明',
    align: 'left',
    field: 'remark',
    minWidth: 130,
  },
  {
    title: '创建时间',
    align: 'center',
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

export const propsTableColumns = [
  {
    title: '序号',
    align: 'center',
    type: 'seq',
    width: 60,
  },
  {
    title: '属性',
    align: 'center',
    minWidth: 130,
    field: 'attributeCode',
    slots: {
      default: 'attributeCode_default',
    },
  },
  {
    title: '属性名称',
    align: 'center',
    field: 'attributeName',
    minWidth: 130,
    slots: {
      default: 'attributeName_default',
    },
  },
  {
    title: '属性类型',
    align: 'center',
    field: 'attributeType',
    minWidth: 130,
    slots: {
      default: 'attributeType_default',
    },
  },
  {
    title: '默认值',
    align: 'center',
    field: 'attributeValue',
    minWidth: 130,
    slots: {
      default: 'attributeValue_default',
    },
  },
  {
    title: '操作',
    align: 'center',
    fixed: 'right',
    width: 120,
    slots: {
      default: 'action_default',
    },
  },
];
