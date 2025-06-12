<template>
  <div class="form-table-item">
    <div class="form-table-header">
      <div class="form-table-title">{{ formItem.tableConfig.tableTitle }}</div>
      <div class="mb-10px mt-10px">
        <template v-if="leftButtonList && leftButtonList.length">
          <template v-for="item in leftButtonList" :key="item.buttonId">
            <template v-if="isShowBtn(item,null)">
              <component
                v-if="item.columnDisplayComponent"
                :is="item.columnDisplayComponent"
                v-bind="item.props"
                class="mr-10px"
                :pageListConfigs="instance.props.formLayouts.pageListConfigs"
                :formData="formData"
                @btnEvent="(data) => handlePageButtons(item, data)"
              >
              </component>
              <el-button v-else :type="item.buttonStyle" class="mr-10px" :loading="item.isLoading" @click="handlePageButtons(item)">
                <Icon v-if="item.buttonIcon" :icon="item.buttonIcon" class="mr-5px" />
                {{ item.buttonName }}</el-button
              >
            </template>
          </template>
        </template>
        <template v-else>
          <el-button v-if="isShowAddBtn" type="primary" @click="newAdd">新增</el-button>
        </template>
      </div>
    </div>
    <vxe-table
      v-if="showColumns && showColumns.length"
      ref="vxeTableRef"
      :show-footer="showFoot"
      :column-config="{resizable: true}"
      :footer-method="footerMethod"
      border="inner"
      stripe
      align="center"
      max-height="500"
      :data="formData['list_' + formItem.tableId]"
    >
      <vxe-column title="序号" width="60" align="center" fixed="left" v-if="formItem.tableConfig.isShowIndex == 1">
        <template #default="{ rowIndex }">
          {{ rowIndex + 1 }}
        </template>
      </vxe-column>
      <template v-for="(col, index) in showColumns" :key="index">
        <vxe-column
          :align="col.align || 'left'"
          :footer-align="col.align || 'left'"
          :params="{ isTotalColumn: col.isTotalColumn, field: col.field }"
          :title="col.columnComment"
          :min-width="col.minWidth"
          v-if="!col.isHidden"
        >
          <template #header> 
            <div class="table-col-title">
              <span class="requird-span" v-if="getColRequire(col)">*</span>
              <el-tooltip
                v-if="col.columnHeadTips"
                popper-class="form-item-label-tooltips"
                placement="top"
              >
                <template #content><div v-html="col.columnHeadTips"></div></template>
                <el-icon class="tips-icon mr-4px"><WarningFilled /></el-icon>
              </el-tooltip>
              {{ col.columnComment }}
            </div>
          </template>
          <template #default="{ row, rowIndex }">
            <el-form-item
              v-if="!row['_'+formItem.columnName+'_isHidden']"
              label-width="0"
              :style="{ 'justify-content': alignValue(col.align) }"
              :prop="`['list_${formItem.tableId}'][${rowIndex}].${col.field}`"
              :class="{'text-row':row.addType!='row'}"
              :rules="isDetail || col.isDisabled || formItemLen >= dialogLen?[]:[...col.rules,{validator:(rule, value, callback)=>tableRowValidate(rule, value, callback,col,row,rowIndex), trigger: ['blur','change'] }]"
            >
              <FormItemDetail
                v-if="isDetail || col.isDisabled || formItemLen >= dialogLen"
                :value="row[col.moduleTableId][col.labelField]"
                :rowData="row"
                :componentType="col.columnDisplayComponent"
                :component-props="col.props"
                :fieldConfig="col"
                :align="col.align"
              >
              </FormItemDetail>
              <component
                v-else
                :is="col.columnDisplayComponent"
                v-model="row[col.moduleTableId][col.field]"
                v-model:modelText="row[col.moduleTableId][col.fieldText]"
                v-model:startDate="row[col.moduleTableId][col.startDateField]"
                v-model:endDate="row[col.moduleTableId][col.endDateField]"
                v-bind="col.props"
                :pageListConfigs="instance.props.formLayouts.pageListConfigs"
                :formData="{...formData,[col.moduleTableId]:row}"
                :disabled="row[col.columnName+'_Disabled']"
                @change="(val, option) => handleComponentEvent('change', col,row,{ val, option,rowIndex })"
                @keyup="(e) => handleComponentEvent('keyup', col,row, { e,rowIndex })"
                @focus="(e) => handleComponentEvent('focus', col,row, { e,rowIndex })"
                @blur="(e) => handleComponentEvent('blur', col,row, { e,rowIndex })"
              >
              </component>
            </el-form-item>
          </template>
        </vxe-column>
      </template>
      <vxe-column field="action" title="操作" fixed="right" width="180" v-if="isShowAction">
        <template #default="{ row, rowIndex }">
          <div class="table-action">
            <template v-if="rowButtonList && rowButtonList.length">
              <template v-for="(btnItem,btnIndex) in rowButtonList" :key="btnItem.buttonId">
                <template v-if="isShowBtn(btnItem,row,rowIndex)">
                  <component
                    v-if="btnItem.columnDisplayComponent"
                    :is="btnItem.columnDisplayComponent"
                    v-bind="btnItem.props"
                    class="mr-10px"
                    :pageListConfigs="instance.props.formLayouts.pageListConfigs"
                    :formData="formData"
                    @btnEvent="(data) => handlePageButtons(btnItem, data,row,rowIndex)"
                  >
                  </component>
                  <el-link v-else 
                           :type="btnItem.buttonStyle" 
                           :loading="btnItem.isLoading" 
                           @click="handlePageButtons(btnItem,null,row,rowIndex)">
                    <Icon v-if="btnItem.buttonIcon" :icon="btnItem.buttonIcon" class="mr-5px" />
                    {{ btnItem.buttonName }}
                  </el-link>
                  <el-divider v-if="btnIndex<rowButtonList.length-1 && isShowBtn(rowButtonList[btnIndex+1],row,rowIndex)" direction="vertical" />
                </template>
              </template>
            </template>
            <template v-else>
              <template v-if="isShowEditBtn">
                <el-link type="primary" @click="handleEdit(row, rowIndex)">编辑</el-link>
                <el-divider v-if="isShowViewBtn || isShowDeleteBtn" direction="vertical" />
              </template>
              <template v-if="isShowViewBtn">
                <el-link type="primary" @click="handleView(row, rowIndex)">详情</el-link>
                <el-divider v-if="isShowDeleteBtn" direction="vertical" />
              </template>
              <template v-if="isShowDeleteBtn">
                <el-link type="primary" @click="handleDelete(row, rowIndex)">删除</el-link>
                <el-divider v-if="isShowCopyBtn" direction="vertical" />
              </template>
              <template v-if="isShowCopyBtn">
                <el-link type="primary" @click="handleCopy(row, rowIndex)">复制</el-link>
              </template>
            </template>
          </div>
        </template>
      </vxe-column>
      <template #empty>
        <el-empty description="暂无数据"/>
      </template>
    </vxe-table>
  </div>
  <DialogRowForm ref="dialogRowFormRef" :mainFormData="formData" @success="tableEditSuccess"></DialogRowForm>
  <DrawerRowForm ref="drawerRowFormRef" :mainFormData="formData" @success="tableEditSuccess"></DrawerRowForm>
</template>
<script setup lang="ts">
import {inject, ref} from 'vue'
import { propTypes } from '@/utils/propTypes'
import DialogRowForm from './Components/DialogRowForm.vue'
import DrawerRowForm from './Components/DrawerRowForm.vue'
import {cloneDeep, throttle} from 'lodash-es'
import { handleEvent } from '@/comRender/render/v2/Core/event'
import FormItemDetail from './Components/FormItemDetail.vue'
import { VxeTablePropTypes } from 'vxe-table'
import * as renderUtil from '@/comRender/utils/renderUtil'
import {setComponentProps} from "@/comRender/render/v2/Components/RenderForm/js/components";
import {
  tableRowCheckRules,
  validateCondition,
  validateRowCondition
} from "@/comRender/render/v2/Core/linkage";
import {replaceMethodField, replaceScriptField} from "@/comRender/utils";
import {btnEvent} from "@/comRender/render/v2/Core/buttonAction";
import {WarningFilled} from "@element-plus/icons-vue";
import {runRowAllLinkage,bindRowFormLinkage} from "@/comRender/render/v2/Core/linkage/rowLinkage"
import {setFormTableId,initFormData} from "@/comRender/render/v2/Components/RenderForm/js/index";

const formData: any = defineModel()
const tableCtx = getCurrentInstance()

const route=useRoute()
const message=useMessage()

// 添加一个计算属性可以获得align
const alignValue = computed(() => {
  return (val: string) => {
    if (val) {
      if (val === 'left') {
        return 'start'
      } else {
        return 'end'
      }
    } else {
      return 'center'
    }
  }
})
// 控制是否显示合计
const showFoot = computed(() => {
  const list = props.formItem.tableItems.filter((item) => item.isTotalColumn === 1)
  return list.length > 0
})

const props = defineProps({
  bizType: propTypes.string.def('add'),
  formItem: propTypes.object,
  groupItem: propTypes.object,
  instance:propTypes.object,
  formTableProps: propTypes.object,
  isDetail: propTypes.bool
})
const pageInfo:any = inject('pageInfo')
const apiInfo:any=inject('apiInfo')
//根据字段长度，设置编辑类型
const dialogLen = 6
const drawerLen = 12
const dialogRowFormRef = ref()
const drawerRowFormRef = ref()

const pageButtons:any=ref([])
const formTableList:any=ref([])
const getPageButtons=()=>{
  formTableList.value=setFormTableId(apiInfo.value,props.formItem.tableId)
  pageButtons.value=pageInfo.pageButtons?.filter(item=>item.moduleTableId==props.formItem.tableId)
  pageButtons.value?.forEach(item=>{
    item.props=setComponentProps(item)
  })
}
getPageButtons()


const initLinkage=()=>{
  if(tableAddType.value=='row'){
    formData.value['list_' + props.formItem.tableId].forEach(row=>{
      runRowAllLinkage(tableCtx,'INIT',props.formItem,props.formItem.tableId,formData.value,row)
      runRowAllLinkage(tableCtx,'RUN',props.formItem,props.formItem.tableId,formData.value,row)
    })
  }
}

const leftButtonList=computed(()=>{
  return pageButtons.value?.filter(item=>item.btnPosition=='table-left')
})
const rightButtonList=computed(()=>{
  return pageButtons.value?.filter(item=>item.btnPosition=='table-right')
})
const rowButtonList=computed(()=>{
  return pageButtons.value?.filter(item=>item.btnPosition=='table-row')
})

const showColumns=computed(()=>{
  return props.formItem.tableItems.filter(item=>!item.isShowInTable && !item.isHidden)
})
const formItemLen=computed(()=>{
  //return props.formItem.tableItems.filter(item=>!item.isHidden).length
  return props.formItem.tableItems.length
})
/**
 * 表格新增类型
 */
const tableAddType=computed(()=>{
  let newType='row'
  const addBtnItem=pageButtons.value.find(item=>item.operationType === 'tableAdd')
  if(addBtnItem && addBtnItem.newAddType && addBtnItem.newAddType!='default'){
    newType=addBtnItem.newAddType
  }else{
    const curTable=apiInfo.value.moduleTables.find(item=>item.id==props.formItem.tableId)
    const isHaveChildTable=apiInfo.value.moduleTables.find(item=>item.mainTableId===curTable.tableId)
    if(isHaveChildTable){
      newType='drawer'
    }else if (formItemLen.value >= drawerLen) {
      newType='drawer'
    } else if (formItemLen.value >= dialogLen) {
      newType='dialog'
    }
  }
  return newType
})
const tableEditType=computed(()=>{
  let newType='row'
  const addBtnItem=pageButtons.value.find(item=>item.operationType === 'tableEdit')
  if(addBtnItem && addBtnItem.newAddType && addBtnItem.newAddType!='default'){
    newType=addBtnItem.newAddType
  }else{
    const curTable=apiInfo.value.moduleTables.find(item=>item.id==props.formItem.tableId)
    const isHaveChildTable=apiInfo.value.moduleTables.find(item=>item.mainTableId===curTable.tableId)
    if(isHaveChildTable){
      newType='drawer'
    }else if (formItemLen.value >= drawerLen) {
      newType='drawer'
    } else if (formItemLen.value >= dialogLen) {
      newType='dialog'
    }
  }
  return newType
})

//操作列显示状态
const isShowAction = computed(() => {
  if(props.formItem.tableConfig.isHiddenAction=='1'){
    return false
  }
  return isShowEditBtn.value || isShowDeleteBtn.value || isShowViewBtn.value || isShowCopyBtn.value
})
const isShowAddBtn = computed(() => {
  //判断子表是否所有字段都是只读
  const isAllDisabled = props.formItem.tableItems.filter(item=>!item.isHidden).every((item) => item.isDisabled)
  if (isAllDisabled) {
    return !isAllDisabled
  }
  if(props.formItem.tableConfig.isNotAllowAdd=='1'){
    return false
  }
  if(pageInfo.id=='1903035836230660097'){
    return false
  }
  return true
})
const isShowPageBtn = computed(() => {
  //判断子表是否所有字段都是只读
  const isAllDisabled = props.formItem.tableItems.filter(item=>!item.isHidden).every((item) => item.isDisabled)
  if (isAllDisabled) {
    return false
  }else{
    return true
  }
})

const isShowEditBtn = computed(() => {
  const isAllDisabled = props.formItem.tableItems.filter(item=>!item.isHidden).every((item) => item.isDisabled)
  if (isAllDisabled) {
    return false
  }
  return tableAddType.value!='row' && props.formTableProps?.showBtnFun()
})
const isShowDeleteBtn = computed(() => {
  const isAllDisabled = props.formItem.tableItems.filter(item=>!item.isHidden).every((item) => item.isDisabled)
  if (isAllDisabled) {
    return false
  }
  return !props.isDetail && props.formTableProps?.showBtnFun()
})
const isShowViewBtn = computed(() => {
  return tableAddType.value!='row'
})

const isShowRefreshBtn = computed(() => {
  //判断子表是否所有字段都是只读
  const isAllDisabled = props.formItem.tableItems.filter(item=>!item.isHidden).every((item) => item.isDisabled)
  if (isAllDisabled) {
    return !isAllDisabled
  }
  if(props.formItem.tableConfig.isShowRefresh=='0'){
    return false
  }
  return props.formTableProps?.showBtnFun()
})
/**
 * 显示复制按钮
 * todo 后续需改成配置方式
 */
const isShowCopyBtn = computed(() => {
  const isAllDisabled = props.formItem.tableItems.filter(item=>!item.isHidden).every((item) => item.isDisabled)
  if (isAllDisabled) {
    return false
  }
  if(['1901881580182142977'].includes(pageInfo.id) && ['1889512177872470017'].includes(props.formItem.tableId)){
    return true
  }
  return !props.isDetail && props.formTableProps?.showBtnFun()
})
const getColRequire=(col)=>{
  return col.isRequire || col.rules?.find(item=>item.required)
}
/**
 * 组件默认事件统一触发
 * @param eventType
 * @param formItem
 * @param data
 */
const handleComponentEvent=(eventType,formItem,row,data)=>{
  // console.log(eventType,formItem,data,renderFormData.value)
  handleEvent(eventType,formItem,props.instance,row,data,props.instance.props.formLayouts.pageListConfigs)
}
const tableFormGroup=ref({})
const assemblyTableForm=()=>{
  tableFormGroup.value={
    groupCode: props.groupItem.groupCode,
    groupName: '基本信息',
    tableId:props.formItem.tableId,
    childTableId:null,
    formItems:props.formItem.tableItems
  }
}
/**
 * 新增记录
 */
const newAdd = (btnItem) => {
  if (tableAddType.value==='drawer') {
    drawerRowFormRef.value.open('add',props.formItem.tableId, tableFormGroup.value)
  } else if (tableAddType.value==='dialog') {
    dialogRowFormRef.value.open('add',props.formItem.tableId, tableFormGroup.value)
  } else {
    const rowFormData=ref({...initFormData(apiInfo.value,formTableList.value),addType:'row'})
    formData.value['list_' + props.formItem.tableId].push(rowFormData.value)
    console.log('rowFormData',rowFormData)
    bindRowFormLinkage(tableCtx,pageInfo,props.formItem,props.formItem.tableId,formData.value,rowFormData.value)
  }
}
/**
 * 修改记录
 */
const curEditRowIndex = ref(-1)
const handleEdit = (row, rowIndex) => {
  curEditRowIndex.value = rowIndex
  if (tableEditType.value=='drawer') {
    drawerRowFormRef.value.open('edit',props.formItem.tableId, tableFormGroup.value, row)
  } else if (tableEditType.value=='dialog') {
    dialogRowFormRef.value.open('edit',props.formItem.tableId, tableFormGroup.value, row)
  }
}
/**
 * 查看
 * @param row
 * @param rowIndex
 */
const handleView = (row, rowIndex) => {
  curEditRowIndex.value = rowIndex
  if (tableAddType.value=='drawer') {
    drawerRowFormRef.value.open('edit',props.formItem.tableId, tableFormGroup.value, row, true)
  } else if (tableAddType.value=='dialog') {
    dialogRowFormRef.value.open('edit',props.formItem.tableId, tableFormGroup.value, row, true)
  }
}
/**
 * 删除记录
 * @param row
 * @param rowIndex
 */
const handleDelete = async (row, rowIndex) => {
  await message.delConfirm('确定删除当前行吗')
  formData.value['list_' + props.formItem.tableId].splice(rowIndex, 1)
}
/**
 * 复制行
 * @param row
 * @param rowIndex
 */
const handleCopy = (row, rowIndex) => {
  const newRow=cloneDeep(row)
  delete newRow._X_ROW_KEY
  formData.value['list_' + props.formItem.tableId].push(newRow)
}

/**
 * 刷新表数据
 */
const handleRefresh = (btnItem, data) => {
  console.log(btnItem, data)
}


/**
 * 表格行内校验 因为需要拿到行内数据，所以和表单走不同的方式
 * @param rule
 * @param value
 * @param callback
 * @param col
 * @param row
 * @param rowIndex
 */
const tableRowValidate=(rule, value, callback,col,row,rowIndex)=>{
  //console.log('tableRowValidate',rule,value,col,row,rowIndex)
  if(row[col.columnName+'_Disabled']){
    callback()
    return
  }
  if(!col.ruleCustomValidateScript){
    callback()
    return
  }
  try{
    const customFunc=new Function(col.ruleCustomValidateScript)
    //执行自定义校验函数，自定义函数是一个字符串，先通过Function转为函数，再传参执行方法；
    customFunc()(rule,value,callback,col,row,rowIndex)
  } catch (e){
    console.log(e)
    callback(new Error('自定义方法校验失败'));
  }
}

const emits = defineEmits(['btnEvent'])
const handleClick = (btnItem) => {
  emits('btnEvent', btnItem)
}
/**
 * 新增、编辑完成回调
 * @param type
 * @param data
 */
const vxeTableRef = ref()
const tableEditSuccess = (type, data) => {
  console.log(type, data)
  let index=-1
  if (type === 'add') {
    formData.value['list_' + props.formItem.tableId].push(cloneDeep(data))
    index=formData.value['list_' + props.formItem.tableId].length-1
  } else {
    formData.value['list_' + props.formItem.tableId][curEditRowIndex.value] = cloneDeep(data)
    vxeTableRef.value.loadData(formData.value['list_' + props.formItem.tableId])
    index=curEditRowIndex.value
  }
  //弹框抽屉确定完之后，对行内进行一次验证
  const fields=props.formItem.tableItems.map(item=>{
    return `['list_${props.formItem.tableId}'][${index}].${item.field}`
  })
  props.instance.exposed.validateFields(fields)
}
/**
 * 对表格数据进行统一格式化
 * @param row
 * @param rowIndex
 * @param column
 */
const valueFormat = (val, rowIndex, column) => {
  return val
}
// 加入合计行
const footerMethod: VxeTablePropTypes.FooterMethod = ({ columns, data }) => {
  return [
    columns.map((column, _columnIndex) => {
      if (_columnIndex === 0) {
        return '合计'
      }
      if (column.params && column.params.isTotalColumn === 1) {
        // 找到data中这一列数据
        const values = data.map((item) => item[column.params.field])
        if (!values.every((value) => isNaN(value))) {
          const result = values.reduce((prev, curr) => {
            const value = Number(curr)
            if (!isNaN(value)) {
              return prev + value
            } else {
              return prev
            }
          }, 0)
          return Number(result).toFixed(2)
        } else {
          return ''
        }
      }else{
        return ''
      }
      return null
    })
  ]
}

const isShowBtn=(btnItem,row?,rowIndex?)=>{
  //console.log('isShowBtn',btnItem,row)
  //新增按钮
  if (btnItem.operationType === 'tableAdd') {
    //根据流程表单权限判断按钮权限
    //console.log('isShowAddBtn',isShowAddBtn.value)
    if(!isShowAddBtn.value){
      return false
    }
  }
  if (btnItem.operationType === 'tableEdit') {
    //根据流程表单权限判断按钮权限
    if(!isShowEditBtn.value){
      return false
    }
  }
  if (btnItem.operationType === 'tableDel') {
    //根据流程表单权限判断按钮权限
    if(!isShowDeleteBtn.value){
      return false
    }
  }
  if (btnItem.operationType === 'tableDetail') {
    //根据流程表单权限判断按钮权限
    if(!isShowViewBtn.value){
      return false
    }
  }
  if (btnItem.operationType === 'tableCopy') {
    //根据流程表单权限判断按钮权限
    if(!isShowCopyBtn.value){
      return false
    }
  }
  if (btnItem.operationType === 'tableRefresh') {
    //根据流程表单权限判断按钮权限
    if(!isShowRefreshBtn.value){
      return false
    }
  }
  //判断按钮的显隐规则
  if(btnItem.conditionalTableRespVO){
    const showCfg=btnItem.conditionalTableRespVO
    //1.判断显示的页面
    if(showCfg.showPageType && route.query.pageType && checkPageMap[route.query.pageType]){
      const isCurPage=checkPageMap[route.query.pageType](showCfg.showPageType)
      if(!isCurPage){
        return false
      }
    }
    //2.校验表达式
    if(showCfg.setType=='1' && showCfg.condition && row){
      if(btnItem.btnPosition==='table-row'){
        const conditionStr=validateRowCondition(props.formItem.tableItems,showCfg.condition)
        //console.log('conditionStr',conditionStr,row,tableRowCheckRules(row,conditionStr))
        return tableRowCheckRules(row,conditionStr)
      }else{
        const conditionStr=validateCondition(props.instance.props.formLayouts.pageListConfigs,showCfg.condition)
        //console.log('conditionStr',conditionStr)
        return tableRowCheckRules(formData,conditionStr)
      }
    }
    //3.校验脚本
    if(showCfg.setType=='2' && showCfg.script){
      try{
        const scriptStr=replaceMethodField(showCfg.script,props.formItem.tableItems,null)
        //console.log('showCfg.script',scriptStr)
        const customFunc=new Function(scriptStr)
        //执行自定义校验函数，自定义函数是一个字符串，先通过Function转为函数，再传参执行方法；
        return customFunc()(tableCtx,formData,row || {},rowIndex,renderUtil)
      } catch (e){
        console.log(e)
      }
    }
  }
  return true
  
}
const checkPageMap:any={
  'add':(pageList)=>{
    return pageList.includes('add-page')
  },
  'edit':(pageList)=>{
    return pageList.includes('edit-page')
  },
  'detail':(pageList)=>{
    return pageList.includes('detail-page')
  }
}
/**
 * 按钮点击事件
 * @param btnItem
 */
const handlePageButtons =throttle(async (btnItem,data,row?,rowIndex?) => {
  console.log('handlePageButtons',btnItem,row,rowIndex)
  if (btnItem.operationType === 'tableAdd') {
    newAdd(btnItem)
  }
  if (btnItem.operationType === 'tableEdit') {
    handleEdit(row,rowIndex)
  }
  if (btnItem.operationType === 'tableDel') {
    handleDelete(row,rowIndex)
  }
  if (btnItem.operationType === 'tableDetail') {
    handleView(row,rowIndex)
  }
  if (btnItem.operationType === 'tableCopy') {
    handleCopy(row,rowIndex)
  }
  if (btnItem.operationType === 'tableRefresh') {
    // handleRefresh(btnItem, data)
    const eventData={data:data,row:row,rowIndex:rowIndex}
    btnEvent(btnItem,pageInfo.pageType,tableCtx,null,eventData,formData.value,props.instance.props.formLayouts.pageListConfigs)
  }
  if (btnItem.operationType === 'tableCustom') {
    //emits('btnEvent',btnItem,data)
    const eventData={data:data,row:row,rowIndex:rowIndex}
    btnEvent(btnItem,pageInfo.pageType,tableCtx,null,eventData,formData.value,props.instance.props.formLayouts.pageListConfigs)
  }
},1000)

defineExpose({newAdd,handleEdit,handleView,handleDelete,handleCopy})
onMounted(()=>{
  assemblyTableForm()
  initLinkage()
})
</script>
<style scoped lang="scss">
.form-table-item {
  margin-bottom: 10px;
}
.button-content {
  padding: 8px 10px;
  display: flex;
  color: #000;
  justify-content: space-between;
}
:deep(.el-form-item__content) {
  //flex: none;
}
.form-table-header {
  display: flex;
  align-items: center;
  .form-table-title {
    font-size: 14px;
    font-weight: 600;
    margin-right: 10px;
  }
}
.text-row{
  :deep(.el-form-item__content) {
    line-height: 22px;
  }
}
.table-col-title{
  display: flex;
  align-items: center;
  justify-content: center;
}
.tips-icon{
  color: #CFA479;
  margin-left: 2px;
}
</style>
