<template>
  <div style="display: flex;width: 100%;align-items: center;">
    <el-select
      style="flex: 1;"
      popper-class="ace-select"
      v-model="curValue"
      :placeholder="placeholder"
      :multiple="multiple"
      :disabled="disabled"
      clearable
      :collapse-tags="!disabled && collapseTags"
      :collapse-tags-tooltip="collapseTagsTooltip"
      @clear="clearValue"
      @change="selectChange"
      @visible-change="visibleChange"
      @remove-tag="removeTag"
    >
      <template #label="{ label, value }">
        {{ isJoin ? (label || value) : (modelText || label || value)}}
      </template>
      <template #header v-if="filterable || multiple">
        <div v-if="filterable" class="search-input">
          <el-input v-model="searchKey" size="small" @keyup="searchData" placeholder="请输入关键字查询" clearable @clear="searchData">
            <template #prefix>
              <el-icon class="el-input__icon"><Search /></el-icon>
            </template>
          </el-input>
        </div>
        <div v-if="multiple" class="select-all">
          <div class="selected-list">已选择 {{selectedLength}} 条</div>
          <el-checkbox v-model="selectAll" @change="handleSelectAll">全选</el-checkbox>
        </div>
      </template>
      <el-option v-if="showAllSelectLabel&&multiple" label="全部" value="all">全部</el-option>
      <el-option
        v-for="item in sourceDataList"
        :key="item.value"
        :label="item[labelKey]"
        :disabled="item.disabled"
        :value="item[valueKey]"
      >
        <slot :option="item"></slot>
      </el-option>
      <template #footer v-if="addUrl">
        <el-button link type="primary" size="small" :icon="Refresh"  @click="loadList">
          刷新
        </el-button>
      </template>
    </el-select>
    <el-button type="primary" plain class="select-button" v-if="addUrl" :icon="Plus" @click="toRouterAdd" />
  </div>
</template>

<script setup lang="ts">
import request from '@/config/axios'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import fetchDataSetData from '@/utils/dataSetCode'
import router from '@/web-admin/router'
import { Plus,Refresh,Search } from '@element-plus/icons-vue'
import {replaceMethodField, replaceScriptField} from "@/comRender/utils";
import {cloneDeep,debounce} from "lodash-es";
// 普通输入框
defineOptions({name: 'AceSelect'})
const props = defineProps({
  modelValue: {
    type:[Number,String,Array<any>],
    default:undefined,
  },
  modelText: {
    type:[Number,String,Array<any>],
    default:undefined,
  },
  disabled:{
    type: Boolean,
    default: false
  },
  clearable:{
    type: Boolean,
    default: true
  },
  placeholder:{
    type:String,
    default:'请选择'
  },
  filterable:{
    type:Boolean,
    default:false
  },
  filterMethod:{
    type:Function
  },
  dataSource: {
    type: [String,Array<any>],
    default: undefined
  },
  dataFun:{
    type:Function,
  },
  dict:{
    type:String,
  },
  dictValue:{
    type:String,
  },
  // 数据集code
  dataSetCode:{
    type:String
  },
  url: {
    type: String,
    default: ''
  },
  urlMode: {
    type: String,
    default: 'post'
  },
  //接口类型，平台（platform）、业务系统（business-sys）
  urlType:{
    type:String,
    default:'platform'
  },
  multiple: {
    type: Boolean,
    default: false
  },
  labelKey:{
    type:String,
    default:'label'
  },
  valueKey:{
    type:String,
    default:'value'
  },
  queryKeyName: {
    type: String,
    default: 'keyword'
  },
  labelName: {
    type: String,
    default: ''
  },
  collapseTags:{
    type:Boolean,
    default:false
  },
  collapseTagsTooltip:{
    type:Boolean,
    default:true
  },
  showAllSelectLabel:{
    type:Boolean,
    default:false
  },
  isJoin:{
    type:Boolean,
    default:false
  },
  addUrl:{
    type: String,
    default: ''
  },
  isAutoSelect:{
    type:Boolean,
    default:false
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
  reloadTag:{
    type:[String,Number]
  },
  emptyDefaultValue:{
    type:[Number,String]
  }
})
const emit = defineEmits(['update:modelValue','update:modelText','change','clear','visible-change','remove-tag'])
//v-model双向绑定
let curValue = computed({
  get: () => {
    if(props.isJoin){
      return props.modelValue && props.modelValue.split(',') || []
    }else{
      return props.modelValue
    }
  },
  set: (val: Object|any[]|String) => {
    if(val && val.length >1 && props.emptyDefaultValue && val.includes(props.emptyDefaultValue)){
      emit('update:modelValue', (props.isJoin && val.filter(item => item !== props.emptyDefaultValue)) ? val.filter(item => item !== props.emptyDefaultValue)?.join(',') : val)
    }else{
      //console.log(props.emptyDefaultValue,'props.emptyDefaultValue');
      if(props.isJoin && val){
        if(val.length){
          emit('update:modelValue', val?.join(','))
        }else{
          emit('update:modelValue', props.emptyDefaultValue || '')
        }
      }else{
        emit('update:modelValue',val)
      }
    }
  }
})
let selectedLength = computed(()=>{
  if (props.multiple && curValue.value) {
    return (curValue.value as any[]).length
  } else {
    return ''
  }
})

watch(
  ()=>[props.dataSource,props.dict,props.reloadTag],
  ()=>{
    loadList()
  }
)
watch(
  ()=>props.dictValue,
  ()=>{
    filterDictValue()
})

let sourceDataList = ref<any[]>([])
let allSourceDataList=ref<any[]>([])
/**
 * 加载数据源，数据
 */
const loadList = async () => {
  //先判断是否有数据源
  if(props.dataSource) {
    sourceDataList.value = Array.isArray( props.dataSource) ? props.dataSource : []
  }else if(props.dataFun){
    sourceDataList.value = await props.dataFun()
  }else if(props.dataSetCode){
    // 判断是否从数据集获取数据
    sourceDataList.value = await fetchDataSetData(props.dataSetCode)
  }else if (props.url) {
    let params={}
    if(props.searchParams){
      // const customParams =replaceScriptField(props.searchParams,props.pageListConfigs,props.formData);
      params={
        ...customParams.value
      }
    }
    //加载url请求
    const res=props.urlMode.toLowerCase() === 'get' ?
      await request.get({url: props.url,params:params}) : await request.post({url: props.url,data:params})
    if(res){
      sourceDataList.value = res.list || res.records || res
    }
  }else if(props.dict){
    //判断是否是字典
    //周频率以及月频率数据字典排序
    const list = getIntDictOptions(props.dict.trim())
    if(['YEAR_FREQUENCY','WEEK_FREQUENCY'].includes(props.dict.trim())){
      list.sort((a, b) => {
        return a.value - b.value
      })
    }
    if(['ZXD2024_0103'].includes(props.dict.trim())){
      list.sort((a, b) => {
        return a.sort - b.sort
      })
    }
    sourceDataList.value = cloneDeep(list)
  }
  allSourceDataList.value=cloneDeep(sourceDataList.value)
  if(props.dict){
    filterDictValue()
  }
}
/**
 * 过滤字典项
 */
const filterDictValue=()=>{
  if(props.dictValue && props.dictValue.length){
    const dictValues=props.dictValue.split(',') || []
    sourceDataList.value=allSourceDataList.value.filter(item=>{
      return dictValues.includes(item.value)
    })
  }
}

const searchKey=ref('')
const searchData=debounce(async ()=>{
  if (props.url){
    let params={
      [props.queryKeyName]:searchKey.value
    }
    if(props.searchParams){
      // const customParams =replaceScriptField(props.searchParams,props.pageListConfigs,props.formData);
      params={
        ...params,
        ...customParams.value
      }
    }
    //加载url请求
    const res=props.urlMode.toLowerCase() === 'get' ? 
    await request.get({url: props.url,params:params}) : await request.post({url: props.url,data:params})
    if(res){
      sourceDataList.value = res.list || res.records || res
    }
  }else{
    sourceDataList.value=allSourceDataList.value.filter(item=>{
      return item[props.labelKey].indexOf(searchKey.value) > -1
    })
  }
},400)

/**
 * 监听参数值变化获取下拉码值
 */
const customParams = computed(()=> {
  if(props.searchParams){
    return replaceScriptField(props.searchParams,props.pageListConfigs,props.formData);
  }else{
    return null
  }
})
watch(() => customParams.value,val => {
  if(val){
    searchData()
  }
})
/**
 * change事件
 * @param val
 */
const selectChange=(val)=>{
  if(props.multiple){
  //   触发change把选中的数据返回label和value
    const list: any[] = []
    //   判断是否含有全部如果有
    if ((val as any[]).includes('all')) {
      // 查找是否已经存在
      const findResult = list.find(item => item.value === 'all')
      if (!findResult) {
        list.push({value: 'all', label: '全部'})
      }
      //   先判断是否全选 如果含有全部取消选中
      selectAll.value = false
    } else {
      // 正常判断
      selectAll.value = sourceDataList.value.length === val.length;
    }
    val.filter(v => v !== 'all').forEach(value => {
      const findItem = sourceDataList.value.find(item => item[props.valueKey] === value)
      if (findItem) {
        list.push(findItem)
      }
    })
    emit('change', val, list)
    if(!props.dict){
      emit('update:modelText',list.map(v=>v[props.labelKey]).join(','))
    }
  }else{
    const selectItem=sourceDataList.value.find(item=>item[props.valueKey] === val)
    emit('change',val,selectItem)
    if(!props.dict){
      emit('update:modelText',selectItem && selectItem[props.labelKey] || '')
    }
  }

//   当全部数据选中把全选打为true
}
/**
 * clear
 */
const clearValue = ()=>{
  emit('change', '', null)
  emit('update:modelText', '')
  emit('clear')
}
const visibleChange = (e)=>{
  emit('visible-change',e)
}
const removeTag = (tagVal)=>{
  emit('remove-tag',tagVal)
}

loadList()
// 加入全选的事件
const selectAll = ref(false)
const handleSelectAll = (val: boolean) => {
  if (val) {
    curValue.value = sourceDataList.value.map(item => item[props.valueKey])
    const list = sourceDataList.value.map(item => ({
      value: item[props.valueKey],
      label: item[props.labelKey]
    }))
    emit('change', sourceDataList.value.map(item => item[props.valueKey]), list)
  } else {
    curValue.value = []
    emit('change', [], [])
  }
}

//跳转到新增页面
const toRouterAdd = () => {
  router.push({ path: props.addUrl || '/' })
}

onMounted(() => {
  if (props && props.multiple && props?.modelValue && sourceDataList.value && props.modelValue.length === sourceDataList.value.length) {
    selectAll.value = true
  }

  //下拉框只有一条时，自动选中 仅针对字典类型
  setTimeout(()=>{
    if(props.isAutoSelect && !curValue.value && sourceDataList.value && sourceDataList.value.length==1){
      curValue.value = sourceDataList.value[0][props.valueKey]
      emit('change', sourceDataList.value[0][props.valueKey], sourceDataList.value[0])
    }
  },500)
  /*//   如果是多选模式下 推进来一个全选按钮
  if (props.multiple && props.showAllSelectLabel) {
    let obj = {}
    obj[props.valueKey] = 'all'
    obj[props.labelKey] = '全部'
    sourceDataList.value.unshift(obj)
  }*/
})
</script>

<style scoped lang="scss">
:deep(.el-input-group__prepend) {
  padding: 0;
}
.select-all{
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-left: 10px;
  padding-right: 20px;
}
.search-input{
  width: 100%;
  :deep(.el-input){
    padding: 0 5px;
  }
}
.select-button{
  margin-left: 4px;
  padding: 2px;
  height: 26px;
  background: #fff;
  --el-button-text-color:var(--el-color-primary) !important;
  --el-button-active-text-color:var(--el-color-primary) !important;
  --el-button-hover-text-color:var(--el-color-primary) !important;
}
:deep(.el-select__selection){
  overflow: hidden;
  text-overflow: ellipsis;
  height: 22px !important;
  flex-wrap: nowrap;
}
</style>
<style lang="scss">
.ace-select{
  .el-select-dropdown__header{
    padding: 5px !important;
  }
}
</style>
