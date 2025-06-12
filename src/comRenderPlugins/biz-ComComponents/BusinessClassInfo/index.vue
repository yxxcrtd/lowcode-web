<template>
  <el-col :span="24" class="aaa">
    <el-row :gutter="10">
      <el-col :span="8">
        <el-form-item label="信托业务分类" >
          <template #label>
            <FormItemLabel label="信托业务分类"></FormItemLabel>
          </template>
          <!-- <el-input v-model="trustInfoForm[formItem.moduleTableId][businessClassMap.xtywflOneText]" disabled/> -->
          {{ trustInfoForm[formItem.moduleTableId][businessClassMap.xtywflOneText] }}
        </el-form-item>
      </el-col>
      <el-col :span="8" v-if="trustInfoForm[formItem.moduleTableId][businessClassMap.xtywflOne] === '1002'">
        <el-form-item label="资产管理信托分类" >
          <template #label>
            <FormItemLabel label="资产管理信托分类"></FormItemLabel>
          </template>
          <!-- <el-input v-model="trustInfoForm[formItem.moduleTableId][businessClassMap.zcglxtflText]" disabled/> -->
          {{ trustInfoForm[formItem.moduleTableId][businessClassMap.zcglxtflText] }}
        </el-form-item>
      </el-col>
      <el-col :span="8" v-if="trustInfoForm[formItem.moduleTableId][businessClassMap.xtywflOne] === '1001'">
        <el-form-item label="资产服务信托分类1" :prop="businessClassMap.zcfwxtflOneText">
          <template #label>
            <FormItemLabel label="资产服务信托分类1"></FormItemLabel>
          </template>
          <!-- <el-input v-model="trustInfoForm[formItem.moduleTableId][businessClassMap.zcfwxtflOneText]" disabled/> -->
          {{ trustInfoForm[formItem.moduleTableId][businessClassMap.zcfwxtflOneText] }}
        </el-form-item>
      </el-col>
      <el-col :span="8" v-if="trustInfoForm[formItem.moduleTableId][businessClassMap.xtywflOne] === '1001'">
        <el-form-item label="资产服务信托分类2" :prop="businessClassMap.zcfwxtflTwoText">
          <template #label>
            <FormItemLabel label="资产服务信托分类2"></FormItemLabel>
          </template>
          <!-- <el-input v-model="trustInfoForm[formItem.moduleTableId][businessClassMap.zcfwxtflTwoText]" disabled/> -->
          {{ trustInfoForm[formItem.moduleTableId][businessClassMap.zcfwxtflTwoText] }}
        </el-form-item>
      </el-col>
      <el-col :span="8" v-if="trustInfoForm[formItem.moduleTableId][businessClassMap.xtywflOne] === '1003'">
        <el-form-item label="公益慈善信托分类" :prop="businessClassMap.gycsxtflText">
          <template #label>
            <FormItemLabel label="公益慈善信托分类"></FormItemLabel>
          </template>
          <!-- <el-input v-model="trustInfoForm[formItem.moduleTableId][businessClassMap.gycsxtflText]" disabled/> -->
          {{ trustInfoForm[formItem.moduleTableId][businessClassMap.gycsxtflText] }}
        </el-form-item>
      </el-col>
    </el-row>
  </el-col>
</template>
<script setup lang="ts">
import {computed, ref, watch} from 'vue'
import request from '@/config/axios'
import FormItemLabel from "@/comRender/render/v1/Components/RenderForm/Components/FormItemLabel.vue";

const props=defineProps({
  modelValue:{
    type:String
  },
  formData:{
    type:Object,
    default:() => {}
  },
  formItem:{
    type:Object,
    default:() => {}
  },
  formGroups:{
    type: Array,
  },
  isDetail: {
    type:Boolean
  }
})
const emit = defineEmits(['update:formData', 'change'])

const trustInfoForm = computed({
  get: () => {
    return props.formData
  },
  set: (val: Object) => {
    emit('update:formData', val)
  }
})
let businessClassMap = {}
//预登记
if(props.formItem?.moduleTableId === '1903295385814560770'){
  businessClassMap = {
    xtywflOne:'XTYWFL_'+props.formItem?.moduleTableId,
    xtywflOneText:'XTYWFL_TEXT_'+props.formItem?.moduleTableId,
    zcglxtfl:'ZCGLXTFL_'+props.formItem?.moduleTableId,
    zcglxtflText:'ZCGLXTFL_TEXT_'+props.formItem?.moduleTableId,
    zcfwxtflOne:'ZCFWXTFL_ONE_'+props.formItem?.moduleTableId,
    zcfwxtflOneText:'ZCFWXTFL_ONE_TEXT_'+props.formItem?.moduleTableId,
    zcfwxtflTwo:'ZCFWXTFL_TWO_'+props.formItem?.moduleTableId,
    zcfwxtflTwoText:'ZCFWXTFL_TWO_TEXT_'+props.formItem?.moduleTableId,
    gycsxtfl:'GYCSXTFL_'+props.formItem?.moduleTableId,
    gycsxtflText:'GYCSXTFL_TEXT_'+props.formItem?.moduleTableId,
  }
}//初始登记 
else if(props.formItem?.moduleTableId === '1909189125359915009'){
  businessClassMap = {
    xtywflOne:'XTYWFL_'+props.formItem?.moduleTableId,
    xtywflOneText:'XTYWFL_TEXT_'+props.formItem?.moduleTableId,
    zcglxtfl:'ASSET_MGMT_TRUST_TYPE_'+props.formItem?.moduleTableId,
    zcglxtflText:'ASSET_MGMT_TRUST_TYPE_TEXT_'+props.formItem?.moduleTableId,
    zcfwxtflOne:'TRUST_CATEGORY_ONE_'+props.formItem?.moduleTableId,
    zcfwxtflOneText:'TRUST_CATEGORY_ONE_TEXT_'+props.formItem?.moduleTableId,
    zcfwxtflTwo:'TRUST_CATEGORY_TWO_'+props.formItem?.moduleTableId,
    zcfwxtflTwoText:'TRUST_CATEGORY_TWO_TEXT_'+props.formItem?.moduleTableId,
    gycsxtfl:'CHAR_TRUST_CATEGORY_'+props.formItem?.moduleTableId,
    gycsxtflText:'CHAR_TRUST_CATEGORY_TEXT_'+props.formItem?.moduleTableId,
  }
}//更正登记
else if(props.formItem?.moduleTableId === '1903359556530860034'){
  businessClassMap = {
    xtywflOne:'XTYWFL_'+props.formItem?.moduleTableId,
    xtywflOneText:'XTYWFL_TEXT_'+props.formItem?.moduleTableId,
    zcglxtfl:'TRUST_CATEGORY_'+props.formItem?.moduleTableId,
    zcglxtflText:'TRUST_CATEGORY_TEXT_'+props.formItem?.moduleTableId,
    zcfwxtflOne:'TRUST_CATEGORY_ONE_'+props.formItem?.moduleTableId,
    zcfwxtflOneText:'TRUST_CATEGORY_ONE_TEXT_'+props.formItem?.moduleTableId,
    zcfwxtflTwo:'TRUST_CATEGORY_TWO_'+props.formItem?.moduleTableId,
    zcfwxtflTwoText:'TRUST_CATEGORY_TWO_TEXT_'+props.formItem?.moduleTableId,
    gycsxtfl:'CHAR_TRUST_CATEGORY_'+props.formItem?.moduleTableId,
    gycsxtflText:'CHAR_TRUST_CATEGORY_TEXT_'+props.formItem?.moduleTableId,
  }
}else{
  businessClassMap = {
    xtywflOne:'XTYWFL_ONE_'+props.formItem?.moduleTableId,
    xtywflOneText:'XTYWFL_ONE_TEXT_'+props.formItem?.moduleTableId,
    zcglxtfl:'ZCGLXTFL_'+props.formItem?.moduleTableId,
    zcglxtflText:'ZCGLXTFL_TEXT_'+props.formItem?.moduleTableId,
    zcfwxtflOne:'ZCFWXTFL_ONE_'+props.formItem?.moduleTableId,
    zcfwxtflOneText:'ZCFWXTFL_ONE_TEXT_'+props.formItem?.moduleTableId,
    zcfwxtflTwo:'ZCFWXTFL_TWO_'+props.formItem?.moduleTableId,
    zcfwxtflTwoText:'ZCFWXTFL_TWO_TEXT_'+props.formItem?.moduleTableId,
    gycsxtfl:'GYCSXTFL_'+props.formItem?.moduleTableId,
    gycsxtflText:'GYCSXTFL_TEXT_'+props.formItem?.moduleTableId,
  }
}


const getTrustInfoForm = async (val) => {
  const params = {
    code:val
  }
  const res = await request.post({ url:'/ibps/fwoa/process/getXTSFL', params })
  if(res && res.length){
    const xtywflOne = res.find(item => item.projCode === '1') || {}
    const xtywflTwo = res.find(item => item.projCode === '2') || {}
    const xtywflThree = res.find(item => item.projCode === '3')|| {}
    trustInfoForm.value[props.formItem.moduleTableId][businessClassMap.xtywflOne] = xtywflOne.code || ''
    trustInfoForm.value[props.formItem.moduleTableId][businessClassMap.xtywflOneText] = xtywflOne.text || ''
    if(xtywflOne.code === '1001'){
      trustInfoForm.value[props.formItem.moduleTableId][businessClassMap.zcfwxtflOne] = xtywflTwo.code || ''
      trustInfoForm.value[props.formItem.moduleTableId][businessClassMap.zcfwxtflOneText] = xtywflTwo.text || ''
      trustInfoForm.value[props.formItem.moduleTableId][businessClassMap.zcfwxtflTwo] = xtywflThree.code || ''
      trustInfoForm.value[props.formItem.moduleTableId][businessClassMap.zcfwxtflTwoText] = xtywflThree.text || ''
      //信托业务分类为100105，没有三级分类需要给三级分类赋2级分类的值，判空为了防止后续码值变化
      if( xtywflTwo.code == '100105' && !xtywflThree.code){
        trustInfoForm.value[props.formItem.moduleTableId][businessClassMap.zcfwxtflTwo] = xtywflTwo.code || ''
        trustInfoForm.value[props.formItem.moduleTableId][businessClassMap.zcfwxtflTwoText] = xtywflTwo.text || ''
      }
    }
    if(xtywflOne.code === '1002'){
      trustInfoForm.value[props.formItem.moduleTableId][businessClassMap.zcglxtfl] = xtywflThree.code || ''
      trustInfoForm.value[props.formItem.moduleTableId][businessClassMap.zcglxtflText] = xtywflThree.text || ''
    }
    if(xtywflOne.code === '1003'){
      trustInfoForm.value[props.formItem.moduleTableId][businessClassMap.gycsxtfl] = xtywflThree.code || ''
      trustInfoForm.value[props.formItem.moduleTableId][businessClassMap.gycsxtflText] = xtywflThree.text || ''
    }
    console.log(trustInfoForm.value,'trustInfoForm------');
    
  }
}

// const initData=()=>{
//   if(props.modelValue){
//     getTrustInfoForm(props.modelValue)
//   }
//   // getTrustInfoForm('10010101')
// }
// initData()
// getTrustInfoForm('10010101')

watch(() => props.modelValue,(val)=>{
  if(val){
    getTrustInfoForm(val)
  }
},{
  immediate:true
})





</script>

<style lang="scss">
  .is-guttered:has(.aaa){
    padding-left: 0px !important;
    padding-right: 0px !important;
  }
  .el-form-item:has(.aaa) {
    .el-form-item__label{
      display: none;
    }
    .aaa{
      .el-form-item__label{
        display: inline-flex;
      }
    }
  }
</style>
