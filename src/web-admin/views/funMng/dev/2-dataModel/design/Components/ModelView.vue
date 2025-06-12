<template>
  <div class="datamodel-header">
    <el-button type="primary" v-if="formData.moduleType==1" @click="chooseFields()" class="mb-10px"> <Icon icon="ep:plus" /> 配置模型 </el-button>
    <el-button type="primary" v-else @click="addModelField" class="mb-10px"> <Icon icon="ep:plus" /> 新增字段 </el-button>
    <el-button @click="addModelComputedField" class="mb-10px"> <Icon icon="ep:plus" /> 新增计算字段 </el-button>
<!--    <el-button @click="addVirtualTable" class="mb-10px"> <Icon icon="ep:plus" /> 新增虚拟表 </el-button>-->
  </div>
  <div class="datamodel-content">
    <div class="content-left">
      <div class="model-cards">
        <div class="model-cards-item" :class="checkSelect(item)?'active':''" v-for="(item,index) in getSortTableList" :key="'model_list_'+index" @click="handleChooseModel(item)">
          <div class="main">
            <div class="title">
              <el-tag type="danger" v-if="item.isMain">主</el-tag>
              <el-tag type="warning" v-if="item.relationType==='LEFT JOIN'">左联</el-tag>
              <el-tag type="warning" v-if="item.relationType==='RIGHT JOIN'">右联</el-tag>
              <el-tag type="success" v-if="item.isChild">子表</el-tag>
              <span>
                <el-tooltip
                  v-if="item.searchSql || item.tableRemark"
                  :content="item.searchSql"
                  placement="top"
                >
                  <template #content>
                    <div>查询条件：{{item.searchSql}}</div>
                    <div>说明：{{item.tableRemark}}</div>
                  </template>
                  <el-icon class="table-where-icon" :size="16"><WarningFilled /></el-icon>
                </el-tooltip>
              </span>
              {{item.tableComment}}

            </div>
            <div class="subTitle">
              <div>表名：{{item.tableName}}</div>
              <div>别名：{{item.tableAlias}}</div>
            </div>
          </div>
          <div class="action">

          </div>
        </div>
      </div>
    </div>
    <div class="conent-right">
      <vxe-table
        ref="vxeTableRef"
        v-if="curModel"
        height="100%"
        border="inner"
        @current-change="currentChange"
        :data="curModel.tableFields"
      >
        <vxe-column type="seq" title="序号" width="90" align="center">
          <template #default="{row,rowIndex}">
            <el-tag type="primary" v-if="curModel.isMain && row.isPrimaryKey">主键</el-tag>
            <el-tag type="warning" v-else-if="row.isCalculateField">计算字段</el-tag>
            <span v-else>{{rowIndex+1}}</span>
          </template>
        </vxe-column>
<!--        <vxe-column field="isChecked" width="60" align="center">-->
<!--          <template #default="{ row }">-->
<!--            <el-checkbox v-model="row.isChecked" :key="'modelview_field_'+row.fieldId" :true-value="1" :false-value="0"/>-->
<!--          </template>-->
<!--        </vxe-column>-->
        <vxe-column field="columnName" title="字段名" width="180">
          <template #default="{row}">
            <template v-if="formData.moduleType!=1 || row.isCalculateField">
              <el-input v-model="row.columnName" placeholder="请输入字段名"></el-input>
            </template>
            <template v-else>
              {{row.columnName}}
            </template>
          </template>
        </vxe-column>
        <vxe-column field="columnComment" title="名称" width="180">
          <template #default="{row}">
            <template v-if="formData.moduleType!=1 || row.isCalculateField">
              <el-input v-model="row.columnComment" placeholder="请输入字段名称"></el-input>
            </template>
            <template v-else>
              {{row.columnComment}}
            </template>
          </template>
        </vxe-column>
        <vxe-column field="columnType" title="数据类型" width="180">
          <template #default="{row}">
            <template  v-if="formData.moduleType!=1 || row.isCalculateField || row.computeSql">
              <el-input @click="openSqlEditor(row)" v-model="row.computeSql" :readonly="true" placeholder="请输入数据类型">
                <template #append v-if="row.isCalculateField || row.computeSql">
                  <el-icon @click="openSqlEditor(row)"><Tools /></el-icon>
                </template>
              </el-input>
            </template>
            <template v-else>
              {{row.columnType}}
            </template>
          </template>
        </vxe-column>
        <vxe-column field="columnLength" title="数据长度" width="180">
          <template #default="{row}">
            <template v-if="formData.moduleType!=1 || row.isCalculateField">
              <el-input v-model="row.columnLength" placeholder="请输入数据长度" type="number"></el-input>
            </template>
            <template v-else>
              {{row.columnLength}}
            </template>
          </template>
        </vxe-column>
        <vxe-column field="mappingFieldId" title="映射模型字段" width="280" v-if="formData.mappingModuleId">
          <template #header v-if="formData.moduleType == 1">
            <div class="batch-group-content">
              <span>映射模型字段</span>
              <el-popover placement="bottom" :width="300"  trigger="hover">
                <template #reference>
                  <div class="field-mapping-head">
                  <el-link type="primary" class="batch-group-btn">一键映射</el-link>
                  <el-tooltip
                    content="一键映射会将选择的表和当前表按照【字段名】+【字段类型】一致的情况进行映射"
                    placement="top"
                  >
                    <el-icon :size="16" color="#409efc"><Warning /></el-icon>
                  </el-tooltip>
                  </div>
                </template>
                <div>
                <el-select :teleported="false" clearable v-model="mappingSelect" @change="mappingChange">
                    <el-option
                      v-for="(item, index) in relayModelTableList"
                      :key="index"
                      :label="item.tableAlias+'-'+item.tableComment"
                      :value="item.id"
                    />
                  </el-select>
                </div>
              </el-popover>
            </div>
          </template>
          <template #default="{ row }">
            <template v-if="formData.moduleType == 1 && formData.mappingModuleId">
              <el-badge value="自动匹配" class="item" type="warning" :hidden="!row.isAutoMapping">
                <SelectModelField v-model="row.mappingFieldId" :is-show-child="true" :dataSource="relayModelTableList" @change="handleMapping($event,row)"></SelectModelField>
              </el-badge>
            </template>
            <template v-else>
              {{row.mappingFieldId}}
            </template>
          </template>
        </vxe-column>
        <vxe-column field="isBackData" title="是否回推" width="80" align="center" v-if="formData.mappingModuleId">
          <template #default="{ row }">
            <el-checkbox v-model="row.isBackData"
                         :true-value="1"
                         :false-value="0"/>
          </template>
        </vxe-column>
<!--        <vxe-column field="component" title="组件类型" width="180" :edit-render="{}">
          <template #edit="{ row }">
            <el-select v-model="row.integer" />
          </template>
        </vxe-column>-->
        <vxe-column field="defaultValue" title="别名" width="180">
          <template #default="{ row }">
            <el-input v-model="row.columnAliasName" />
          </template>
        </vxe-column>
        <vxe-column field="columnLength" title="回显字段" width="100">
          <template #default="{row}">
            <div class="table-row-cfg-wrap">
              <el-button
                text
                type="primary"
                @click="openShowTableFieldDialog(row)"
                :class="(row.textTableId || row.textSql) ? 'green-text' : ''"
              >
                配置
              </el-button>
              <el-popconfirm
                title="确定清空配置?"
                @confirm="clearCfg(row,['textTableId','textTableKey','textColumnId','valueType','textSql'])"
                v-if="row.textTableId || row.textSql"
              >
                <template #reference>
                  <el-icon class="cfg-del-btn" title="清空配置">
                    <Delete />
                  </el-icon>
                </template>
              </el-popconfirm>
            </div>
          </template>
        </vxe-column>
        <vxe-column field="remark" title="描述" min-width="180">
          <template #default="{ row }">
            <el-input v-model="row.remark" />
          </template>
        </vxe-column>
      </vxe-table>
    </div>
  </div>
  <ChooseTableDialog ref="refChooseFields" :mainTableInfo="mainTableInfo" :curSelectTableList="formData.tableList" @select-ok="handleSelectFields"/>
  <MappingResult ref="refMapping"  />
  <SqlEditorDialog tips="配置计算公式" title="配置公式" v-if="sqlEditorDialogIsLoad" ref="sqlEditorDialogRef" @success="sqlEditorSuccess"></SqlEditorDialog>
  <ShowTableFieldDialog ref="refShowTableFieldDialog" @success="selectShowFieldSuccess"></ShowTableFieldDialog>
<!--  <VirtualTableDialog ref="virtualTableDialogRef" @success="virtualTableSuccess"></VirtualTableDialog>-->
</template>
<script lang="ts" setup>
import { ref } from 'vue'
import ChooseTableDialog from '../../../Components/ChooseTableDialog.vue'
import SqlEditorDialog from '../../../Components/EditorDialog.vue'
import SelectModelField from '@/web-admin/views/funMng/dev/Components/SelectModelField.vue'
import {getPageModuleInfo, getTableFields} from "@/web-admin/views/funMng/dev/api";
import MappingResult from './MappingResult.vue'
import {Delete, Tools, Warning, WarningFilled} from '@element-plus/icons-vue'
import ShowTableFieldDialog from '../../../Components/ShowTableFieldDialog.vue'
// import FormulaEditorDialog from '@/components/FormulaEditor/DialogSetting.vue'

defineOptions({ name: 'DataModelDesignView' })

const message = useMessage() // 消息弹窗
const refMapping = ref()
const formData:any=defineModel()

const curModel:any = ref(null)
const currentRow = ref(null)
const mappingSelect=ref([])

const mainTableInfo=computed(()=>{
  return formData.value.tableList?.find(item=>item.isMain)
})
const setCurModel=(index)=>{
  curModel.value=formData.value.tableList[index];
  if(!curModel.value.tableFields){
    handleChooseModel(curModel.value)
  }else{
    initIsBackData()
  }
}
const getSort = (item) => {
  if(item.isMain){
    return 0
  }else if(item.relationType==='LEFT JOIN'){
    return 1
  }else if(item.relationType==='RIGHT JOIN'){
    return 2
  }else if(item.isChild){
    return 3
  }
}

const getSortTableList = computed(() => {
  if(formData.value.tableList){
    return formData.value.tableList.sort((a,b) => getSort(a) - getSort(b) )
  }else {
    return []
  }
})

/**
 * 选择字段完成后
 * @param data
 */
const handleSelectFields=(data)=>{
  formData.value.tableList=data;
  curModel.value=formData.value.tableList[0];
}
const handleChooseModel=async (item)=>{
  curModel.value=item
  if(!curModel.value.tableFields) {
    if(item.tableId) {
      let param = { tableId: item.tableId,status:true,pageSize: 100,pageNo: 1 }
      const { list } = await getTableFields(param)
      list.forEach(fieldItem=>{
        const isCheckedItem=item.fieldList.find(childItem=>childItem.fieldId===fieldItem.id)
        if(isCheckedItem){
          fieldItem.isChecked = true
          fieldItem.cId = isCheckedItem.id
        }
      })
      curModel.value.tableFields=list;
    }else {
      const list  = item.fieldList
      list.forEach(fieldItem=>{
          fieldItem.isChecked = true
          fieldItem.cId = fieldItem.id
      })
      curModel.value.tableFields=list;
    }
  }
  initIsBackData()
}
const currentChange = ({ row, rowIndex }) => {
  currentRow.value = {
    row: row,
    rowIndex: rowIndex
  }
}
/**
 * 初始化回推字段
 */
const initIsBackData=()=>{
  curModel.value.tableFields.forEach(item=>{
    console.log('item.isBackData',item.isBackData)
    if(item.isBackData==undefined){
      if(item.mappingFieldId){
        item.isBackData=1
      }else{
        item.isBackData=0
      }
    }
  })
}
const checkSelect=(tableItem)=>{
  return curModel.value?.tableId===tableItem.tableId && curModel.value?.tableAlias==tableItem.tableAlias
}
const refChooseFields=ref()
const chooseFields=(type)=>{
  console.log('formData.mainTableId',formData.value)
  if(!formData.value.mainTableId){
    message.warning("请选择主表")
    return;
  }
  refChooseFields.value.open(type)
}
const addModelField=()=>{
  console.log('curModel',curModel)
  curModel.value.tableFields.push({
    isChecked:1
  })
}
const vxeTableRef=ref()
const addModelComputedField=()=>{
  curModel.value.tableFields.push({
    isChecked:1,
    isCalculateField:1,
  })
  setTimeout(()=>{
    const lastRow = curModel.value.tableFields[curModel.value.tableFields.length - 1]
    vxeTableRef.value.scrollToRow(lastRow)
  },500)
}
const handleMapping=(val,row)=>{
  if(val){
    row.isBackData=1
  }else{
    row.isBackData=0
  }
}
/**
 * 新增虚拟表
 */
const virtualTableDialogRef=ref()
const addVirtualTable=()=>{
  virtualTableDialogRef.value.open()
}
const virtualTableSuccess=()=>{

}

const failList = ref([])
const mappingChange=()=>{
  failList.value = []
  const selectTable = relayModelTableList.value.find(item=>mappingSelect.value == item.id)
  if (selectTable) {
    //匹配成功字段数量
    let mappingFieldCount=0
    curModel.value.tableFields.forEach(item => {
      if (!item.mappingFieldId || 1==1) {
        //根据字段名+类型名，如果一致，就算映射成功
        const findMappingFieldItem=selectTable.fieldList.find(selectTableField=>{
          console.log(item.columnName,'--',item.columnType,'-----',selectTableField.columnName,'--',selectTableField.columnType)
          return item.columnName.toLowerCase() === selectTableField.columnName.toLowerCase() && item.columnType.toLowerCase() === selectTableField.columnType.toLowerCase()
        })
        if(findMappingFieldItem){
          item.mappingFieldId = findMappingFieldItem.id
          item.isAutoMapping=true
          item.isBackData=1
          mappingFieldCount++
        }
      }
    })
    message.success('匹配成功，共匹配 '+mappingFieldCount+' 个字段')
    mappingSelect.value = []
  }
}

const getFaield = (item,fieldItem,msg) => {
  return {
    tableName: curModel.value.tableName,
    columnName: item.columnName,
    javaType: item.javaType,
    mappingTableName: fieldItem.tableName,
    mappingColumnName: fieldItem.columnName,
    mappingJavaType: fieldItem.javaType,
    msg:msg
  }
}

const relayModelTableList=ref([])
const loadRelayModelInfo=async (moduleId)=>{
  const res = await getPageModuleInfo({ id: moduleId })
  relayModelTableList.value=res.tableList;
}

const sqlEditorDialogRef=ref()
const sqlEditorDialogIsLoad=ref(false)
const curActiveRow=ref()
const openSqlEditor=async (row)=>{
  sqlEditorDialogIsLoad.value=true
  await nextTick()
  // const allFieldList=formData.value.tableList.reduce((acc,cur)=>{
  //   const fieldList=cur.tableFields.filter(item=>!item.isCalculateField).map(item=>{
  //     return {
  //       fullName:item.columnComment,
  //       enCode:item.columnName,
  //       value:convertType(item.columnType)
  //     }
  //   })
  //   return [...acc,...fieldList]
  // },[])
  curActiveRow.value=row
  sqlEditorDialogRef.value.open(row.computeSql || '')
}
const sqlEditorSuccess=(data)=>{
  sqlEditorDialogIsLoad.value=false
  // curActiveRow.value.sqlCfg=JSON.stringify(data)
  curActiveRow.value.computeSql=data
}


const refShowTableFieldDialog=ref()
const openShowTableFieldDialog=async (row)=>{
  curActiveRow.value=row
  refShowTableFieldDialog.value.open(row)
}
const selectShowFieldSuccess=(data)=>{
  if(data){
    curActiveRow.value.textTableId=data.tableId
    curActiveRow.value.textTableKey=data.tableKey
    curActiveRow.value.textColumnId=data.columnId
    curActiveRow.value.valueType=data.valueType
    curActiveRow.value.textSql=data.textSql
  }
}

const convertType=(fieldType)=>{
  if(['INT','BIT','BITINT','DECIMAL','FLOAT'].includes(fieldType)){
    return 'number'
  }
  if(['VARCHAAR'].includes(fieldType)){
    return 'array'
  }else{
    return 'string'
  }
}
const clearCfg = (row, field) => {
  if(Array.isArray(field)){
    field.forEach(v=>{
      row[v]=null
    })
  }else{
    row[field] = null
  }
}
watch(
  () => formData.value.mappingModuleId,
  (val) => {
    if (val) {
      loadRelayModelInfo(val)
    }
  },
  { immediate: true }
)

defineExpose({setCurModel})
</script>
<style lang="scss" scoped>
.sort {
  .sort-number {
    //display: none;
  }
  .sort-action {
    display: none;
    i {
      font-size: 16px;
      cursor: pointer;
      &:nth-child(1) {
        margin-right: 5px;
      }
      &:hover {
        color: #f50909;
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
.datamodel-content {
  display: flex;
  height: calc(100vh - 190px);
}
.main-icon {
  background: #1e83e9;
  color: #fff;
  font-size: 12px;
  padding: 2px;
  border-radius: 4px;
  margin-right: 6px;
}
.custom-tree-node{
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin-right:10px;
  a{
    font-size: 12px;
    color: #1e83e9;
    cursor: pointer;
  }
}
.left-tree{
  border-right: 1px solid #e9e4e4;
  margin: 0 10px;
}

.content-left{
  width: 260px;
  padding:5px 10px 5px 0;
  margin:0 16px 0 0;
  border-right: 1px solid #e9e4e4;
  overflow-y: auto;
  .view-tabs{
    display: flex;
    justify-content: center;
    margin: 0px 0px 10px;
  }
  .model-cards{
    margin: 0 10px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    .model-cards-item{
      background: #f6f6f6;
      border-radius: 4px;
      padding: 5px 10px;
      display: flex;
      margin-bottom: 10px;
      .main{
        .title{
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 5px;
        }
        .subTitle{
          font-size: 12px;
          color: #929292;
        }
      }
    }
    .model-cards-item:hover{
      border:1px solid #409eff;
      background: #ebf0fc;
      cursor: pointer;
      .main{
        .title{
          color: #409eff;
        }
        .subTitle{
          color: #a2abd7;
        }
      }
    }
  }
}
.active{
  border:1px solid #1c85f1;
  background: #ebf0fc;
  .main{
    .title{
      color: #409eff;
    }
    .subTitle{
      color: #a2abd7;
    }
  }
}
.conent-right {
  width: calc(100% - 300px);
  height:100%;
  .table-content {
    height: calc(100% - 50px);
  }
}
.select-api {
  margin-bottom: 15px;
}
.batch-group-content {
  display: flex;
  justify-content: space-between;
  .batch-group-btn {
    font-size: 12px;
  }
}
.field-mapping-head{
  display: flex;
  align-items: center;
  justify-content: center;
}
.table-where-icon{
  color: #B38E33;
  top: 3px;
}
</style>
