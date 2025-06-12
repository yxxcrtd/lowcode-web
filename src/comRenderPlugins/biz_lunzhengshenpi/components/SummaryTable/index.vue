<template>
  <div>
    <!-- 表格部分 -->
    <div style="width: 100%;text-align: center;background-color: #f3f5f9;line-height: 35px;font-weight: 700;">
      {{ (renderFormData[formId]?.[`DEPART_TEXT_${formId}`]||'')+'“'+(renderFormData[formId]?.[`PRODUCT_NAME_${formId}`]||'')+'”'+'（'+(renderFormData[formId]?.[`PERIOD_NUMBER_${formId}`]||'')+'期）募集情况表' }}
    </div>
    <div style="width: 100%;display: flex;line-height: 32px;justify-content: space-between;">
      <span>成立日期：{{ renderFormData[formId]?.[`PROD_SET_UP_DATE_${formId}`] }}</span>
      <span>金额单位（元）</span>
    </div>
    <JVxeTable
      ref="tableRef"
      :columns="defaultColumns"
      :data-source="renderFormData['list_'+curTable.tableId]"
      :height="400"
      :table-page-config="{enabled: false}"
      :isShowRightButton="false"
      :footer-count="footerCount"
      :show-footer="true"
    >
      <template v-for="(slotName,index) in columnsSlots" #[slotName]="{ row,column }" :key="'vxetable-col-slot-'+index">
        <div v-if="column.params.slotType === 'amt'">
          {{ formatNum(row[column.field],true,{keepDecimalPlaces:column.params.decimalLimit || 0,conversionRate:column.params.rate || 1,thousandth:column.params.showThousands}) }}{{ column.params.appendTitle }}
        </div>
        <div v-if="column.params.slotType === 'dict'">
          {{ getDictLabel(column.params.dict,row[column.field]) }}
        </div>
        <div v-if="column.params.slotType === 'BENEFIT_TERM'">
          {{ (row['BENEFIT_TERM_'+curTable.tableId] || '')}}{{row['BENEFIT_TERM_UNIT_'+curTable.tableId]?getDictLabel('TERM_UNIT',row['BENEFIT_TERM_UNIT_'+curTable.tableId] || ''):null }}
        </div>
      </template>
    </JVxeTable>
    <div style="width: 100%;line-height: 32px;">
      <span>注：本期募集已完成（金融产品{{renderFormData[formId]?.[`FIN_PROD_COUNT_${formId}`] || 0}}笔，机构{{renderFormData[formId]?.[`ORG_COUNT_${formId}`]|| 0}}笔，自然人{{renderFormData[formId]?.[`NATURAL_PERSON_COUNT_${formId}`]|| 0}}笔,{{formatNum(Number(renderFormData[formId]?.[`TOTAL_${formId}`]|| 0),true,{thousandth:true}) }}元）</span>
    </div>
  </div>
</template>
<script setup lang="ts">
import {computed, ref, watch} from 'vue'
import * as tableCls from '@/comRender/Template/T-02-List/js/table'
import {formatNum} from "@/utils/formatter";
import {getDictLabel} from "@/utils/dict"

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

const curTable=ref({})

// 默认列配置
let defaultColumns,columnsSlots = []

const footerCount = () => {
  return [
    defaultColumns.map((column, _columnIndex) => {
      if (_columnIndex === 0) {
        return '合计'
      }
      if (column.isTotalColumn) {
        console.log('aaaa-----');
        
        // 找到data中这一列数据
        const values = (renderFormData.value['list_'+curTable.value.tableId] || []).map((item) => item[column.field])
        if (!values.every((value) => isNaN(value))) {
          const result = values.reduce((prev, curr) => {
            const value = Number(curr)
            if (!isNaN(value)) {
              return prev + curr
            } else {
              return prev
            }
          }, 0)
          return formatNum(Number(result),true,{keepDecimalPlaces:column.params.decimalLimit || 0,conversionRate:column.params.rate || 1,thousandth:true}) + (column.params.appendTitle || '')
        } else {
          return ''
        }
      }
      return null
    })
  ]
}

const formIdList = [
  '1893927138770055170',//子产品
  '1894230069352361985',//募集情况
  '1894273871882514434',//代销金额确认
  '1894288982567317505',//TA份额登记
]
const formId = ref('')
const initTable=()=>{
  for (const key in renderFormData.value) {
    if(formIdList.includes(key)){
      formId.value = key
    }
  }
  if(props.groupItem.formItems && props.groupItem.formItems.length){
    curTable.value=props.groupItem.formItems[0] || {}
    const typeMap = {
      'ace-input-currency':'amt',
      'ace-select':'dict'
    }
    defaultColumns = (props.groupItem.formItems[0].tableItems || [])
    .filter(item => !item.isHidden)
    .map((item) => {
      let col={
        title: item.columnNameAlias || item.columnComment,
        align: typeMap[item.columnDisplayComponent] === 'amt'?'right':'left',
        field:item.columnName+'_'+item.moduleTableId,
        sortable:item.isColumnSort,
        fixed:item.isColumnFixed==='none' ? null :item.isColumnFixed,
        minWidth: item.columnFixedWidth || 180,
        isTotalColumn: item.columnDisplayComponent === 'ace-input-currency' && !(item.props && item.props.rate == 0.01),
        slots:{
          // header:item.columnName+'_'+item.tableId+'_header'
        },
        params:{
          ...(item.props || {})
        }
      }
      //对于是需要对数据进行转换的操作，添加插槽
      if(item.columnDisplayComponent !== 'ace-input'){
        col.slots.default = item.columnName+'_'+item.tableId+'_default'
        col.params.slotType = typeMap[item.columnDisplayComponent] || ''
      }
      if(item.columnName === 'BENEFIT_TERM'){
        col.slots.default = item.columnName+'_'+item.tableId+'_default'
        col.params.slotType = 'BENEFIT_TERM'
      }
      return col;
    })
    columnsSlots=tableCls.getColumnsSlots(defaultColumns)
  }
}
initTable()

</script>

<style scoped lang="scss">
</style>
