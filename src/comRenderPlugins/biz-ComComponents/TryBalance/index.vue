<template>
  <div class="try-balance-container" v-if="!isDetail && flowNodeInfo.nodeId=='3736'">
    <el-button type="primary" @click="handleClick">试 算</el-button>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import {getTryBalance} from "@/comRenderPlugins/biz-ComComponents/TryBalance/api";
import { computedBalance } from './computed';
// ==================== Props 定义 ====================
const renderFormData=defineModel()
const props = defineProps({
  instance:{
    type:Object,
  },
  groupItem:{
    type:Object
  },
  formGroups:{
    type: Array,
  },
  flowNodeInfo: {
    type:Object
  },
  isDetail:{
    type:Boolean
  }
})

const curTable=ref({})
const initTable=()=>{
  if(props.groupItem.formItems && props.groupItem.formItems.length){
    curTable.value=props.groupItem.formItems[0] || {}
  }
  console.log('curTable',curTable,renderFormData)
}
initTable()

const handleClick=async (val,option)=>{
  console.log(val,option)
  const tableId=curTable.value.moduleTableId
  const curTableData=renderFormData.value[tableId]
  //对字段进行必填校验
  const fields=[]
  fields.push(`${tableId}.ANNUALIZED_DAYS_${tableId}`)
  fields.push(`${tableId}.DURATION_OF_EXISTENCE_${tableId}`)
  fields.push(`${tableId}.ACCUMULATED_PAID_IN_TRUST_${tableId}`)
  fields.push(`${tableId}.DAILY_AVERAGE_PAID_IN_TRUST_${tableId}`)
  fields.push(`${tableId}.REAL_RETURN_${tableId}`)
  fields.push(`${tableId}.TRUST_FEES_${tableId}`)
  fields.push(`${tableId}.ACCUMULATED_BASIC_${tableId}`)
  fields.push(`${tableId}.ACCUMULATED_PERFORMANCE_${tableId}`)
  fields.push(`${tableId}.ACCUMULATED_PAYMENT_${tableId}`)
  const flag = await props.instance.exposed.validateFields(fields)
  if(flag){
    const {TRUST_FEE_RATE,ACTUAL_TRUST_RETURN_RATE,REAL_RATE_OF_RETURN,AMOUNT_OF_DAMAGES} = computedBalance(renderFormData.value,tableId)
    /**
     * 计算信托费用率
     * 信托费用/日均实收信托/存续天数*年化天数
     */
    renderFormData.value[tableId][`TRUST_FEE_RATE_${tableId}`]=TRUST_FEE_RATE
    /**
     * 实际信托报酬率
     * (受托人累计基本报酬+受托人累计业绩报酬)/日均实收信托/存续天数*年化天数
     */
    renderFormData.value[tableId][`ACTUAL_TRUST_RETURN_RATE_${tableId}`]=ACTUAL_TRUST_RETURN_RATE
    /**
     * 实际收益率
     * 实际收益/日均实收信托/存续天数*年化天数
     */
    renderFormData.value[tableId][`REAL_RATE_OF_RETURN_${tableId}`]=REAL_RATE_OF_RETURN
    /**
     * 计算损失金额
     * 项目整体盈亏情况选择【整体亏损】时，该字段显示并必填，否则不显示
     * 损失金额=累计实收信托-信托本金累计给付额
     */
     renderFormData.value[tableId][`AMOUNT_OF_DAMAGES_${tableId}`] = AMOUNT_OF_DAMAGES
  }
  
  // const params={
  //   'ANNUALIZED_DAYS':curTableData['ANNUALIZED_DAYS_'+tableId],//年化天数
  //   'DURATION_OF_EXISTENCE':curTableData['DURATION_OF_EXISTENCE_'+tableId],//存续天数
  //   'ACCUMULATED_PAID_IN_TRUST':curTableData['ACCUMULATED_PAID_IN_TRUST_'+tableId],//累计实收信托
  //   'DAILY_AVERAGE_PAID_IN_TRUST':curTableData['DAILY_AVERAGE_PAID_IN_TRUST_'+tableId],//日均实收信托
  //   'REAL_RETURN':curTableData['REAL_RETURN_'+tableId],//实际收益
  //   'TRUST_FEES':curTableData['TRUST_FEES_'+tableId],//信托费用
  //   'ACCUMULATED_BASIC':curTableData['ACCUMULATED_BASIC_'+tableId],//受托人累计基本报酬
  //   'ACCUMULATED_PERFORMANCE':curTableData['ACCUMULATED_PERFORMANCE_'+tableId],//受托人累计业绩报酬
  //   'ACCUMULATED_PAYMENT':curTableData['ACCUMULATED_PAYMENT_'+tableId],//信托本金累计给付额
  // }
  
  // const res=await getTryBalance(params)
  // if(res){
  //   renderFormData.value[tableId][`TRUST_FEE_RATE_${tableId}`]=''//信托费用率
  //   renderFormData.value[tableId][`ACTUAL_TRUST_RETURN_RATE_${tableId}`]=''//实际信托报酬率
  //   renderFormData.value[tableId][`REAL_RATE_OF_RETURN_${tableId}`]=''//实际收益率
  //   renderFormData.value[tableId][`AMOUNT_OF_DAMAGES_${tableId}`]=''//损失金额
  // }
}
</script>

<style lang="scss" scoped>
.try-balance-container{
  margin-left: 180px;
}
</style>
