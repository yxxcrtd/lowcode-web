# 信托三分类级联选择器

一个基于 Element Plus 的级联选择器组件，专门用于信托三分类数据的选择。支持单选/多选、搜索、完整路径显示等功能。

## ✨ 功能特点

- 支持单选和多选模式
- 支持搜索功能
- 支持显示完整路径
- 支持悬浮提示（当选项文本过长时）
- 标签自动省略显示
- 支持清空选择
- 支持自定义展开触发方式

## 📖 API

### Props

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| modelValue | `string \| number \| Array` | null | 选中项的值 |
| multiple | boolean | false | 是否开启多选模式 |
| showAllLevels | boolean | true | 是否显示完整路径 |
| emitPath | boolean | false | 是否返回节点路径值 |
| expandTrigger | string | 'click' | 子菜单触发展开的方式 |
| filterable | boolean | true | 是否开启搜索功能 |
| showTooltip | boolean | true | 是否显示悬浮提示 |

### Events

| 事件名 | 参数 | 说明 |
|--------|------|------|
| update:modelValue | (value: CascaderValue) | 选中值更新时触发 |
| change | (value: CascaderValue) | 选中值变化时触发 |

## 🔍 Props 详细说明

### modelValue

选中项的值，支持以下几种类型：
- `''`：空字符串（清空选择）
- `null`：未选择任何值
- `undefined`：未定义
- `[]`：空数组（清空多选）
- `string/number`：单选模式下的选中值
- `Array<string|number>`：多选模式下的选中值数组

### multiple

是否开启多选模式，开启后可以同时选择多个选项。

### showAllLevels

是否在选择器中显示选中项的完整层级路径：
- `true`：显示为 "父级/子级/选中项"
- `false`：仅显示 "选中项"

### emitPath

选择节点时是否返回节点的完整路径值数组：
- `true`：返回 `['root', 'child', 'leaf']`
- `false`：返回 `'leaf'`

### expandTrigger

配置如何触发子菜单的展开：
- `'click'`：点击触发（默认）
- `'hover'`：悬浮触发

### filterable

是否开启搜索功能，开启后可以通过输入关键字快速查找选项。

### showTooltip

鼠标悬浮在选择框上时是否显示选中项的完整内容。


## ⚠️ 注意事项

1. 组件依赖 Element Plus，请确保项目中已安装
2. 数据源需要符合指定的格式要求
3. 多选模式下，标签会自动省略显示
4. 悬浮提示会显示完整的选中路径
5. 搜索功能支持快速查找选项

## 👨‍💻 贡献者

- miffy

## 📋 更新日志

### 1.0.0 (2024-11-13)

- 🎉 初始版本发布
- ✨ 实现基础功能
- 📝 添加文档说明

## 📄 License

[MIT](LICENSE)