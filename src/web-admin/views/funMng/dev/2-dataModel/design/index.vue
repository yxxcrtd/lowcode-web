<template>
  <el-dialog title="模型配置" v-model="dialogVisible" fullscreen class="fullscreen-dialog">
    <template #title>
      <div class="dialog-title">
        <div>模型配置</div>
        <div>
          <el-button :disabled="formLoading" type="primary" @click="submitForm">保 存</el-button>
        </div>
      </div>
    </template>
    <div class="page-container" v-loading="loading">
      <el-tabs v-model="activeName" :before-leave="tabBeforeLeave">
        <el-tab-pane label="模型信息" name="base">
          <ModelIndex ref="modelIndexRef" v-model="formData" @close-click="closeDialog()" @changeMainTable="changeMainTalbe"></ModelIndex>
        </el-tab-pane>
        <el-tab-pane label="视图配置" name="model">
          <ModelView ref="modelViewRef" v-model="formData"></ModelView>
        </el-tab-pane>
        <el-tab-pane label="API管理" name="relationModel" v-if="bizType==='edit'">
          <ModelAPI ref="modelViewAPI" v-model="formData"></ModelAPI>
        </el-tab-pane>
      </el-tabs>
    </div>
  </el-dialog>
  <ChooseFieldsDialog ref="refChooseFields" />
</template>
<script lang="ts" setup>
import { ref } from 'vue'
import ChooseFieldsDialog from '../../Components/ChooseFieldsDialog.vue'
import ModelIndex from './Components/ModelIndex.vue'
import ModelView from './Components/ModelView.vue'
import ModelAPI from './Components/ModelAPI.vue'
import { defineEmits } from 'vue'
import { cloneDeep, uniqueId } from 'lodash-es'
import {addModuleInfo, getModuleInfo, updateModuleInfo} from '../api'

defineOptions({ name: 'DataModel-Design' })
const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调

const route = useRoute()
const message = useMessage() // 消息弹窗
const dialogVisible = ref(false)
const activeName = ref('base')

const menuId = route.query.id
const formData = ref({})
const bizType=ref('create')
const formLoading = ref(false)
//时间戳，本次编辑时的更新时间 
const updateTimeStamp=ref(null)

/** 打开弹窗 */
const open = async (type: string, row) => {
  dialogVisible.value = true
  loading.value = true
  await nextTick()
  activeName.value = 'base'
  bizType.value=type
  if (type === 'edit') {
    loadModuleInfo(row.id)
  } else {
    initFormData()
  }
  loading.value=false
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗
/**
 * 加载模型数据
 * @param id
 */
const loadModuleInfo = async (id) => {
  const res = await getModuleInfo(id)
  console.log(res)
  formData.value = res
  formData.value.tableList.forEach(tableItem=>{
    tableItem.tableFields=tableItem.fieldList.map(item=>{
      return {
        ...item,
        isChecked:1
      }
    })
  })
  updateTimeStamp.value=res.updateTime
  changeMainTalbe()
}
/**
 * 关闭弹框
 */
const closeDialog = () => {
  console.log('进入到了关闭方法的页面')
  dialogVisible.value = false
}
/**
 * 模型提交保存
 */
const modelIndexRef = ref()
const loading=ref(false)
const submitForm = async () => {
  const params:any = assemblyParams()
  console.log(formData.value, params)
  params.updateTimeStamp=updateTimeStamp.value
  const validModelIndex=await modelIndexRef.value.validateForm()
  console.log(validModelIndex)
  if (!validModelIndex) return
  try{
    loading.value=true
    const res =bizType.value==='create' ? await addModuleInfo(params) : await updateModuleInfo(params)
    if (res) {
      message.success('保存成功')
      dialogVisible.value = false
      emit('success')
      initFormData()
    }
  }catch (e){
    console.log(e)
  }finally {
    loading.value=false
  }
}
/**
 * 组装模型数据
 */
const assemblyParams = () => {
  let modelInfo = cloneDeep(formData.value)
  modelInfo.tableList.forEach((item) => {
    if (item.tableFields && item.tableFields.length > 0) {
      item.fieldList = item.tableFields
        .filter((item) => item.isChecked)
        .map((item) => {
          return {
            id:item.id,
            tableId: item.tableId,
            fieldId: item.fieldId ? item.fieldId : item.id,
            defaultValue: item.defaultValue,
            remark: item.remark,
            columnName: item.columnName,
            columnComment: item.columnComment,
            columnAliasName: item.columnAliasName,
            columnType: item.columnType,
            columnLength: item.columnLength,
            mappingFieldId: item.mappingFieldId,
            textTableId:item.textTableId,
            textColumnId:item.textColumnId,
            textTableKey:item.textTableKey,
            valueType:item.valueType,
            textSql:item.textSql,
            isBackData:item.isBackData,
            computeSql: item.computeSql
           // id: item.cId,
          }
        })
    }
  })
  return modelInfo
}

const generateUniqueId=()=> {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 9);
  return `yt-model-${timestamp}-${random}`;
}

const tabBeforeLeave=(newName,oldName)=>{
  if(newName=='model' && formData.value.moduleType===1 &&!formData.value.mainTableId){
    message.warning("请选择主表")
    return false;
  }
  return true;
}
/**
 * 初始化模型数据变量
 */
const initFormData = () => {
  formData.value = {
    moduleName: '',
    moduleCode: 'MX-',
    moduleType: '1',
    remark: null,
    moduleSql: '',
    moduleBean: '',
    moduleMethod: '',
    modelApi: '',
    modelApiType: '',
    menuId: menuId,
    tableList: []
  }
}
/**
 * 选择主表后的操作
 * @param data
 */
const modelViewRef=ref()
const changeMainTalbe = async () => {
  await nextTick()
  modelViewRef.value.setCurModel(0)
}
//初始化模型数据变量
initFormData()

</script>
<style lang="scss" scoped>
.dialog-title {
  height: 32px;
  display: flex;
  justify-content: space-between;
  padding: 0 45px 0px 0px;
}
:deep(.el-dialog__headerbtn) {
  top: 10px;
  font-size: 26px;
}
</style>
