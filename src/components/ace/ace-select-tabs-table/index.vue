<!--
 * @Description: 带标签页的下拉表格选择器
 * @Author: miffy
 * @Date: 2024-11-09
 *
 * 功能：
 * 1. 支持单选和多选模式
 * 2. 支持左侧标签页分类切换
 * 3. 支持表格搜索和筛选
 * 4. 支持远程数据加载和静态数据源
 * 5. 使用单表格实例，优化性能
 * 6. 使用节流函数处理频繁操作
 * 7. 支持对象数据的选择和回显
 * 8. 支持自定义列配置
-->

<template>
  <div class="ace-select-wrapper">
    <el-select
      ref="selectRef"
      v-model="innerValue"
      :multiple="multiple"
      :placeholder="placeholder"
      :disabled="disabled"
      :value-key="valueKey"
      clearable
      popper-class="ace-select-tabs-table"
      @visible-change="handleVisibleChange"
      @clear="handleClear"
    >
      <template v-if="multiple" #tag>
        <el-tag v-for="item in selectedObjValue" :key="item[valueKey]" closable @close="handleRemoveTag(item[valueKey])"> {{ item[labelKey] }} </el-tag>
      </template>

      <template v-if="!multiple" #label>
        <span>{{ getDisplayText }}</span>
      </template>

      <template #empty>
        <div class="select-dropdown-container">
          <!-- 左侧标签页 -->
          <el-tabs v-model="activeTab" class="custom-tabs" tab-position="left" @tab-change="handleTabChange">
            <el-tab-pane v-for="item in curTabList" :key="item.value" :label="item.label" :name="item.value" />
          </el-tabs>

          <!-- 表格容器 -->
          <div class="table-container">
            <!-- 搜索框 -->
            <div class="search-box">
              <el-input v-model="searchKeyword" placeholder="请输入搜索关键词" clearable @input="handleSearch">
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
            </div>

            <!-- 表格组件 -->
            <JVxeTable 
              v-if="isLoad"
              ref="jVxeTable"
              height="350px"
              :columns="processedColumns"
              :search-params="computedQueryParams"
              :data-url="sourceUrl"
              :data-source="sourceDataList"
              :table-page-config="tablePageConfig"
              :show-check-box="multiple"
              :check-box-config="checkBoxConfig"
              :radio-config="radioConfig"
              :row-config="computedRowConfig"
              :is-row-check="false"
              @load-success="handleLoadSuccess"
              @checkbox-change="handleChangeRow"
              @checkbox-all="handleCheckAll"
              @radio-change="handleRadioChange"
              :isShowRightButton="['refresh',]"
            />
          </div>
        </div>
      </template>
    </el-select>
  </div>
</template>

<script setup>
import { ref, watch, computed, nextTick } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { debounce } from 'lodash-es'

// ================ Props 定义 ================
const props = defineProps({
  // Select 属性
  modelValue: {
    type: [Array, String, Number, Object, null, undefined],
    default: undefined
  },
  multiple: {
    type: Boolean,
    default: false
  },
  placeholder: {
    type: String,
    default: '请选择'
  },
  disabled:{
    type:Boolean,
    default:false
  },
  valueKey: {
    type: String,
    default: 'id'
  },
  labelKey: {
    type: String,
    default: 'name'
  },
  showLabel: {
    type: [String, Array],
    default: null
  },

  // Tabs 属性
  tabsList: {
    type: Array
  },
  loadTabList:{
    type:Function,
  },
  defaultActiveTab: {
    type: [String, Number],
    default: ''
  },
  queryConfig: {
    type: Object,
    default: () => ({
      tabKey: 'tabKey',
      searchKey: 'searchKeyword'
    })
  },
  // Table 属性
  columns: {
    type: Array,
    default: () => []
  },
  sourceUrl: {
    type: String,
    default: ''
  },
  sourceDataList: {
    type: Array,
    default: null
  }
})

// 统一的节流延迟时间配置
const THROTTLE_DELAY = 300

// ================ Emits 定义 ================
const emit = defineEmits(['update:modelValue', 'change','visible-change','tab-change'])

// ================ Refs 定义 ================
const selectRef = ref()
const jVxeTable = ref(null)
const activeTab = ref(props.defaultActiveTab)
const searchKeyword = ref('')
const loading = ref(false)
const selectedObjValue = ref(null)
const queryParams = ref({
  [props.queryConfig?.searchKey || 'searchKeyword']: '',
})
const tablePageConfig=ref({
  pageSize: 20,
  layouts: ['PrevPage', 'JumpNumber', 'NextPage','Total'],
})

const isLoad=ref(false)
const curTabList=ref([])

// ================ 计算属性 ================
/**
 * 内部值处理
 */
const innerValue = computed({
  get() {
    if (props.multiple) {
      return selectedObjValue.value?.map((item) => item[props.valueKey]) || []
    }
    return selectedObjValue.value?.[props.valueKey] ?? null
  },
  set(val) {
    // 这里只处理值的更新，选中状态由 watch 处理
    emit('update:modelValue', val)
    emit('change', val,selectedObjValue.value)
  }
})

/**
 * 显示文本
 */
const getDisplayText = computed(() => {
  if (!selectedObjValue.value) return ''

  if (props.multiple) {
    return Array.isArray(selectedObjValue.value) ? selectedObjValue.value.map((item) => item[props.labelKey]).join(', ') : ''
  }

  return selectedObjValue.value[props.labelKey] || ''
})

/**
 * 处理表格列配置
 * 根据选择模式添加对应的选择列
 */
// 监听到列发生变化 重新刷新当前表格
watch(() => props.columns, () => {
  nextTick(async () => {
    await jVxeTable.value?.loadColumn()
  })
})
 const processedColumns = computed(() => {
  const columns = [...props.columns]

  if (props.multiple) {
    // 多选模式：添加复选框列
    columns.unshift({
      type: 'checkbox',
      width: 50,
      fixed: true,
      title: ''
    })
  } else {
    // 单选模式：添加单选框列
    columns.unshift({
      type: 'radio',
      width: 50,
      fixed: true,
      title: ''
    })
  }

  return columns
})

/**
 * 处理复选框配置
 */
const checkBoxConfig = computed(() => {
  if (!props.multiple) {
    return null
  }
  return {
    trigger: 'row',
  }
})

/**
 * 处理单选框配置
 */
const radioConfig = computed(() => {
  if (props.multiple) {
    return null
  }
  return {
    trigger: 'row',
  }
})

// 计算表格行配置
const computedRowConfig = computed(() => ({
  isHover: true,
  height: 58,
  keyField: props.valueKey
}))

const computedQueryParams = computed(() => queryParams.value)

// ================ 方法定义 ================
/**
 * 创建节流函数
 */
const createDebounceFn = (fn, delay = THROTTLE_DELAY) => {
  return debounce(fn, delay)
}

/**
 * 处理下拉框显示状态变化
 */
const handleVisibleChange = createDebounceFn(async (visible) => {
  if (visible) {
    if(isLoad.value===false){
      initLoad()
      isLoad.value=true
      await nextTick()
    }
    //await reloadTable(true)

    // 处理表格选中状态
    if (props.modelValue) {
      // 从表格数据中找到对应行
      const tableData = jVxeTable.value?.getTableData().fullData || []
      if (props.multiple) {
        const valueArray = Array.isArray(props.modelValue) ? props.modelValue : [props.modelValue]
        const selectedRows = tableData.filter((row) => valueArray.includes(row[props.valueKey]))
        if (selectedRows.length) {
          jVxeTable.value?.setCheckboxRow(selectedRows, true)
        }
      } else {
        const selectedRow = tableData.find((row) => row[props.valueKey] === props.modelValue)
        if (selectedRow) {
          jVxeTable.value?.setRadioRow(selectedRow)
        }
      }
    }
  }
  emit('visible-change',visible)
})

/**
 * 处理标签页切换
 */
const handleTabChange = createDebounceFn((tabValue) => {
  // 清空搜索值
  searchKeyword.value = ''
  // tab切换发送通知到组件外
  emit('tab-change',tabValue)
  // 组装参数
  initQueryParams(tabValue, { resetSearch: true })

  nextTick(() => {
    reloadTable(true)
  })
})

/**
 * 处理搜索
 */
const handleSearch = createDebounceFn(() => {
  queryParams.value = {
    ...queryParams.value,
    [props.queryConfig?.searchKey || 'searchKeyword']: searchKeyword.value
  }
  nextTick(() => {
    reloadTable(true)
  })
})

/**
 * 重新加载表格数据
 */
const reloadTable = async (resetPage = true) => {
  try {
    loading.value = true
    await jVxeTable.value?.refresh(resetPage)
  } catch (error) {
    console.error('加载数据失败:', error)
  } finally {
    loading.value = false
  }
}

/**
 * 处理多选变化
 */
const handleChangeRow = createDebounceFn(( {row} ) => {
  if (props.multiple) {
    const isSelected = selectedObjValue.value?.some(item =>
      item[props.valueKey] === row[props.valueKey]
    )
    if (isSelected) {
      // 如果已选中，则取消选中
      selectedObjValue.value = selectedObjValue.value.filter(
        item => item[props.valueKey] !== row[props.valueKey]
      )
      innerValue.value = selectedObjValue.value.map(item => item[props.valueKey])
      jVxeTable.value?.setCheckboxRow([row], false)
    } else {
      // 如果未选中，则选中该行
      selectedObjValue.value = [...(selectedObjValue.value || []), row]
      innerValue.value = selectedObjValue.value.map(item => item[props.valueKey])
      jVxeTable.value?.setCheckboxRow([row], true)
    }
  }
})

/**
 * 处理全选/取消全选
 */
const handleCheckAll = createDebounceFn(({ records }) => {
  if (props.multiple) {
    selectedObjValue.value = records
    innerValue.value = records.map((record) => record[props.valueKey])
  }
})

/**
 * 处理单选框变化
 */
const handleRadioChange = ({ row }) => {
  // 如果选中的值与当前值相同，不做任何操作
  if (selectedObjValue.value && row[props.valueKey] === selectedObjValue.value[props.valueKey]) {
    return
  }

  // 选中新值时，更新值并关闭下拉框
  selectedObjValue.value = row
  innerValue.value = row[props.valueKey]
  selectRef.value?.toggleMenu(false)
}

/**
 * 处理移除标签
 */
const handleRemoveTag = (value) => {
  if (props.multiple && Array.isArray(innerValue.value)) {
    innerValue.value = innerValue.value.filter((v) => v !== value)
    // 更新选中对象
    selectedObjValue.value = selectedObjValue.value.filter((item) => item[props.valueKey] !== value)

    // 更新表格选中状态
    const tableData = jVxeTable.value?.getTableData().fullData || []
    const rowToUncheck = tableData.find((row) => row[props.valueKey] === value)
    if (rowToUncheck) {
      jVxeTable.value?.setCheckboxRow([rowToUncheck], false)
    }
  }
}

/**
 * 处理清除事件
 */
const handleClear = () => {
  // 清空选中值
  selectedObjValue.value = props.multiple ? [] : null
  // 同步更新表格选中状态
  nextTick(() => {
    if (props.multiple) {
      jVxeTable.value?.clearCheckboxRow()
    } else {
      jVxeTable.value?.clearRadioRow()
    }
  })
  // 触发事件
  emit('update:modelValue', props.multiple ? [] : null)
  emit('change', props.multiple ? [] : null)
}

/**
 * 处理表格数据加载完成
 */
const handleLoadSuccess = () => {
  // 设置表格选中状态
  if (props.multiple && Array.isArray(selectedObjValue.value)) {
    jVxeTable.value?.setCheckboxRow(selectedObjValue.value, true)
  } else if (!props.multiple && selectedObjValue.value) {
    jVxeTable.value?.setRadioRow(selectedObjValue.value)
  }
}

/**
 * 初始化选中值状态
 */
 const initSelectedValue = () => {
  // 处理空值情况
  if (props.modelValue === null || props.modelValue === undefined) {
    selectedObjValue.value = props.multiple ? [] : null
    return
  }

  if (props.multiple) {
    // 多选模式
    const valueArray = Array.isArray(props.modelValue) ? props.modelValue : [props.modelValue]
    // 过滤掉 null 和 undefined
    const validValues = valueArray.filter(value => value != null)

    if (validValues.length === 0) {
      selectedObjValue.value = []
      return
    }

    const tableData = jVxeTable.value?.getTableData().fullData || []

    // 如果有 showLabel，使用它来初始化显示
    if (Array.isArray(props.showLabel)) {
      selectedObjValue.value = validValues.map((value, index) => ({
        [props.valueKey]: value,
        [props.labelKey]: props.showLabel[index] || value
      }))
    } else {
      // 否则从表格数据中查找
      selectedObjValue.value = tableData.filter((row) => validValues.includes(row[props.valueKey]))
    }
  } else {
    // 单选模式
    const tableData = jVxeTable.value?.getTableData().fullData || []

    // 如果有 showLabel，使用它来初始化显示
    if (props.showLabel) {
      selectedObjValue.value = {
        [props.valueKey]: props.modelValue,
        [props.labelKey]: props.showLabel
      }
    } else {
      // 否则从表格数据中查找
      const selectedRow = tableData.find((row) => row[props.valueKey] === props.modelValue)
      selectedObjValue.value = selectedRow || null
    }
  }
}

/**
 * 初始化查询参数  tab参数+搜索关键字
 * @param {string | number} tabValue - 标签页值
 * @param {Object} options - 配置项
 * @param {boolean} options.resetSearch - 是否重置搜索参数，默认 false
 */
 const initQueryParams = (tabValue, options = { resetSearch: false }) => {
  // 获取当前选中的 tab 项
  const currentTab = curTabList.value.find(tab => tab.value === tabValue)
  console.log('currentTab', currentTab)
  // 构建映射参数
  let mappedParams = {}
  if (currentTab) {
    mappedParams=Object.assign(mappedParams, currentTab.params)
  }

  // 更新查询参数
  queryParams.value = {
    ...queryParams.value,
    ...mappedParams
  }

  // 如果需要重置搜索参数，则不包含搜索关键词
  if (options.resetSearch) {
    const searchKey = props.queryConfig?.searchKey || 'searchKeyword'
    delete queryParams.value[searchKey]
  }
}

/**
 * 初始化加载
 */
const initLoad = async () => {
  let initialTab = ''

  if(!props.tabsList){
    curTabList.value=await props.loadTabList()
  }else{
    curTabList.value=props.tabsList
  }
  
  // 确定初始标签页
  if (props.defaultActiveTab) {
    initialTab = props.defaultActiveTab
  } else if (curTabList.value.length > 0) {
    initialTab = curTabList.value[0].value
  }

  // 设置激活的标签页
  activeTab.value = initialTab

  // 初始化查询参数
  initQueryParams(initialTab, { resetSearch: false })

  nextTick(() => {
    reloadTable(true)
  })
}

// ================ Watch 监听 ================
/**
 * 监听选中值变化
 */
watch(
  () => props.modelValue,
  (newVal) => {
    if (!newVal) {
      selectedObjValue.value = props.multiple ? [] : null
      return
    }

    const tableData = jVxeTable.value?.getTableData().fullData || []
    if (!tableData.length) return

    if (props.multiple) {
      const valueArray = Array.isArray(newVal) ? newVal : [newVal]
      selectedObjValue.value = tableData.filter((row) => valueArray.includes(row[props.valueKey]))
    } else {
      selectedObjValue.value = tableData.find((row) => row[props.valueKey] === newVal)
    }
  },
  { immediate: true }
)


// 监听默认标签页变化
watch(
  () => props.defaultActiveTab,
  (newVal) => {
    if (newVal) {
      activeTab.value = newVal
      queryParams.value.tabKey = newVal
      nextTick(() => {
        reloadTable(true)
      })
    }
  }
)

// ================ 生命周期 ================
onMounted(() => {
  initSelectedValue()
})
</script>

<style lang="scss">
// ================ Select 下拉框样式 ================
.el-select-dropdown.ace-select-tabs-table {
  padding: 0;
  margin: 0;

  .el-select-dropdown__wrap {
    max-height: none;
  }

  .el-select-dropdown__empty {
    padding: 0;
    margin: 0;
  }
}
</style>

<style lang="scss" scoped>
// ================ 基础样式 ================
.ace-select-wrapper {
  width: 100%;
  display: inline-block;

  :deep(.el-select) {
    width: 100%;
    .el-select__wrapper {
      .el-select__selection {
        flex-wrap: nowrap !important;
        &:has(.el-tag),
        &:has(.el-select__prefix-inner) {
          overflow: hidden;
        }
      }
    }
    .el-tag {
      flex-shrink: 0;
      margin-right: 4px;

      &.collapse-tag {
        background-color: var(--el-fill-color);
        border-color: var(--el-border-color-lighter);
        color: var(--el-text-color-secondary);
      }
    }

    .el-select__tags {
      padding-left: 6px;
    }
  }
}

.select-dropdown-container {
  width: 800px;
  height: 400px;
  display: flex;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

// ================ Tabs 样式 ================
:deep(.el-tabs) {
  min-width: 100px;
  max-width: 180px;
  height: 100%;
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--el-border-color-light);

  .el-tabs__header {
    margin: 0;
    height: 100%;

    &.is-left {
      margin-right: 0;
      width: 100%;
    }
  }

  .el-tabs__nav-wrap {
    height: 100%;
    width: 100%;

    &.is-left {
      margin-right: 0;
    }

    &::after {
      display: none;
    }
  }

  .el-tabs__nav-scroll {
    height: 100%;
    width: 100%;
  }

  .el-tabs__nav {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .el-tabs__item {
    width: 100%;
    height: 40px;
    line-height: 40px;
    text-align: left;
    padding: 0 20px;
    border: none;
    transition: all 0.3s;
    flex-shrink: 0;

    &:hover {
      color: var(--el-color-primary);
      background-color: var(--el-color-primary-light-9);
    }

    &.is-active {
      color: var(--el-color-primary);
      background-color: var(--el-color-primary-light-9);
      font-weight: 500;
    }
  }

  .el-tabs__content {
    display: none;
  }
}

// ================ Table 容器样式 ================
.table-container {
  flex: 1;
  padding: 6px;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .search-box {
    margin-bottom: 6px;

    :deep(.el-input) {
      .el-input__wrapper {
        box-shadow: 0 0 0 1px var(--el-border-color) inset;

        &:hover {
          box-shadow: 0 0 0 1px var(--el-border-color-hover) inset;
        }

        &.is-focus {
          box-shadow: 0 0 0 1px var(--el-color-primary) inset;
        }
      }

      .el-input__prefix {
        color: var(--el-text-color-placeholder);
      }
    }
  }
}

// ================ 滚动条样式 ================
:deep {
  .el-scrollbar__bar {
    z-index: 3;
  }

  .el-scrollbar__wrap {
    overflow-x: hidden;
  }

  ::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  ::-webkit-scrollbar-thumb {
    background: #ddd;
    border-radius: 3px;

    &:hover {
      background: #ccc;
    }
  }

  ::-webkit-scrollbar-track {
    background: #f1f1f1;
  }
}

// 添加选中值的样式
:deep(.el-select .el-select__tags) {
  max-width: calc(100% - 30px);
}
:deep(.vxe-body--row){
  height:38px;
}
</style>
