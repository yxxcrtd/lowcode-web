<template>
  <div class="contract-list">
    <GroupTipsContent v-if="formItem.columnHeadTips" :groupTips="formItem.columnHeadTips">{{formItem.columnHeadTips}}</GroupTipsContent>
    <div class="select-all">
      <div>
          <el-checkbox v-if='!isDetail' v-model="selectAll" @change="handleSelectAll">全选（单击选择卡片，再次单击可取消选择）</el-checkbox>
      </div>
      <div style="display:flex">
          <div class="status-filter" v-for="(item,index) in statusOptions" :key="index">
              <div class="statusStyle" :class="[item.color]">{{item.label}}</div>
          </div>
      </div>
    </div>
    <div class="card-wrapper">
      <div
v-for="(item, index) in contractList" :key="item" class="contract-card"
          :class="{ 'disabled-card': index === 0,'disabled-read': isDetail, 'selected-card': item.selected, 'default-selected': index === 0 }"
          @click="toggleCard(index)">
          {{ item.label }}
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import {computed, ref, watch} from 'vue'
import GroupTipsContent from '@/comRender/render/v1/Components/RenderForm/Components/GroupTipsContent.vue';
// const renderFormData=defineModel()
const props=defineProps({
  modelValue:{
    type:String
  },
  formItem:{
    type:Object
  },
  formGroups:{
    type: Array,
  },
  isDetail: {
    type:Boolean
  },
  formData: {
    type:Object
  }
})

const curTable=ref({})

const statusOptions = [
  { label: '已选且不可取消选择', value: '已选且不可取消选择', color: 'statusStyle-no-select' },
  { label: '已选', value: '已选', color: 'statusStyle-select' },
  { label: '可选', value: '可选', color: 'statusStyle-null' }
]

const selectAll = ref(false)

const contractList = ref([
  { label: '运用合同', value: '01', selected: true, disabled: true },
  { label: '担保合同/保证合同', value: '09', selected: false },
  { label: '担保合同/抵押合同', value: '10', selected: false },
  { label: '担保合同/质押合同', value: '11', selected: false },
  { label: '担保合同/其他担保合同', value: '12', selected: false },
  { label: '补充协议/其他合同', value: '14', selected: false },
  { label: '补充协议/债权债务确认及清偿合同', value: '15', selected: false },
  { label: '补充协议/应收账款转让登记协议', value: '16', selected: false },
  { label: '其他合同/信托业保障基金委托认购合同', value: '17', selected: false },
  { label: '其他合同/其他合同', value: '18', selected: false }
])

const initTable=()=>{
  if(props.formItem){
    curTable.value=props.formItem || {}
  }
}
initTable()

const contractMap = {
  ContractType:'CONTRACT_TYPE_'+curTable.value.moduleTableId //合同类型
}

// 更新全选状态
const updateSelectAllState = () => {
  selectAll.value = contractList.value.slice(1).every(item => item.selected)
}
// 卡片点击事件
const toggleCard = (index) => {
  if (index === 0 || props.isDetail) return // 第一个不可操作
  contractList.value[index].selected = !contractList.value[index].selected
  updateSelectAllState()
}
// 全选处理
const handleSelectAll = (val) => {
  contractList.value.forEach((item, index) => {
      if (index !== 0) item.selected = val
  })
}
const emit = defineEmits(['update:modelValue'])
watch(contractList, (newVal) => {
    emit('update:modelValue',newVal.filter(item => item.selected).map(item => {
      return item.value
    }
    )?.join(','))
}, { deep: true,immediate:true });
watch(() => props.modelValue, (newVal) => {
  contractList.value.forEach(item => {
    if(props.modelValue && (props.modelValue?.split(',') || []).find(contract => contract === item.value)){
      item.selected = true
    }
    return {...item}
  })
}, { deep: true,immediate:true });
//底部资产一级
watch(
  () => props.formData[curTable.value.moduleTableId][`BOTTOM_ASSET_ONE_${curTable.value.moduleTableId}`],(newVal) => {
  if(newVal !== '1'){
    contractList.value[0].value = '02'
    contractList.value[0].label = '运用合同/收（受）益权类'
  }
}, { deep: true,immediate:true })

//底部资产二级
watch(
  () => props.formData[curTable.value.moduleTableId][`BOTTOM_ASSET_TWO_${curTable.value.moduleTableId}`],(newVal) => {
  if(newVal === '0'){
    contractList.value[0].value = '01'
    contractList.value[0].label = '运用合同/贷款类'
  }else if(newVal === '3'){
    contractList.value[0].value = '05'
    contractList.value[0].label = '运用合同/其他股权投资类'
  }else if(['5','6','4'].includes(newVal)){
    contractList.value[0].value = '07'
    contractList.value[0].label = '运用合同/合伙企业份额类'
    }
}, { deep: true,immediate:true })

//底部资产三级
watch(
  () => props.formData[curTable.value.moduleTableId][`BOTTOM_ASSET_THREE_${curTable.value.moduleTableId}`],(newVal) => {
    if(['1','2','3','4','5','6'].includes(newVal)){
      if(newVal === '1'){
        contractList.value[0].value = '04'
        contractList.value[0].label = '运用合同/应收账款类'
      }else{
        contractList.value[0].value = '06'
        contractList.value[0].label = '运用合同/其他非标准化债权类'
      }
    }
}, { deep: true })

</script>
<style lang="scss">
  .el-form-item:has(.contract-list) {
    .el-form-item__label{
      display: none;
    }
  }
</style>
<style scoped lang="scss">
  .select-all {
    margin-bottom: 10px;
    display: flex;
    justify-content: space-between;
    .status-filter {
      display: flex;
      justify-content: flex-end;
      .statusStyle{
        margin-right: 7px;
        padding: 2px 15px 2px 15px;
      }
    }
  }
  .card-wrapper {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }
  .contract-card {
    width: 18.3%;
    height: 30px;
    border: 1px solid #DCDFE6;
    border-radius: 4px;
    display: flex;
    align-items: center;
    padding: 0 5px;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s;
  }
  .selected-card {
    background-color: rgba(253, 250, 237, 1) !important;
    border-color: #f90;
  }
  .disabled-card {
    background-color: rgba(242, 242, 242, 1) !important;
    cursor: not-allowed;
  }
  .statusStyle-no-select{
    background-color: rgba(242, 242, 242, 1);
    border: 1px solid rgba(220, 222, 224, 1);
  }
  .statusStyle-select{
    background-color: rgba(253, 250, 237, 1);
    border: 1px solid rgba(255, 228, 139, 1);
  }
  .statusStyle-null{
    background-color: white;
    border: 1px solid rgba(178, 215, 255, 1);
  }
</style>
