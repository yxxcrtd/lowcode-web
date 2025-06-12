<template>
  <Dialog :title="title" v-model="dialogVisible" width="70vw">
    <template #title>
      <div class="dialog-title">
        {{ dialogType === 'KB'?'选择资产':'选择产品'}}
        <el-tooltip placement="top">
          <template #content>
            {{ titleTip }}
          </template>
          <el-icon class="table-header-tips-icon" :size="16"><WarningFilled /></el-icon>
        </el-tooltip>
      </div>
    </template>
    <div class="dialog-wrap">
      <el-form label-width="120px" style="margin: 5px 0;">
          <el-row :gutter="10">
            <el-col :span="8" v-if="dialogType !=='KB'">
              <el-form-item label="信托产品">
                <el-input v-model="searchForm.productName" placeholder="输入查询" clearable />
              </el-form-item>
            </el-col>
            <el-col :span="8" v-if="dialogType !=='KB'">
              <el-form-item label="产品品牌">
                <ace-select v-model="searchForm.productBrand" placeholder="请选择" dict="PRODUCT_BRAND"></ace-select>
              </el-form-item>
            </el-col>
            <el-col :span="8" v-if="dialogType ==='KB'">
              <el-form-item label="资产名称">
                <el-input v-model="searchForm.assetName" placeholder="输入查询" clearable />
              </el-form-item>
            </el-col>
            <el-col :span="8" v-if="dialogType ==='KB'">
              <el-form-item label="资产编号">
                <el-input v-model="searchForm.assetNo" placeholder="输入查询" clearable />
              </el-form-item>
            </el-col>
            <el-col :span="8" style="text-align: right;">
              <el-button @click="handleQuery"><Icon icon="ep:search" class="mr-5px" /> 搜索</el-button>
              <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" /> 重置</el-button>
            </el-col>
          </el-row>
        </el-form>
      <JVxeTable
        :columns="tableColumns"
        ref="jVxeTable"
        height="360px"
        :data-fun="getTableData"
        :tablePageConfig="{enabled:dialogType !== 'KB'}"
        :check-box-config="checkConfig"
        :radio-config="radioConfig"
        :row-config="{ keyField: 'id', isHover: true }"
        :rowHeight="38"
        :is-row-check="false"
      >
      </JVxeTable>
    </div>
    <template #footer>
      <div class="dialog-more-footer">
        <div class="right">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="submitForm">确 定</el-button>
        </div>
      </div>
    </template>
  </Dialog>
</template>
<script lang="ts" setup>
import { watch, ref } from 'vue'
import request from "@/config/axios";
import {formatDate} from "@/utils/formatTime";
import {replaceScriptField} from "@/comRender/utils";
import {WarningFilled} from "@element-plus/icons-vue";
import {getDictLabel} from "@/utils/dict"
defineOptions({ name: 'SelectTableDialog' })

const props = defineProps({
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
    default: true
  },
  dataUrl: {
    type: String,
    default:'/ibps/acct/acctTrustProject/getProjectList'
  },
  searchParams:{
    type:[Object,String],
    default:'{\n  \"createByIn\":\"#SysParam-curUserId#\"\n}'
  },
  pageListConfigs:{
    type:Array
  },
  formData:{
    type:Object
  },
  titleTip:{
    type:String
  },
  dialogType:{
    type: String,
    default: 'YDJ'
  }
})
const message=useMessage()
//组装表格列头
const tableColumns = ref<any[]>([])
const otherParams=ref({})
const formaterData=({cellValue})=>{
  return formatDate(cellValue,'YYYY-MM-DD')
}
const formaterDict = (cellValue,dictType) => {
  return getDictLabel(dictType,cellValue)
}
const columnsObj = ref({
  KB:[
    {
      field: 'assetName',
      title: '资产名称'
    },
    {
      field: 'assetNo',
      title: '资产编号'
    },
    {
      field: 'establishState',
      title: '开办状态',
      formatter:({cellValue}) => formaterDict(cellValue,'OPEN_STATUS')
    },
    {
      field: 'assetNature',
      title: '资产性质',
      formatter:({cellValue}) => formaterDict(cellValue,'ASSET_NATURE')
    },
    {
      field: 'approvalEndDate',
      title: '批复有效截止日期',
      formatter:formaterData
    },
    {
      field: 'isRealEstatInvest',
      title: '是否属于房地产股权投资',
      formatter:({cellValue}) => formaterDict(cellValue,'YN')
    }
  ],
  YDJ:[
    {
      field: 'trustThreeCategoryAsAllText',
      title: '信托业务分类'
    },
    {
      field: 'productBrandAsText',
      title: '产品品牌'
    },
    {
      field: 'projectName',
      title: '信托产品全称'
    },
    {
      field: 'projectCode',
      title: '信托产品代码'
    },
    {
      field: 'projStatusAsText',
      title: '产品状态'
    }
  ]
})
//配置搜索
const searchForm = ref({
  productName: '',
  productBrand: ''
})
const initDialog = () => {
  tableColumns.value = [...columnsObj.value[props.dialogType]]
  //根据是否多选，选择复选框或单选框
  tableColumns.value.unshift({
    align: 'center',
    type: props.multiple ? 'checkbox' : 'radio',
    width: 60
  })
  if(props.searchParams){
    otherParams.value =replaceScriptField(props.searchParams,props.pageListConfigs,props.formData)
    for(let key in otherParams.value){
      otherParams.value[key] === null && (otherParams.value[key] = '')
    }
    searchForm.value = {...searchForm.value,...otherParams.value}
  }
}
//配置多选单选
const radioConfig = ref(null)
const checkConfig = ref(null)
if (props.multiple) {
  checkConfig.value = { trigger: 'row' }
} else {
  radioConfig.value = { trigger: 'row' }
}

/**
 * 获取数据
 * @param paramer
 */
const getTableData=async (paramer)=>{
  const param={
    ...searchForm.value,
    ...paramer,
  }
  const res=await request.post({url: props.dataUrl,data:param})
  return res
}
//选中数据
const jVxeTable = ref()
/**
 * 查询事件
 */
const handleQuery = () => {
  jVxeTable.value?.refresh(true)
}
const resetQuery = () => {
  searchForm.value = {}
}


onMounted(() => {})
const dialogVisible = ref(false)

const title = ref<string>('选择')

/** 打开弹窗 */
const open = async (value,text) => {
  dialogVisible.value = true
  initDialog()
}

defineExpose({ open }) // 提供 open 方法，用于打开弹窗
const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调

const submitForm = () => {
  let selectedRow = null
  if(props.multiple){
    selectedRow = jVxeTable.value.getCheckboxRecords()
    if(selectedRow && selectedRow.length){
      if(props.dialogType === 'KB'){
        // if(selectedRow.find(item => !['1','3'].includes(item.establishState))){
        //   message.warning('仅允许选择开办状态为待提交或者作废进行开办')
        //   return
        // }
        console.log('111');
        
      }else{
        const productBrand=selectedRow[0].productBrand
        const isSameProductBrand=selectedRow.every(item=>item.productBrand==productBrand)
        if(!isSameProductBrand){
          message.warning('仅允许同一品牌的信托产品进行批量开户。')
          return
        }
      }
    }
  }else{
    selectedRow = jVxeTable.value.getRadioRecord()
  }
  emit('success',selectedRow)
  dialogVisible.value = false
}
</script>
<style lang="scss" scoped>
.dialog-wrap {
  width: 100%;
  min-height: 300px;
  :deep(.el-form-item__content){
    margin-left:  0 !important;
    display:block!important;
  }
}
.table-box{
  overflow-x:auto;
  position: relative;
  border-left:1px solid #dcdfe6;
  padding-left:15px;
}
:deep(.left-box){
  .el-icon{
  font-size: 16px;
    border: 1px solid #ddd;
    padding: 10px;
    border-radius: 50%;
    margin-bottom: 10px;
   color: var(--el-color-primary);
   border: 1px solid var(--el-color-primary);
}
.el-form-item__content{
  text-align:center;
}
.componentName{
  font-size:16px;
}
.componentCode{
  font-size:12px;
}
}
:deep(.el-select__wrapper){
  height: 32px !important;
}
:deep(.el-form-item__label){
  display: inline-flex !important;
}
.dialog-title{
  display: flex;
  justify-content: center;
  align-items: center;
}
.table-header-tips-icon{
  margin-left:6px;
  color: #B38E33;
}
</style>
