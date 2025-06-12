<template>
  <div class="prod-states-container">
    <el-button v-if="nodeId === 3589" type="primary" @click="handleClick" :disabled="!renderFormData[tableId][`PRODUCT_NO_${tableId}`]">获取登记结果</el-button>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import {getProdBasicInfo} from "@/comRenderPlugins/biz-ComComponents/ProdStatesButton/api";
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
  }
})
const route = useRoute()
const nodeId = route.query.nodeId
const curTable=ref({})
const tableId=ref('')
const initTable=()=>{
  if(props.groupItem.formItems && props.groupItem.formItems.length){
    curTable.value=props.groupItem.formItems[0] || {}
    tableId.value=curTable.value.moduleTableId
  }
  console.log('curTable',curTable,renderFormData)
}
initTable()

const handleClick=async (val,option)=>{
  console.log(val,option)
  const curTableData=renderFormData.value[tableId.value]
  const res = await getProdBasicInfo({productNoEquals:curTableData[`PRODUCT_NO_${tableId.value}`],prodStateIn:'5'})
  if(res && res.records && res.records.length){
    curTableData[`SHARE_REGIST_FINISH_FLAG_${tableId.value}`] = '1'
  }else{
    curTableData[`SHARE_REGIST_FINISH_FLAG_${tableId.value}`] = '0'
  }
}
</script>

<style lang="scss" scoped>
.prod-states-container{
  margin-left: 180px;
}
</style>