<template>
  <div class="form-wrapper">
    <el-form :model="formData" :rules="rules" ref="formRef" label-width="160">
      <el-form-item label="流程名称" prop="processName">
        <el-input ref="processNameRef" v-model="formData.processName" placeholder="请输入流程名称">
          <template #append v-if="formData.formModelId">
            <el-popover
              ref="popoverRef"
              placement="bottom-end"
              trigger="click"
              width="700px"
              title="选择字段"
            >
              <div class="pop-panel">
                <SelectModelFieldPanel ref="modelFieldPanelRef" v-model="selectModelFieldId" multiple :moduleId="formData.formModelId"></SelectModelFieldPanel>
              </div>
              <div class="pop-btn">
                <el-button type="primary" @click="handleChooseField">确定</el-button>
              </div>
              <template #reference>
                <el-button>插入变量</el-button>
              </template>
            </el-popover>
          </template>
        </el-input>
      </el-form-item>
      <el-form-item label="流程类型" prop="processType">
        <el-radio-group v-model="formData.processType">
          <el-radio label="1" value="1">内部流程</el-radio>
          <el-radio label="2" value="2">外部流程</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="外部流程Id" prop="flowId" v-if="formData.processType==='2'">
        <el-input v-model="formData.flowId" placeholder="请输入外部流程id"/>
      </el-form-item>
      <el-form-item label="关联表单页面" prop="pageId">
        <el-select v-model="formData.pageId" @change="handlePageChange">
          <el-option v-for="item in pageInfoOption" :key="item.id" :value="item.id" :label="item.pageName"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="关联移动表单页面" prop="mobilePageId">
        <el-select v-model="formData.mobilePageId" @change="handlePageChange">
          <el-option v-for="item in mobilePageOption" :key="item.id" :value="item.id" :label="item.pageName"></el-option>
        </el-select>
      </el-form-item>
      <el-row>
        <el-col :span="24">
          <el-form-item label="备注" prop="remark">
            <el-input v-model="formData.remark" type="textarea" :rows="4"/>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </div>
</template>
<script lang="ts" setup>
import {ref,defineExpose} from 'vue'
import {getPageInfoPage} from '../api';
import SelectModelFieldPanel from "@/web-admin/views/funMng/dev/Components/SelectModelFieldPanel.vue";

defineOptions({name: 'DataModelDesignIndex'})
const formData:any=defineModel()
const route=useRoute()
const moduleId=route.query.id

const formType = ref('') // 表单的类型：create - 新增；update - 修改
const message = useMessage() // 消息弹窗
const formRef = ref()

const rules = reactive({
  processName: [{required: true, message: '请输入流程名称', trigger: 'blur'}],
  flowId:null,
  pageId: [{required: true, message: '请输入关联页面', trigger: 'blur'}]
})
const emit = defineEmits(['close-click','page-change']);
const validateForm=async ()=>{
  return formRef.value.validate()
}

const processNameRef=ref()
const popoverRef = ref()

const pageInfoOption=ref([])
const mobilePageOption=ref([])
const getPageOption=async (pageType)=>{
  const param={
    pageSize:100,
    pageType:pageType,
    menuId:moduleId
  }
  const res = await getPageInfoPage(param)
  if(pageType==='mobile-form'){
    mobilePageOption.value=res.list
  }else{
    pageInfoOption.value=res.list
  }
}
getPageOption('form')
getPageOption('mobile-form')

const selectModelFieldId=ref()
const modelFieldPanelRef=ref()
const handleChooseField=()=>{
  if(selectModelFieldId.value && selectModelFieldId.value.length){
    formData.value.processName=formData.value.processName+selectModelFieldId.value?.map(item=>'${'+item+'}').join('-')
  }
  popoverRef.value.hide()
}

const handlePageChange=(val)=>{
  emit('page-change',val)
}
defineExpose({validateForm})
</script>
<style lang="scss" scoped>
.form-wrapper{
  width: 1200px;
  height: 50vh;
  margin:0 auto;
  padding: 20px 30px;
  background: #fff;
}
.pop-btn{
  display: flex;
  justify-content: flex-end;
  margin-top: 6px;
}
</style>
