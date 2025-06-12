<template>
  <Dialog v-model="dialogVisible" :title="title" width="800">
    <div class="dialog-content">
      <el-form ref="formRef" :rules="rules" :model="formData" label-width="120">
        <el-row>
          <el-col :span="12">
            <el-form-item label="功能名称" prop="pageName">
              <el-input v-model="formData.pageName" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="页面模型" prop="modelId">
              <SelectModel v-if="moduleList" v-model="formData.modelId" :model-list="moduleList"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="表单模板" prop="formTemplateId">
              <el-select v-model="formData.formTemplateId">
                <el-option v-for="(item,index) in formPageTemplateOption" :key="'pageTemplate_'+index" :label="item.templateName" :value="item.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="列表模板" prop="listTemplateId">
              <el-select v-model="formData.listTemplateId">
                <el-option v-for="(item,index) in listPageTemplateOption" :key="'pageTemplate_'+index" :label="item.templateName" :value="item.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="上传模板文件">
              <el-upload
                ref="uploadRef"
                class="upload-com"
                drag
                action="#"
                :multiple="false"
                :limit="1"
                :on-exceed="handleExceed"
                :auto-upload="false"
                :on-change="handleChange"
                :before-upload="beforeUpload"
              >
                <el-icon class="el-icon--upload"><upload-filled /></el-icon>
                <div class="el-upload__text">
                  请选择指定模板文件上传
                </div>
              </el-upload>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </div>
    </template>
  </Dialog>
</template>
<script lang="ts" setup>
import { onMounted, ref, nextTick } from 'vue'
import { cloneDeep } from 'lodash-es'
import * as XLSX from 'xlsx'
import {UploadFilled} from '@element-plus/icons-vue'
import SelectModel from "@/web-admin/views/funMng/dev/Components/SelectModel.vue";
import {getModuleList} from "@/web-admin/views/funMng/dev/api";
import {AnalysisImportTemplate} from '../analysisImportTemplate'
import {genFileId,ElLoading} from "element-plus";
import {
  addPageInfo, addProcessDesign,
  getTemplateInfoPage
} from "@/web-admin/views/funMng/dev/4-pageDesign/api";

defineOptions({ name: 'ImportTemplate' })

const message = useMessage() // 消息弹窗
const route = useRoute()
const dialogVisible = ref(false)

const menuId = route.query.id
const title = ref('模板导入')
const formRef = ref()
const formData = ref({
  pageName:'',
  modelId: '',
  formTemplateId:'',
  listTemplateId:'',
})
const rules = reactive({
  pageName: [{ required: true, message: '请输入功能名称', trigger: 'blur' }],
  modelId: [{ required: true, message: '请选择模型', trigger: 'blur' }],
  formTemplateId: [{ required: true, message: '请选择表单模板', trigger: 'blur' }],
  listTemplateId: [{ required: true, message: '请选择列表模板', trigger: 'blur' }],
})

/** 打开弹窗 */
const open = async (data) => {
  dialogVisible.value = true

  loadModelList()
  loadPateTemplate()
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

const moduleList=ref()
const loadModelList=async ()=>{
  const params={}
  moduleList.value= await getModuleList(params)
}

const formPageTemplateOption=ref([])
const listPageTemplateOption=ref([])
const loadPateTemplate=async ()=>{
  const param={
    pageSize:100
  }
  const res=await getTemplateInfoPage(param)
  formPageTemplateOption.value=res.list.filter(item=>item.templateType==='form')
  listPageTemplateOption.value=res.list.filter(item=>item.templateType==='list')
}

const beforeUpload=async (file)=> {
  const valid=formRef.value.validate()
  const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || file.type === 'application/vnd.ms-excel';
  const isLt2M = file.size / 1024 / 1024 < 2;

  if (!isExcel) {
    message.error('上传文件只能是 Excel 格式！');
  }
  if (!isLt2M) {
    message.error('上传文件大小不能超过 2MB！');
  }
  return isExcel && isLt2M;
}
const uploadRef=ref()
const handleExceed= (files) => {
  uploadRef.value!.clearFiles()
  const file = files[0]
  file.uid = genFileId()
  uploadRef.value!.handleStart(file)
}
const curFile=ref()
const excelData=ref()
const handleChange=(file)=> {
  curFile.value=file
}
const loadText=ref('正在解析模板...')
const parseFile=async (callBack)=>{
  const reader = new FileReader();
  const loading = ElLoading.service({
    lock: true,
    text: loadText,
    background: 'rgba(0, 0, 0, 0.7)',
  })
  reader.onload = async (e) => {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: 'array' });
    const analysisExcel=new AnalysisImportTemplate(menuId,formData.value,workbook)
    const {formPageData,listPageData,flowData,error}=await analysisExcel.convertExcel2PageData()
    if(error){
      message.error(error)
      loading.close()
      return;
    }
    console.log(formPageData,listPageData,flowData,error)
    try{
      //开始保存数据
      //保存页面
      loadText.value='正在保存表单页面...'
      const formRes=await addPageInfo(formPageData)
      flowData.pageId=formRes
      loadText.value='正在保存列表页面...'
      await addPageInfo(listPageData)
      loadText.value='正在保存流程设计...'
      await addProcessDesign(flowData)
      console.log(excelData)
      loading.close()
      if(callBack){
        callBack()
      }
    }catch(e){
      loading.close()
    }
  };
  reader.readAsArrayBuffer(curFile.value.raw);
}
onMounted(() => {
})
const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
const submitForm = () => {
  formRef.value.validate(async (valid) => {
    if (valid) {
      parseFile(()=>{
        //调用接口保存
        dialogVisible.value = false
        emit('success', cloneDeep(formData.value))
      })
    }
  })
}
</script>
<style lang="scss" scoped>
.dialog-content{
  height:360px;
}
.upload-com{
  width: 100%;
}
</style>
