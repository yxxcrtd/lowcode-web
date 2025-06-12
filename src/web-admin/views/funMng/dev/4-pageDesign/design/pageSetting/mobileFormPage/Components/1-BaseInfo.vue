<template>
  <el-form :model="formData" :rules="rules" ref="formRef" label-width="120">
    <el-row :gutter="20">
      <el-col :span="8">
        <el-form-item label="页面名称" prop="pageName">
          <el-input v-model="formData.pageName" @change="handleNameChange" />
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
          <el-form-item>
            <template #label>
              <div class="custom-form-label">
                模板API
                <el-tooltip
                  popper-class="tooltips"
                  content="模板页面、参数、API组成，模板API代表模板中需要调用的接口服务，根据不同服务可以配置对应的表单项"
                  placement="top-start"
                >
                  <el-icon class="form-label-tips-icon"><WarningFilled /></el-icon>
                </el-tooltip>
              </div>
            </template>
            <vxe-table border="inner" style="width:100%" height="240" :data="formData.templateApiList">
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
                    <SelectModel v-if="moduleList" v-model="row.moduleId" @change="handleSelectModel($event,row)" :model-list="moduleList"/>
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
          <el-form-item>
            <template #label>
              <div class="custom-form-label">
                模板参数
                <el-tooltip
                  popper-class="tooltips"
                  content="可配置固定的参数，渲染页面模板时可以用到"
                  placement="top-start"
                >
                  <el-icon class="form-label-tips-icon"><WarningFilled /></el-icon>
                </el-tooltip>
              </div>
            </template>
            <vxe-table border="inner" style="width:100%" height="240" :data="formData.templateParamList">
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
          <el-input v-model="formData.headerSlot" />
        </el-form-item>
      </el-col>
      <el-col :span="8">
        <el-form-item label="尾部插槽" prop="tailSlot">
          <el-input v-model="formData.tailSlot" />
        </el-form-item>
      </el-col>
      <el-col :span="8">
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

      <el-col :span="8">
        <el-form-item label="支持附件" prop="isSupportAttachment">
          <el-switch
            v-model="formData.isSupportAttachment"
            inline-prompt
            active-text="是"
            active-value="1"
            inactive-text="否"
            inactive-value="0"
          />
        </el-form-item>
      </el-col>
      <el-col :span="8">
      </el-col>
      <el-col :span="8">
      </el-col>
      <el-col :span="8">
        <el-form-item label="表单排版" prop="columnSpan">
          <ace-select v-model="formData.columnSpan" :data-source="formColCountList"></ace-select>
        </el-form-item>
      </el-col>
      <el-col :span="8">
        <el-form-item label="标签长度" prop="labelWidth">
          <el-input v-model="formData.labelWidth" type="number"></el-input>
        </el-form-item>
      </el-col>
      <el-col :span="8">
        <el-form-item label="标签位置" prop="labelPosition">
          <ace-select v-model="formData.labelPosition" :data-source="labelPositionList"></ace-select>
        </el-form-item>
      </el-col>
    </el-row>
  </el-form>
</template>
<script lang="ts" setup>
import {ref} from 'vue'
import SelectModel from "@/web-admin/views/funMng/dev/Components/SelectModel.vue"
import {getPageModuleInfo, getTemplateInfo,getTemplateInfoPage} from "@/web-admin/views/funMng/dev/4-pageDesign/api";
import {getPinyin} from "@/utils";
import {WarningFilled} from "@element-plus/icons-vue";
import {getModuleList} from "@/web-admin/views/funMng/dev/api";

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
    templateType:'form'
  }
  const res=await getTemplateInfoPage(param)
  pageTemplateOption.value=res.list;
}
loadPateTemplate()
/**
 * 选择模板事件
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
      pageGroupsTree:[
        {
          groupCode:'base',
          groupName:'基本信息',
          groupSort:1
        }
      ],
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
          tableName:tableItem.tableName,
          moduleId:tableItem.moduleId,
          tableId:tableItem.tableId,
          fieldId:fieldItem.fieldId,
          columnName:fieldItem.columnName,
          columnComment:fieldItem.columnComment,
          columnNameAlias:fieldItem.columnComment,
          columnType:fieldItem.columnType,
          relationTableId: tableItem.id,
          columnDisplayComponent:"ace-input",
          columnDisplayComponentName:'普通输入框',
          isRequire:fieldItem.required?1:0,
          isRequireDisabled:!!fieldItem.required,
          columnSpan:formData.value.columnSpan || 8,
          groupCode:'base',
          isVisible:1,
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

watch(
  ()=>formData.value.columnSpan,
  (val,oldVal)=>{
    if(val!=oldVal){
      formData.value.templateApiList.forEach(apiItem=>{
        if(apiItem.tableColumns && apiItem.tableColumns.length){
          apiItem.tableColumns.forEach(column=>{
            if(column.columnSpan===oldVal){
              column.columnSpan=val
            }
          })
        }
      })
      
    }
  }
)
/**
 * 表单校验
 * @param callback
 */
const validateForm=async ()=>{
  return  formRef.value.validate()
}
defineExpose({validateForm})

const handleNameChange=()=>{
  formData.value.pageCode=getPinyin(formData.value.pageName,'BD-')
}

const formColCountList=ref([
  {label:'1列',value:'24'},
  {label:'2列',value:'12'},
  {label:'3列',value:'8'},
  {label:'4列',value:'6'},
])
const labelPositionList=ref([
  {label:'right',value:'right'},
  {label:'left',value:'left'},
  {label:'top',value:'top'},
])

const moduleList=ref()
const loadModelList=async ()=>{
  const params={}
  moduleList.value= await getModuleList(params)
}
loadModelList()

</script>
<style lang="scss" scoped>
</style>
