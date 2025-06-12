# AceSelectTabsTable 组件

一个带标签页的下拉表格选择器组件。

## 功能特点

- 支持单选和多选模式
- 支持左侧标签页分类切换
- 支持表格搜索和筛选
- 支持远程数据加载和静态数据源
- 使用单表格实例，优化性能
- 使用节流函数处理频繁操作
- 支持对象数据的选择和回显
- 支持自定义列配置

## 属性

### Select 属性
| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| modelValue | Array/String/Number/Object/null | undefined | 选中值 |
| multiple | Boolean | false | 是否多选 |
| enableDetail | Boolean | false | 是否启用详情 |
| placeholder | String | '请选择' | 占位符文本 |
| valueKey | String | 'id' | 值字段名 |
| labelKey | String | 'name' | 标签字段名 |
| showLabel | String/Array | null | 初始显示标签 |

### Tabs 属性
| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| tabsList | Array | [] | 标签页列表 |
| defaultActiveTab | String/Number | '' | 默认激活的标签页 |

### Table 属性
| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| columnsTable | Array | [] | 表格列配置 |
| sourceUrl | String | '' | 数据源URL |
| sourceDataList | Array | null | 静态数据源 |
| tablePageConfig | Object | {} | 表格分页配置 |

## 事件

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| update:modelValue | 选中值更新时触发 | (value: any) |
| change | 选中值变化时触发 | (value: any) |

## 插槽

| 插槽名 | 说明 |
|--------|------|
| tag | 自定义多选标签的内容 |
| label | 自定义单选显示的内容 |