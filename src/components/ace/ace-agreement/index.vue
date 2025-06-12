<template>
  <ace-radio dict="YN" v-model="curValue" :disabled="disabled"></ace-radio>
  <div class="agreement" v-if="curValue=='1'">
    <el-collapse v-model="activeNames">
      <el-collapse-item :title="title" name="1">
        <div class="agreement-content-middle" v-html="content">
        </div>
        <div class="agreement-content-bottom">
          <el-checkbox readonly v-model="curIsAgreement" label="我已阅读以上条款并同意"></el-checkbox>
        </div>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script setup lang="ts">
// 普通输入框
defineOptions({ name: 'AceAgreement' })

const props = defineProps({
  modelValue: String,
  isAgreement:{
    type:Boolean
  },
  title: {
    type: String,
    default: '请阅读相关条款并选择同意'
  },
  content: {
    type:String,
    default:`特此承诺如下（包括但不限于）：<br\>
    1、业务部门自主选择开户机构，在项目开户、期间运行、销户、账户信息变更等事项上，积极配合完成相关账户管理工作，遵循公司及计划财务部账户管理相关规定。<br\>
    2、信托专户应开通电子网银业务，若不能开通网银、不能打印银行流水或回单，业务部门须及时联系开户机构催收。<br\>
    3、自主选择开户机构的项目，如账户冻结、久悬，对公司业务正常开展造成潜在风险的，由项目经理及所属业务部门承担责任。`
  },
  disabled:{
    type:Boolean
  }
})
const activeNames = ref(['1'])

const emit = defineEmits(['update:modelValue','update:isAgreement','change','input','blur','focus','clear'])
const curValue = computed({
  get: () => {
    return props.modelValue
  },
  set: (val: string) => {
    emit('update:modelValue', val)
  }
})
const curIsAgreement = computed({
  get: () => {
    return props.isAgreement || true
  },
  set: (val: boolean) => {
    emit('update:isAgreement', val)
  }
})
</script>

<style scoped lang="scss">
  .agreement{
    background: #f9fafc;
    border-radius: 8px;
    font-size: 13px;
    line-height: 25px;
    width: 100%;
    :deep(.el-collapse){
      border: 1px dashed #ebeef5 !important;
      border-radius: 4px;
    }
    :deep(.el-collapse-item__header){
      background: #f9fafc !important;
      font-size: 14px!important;
      font-weight: 500!important;
      &::before{
        content:'';
        display:none;
      }
    }
    :deep(.el-collapse-item__wrap){
      background: #f9fafc !important;
      font-size: 14px!important;
      font-weight: 500!important;
      padding: 10px 20px!important;
      border: none;
    }
  }
</style>
