<template>
  <div id="select-table-id" style="width:100%;">
    <el-select
      ref="selectTableRef"
      v-model="curText"
      :placeholder="placeholder"
      :multiple="multiple"
      :clearable="true"
      :placement="placement"
      @clear="handleClear"
      @remove-tag="handleRemoveTag"
      @visible-change="handleVisibleChange"
      :disabled="disabled"
    >
      <template #label="{ label, value }">
        {{curText || label || value || curValue}}
      </template>
      <template #empty>
        <div class="t-table-select__table" :style="{ width: `100%` }">
          <div class="search-content">
            <el-input v-model="searchQuery[queryKeyName]" placeholder="输入查询" clearable @clear="handleClearInput" :suffix-icon="Search" @input="handleQuery" />
          </div>
          <JVxeTable
            :columns="tableColumns"
            ref="jVxeTable"
            height="360px"
            :isDefLoadData="false"
            :searchParams="searchQuery"
            :tablePageConfig="tablePage"
            :data-url="dataUrl"
            apiType="post"
            :data-fun="dataFun"
            :dataSource="sourceDataList"
            :check-box-config="checkConfig"
            :radio-config="radioConfig"
            :row-config="{ keyField: valueKey, isHover: true }"
            :rowHeight="38"
            :is-row-check="false"
            @checkbox-change="handleCheckboxChange"
            @radio-change="handleRadioChange"
            @data-change="handleDataChange"
          >
          </JVxeTable>
        </div>
      </template>
    </el-select>
  </div>
</template>

<script setup lang="ts">
// import request from '@/config/axios'
import { watch, ref } from 'vue'
import { Search } from '@element-plus/icons-vue'
import fetchDataSetData from '@/utils/dataSetCode'
import { replaceScriptField } from "@/comRender/utils";
// 普通输入框
defineOptions({ name: 'AceSelectTable' })

const props = defineProps({
  modelValue: {
    type: [String, Array],
    default: undefined
  },
  showLabel: {
    type: [String, Array],
    default: undefined
  },
  placeholder:{
    type:String,
    default:'请选择'
  },
  disabled: {
    type: Boolean,
    default: false
  },
  multiple: {
    type: Boolean,
    default: false
  },
  dataSource: {
    type: Array,
    default: undefined
  },
  dataUrl: {
    type: String
  },
  dataFun: {
    type: Function
  },
  columns: {
    type: Array,
    default: () => []
  },
  valueKey: {
    type: String,
    default: 'id'
  },
  labelKey: {
    type: String,
    default: 'name'
  },
  queryKeyName: {
    type: String,
    default: 'keyword'
  },
  // 数据集code
  dataSetCode:{
    type:String
  },
  searchParams:{
    type:[Object,String]
  },
  pageListConfigs:{
    type:Array
  },
  formData:{
    type:Object
  },
})

const emit = defineEmits(['update:modelValue', 'update:showLabel','change'])

const curValue = computed({
  get: () => {
    return props.modelValue
  },
  set: (val: String | any[]) => {
    emit('update:modelValue', val)
  }
})

const placement=ref('bottom-start')
/**
 * 监听参数值变化获取下拉码值
 * 添加查询条件
 */
 const isLoadData=ref(false)
 const customParams = computed(()=> {
  if(props.searchParams){
    return replaceScriptField(props.searchParams,props.pageListConfigs,props.formData);
  }else{
    return null
  }
})
watch(() => customParams.value,val => {
  if(val){
    searchQuery.value = {
      ...searchQuery.value,
      ...val
    }
    isLoadData.value=false
  }
})
const curText = computed({
  get: () => {
    return props.showLabel || props.modelValue
  },
  set: (val: String | any[]) => {
    emit('update:showLabel', val)
  }
})
let defaultSelectKey = computed(() => {
  return props.multiple ? props.modelValue : [props.modelValue]
})

const selectTableRef = ref()

//组装表格列头
const tableColumns = ref<any[]>([])
const assemblyColumns = () => {
  tableColumns.value = props.columns
  const checkColumns=tableColumns.value.find(item=>item.type=='checkbox' || item.type=='radio')
  if(!checkColumns){
    //根据是否多选，选择复选框或单选框
    tableColumns.value.unshift({
      align: 'center',
      type: props.multiple ? 'checkbox' : 'radio',
      width: 60
    })
  }
}
assemblyColumns()
//配置多选单选
const radioConfig = ref(null)
const checkConfig = ref(null)
if (props.multiple) {
  checkConfig.value = { trigger: 'row', checkRowKeys: defaultSelectKey }
} else {
  radioConfig.value = { trigger: 'row', checkRowKeys: defaultSelectKey }
}

//配置表格分页
const tablePage = reactive({
  pageSize: 20,
  layouts: ['PrevPage', 'JumpNumber', 'NextPage','Total'],
})
//配置搜索
const searchQuery = ref({
  ...customParams.value,
  [props.queryKeyName]: ''
})
//选中数据
const jVxeTable = ref()
const handleRowClick = (val) => {}
/**
 * 单选选中
 * @param row
 */
const handleRadioChange = ({ row }) => {
  curValue.value = row[props.valueKey]
  curText.value = row[props.labelKey]
  selectTableRef.value.toggleMenu(false)
  emit('change',row[props.valueKey],row)
}
const handleCheckboxChange = ({ records }) => {
  curValue.value = records.map((item) => item[props.valueKey])
  curText.value = records.map((item) => item[props.labelKey])
  emit('change',records.map((item) => item[props.valueKey]),records)
}
/**
 * 数据改变时，分页情况，勾选已选
 */
const handleDataChange = () => {
  const tableData = jVxeTable.value.tableData
  if(props.multiple){
    const selectRow = tableData.filter((item) => defaultSelectKey.value.includes(item[props.valueKey]))
    jVxeTable.value.setCheckboxRows(selectRow, true)
  }else{
    const selectRow = tableData.find((item) => defaultSelectKey.value.includes(item[props.valueKey]))
    jVxeTable.value.setRadioRow(selectRow, true)
  }
}
/**
 * 多选时 删除标签
 * @param val
 */
const handleRemoveTag = (val: any) => {
  //   单纯改变表格多选状态
  const valIndex=props.showLabel.findIndex(item=>item===val)
  const findRow = jVxeTable.value.tableData.find((item) => item[props.valueKey] === curValue.value[valIndex])
  jVxeTable.value.setCheckboxRow(findRow, false)
}
/**
 * 输入框清空
 */
const handleClear = () => {
  jVxeTable.value.clearCheckboxRow()
  curValue.value = !props.multiple ? null : []
}

const handleVisibleChange=(e)=>{

  const viewportWidth = document.documentElement.clientWidth;
  const position=document.getElementById('select-table-id').getBoundingClientRect();
  console.log('vvvvv',viewportWidth,position.left,viewportWidth-position.left)
  if((viewportWidth-position.left)<625){
    placement.value='left'
  }
  if(e && !isLoadData.value){
    jVxeTable.value?.refresh(true)
    isLoadData.value=true
  }
  
}
/**
 * 查询事件
 */
const handleQuery = () => {
  jVxeTable.value?.refresh(true)
}
const handleClearInput = () => {
  searchQuery.value[props.queryKeyName] = ''
  handleQuery()
}

/**
 * 加载数据源，数据
 */
 let sourceDataList = ref<any[]>()

const loadList = async () => {
  //先判断是否有数据源
  if(props.dataSource) {
    sourceDataList.value = props.dataSource ? props.dataSource : []
    return
  }
  if(props.dataSetCode){
    sourceDataList.value = await fetchDataSetData(props.dataSetCode)
    return
  }
}
watch(
  ()=>props.dataSource,
  ()=>{
    loadList()
  }
)

onMounted(() => {})
</script>

<style scoped lang="scss">
:deep(.el-input-group__prepend) {
  padding: 0;
}
.search-content {
  padding: 0 5px 5px;
}
</style>
