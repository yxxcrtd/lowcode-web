<script setup lang="ts">
import type {tableFormColumnType} from '../baseUseType'
import {ref} from 'vue'
defineProps({
  column: Array<tableFormColumnType>,
  tableData: Array<any>,
})
const currentChange = (row)=>{
  console.log(row);
  dialogVisible.value = true
}
const dialogVisible = ref(false)
const handleClose = ()=>{
  dialogVisible.value = false
}
import type {ComponentSize, FormInstance, FormRules} from 'element-plus'

interface RuleForm {
  name: string
  region: string
  count: string
  date1: string
  date2: string
  delivery: boolean
  location: string
  type: string[]
  resource: string
  desc: string
}
const formSize = ref<ComponentSize>('default')
const ruleFormRef = ref<FormInstance>()
const ruleForm = reactive<RuleForm>({
  name: 'Hello',
  region: '',
  count: '',
  date1: '',
  date2: '',
  delivery: false,
  location: '',
  type: [],
  resource: '',
  desc: '',
})
const rules = reactive<FormRules<RuleForm>>({
  name: [
    {required: true, message: 'Please input Activity name', trigger: 'blur'},
    {min: 3, max: 5, message: 'Length should be 3 to 5', trigger: 'blur'},
  ],
  region: [
    {
      required: true,
      message: 'Please select Activity zone',
      trigger: 'change',
    },
  ],
  count: [
    {
      required: true,
      message: 'Please select Activity count',
      trigger: 'change',
    },
  ],
  date1: [
    {
      type: 'date',
      required: true,
      message: 'Please pick a date',
      trigger: 'change',
    },
  ],
  date2: [
    {
      type: 'date',
      required: true,
      message: 'Please pick a time',
      trigger: 'change',
    },
  ],
  location: [
    {
      required: true,
      message: 'Please select a location',
      trigger: 'change',
    },
  ],
  type: [
    {
      type: 'array',
      required: true,
      message: 'Please select at least one activity type',
      trigger: 'change',
    },
  ],
  resource: [
    {
      required: true,
      message: 'Please select activity resource',
      trigger: 'change',
    },
  ],
  desc: [
    {required: true, message: 'Please input activity form', trigger: 'blur'},
  ],
})

/*const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate((valid, fields) => {
    if (valid) {
      console.log('submit!')
    } else {
      console.log('error submit!', fields)
    }
  })
}

const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return
  formEl.resetFields()
}*/
</script>

<template>
  <div class="table-content">
    <div class="btn">
      <el-button @click="dialogVisible = true">新增</el-button>
    </div>
    <div class="table">
      <JVxeTable ref="jVxeTable" :columns="column" :row-height="58" :data-source="tableData" >
        <template #action_default="{row}">
          <div>
            <el-button size="small" @click="currentChange(row)">编辑</el-button>
            <el-divider direction="vertical" />
            <el-button  danger size="small" @click="currentChange(row)">删除</el-button>
          </div>
        </template>
      </JVxeTable>
    </div>
  </div>
  <el-dialog
    v-model="dialogVisible"
    title="Tips"
    width="1000"
    :before-close="handleClose"
  >
    <el-form
      ref="ruleFormRef"
      :model="ruleForm"
      :rules="rules"
      label-width="auto"
      class="demo-ruleForm"
      :size="formSize"
    >
      <template v-for="item in column" :key="item.field">
        <el-form-item :label="item.title" v-if="item.edit" :prop="item.field">
          <el-input v-model="ruleForm.name"/>
        </el-form-item>
      </template>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="dialogVisible = false">
          Confirm
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">
  .table-content{
    padding: 15px;
    .btn{
      margin-bottom: 15px;
    }
  }
</style>
