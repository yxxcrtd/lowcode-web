<template>
  <div class="form-table-item" v-if="!isAllHidden">
    <el-form-item
      label="预登记材料清单"
      :prop="fieldProp"
      :rules="textEl.isRequire ? [{ required: true, message: '请生成报送文件', trigger: 'change' }] : []"
    >
      <div class="pre-input">
        <ace-ellipsis v-if="isDetail || textEl.isDisabled" :line="1">
          {{ renderFormData[curFormItem.moduleTableId][curFormItem.field] }}
        </ace-ellipsis>
        <ace-textarea v-else :rows="3" v-model="renderFormData[curFormItem.moduleTableId][curFormItem.field]"></ace-textarea>
      </div>
      <div>
        <el-button v-if="!isDetail && !btnEl.isHidden" :disabled="btnEl.isDisabled" type="primary" @click="createFile">生成报送文件</el-button>
      </div>
    </el-form-item>
  </div>
</template>
<script setup lang="ts">
import { PropType, ref, watch } from 'vue'
import {
  createReportFile,
  exportApplicationWord,
  exportBatchJson
} from "@/comRenderPlugins/biz_yudengji/PreRegistrationMaterialList/api";
import AceEllipsis from '@/components/ace/ace-ellipsis/index.vue'
import { getTagsData} from "@/comRender/utils/columnTag";
import { downloadByData } from '@/utils/filt'

const renderFormData:any=defineModel()
const props=defineProps({
  groupItem:{
    type:Object
  },
  formGroups:{
    type: Array as PropType<FormGroup[]>,
  },
  isDetail: {
    type:Boolean
  },
  instance:{
    type:Object
  },
  flowNodeInfo: {
    type: Object
  }
})
interface FormGroup {
  groupName?: string;
  [key: string]: any;
}
const curFormItem:any=ref({})
const curFormItems:any=ref([])
const fieldProp=ref()
const route=useRoute()

const textEl = computed(()=>{
  return curFormItems.value.find(item=>item.columnName=='REGISTER_FILE_LIST')
})
const btnEl = computed(()=>{
  return curFormItems.value.find(item=>item.columnName=='REPORT_DETAIL_FILE')
})
const isAllHidden = computed(()=>{
  return textEl.value.isHidden && btnEl.value.isHidden
})

const initData= async ()=>{
  if(props?.groupItem?.formItems && props.groupItem.formItems.length){
    curFormItem.value=props.groupItem.formItems[0]
    curFormItems.value = props?.groupItem?.formItems
  }
  fieldProp.value=`[${curFormItem.value.moduleTableId}].${curFormItem.value.field}`
  console.log('调用接口，生成报送文件', props,renderFormData)
  
  if(props?.flowNodeInfo?.name.indexOf('发起人') > -1 && !renderFormData.value[curFormItem.value.moduleTableId][curFormItem.value.field]) {
    renderFormData.value[curFormItem.value.moduleTableId][curFormItem.value.field] = curFormItem.value.defValue
  }
  await nextTick()
}
initData()

watch(
  () => renderFormData.value,
  (newVal) => {
    if(props?.flowNodeInfo?.name.indexOf('发起人') > -1 && !newVal[curFormItem.value.moduleTableId][curFormItem.value.field]) {
      renderFormData.value[curFormItem.value.moduleTableId][curFormItem.value.field] = curFormItem.value.defValue
    }
  },
  { deep: true, immediate: false }
)

/**
 * 生成报送文件
 */
const createFile =async () => {
  console.log('调用接口，生成报送文件', props, renderFormData)
  const registrationType = renderFormData.value[curFormItem.value.moduleTableId]['REGISTRATION_TYPE_'+curFormItem.value.moduleTableId] ||
    renderFormData.value[curFormItem.value.moduleTableId]['REGIST_TYPE_'+curFormItem.value.moduleTableId] ||
    renderFormData.value[curFormItem.value.moduleTableId]['REGISTER_TYPE_'+curFormItem.value.moduleTableId]
  
  // 根据节点信息名称，区分节点
  if(props?.flowNodeInfo?.name.indexOf('发起人') > -1) {
    let ids = renderFormData.value[curFormItem.value.moduleTableId]['BUSINESS_ID_'+curFormItem.value.moduleTableId]
    
    if(props?.flowNodeInfo?.processName?.indexOf('批量预登记') > -1) {
      const item = props?.formGroups?.find(item => item.groupName === '产品信息')
      let tableId = ''
      if(item && item.formItems && item.formItems.length) {
        tableId = item.formItems[0].tableId
      }
      ids = renderFormData.value['list_'+tableId].map(item => item['PROJECT_ID_'+tableId])
    }

    let headersType = ''
    let params = {} as any
    if(ids && Array.isArray(ids)) {
      params = {
        registrationType: registrationType,
        ids: ids
      }
    } else {
      headersType = 'multipart/form-data'
      params = new FormData()
      params.append('registrationType', registrationType)
      params.append('ids', ids)
    }

    //调用接口
    const res = await exportApplicationWord(params, headersType) as any
    if(res){
      const fileContentType = headersType ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' : 'application/zip'
      const fileName = res.fileName || (headersType ? '未知文件名称.docx' : '未知文件名称.zip')
      downloadByData(res.data ? res.data : res, fileName, fileContentType)
    }
  }

  const isExist = ['资管部信息登记', '资管信息登记'].some(name => props?.flowNodeInfo?.name.indexOf(name) > -1)
  if(isExist) {
    let ids = renderFormData.value[curFormItem.value.moduleTableId]['ID_'+curFormItem.value.moduleTableId]
    //校验表单必填
    fieldProp.value=''
    await nextTick()
    // const formValid=await props.instance?.exposed.validateForm(false,false)
    // if(formValid){
    if(props?.flowNodeInfo?.processName?.indexOf('批量预登记') > -1) {
      const item = props?.formGroups?.find(item => item.groupName === '产品信息')
      let tableId = ''
      if(item && item.formItems && item.formItems.length) {
        tableId = item.formItems[0].tableId
      }
      ids = renderFormData.value['list_'+tableId].map(item => item['PROJECT_ID_'+tableId])

      const params = new FormData()
      params.append('registrationType', registrationType)
      params.append('ids', ids)
      const res = await exportBatchJson(params, 'multipart/form-data') as any
      if(res){
        const fileName = res.fileName || '未知文件名称.zip'
        downloadByData(res.data ? res.data : res, fileName, 'application/zip')
      }
    } else {
      const params = new FormData()
      params.append('registrationType', registrationType)
      params.append('ids', ids)
      //调用接口
      const res = await createReportFile(params) as any
      if(res){
        const fileName = res.fileName || '未知文件名称.json'
        downloadByData(res.data ? res.data : res, fileName)
      }
    }

    // }
    //还原校验
    fieldProp.value=`[${curFormItem.value.moduleTableId}].${curFormItem.value.field}`
  }
}
const getSuperviseFieldTagData=()=>{
  let msgParmas={}
  //获取标签为【泛微字段】字段
  const fanweiTagColumn=getTagsData(renderFormData.value,props.instance?.props.formLayouts,['superviseField'])
  msgParmas={...msgParmas,...fanweiTagColumn}
  return msgParmas
}
</script>
<style lang="scss" scoped>
.pre-input{
  width: 100%;
  margin-bottom: 10px;
}
</style>
