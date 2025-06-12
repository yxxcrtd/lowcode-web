<template>
  <el-form :model="formData" :rules="rules" ref="formRef" label-width="120">
    <el-row :gutter="20">
      <el-col :span="8">
        <el-form-item label="模型名称" prop="moduleName">
          <el-input v-model="formData.moduleName" placeholder="请输入模型名称" @change="handleNameChange"/>
        </el-form-item>
      </el-col>
      <el-col :span="8">
        <el-form-item label="模型编码" prop="moduleCode">
          <el-input v-model="formData.moduleCode" disabled/>
        </el-form-item>
      </el-col>
      <el-col :span="24">
        <el-form-item label="模型类型" prop="moduleType">
          <el-select v-model="formData.moduleType" placeholder="请选择模型类型" style="width: 240px" @change="handleModuleTypeChange">
            <el-option v-for="item in modelTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
          <span style="margin-left: 20px; font-size: 12px; color: #a6a4a4">注意：除普通模型，其他模型不支持自动生成服务</span>
        </el-form-item>
      </el-col>
    </el-row>
    <el-row v-if="formData.moduleType == 1">
      <el-col :span="8">
        <el-form-item label="主表" prop="mainTableId">
          <SelectTable v-model="formData.mainTableId" @change="selectMainTable" />
        </el-form-item>
      </el-col>
      <el-col :span="8">
        <el-form-item label="是否只读" prop="readonly">
          <el-switch v-model="formData.readonly" />
        </el-form-item>
      </el-col>
    </el-row>
    <el-row v-if="formData.moduleType == 2">
      <el-col :span="24">
        <el-form-item label="sql" prop="moduleSql">
          <el-input v-model="formData.moduleSql" type="textarea" :rows="4" />
        </el-form-item>
      </el-col>
    </el-row>
    <el-row v-if="formData.moduleType == 3">
      <el-col :span="24">
        <el-form-item label="接口类" prop="moduleBean">
          <el-input v-model="formData.moduleBean" />
        </el-form-item>
      </el-col>
      <el-col :span="24">
        <el-form-item label="方法名" prop="moduleMethod">
          <el-input v-model="formData.moduleMethod" />
        </el-form-item>
      </el-col>
    </el-row>
    <el-row v-if="formData.moduleType == 4">
      <el-col :span="24">
        <el-form-item label="接口地址" prop="apiUrl">
          <el-input v-model="formData.apiUrl" />
        </el-form-item>
      </el-col>
      <el-col :span="8">
        <el-form-item label="接口类型" prop="apiType">
          <el-radio-group v-model="formData.apiType">
            <el-radio :value="'1'">GET</el-radio>
            <el-radio :value="'2'">POST</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-col>
    </el-row>
    <el-row v-if="formData.moduleType == 1">
      <el-col :span="8">
        <el-form-item prop="mappingModuleId">
          <template #label>
            <div class="custom-form-label">
              映射模型
              <el-tooltip
                popper-class="tooltips"
                content="设置映射模型会自动生成模型映射服务，会根据映射模型的服务查询数据，但根据本模型的字段信息返回"
                placement="top-start"
              >
                <el-icon class="form-label-tips-icon"><WarningFilled /></el-icon>
              </el-tooltip>
            </div>
          </template>
          <SelectModel v-model="formData.mappingModuleId" @change="handleSelectModel"/>
        </el-form-item>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="24">
        <el-form-item label="模型描述" prop="remark">
          <el-input v-model="formData.remark" type="textarea" :rows="4" />
        </el-form-item>
      </el-col>
      <el-col :span="8">
        <el-form-item label="是否回推模型数据" prop="isPushBackModelData">
          <el-switch v-model="formData.isPushBackModelData" />
        </el-form-item>
      </el-col>
      <el-col :span="8">
        <el-form-item label="指定回推地址" prop="pushBackUrl">
          <el-input  v-model="formData.pushBackUrl" />
        </el-form-item>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="24">
        <el-form-item label="流程记录回推参数" prop="flowLogParams">
          <JSONInput v-model="formData.flowLogParams"></JSONInput>
        </el-form-item>
      </el-col>
    </el-row>
  </el-form>
</template>
<script lang="ts" setup>
import { ref } from 'vue'
import SelectTable from '../../../Components/SelectTable.vue'
import {getTableFields} from "@/web-admin/views/funMng/dev/api";
import {cloneDeep, uniqueId} from "lodash-es";
import {getPinyin} from "@/utils";
import {WarningFilled} from "@element-plus/icons-vue";
import SelectModel from "@/web-admin/views/funMng/dev/Components/SelectModel.vue";
import JSONInput from "@/components/JsonInput/index.vue";

defineOptions({ name: 'DataModelDesignIndex' })

const formData:any=defineModel()

const route = useRoute()

const formLoading = ref(false)
const formType = ref('') // 表单的类型：create - 新增；edit - 修改
const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化
const formRef = ref()
const rules = reactive({
  moduleName: [{ required: true, message: '请输入模型名称', trigger: 'blur' }],
  moduleCode: [{ required: true, message: '请输入模型编码', trigger: 'blur' }],
  moduleType: [{ required: true, message: '请选择模型类型', trigger: 'blur' }],
  moduleSql: [{ max: 10000, message: '最大支持输入10000个字符', trigger: 'blur' }]
})
const modelTypeOptions = ref([
  { label: '普通模型', value: '1' },
  { label: 'SQL', value: '2' },
  { label: 'JavaBean', value: '3' },
  { label: '接口服务', value: '4' }
])

const validateForm = async () => {
  return formRef.value.validate()
}
defineExpose({ validateForm })

const emit = defineEmits(['changeMainTable'])
const handleModuleTypeChange=(val)=>{
  if(val!=1){
    formData.value.tableList = [
      {
        tableId: uniqueId(),
        tableComment: '模型表',
        tableName: 'modelTable',
        tableFields : [],
        isMain:1,
        tableKey:uniqueId(),
      }
    ]
    emit('changeMainTable')
  }
}
const selectMainTable = async (data) => {
  let param = { tableId: data.id,status: true,pageSize: 100,pageNo: 1 }
  const res = await getTableFields(param)

  const mainTableData = {
    tableId: data.id,
    tableComment: data.tableComment,
    tableName: data.tableName,
    tableFields : cloneDeep(res.list),
    isMain:1,
    tableAlias:'A',
    tableKey:uniqueId(),
  }
  mainTableData.tableFields.forEach((item) => {
    item.fieldId=item.id
    item.isChecked = 1
    delete item.id
  })
  formData.value.tableList = [mainTableData]
  emit('changeMainTable')
}

const handleNameChange=()=>{
  formData.value.moduleCode=getPinyin(formData.value.moduleName,'MX-')
}

const handleSelectModel=()=>{

}
</script>
<style lang="scss" scoped></style>
