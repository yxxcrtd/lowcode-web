<template>
  <div class="datamodel-header">
    <!-- <el-button type="primary" @click="submitForm(true)" class="mb-10px" title="暂存不会生成或改变表结构,暂存的字段可修改"> <Icon icon="ep:plus" /> 暂存 </el-button>
    <el-button type="primary" @click="submitForm(false)" class="mb-10px" title="保存并执行会改变表结构,执行后字段不可修改"> <Icon icon="ep:plus" /> 保存并执行 </el-button> -->
    <el-dropdown split-button @click="addRow()" class="mb-10px" @command="(cmd) => addRow(null, cmd)">
      新增一行
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item command="5">新增5行</el-dropdown-item>
          <el-dropdown-item command="10">新增10行</el-dropdown-item>
          <el-dropdown-item command="15">新增15行</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
    <el-button @click="batchAddField" class="mb-10px ml-10px" > <el-icon size="16"><Position /></el-icon> 批量录入 </el-button>
  </div>
  <el-form ref="formRef" :model="formData" :rules="formRules" >
    <div class="table-tb" style="height: calc(100vh - 290px)">
      <JVxeTable
        ref="fieldsVxeTable" 
        height="auto"
        :showOverFlow="false"
        border="inner" 
        align="left" 
        :row-height="58"
        :table-page-config="{enabled:false}"
        :enable-row-drag-sort="true"
        :row-class-name="rowClsName"
        :data-source="formData.fieldList"
        :columns="fieldListColumns"
      >
        <!-- 序号列 -->
        <template #seq="{ row, rowIndex }">
          <div class="sort">
            <span class="sort-number">{{ rowIndex + 1 }}</span>
            <span class="sort-action">
              <el-icon @click="addRow(rowIndex)"><CirclePlusFilled /></el-icon>
              <el-icon @click="delRow(rowIndex)" v-if="!(row.isSys || row.status)"><RemoveFilled /></el-icon>
            </span>
          </div>
        </template>

        <!-- 字段名列 -->
        <template #columnName="{ row, rowIndex }">
          <template v-if="row.isSys || row.status">
            {{ row.columnName }}
          </template>
          <template v-else>
            <el-form-item :prop="'fieldList.' + rowIndex + '.columnName'" :rules="formRules.columnName">
              <el-input v-model="row.columnName" :maxlength="32">
                <template v-if="row.isSys" #prepend>系统字段</template>
              </el-input>
            </el-form-item>
          </template>
        </template>

        <!-- 名称列 -->
        <template #columnComment="{ row, rowIndex }">
          <template v-if="row.isSys || row.status">
            {{ row.columnComment }}
          </template>
          <template v-else>
            <el-form-item :prop="'fieldList.' + rowIndex + '.columnComment'" :rules="formRules.columnComment">
              <el-input v-model="row.columnComment" :maxlength="100"></el-input>
            </el-form-item>
          </template>
        </template>

        <!-- 数据类型列 -->
        <template #dataDomainId="{ row, rowIndex }">
          <template v-if="row.isSys || row.status">
            {{getColumnTypeName(row.columnTypeWithId)}}
          </template>
          <template v-else>
            <el-form-item :prop="'fieldList.' + rowIndex + '.columnTypeName'" :rules="formRules.columnTypeWithId">
              <el-input v-model="row.columnTypeWithId" v-show="false"></el-input>
              <ace-autocomplete @blur="() => oldQueryString = ''" :fetch-suggestions="(queryString,cb) => searchDataTypeList(queryString,cb,row)"  labelKey="columnTypeName" valueKey="columnTypeName" v-model="row.columnTypeName" filterable allow-create placeholder="请选择或输入类型" @change="dataTypeChange(row)" @select="dataTypeSelect($event,row)">
              </ace-autocomplete>
            </el-form-item>
          </template>
        </template>

        <!-- 长度列 -->
        <template #columnLength="{ row }">
          <template v-if="row.isSys || row.status">
            {{ row.columnLength }}
          </template>
          <template v-else>
            <el-input v-model="row.columnLength" type="number" :rules="formRules.columnLength" />
          </template>
        </template>

        <!-- 小数位列 -->
        <template #columnScale="{ row }">
          <template v-if="row.isSys || row.status">
            {{ row.columnScale }}
          </template>
          <template v-else>
            <el-input v-model="row.columnScale" type="number" :rules="formRules.columnScale" />
          </template>
        </template>

        <!-- 控件类型列 -->
        <template #component="{ row }">
          <template v-if="!row.isSys">
            <SelectComponent v-model="row.componentCode" :show-label="row.componentName" v-model:props-list="row.propsList" :priority="0" />
          </template>
        </template>

        <!-- 不为空列 -->
        <template #isNotNull="{ row }">
          <template v-if="row.isSys || row.status">
            {{ row.isNotNull ? '是' : '否' }}
          </template>
          <template v-else>
            <el-checkbox v-model="row.isNotNull" />
          </template>
        </template>

        <!-- 默认值列 -->
        <template #defaultValue="{ row }">
          <template v-if="row.isSys || row.status">
            {{ row.defaultValue }}
          </template>
          <template v-else>
            <el-input v-model="row.defaultValue"/>
          </template>
        </template>
      </JVxeTable>
    </div>
  </el-form>
  <BatchAddFieldDialog ref="batchAddFieldDialogRef" @success="batchAddFieldSuccess"/>
</template>
<script lang="ts" setup>
import { CirclePlusFilled, RemoveFilled,Position } from '@element-plus/icons-vue'
import { getColumnType, getFieldPage, saveField, getSysFieldPage, saveTempField } from '../../api'
import { propTypes } from '@/utils/propTypes'
import SelectComponent from '../../../dev/Components/SelectComponent.vue'
import { fieldListColumns } from '../../data'
import {cloneDeep} from "lodash-es";
import BatchAddFieldDialog from "../../Components/BatchAddFieldDialog.vue";
import { useSysConfigStore } from '@/store/modules/sysConfig';

defineOptions({ name: 'TableModel' })
const useSysConfig = useSysConfigStore()
const dataSourceConfig = useSysConfig.getDataSourceConfig
const message = useMessage() // 消息弹窗
const props = defineProps({
  tableId: propTypes.string,
  dataSourceId: propTypes.number,
  fieldRules: propTypes.object.def({}),
  tableSql:propTypes.string,
  tableType:propTypes.string
})
let formRef = ref()
const fieldsVxeTable = ref()
// 字段名校验
const validateColumnName = (_rule: any, value: any, callback: any) => {
  if (!(value && !(value.indexOf(dataSourceConfig.field_name_prefix) === 0 && value.length === dataSourceConfig.field_name_prefix.length)) ) {
    callback(new Error('请输入字段名'))
  } 
  else if(!new RegExp(dataSourceConfig.field_name_rule,'g').test(value)){
    callback(new Error(dataSourceConfig.field_name_rule_tips || `请输入正确的格式`))
  }
  else {
    callback()
  }
}
// 名称校验
const validateComment = (rule: any, value: any, callback: any) => {
  if (!value) {
    callback(new Error('请输入名称'))
  } else if(value.length > 64){
    callback(new Error('名称最大长度64位'))
  } else {
    callback()
  }
}
// 长度校验
const validateColumnLength = (rule: any, value: any, callback: any) => {
  if (!value) {
    callback(new Error('请输入长度'))
  } else if(value > 5000){
    callback(new Error('长度不能超过5000'))
  }else {
    callback()
  }
}
const formRules = reactive({
  columnName: [{ required: true, validator: validateColumnName, trigger: 'blur' }],
  columnComment: [{ required: true, validator: validateComment, trigger: 'blur' }],
  columnTypeWithId: [{ required: true,  message: '请选择数据类型', trigger: ['change', 'blur'] }],
  columnLength: [{ required: true, validator: validateColumnLength, trigger: 'blur' }],
  columnScale: [
    {
      validator(rule, value, callback) {
        callback()
      },trigger: 'blur'
    }
  ]
})
const formData:any = ref({ fieldList: [] })

const getColumnTypeName=(columnTypeWithId)=>{
  return dataTypeList.value.find(item=>item.columnTypeWithId===columnTypeWithId)?.columnTypeName || columnTypeWithId
}

//获取当前表字段
const getFieldList = async () => {
  await getDataTypeList()
  const fieldPageRes = await getFieldPage({ tableId: props.tableId, pageNo: 1, pageSize: 1000 })
  formData.value.fieldList = (fieldPageRes.list || []).map(item => ({
    ...item,
    columnTypeName:dataTypeList.value.find(item1=>item.columnTypeWithId===item1.columnTypeWithId)?.columnTypeName || item.columnTypeWithId
  }))
  if(formData.value.fieldList.length == 0) {
    if(props.tableType !== 'virtual_table'){
      await getSysFieldList()
    }else{
      formData.value.fieldList = [{}]
    }
  }
}

//获取系统系统
const getSysFieldList = async () => {
  const res = await getSysFieldPage({ pageNo: 1, pageSize: 100, dataSourceId: props.dataSourceId })
  const sysFieldList = res.list.map((item) => {
    return {
      ...item,
      id: null,
      isSys: 1
    }
  })
  formData.value.fieldList = [...sysFieldList.filter((item) => item.columnPosition == '1'), {}, ...sysFieldList.filter((item) => item.columnPosition != '1')]
}

//获取数据类型下拉框数据
const dataTypeList = ref([])
const getDataTypeList = async () => {
  const dataTypeRes = await getColumnType(props.dataSourceId)
  dataTypeList.value = dataTypeRes
}
getFieldList()

const rowClsName = ({ row }) => {
  if (row.isSys) {
    return 'disable-row'
  } else {
    return ''
  }
}

let selectedDataTypeFlag = false
let oldQueryString = ''

const dataTypeSelect = (item,row) =>{
  row.columnTypeWithId = item.columnTypeWithId
  const map = new Map(dataTypeList.value.map(item => [item.columnTypeWithId, item]));
  const obj:any = map.get(item.columnTypeWithId)
  if (obj) {
    row.columnType = obj.columnType
    row.dataDomainId = obj.dataDomainId
    if ( obj.columnLength) {
      row.columnLength = obj.columnLength
    }
    if (obj.columnScale) {
      row.columnScale = obj.columnScale
    }
    if (obj.inputRule) {
      row.inputRule = obj.inputRule
    }
  }else{
    row.columnType = item.columnType
  }
}

const dataTypeChange = (row) => {
  if(!dataTypeList.value.find(item => item.columnTypeName === row.columnTypeName)){
    row.columnTypeWithId = row.columnTypeName
    row.columnType = row.columnTypeName
  }
}

const searchDataTypeList = (queryString,cb,row) => {
  const selectedDataType = dataTypeList.value.find(item => item.columnTypeWithId === row.columnTypeWithId)?.columnTypeName || row.columnTypeWithId
  if(selectedDataType === queryString){
    oldQueryString !== queryString ? (selectedDataTypeFlag = true) : (selectedDataTypeFlag = false)
    oldQueryString = queryString
  }
  const results = queryString && !(selectedDataType === queryString && selectedDataTypeFlag)
    ? dataTypeList.value.filter(createFilter(queryString))
    : dataTypeList.value
  cb(results)
}
const createFilter = (queryString: string) => {
  return (dataType) => {
    return (
      dataType.columnTypeName.toLowerCase().indexOf(queryString.toLowerCase()) === 0
    )
  }
}

const addRow = (index, count) => {
  if (index != null) {
    formData.value.fieldList.splice(index + 1, 0, { columnName: '' })
  } else {
    //找到系统字段前面一行
    let lastIndex=cloneDeep(formData.value.fieldList).reverse().findIndex((item) => !item.isSys)
    lastIndex=formData.value.fieldList.length-1-lastIndex
    count = count || 1
    for (let i = 0; i < count; i++) {
      formData.value.fieldList.splice(lastIndex + 1, 0, { columnName: '' })
      lastIndex++
    }
    nextTick(()=>{
      scrollToRow(lastIndex)
    })
  }
}
const scrollToRow=(index)=>{
  fieldsVxeTable.value.scrollToRow(index)
}
const delRow = (index) => {
  formData.value.fieldList.splice(index, 1)
}
const submitForm = (isTemp: boolean) => {
  if (formData.value.fieldList.filter((item) => !item.isSys).length == 0) {
    message.warning('请添加字段')
    return
  }
  formRef.value.validate(async (valid) => {
    if (valid) {
      let createReqVOs = formData.value.fieldList
      createReqVOs.forEach((item,index) => {
        item.sort = index
        item.tableId = props.tableId
        item.isTemp = isTemp
      })
      const params = {
        createReqVOs,
        tableSql:props.tableSql
      }
      //return
      let res: any = null
      if (isTemp) {
        res = await saveTempField(params)
      } else {
        res = await saveField(params)
      }
      if (res) {
        message.success('提交成功！')
        let fieldRes = await getFieldPage({ tableId: props.tableId, pageNo: 1, pageSize: 1000 })
        formData.value.fieldList = (fieldRes.list || []).map(item => ({
          ...item,
          columnTypeName:dataTypeList.value.find(item1=>item.columnTypeWithId===item1.columnTypeWithId)?.columnTypeName || item.columnTypeWithId
        }))
      }
    } else {
      message.warning('表单验证失败，请检查输入')
      return false
    }
  })
}

defineExpose({ submitForm })

const batchAddFieldDialogRef=ref()
const batchAddField=()=>{
  batchAddFieldDialogRef.value.open()
}
const batchAddFieldSuccess=(str)=>{
  const fieldStrList=str.split('\n')
  const fieldList=fieldStrList.map(item=>{
    const itemStrList=item.split('|')
    return{
      columnName:itemStrList.at(0),
      columnComment:itemStrList.at(1),
      columnTypeWithId:dataTypeList.value.find(typeItem=>typeItem.columnTypeName.toLowerCase()==itemStrList.at(2).toLowerCase())?.columnTypeWithId || itemStrList.at(2),
      columnLength:itemStrList.at(3),
      columnScale:itemStrList.at(4),
      columnTypeName:itemStrList.at(2),
      columnType:dataTypeList.value.find(typeItem=>typeItem.columnTypeName.toLowerCase()==itemStrList.at(2).toLowerCase())?.columnType || itemStrList.at(2)
    }
  })

  let lastIndex=cloneDeep(formData.value.fieldList).reverse().findIndex((item) => !item.isSys)
  lastIndex=formData.value.fieldList.length-1-lastIndex
  fieldList.forEach(item=>{
    formData.value.fieldList.splice(lastIndex + 1, 0, item)
    lastIndex++
  })
}
/** 初始化 */
onMounted(() => {})
</script>
<style lang="scss" scoped>
.datamodel-header {
  display: flex;
  justify-content: start;
  align-items: center;
}
.sort {
  .sort-number {
    //display: none;
  }
  .sort-action {
    display: none;
    i {
      font-size: 16px;
      cursor: pointer;
      color: #409eff;
      &:nth-child(1) {
        margin-right: 5px;
      }
      &:hover {
        color: #79bbff;
      }
    }
  }
}
:deep(.vxe-body--row) {
  height: 56px;
  &:hover {
    .sort-number {
      display: none;
    }
    .sort-action {
      display: block;
    }
  }
}
.table-group-row {
}
:deep(.table-row) {
  .vxe-cell--tree-node,
  .vxe-tree-cell {
    padding-left: 0px !important;
  }
}
.table-tb {
  :deep(.el-form-item--default) {
    margin-bottom: 0 !important;
  }
}
.dataType-item {
  display: flex;
  justify-content: space-between;
  .value {
    color: #bfbfbf;
  }
}
</style>
