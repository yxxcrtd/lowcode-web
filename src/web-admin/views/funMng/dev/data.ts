
export interface OptionEx extends Option{
  isLeaf:boolean,
  level:string
}
export interface param extends PageParam{
  datasourceId?:string
  tableId?:string
}


export const eventType = [
  {
    label: '前端',
    value: 'font',
    children: [
      {
        label: '生命周期-Create',
        value: 'create'
      },
      {
        label: '生命周期-Mounted',
        value: 'mounted'
      },
      {
        label: '生命周期-Actived',
        value: 'actived'
      },
      {
        label: '数据加载前',
        value: 'data-load-before'
      },
      {
        label: '数据加载后',
        value: 'data-load-after'
      },
      {
        label: '保存前',
        value: 'before-save'
      },
      {
        label: '保存成功后',
        value: 'after-save'
      },
      {
        label: '保存失败后',
        value: 'after-save-fail'
      }
    ]
  },
  {
    label: '后端',
    value: 'back',
    children: [
      {
        label: '页面配置加载前',
        value: 'page-api-before'
      },
      {
        label: '页面配置加载后',
        value: 'page-api-after'
      },
      {
        label: 'API服务加载前',
        value: 'api-load-before'
      },
      {
        label: 'API服务加载后',
        value: 'api-load-after'
      }
    ]
  }
]


export const callType=[
  {
    label:'调用方法',
    value:'1'
  },{
    label:'调用接口',
    value:'2'
  },{
    label:'执行代码',
    value:'3'
  }
]
