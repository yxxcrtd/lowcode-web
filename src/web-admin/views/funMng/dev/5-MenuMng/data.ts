//列表数据
export const columns = [
  {
    title: '序号',
    align: 'center',
    type: 'seq',
    width: 60,
  },
  {
    title: '菜单名称',
    align: 'left',
    minWidth: 180,
    field: 'name',
    slots:{
      default:'name_default'
    }
  },
  {
    title: '菜单路径',
    field: 'path',
    width: 300,
  },
  {
    title: '关联页面',
    field: 'pageId',
    width: 180,
  },
  {
    title: '排序',
    align: 'center',
    field: 'sort',
    width: 180,
  },
  {
    title: '菜单类型',
    field: 'type',
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
