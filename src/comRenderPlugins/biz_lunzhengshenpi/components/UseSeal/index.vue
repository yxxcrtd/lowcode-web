
<template>
  <div class="form-table-item">
    <div class="form-item" v-for="(tableItem,index) in tableList" :key="'use-seal-table-item'+index">
      <div class="item-title">
        <span>{{tableItem.tableTitle}}</span>
        <el-button v-if="tableItem.tableTitle==='其他资料' && !tableIsDisable" :icon="Plus" size="small" @click="addRow(tableItem.tableId)">新增</el-button>
      </div>
      <vxe-table
        ref="vxeTableRef"
        :column-config="{resizable: true}"
        border="inner"
        stripe
        align="center"
        min-height="200"
        :data="renderFormData['list_' + tableItem.tableId]"
      >
        <template v-for="(col, index) in tableItem.tableItems" :key="index">
          <vxe-column
            :align="col.align || 'center'"
            :footer-align="col.align || 'center'"
            :params="{ isTotalColumn: col.isTotalColumn, field: col.field }"
            :title="col.columnComment"
            :min-width="col.minWidth"
            v-if="!col.isHidden"
          >
            <template #default="{ row,rowIndex }">
              <template v-if="isDetail">
                {{row[col.field]}}
              </template>
              <el-form-item
                v-else
                label-width="0"
                :prop="`['list_${tableItem.tableId}'][${rowIndex}].${col.field}`"
                :rules="col.rules"
              >
                <template v-if="col.isDisabled">
                  <template v-if="col.columnName=='USE_SEAL_CONTENT' && tableItem.tableTitle==='其他资料'">
                    <span>{{getDictLabel(row[col.field])}}</span>
                  </template>
                  <span v-else>{{row[col.field]}}</span>
                </template>
                <template v-else>
                  <template v-if="col.columnName=='USE_SEAL_CONTENT'">
                    <template v-if="tableItem.tableTitle==='其他资料'">
                      <ace-select style="width: 100%" dict="FORM_BANK_CODE" v-model="row[col.field]"></ace-select>
                    </template>
                    <template v-else>
                      {{row[col.field]}}
                    </template>
                  </template>
                  <ace-input-number v-else v-model="row[col.field]" :decimal-limit="0"></ace-input-number>
                </template>
              </el-form-item>

            </template>
          </vxe-column>
        </template>
        <vxe-column field="action" title="操作" fixed="right" width="90" v-if="tableItem.tableTitle==='其他资料' && !tableIsDisable">
          <template #default="{ row, rowIndex }">
            <div class="table-action">
              <el-link type="primary" @click="handleDelete(tableItem,row, rowIndex)">删除</el-link>
            </div>
          </template>
        </vxe-column>
        <template #empty>
          <el-empty description="暂无数据"/>
        </template>
      </vxe-table>
    </div>
  </div>
</template>
<script setup>
import {computed, ref, watch} from 'vue'
import {getDictLabels, getIntDictOptions} from "@/utils/dict";
import { Plus } from '@element-plus/icons-vue'

const renderFormData=defineModel()
const props=defineProps({
  groupItem:{
    type:Object
  },
  formGroups:{
    type: Array,
  },
  isDetail: {
    type:Boolean
  }
})
const tableList=ref(null)
const dictMap={
  '公司资料':'FORM_COMPANY_CODE',
  '银行资料':'FORM_BANK_CODE'
}
const initData=()=>{
  if(props.groupItem.formItems && props.groupItem.formItems.length){
    tableList.value=props.groupItem.formItems.filter(item=>item.isTableItem).map(item=>{
      return {
        ...item,
        tableTitle:item.tableConfig.tableTitle,
        dict:dictMap[item.tableConfig.tableTitle] || null
      }
    })
  }
  console.log('tableList',tableList)
  tableList.value.forEach((tableItem,index)=>{
    if(tableItem.dict){
      const companyFileDicts=getIntDictOptions(tableItem.dict)
      renderFormData.value['list_' + tableItem.tableId]=companyFileDicts.map(item=>{
        return {
          ['USE_SEAL_CONTENT_'+tableItem.tableId]:item.label,
          ['USE_SEAL_NUM_'+tableItem.tableId]:0,
          ['COMMON_SEAL_NUM_'+tableItem.tableId]:0
        }
      })
    }
  })
}
initData()

const tableIsDisable=computed(()=>{
  const curTable=tableList.value.find(item=>item.tableTitle==='其他资料')
  return curTable.tableItems.every(item=>item.isDisabled)
})

const drawerSelectAssets=ref()
const handleSelectAssets=()=>{
  const choosedAssetIds=renderFormData.value['list_' + curGroup.value.tableId].map(item=>item['ASSET_ID_1891433037852061697'])
  drawerSelectAssets.value.open('create',choosedAssetIds)
}
const getDictLabel=(value)=>{
  return getDictLabels('FORM_BANK_CODE',value)
}
const tableSelectSuccess=(selectRows)=>{
  selectRows.forEach((item,index)=>{
    renderFormData.value['list_' + curGroup.value.tableId].push({
      'ASSET_NAME_1891433037852061697':item.bottomAssetName,
      'ASSET_ID_1891433037852061697':item.assetId,
      'ASSET_TYPE_1891433037852061697':item.assetTypeAsText,
    })
  })
}
const addRow=(tableId)=>{
  renderFormData.value['list_' + tableId].push({
    ['USE_SEAL_NUM_'+tableId]:0,
    ['COMMON_SEAL_NUM_'+tableId]:0
  })
}
/**
 * 删除记录
 * @param row
 * @param rowIndex
 */
const handleDelete = (tableItem,row, rowIndex) => {
  renderFormData.value['list_' + tableItem.tableId].splice(rowIndex, 1)
}
</script>
<style lang="scss" scoped>
.form-table-item{
  display: flex;
  justify-content: space-evenly;
  .form-item{
    flex: 1;
    .item-title{
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
    }
  }
  &>.form-item:nth-child(2){
    margin:0 20px;
  }
}
.main-content{
  margin: 15px 0;
}
</style>
