<template>
  <el-form :model="formData" :rules="rules" ref="formRef" label-width="120">
    <el-row :gutter="20">
      <el-col :span="8">
        <el-form-item label="页面名称" prop="pageName">
          <el-input v-model="formData.pageName" placeholder="请输入页面名称" @change="handleNameChange"/>
        </el-form-item>
      </el-col>
      <el-col :span="8">
        <el-form-item label="页面编码" prop="pageCode">
          <el-input v-model="formData.pageCode" disabled/>
        </el-form-item>
      </el-col>
      <el-col :span="8">
      </el-col>
      <el-col :span="8">
        <el-form-item label="页面模板" prop="pageTemplate">
          <el-select v-model="formData.pageTemplate" @change="handleTemplate">
            <el-option v-for="(item,index) in pageTemplateOption" :key="'pageTemplate_'+index" :label="item.templateName" :value="item.id" />
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="8">
        <el-form-item label="状态" prop="pageState">
          <el-switch
            v-model="formData.pageState"
            inline-prompt
            active-text="启用"
            active-value="1"
            inactive-text="停用"
            inactive-value="0"
          />
        </el-form-item>
      </el-col>
      <el-col :span="8">
      </el-col>
      <template v-if="formData.pageTemplate">
        <el-col :span="12">
          <el-form-item label="模板API">
            <vxe-table border="inner" style="width:100%" height="300" :data="formData.templateApiList">
              <vxe-column field="field" title="api编码" width="150">
                <template #default="{ row }">
                  {{row.apiCode}}
                </template>
              </vxe-column>
              <vxe-column field="field" title="api名称" width="150">
                <template #default="{ row }">
                  {{row.apiName}}
                </template>
              </vxe-column>
              <vxe-column field="sort" title="选择模型" width="220">
                <template #default="{ row,rowIndex }">
                  <el-form-item :prop="'templateApiList.['+rowIndex+'].moduleId'" :rules="rules.moduleId">
                    <SelectModel v-model="row.moduleId" @change="handleSelectModel($event,row)"/>
                  </el-form-item>
                </template>
              </vxe-column>
              <vxe-column field="sort" title="选择服务">
                <template #default="{ row,rowIndex }">
                  <el-form-item :prop="'templateApiList.['+rowIndex+'].serverId'" :rules="rules.serverId">
                    <el-select v-model="row.serverId">
                      <el-option v-for="(item,index) in row.pageModuleApiOption" :key="index" :label="item.label" :value="item.value" />
                    </el-select>
                  </el-form-item>
                </template>
              </vxe-column>
            </vxe-table>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="模板参数">
            <vxe-table border="inner" style="width:100%" height="300" :data="formData.templateParamList">
              <vxe-column field="field" title="参数名" minWidth="150">
                <template #default="{ row }">
                  {{row.parameterName}}
                </template>
              </vxe-column>
              <vxe-column field="field" title="参数值" minWidth="150">
                <template #default="{ row }">
                  <el-input v-model="row.parameterValue" />
                </template>
              </vxe-column>
            </vxe-table>
          </el-form-item>
        </el-col>
      </template>
      <el-col :span="8">
        <el-form-item label="头部插槽" prop="headerSlot">
          <el-input v-model="formData.headerSlot" placeholder="页面顶部插槽"/>
        </el-form-item>
      </el-col>
      <el-col :span="8">
        <el-form-item label="中间插槽" prop="middleSlot">
          <el-input v-model="formData.middleSlot" placeholder="查询条件与按钮中间插槽"/>
        </el-form-item>
      </el-col>
      <el-col :span="8">
        <el-form-item label="尾部插槽" prop="tailSlot">
          <el-input v-model="formData.tailSlot" placeholder="页面尾部插槽"/>
        </el-form-item>
      </el-col>
      <el-col :span="24">
        <el-form-item label="外部JS" prop="externalJsFile">
          <template #label>
            <div class="custom-form-label">
              外部JS
              <el-tooltip
                popper-class="tooltips"
                content="外部js统一放在【/src/web-sys/views/plugins/】目录下，在自定义方法名配置上可直接使用。"
                placement="top-start"
              >
                <el-icon class="form-label-tips-icon"><WarningFilled /></el-icon>
              </el-tooltip>
            </div>
          </template>
          <el-input v-model="formData.externalJsFile" placeholder="配置外部js文件地址，格式按照“test/test.js”"/>
        </el-form-item>
      </el-col>
    </el-row>
  </el-form>
</template>
<script lang="ts" setup>
import {ref} from 'vue'
import SelectModel from "@/web-admin/views/funMng/dev/Components/SelectModel.vue"
import {propTypes} from "@/utils/propTypes";
import {
  getPageModuleInfo, getTemplateInfo,
  getTemplateInfoPage
} from "@/web-admin/views/funMng/dev/4-pageDesign/api";
import {CirclePlusFilled, RemoveFilled, WarningFilled} from "@element-plus/icons-vue";
import {getPinyin} from "@/utils";

defineOptions({name: 'ListPageDesignIndex'})

const emit = defineEmits(['close-click', 'chooseModel'])
const formData:any=defineModel()

const message = useMessage() // 消息弹窗
const formRef = ref()
const rules = reactive({
  pageName: [{required: true, message: '请输入页面名称', trigger: 'blur'}],
  pageCode: [{required: true, message: '请输入页面编码', trigger: 'blur'}],
  moduleId: [{required: true, message: '请选择数据模型', trigger: 'blur'}],
  serverId: [{required: true, message: '请选择模型服务', trigger: 'blur'}],
  pageTemplate: [{required: true, message: '请选择页面模板', trigger: 'blur'}]
})

const pageTemplateOption=ref([])
const loadPateTemplate=async ()=>{
  const param={
    templateType:'list'
  }
  const res=await getTemplateInfoPage(param)
  pageTemplateOption.value=res.list;
}
loadPateTemplate()
/**
 * 选择模板 加载模板api和参数
 * @param templateId
 */
const handleTemplate=async (templateId)=>{
  const res=await getTemplateInfo({id:templateId})
  const templateInfo=res
  formData.value.templateApiList=templateInfo.apiList.map(item=>{
    return {
      apiId:item.id,
      apiCode:item.apiCode,
      apiName:item.apiName,
      pageGroups:[],
      tableList:[],
      tableColumns:[],
      searchItems:[],
      pageListConditions:[],
      pageButtons:[],
      eventList:[],
      paramterList:[],
      tableLayoutConfig:[]
    }
  })
  if(templateInfo.paramList){
    formData.value.templateParamList=templateInfo.paramList.map(item=>{
      return {
        pageApiId: item.id,
        parameterCode: item.parameterCode,
        parameterName: item.parameterName,
        parameterType: item.parameterType,
        parameterValue: item.parameterValue,
        templateId: item.templateId
      }
    })
  }else{
    formData.value.templateParamList=[]
  }
}
/**
 * 选择模型 更新API
 * @param modelInfo
 */
const handleSelectModel=async (modelInfo,row)=>{
  const moduleInfo=await getModuleInfo(modelInfo.id)
  row.pageModuleApiOption = moduleInfo.apiList.map(tableItem=>{
    return {
      label:tableItem.serviceName,
      value:tableItem.id,
      ...tableItem
    }
  })
  row.tableList=moduleInfo.tableList
  
  let sort=1
  moduleInfo.tableList.forEach(tableItem=>{
    tableItem.fieldList.forEach(fieldItem=>{
      if(!fieldItem.isSys){
        row.tableColumns.push({
          moduleTableId:tableItem.id,
          childTableId:tableItem.isChild ? tableItem.tableId:null,
          tableId:tableItem.tableId,
          tableName:tableItem.tableName,
          moduleId:tableItem.moduleId,
          fieldId:fieldItem.fieldId,
          columnName:fieldItem.columnName,
          columnComment:fieldItem.columnComment,
          columnNameAlias:fieldItem.columnComment,
          columnType:fieldItem.columnType,
          relationTableId: fieldItem.relationTableId,
          isVisible:1,
          columnFixedWidth:null,
          columnMinWidth:null,
          sort:sort
        })
        row.searchItems.push({
          moduleTableId:tableItem.id,
          childTableId:tableItem.isChild ? tableItem.tableId:null,
          tableId:tableItem.id,
          tableName:tableItem.tableName,
          moduleId:tableItem.moduleId,
          fieldId:fieldItem.fieldId,
          columnName:fieldItem.columnName,
          columnComment:fieldItem.columnComment,
          columnNameAlias:fieldItem.columnComment,
          columnType:fieldItem.columnType,
          relationTableId: fieldItem.relationTableId,
          columnDisplayComponent:"ace-input",
          columnDisplayComponentName:"普通输入框",
          columnQueryOperator:'eq',
          sort:sort
        })
        sort++
      }
    })
  })
  row.serverId=null
}
/**
 * 查询模型信息
 * @param modelId
 */
const getModuleInfo=async (modelId)=>{
  let params = {
    id:modelId
  }
  let pageModuleInfo = await getPageModuleInfo(params)
  return pageModuleInfo
}

const validateForm=async (callback:Function)=>{
  return  formRef.value.validate((valid) => {
    if (valid) {
      callback(valid)
    } else {
      message.error('表单验证失败，请检查输入')
      return false
    }
  })
}

defineExpose({validateForm})

const handleNameChange=()=>{
  formData.value.pageCode=getPinyin(formData.value.pageName,'LB-')
}
</script>
<style lang="scss" scoped>
</style>
