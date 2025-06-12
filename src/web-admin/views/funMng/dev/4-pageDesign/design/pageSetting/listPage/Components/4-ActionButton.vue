<template>
   <div class="oprate-button-warp-noselect"> 
    <el-button type="primary" @click="addRow()" class="mb-10px"> 新增按钮 </el-button>
   </div>
  <div class="action-button-container">
    <div style="display: flex; justify-content: center; width: 100%;margin-bottom: 6px;">
      <el-radio-group v-model="btnType" @change="handleBtnTypeChange">
        <el-radio-button label="左边按钮" value="left" />
        <el-radio-button label="右边按钮" value="right" />
        <el-radio-button label="行内按钮" value="row" />
      </el-radio-group>
    </div>
    <div class="datamodel-header">
    </div>
    <div class="table-content">
      <vxe-table ref="vxeTableRef" border="inner" stripe align="center" height="100%" :data="tableData">
        <vxe-column type="seq" title="序号" width="60" align="center" fixed="left"/>
        <vxe-column field="operationType" title="操作类型" width="130" fixed="left">
          <template #default="{ row }">
            <el-select v-model="row.operationType" @change="(val)=>selectOperationType(val,row)" clearable>
              <el-option v-for="(item, index) in operationTypeOptions" :key="'operationType_' + index" :label="item.label" :value="item.value" />
            </el-select>
          </template>
        </vxe-column>
        <vxe-column field="buttonName" title="按钮名称" width="180" fixed="left">
          <template #default="{ row }">
            <el-input v-model="row.buttonName" />
          </template>
        </vxe-column>
        <vxe-column field="buttonShape" title="按钮类型" width="140" v-if="btnType!=='row'">
          <template #default="{ row }">
            <el-select v-model="row.buttonShape" clearable>
              <el-option v-for="(item, index) in buttonShapeOption" :key="'buttonStyle_' + index" :label="item.label" :value="item.value" />
            </el-select>
          </template>
        </vxe-column>
        <vxe-column field="buttonStyle" title="按钮样式" width="120">
          <template #default="{ row }">
            <el-select v-model="row.buttonStyle" clearable>
              <el-option v-for="(item, index) in buttonTypeOption" :key="'buttonStyle_' + index" :label="item.label" :value="item.value" />
            </el-select>
          </template>
        </vxe-column>
        <vxe-column field="buttonIcon" title="按钮图标" width="180">
          <template #default="{ row }">
            <IconSelect v-model="row.buttonIcon" />
          </template>
        </vxe-column>
        <vxe-column field="permissionSign" title="权限标识" width="240">
          <template #default="{ row }">
            <el-input
              v-model="row.permissionSign"
              placeholder="请输入权限标识"
            >
              <template #prepend>页面ID:</template>
            </el-input>
          </template>
        </vxe-column>
        <vxe-column field="apiCode" title="模板API" width="200">
          <template #default="{ row }">
            <el-select v-model="row.apiCode" clearable @change="handleTemplateApiChange($event,row)">
              <el-option v-for="(item,index) in formData.templateApiList" :key="'list_templateApiList_'+index" :label="item.apiName" :value="item.apiCode" />
            </el-select>
          </template>
        </vxe-column>
        <vxe-column field="showCondition" align="center" title="显示条件" width="100" min-width="100">
          <template #default="{ row }">
            <div class="table-row-cfg-wrap">
              <el-button text type="primary" @click="openDialog('showCondition', row)" :class="row.conditionalTableRespVO ? 'green-text':''"> 配置 </el-button>
              <el-popconfirm title="确定清空配置?" @confirm="clearCfg(row,'conditionalTableRespVO')" v-if="row.conditionalTableRespVO">
                <template #reference>
                  <el-icon class="cfg-del-btn" title="清空配置">
                    <Delete />
                  </el-icon>
                </template>
              </el-popconfirm>
            </div>
          </template>
        </vxe-column>
        <vxe-column field="actionType" align="center" title="按钮动作" width="100" min-width="100">
          <template #default="{ row }">
            <div class="table-row-cfg-wrap">
              <el-button text type="primary" @click="openDialog('showButtonActionCfg', row)" :class="row.showButtonActionCfg ? 'green-text':''"> 配置 </el-button>
              <el-popconfirm title="确定清空配置?" @confirm="clearCfg(row,'showButtonActionCfg')" v-if="row.showButtonActionCfg">
                <template #reference>
                  <el-icon class="cfg-del-btn" title="清空配置">
                    <Delete />
                  </el-icon>
                </template>
              </el-popconfirm>
            </div>
          </template>
        </vxe-column>
        <vxe-column field="remark" title="备注" min-width="130">
          <template #default="{ row }">
            <el-input v-model="row.remark" />
          </template>
        </vxe-column>
        <vxe-column field="action" title="操作" width="110" fixed="right">
          <template #default="{ row }">
            <div class="table-action">
              <el-link type="primary" @click="handleDelete(row)">删除</el-link>
            </div>
          </template>
        </vxe-column>
      </vxe-table>
    </div>
  </div>
  <ConditionDialog ref="conditionDialogRef" :field-list="selectApi.tableColumns" @success="configSuccess('showCondition',$event)"/>
  <ConditionScriptDialog ref="conditionScriptDialogRef" @success="configSuccess('showCondition',$event)"></ConditionScriptDialog>
  <ButtonActionCfgDialog ref="buttonActionCfgDialogRef" @success="configSuccess('showButtonActionCfg',$event)"/>
</template>
<script lang="ts" setup>
import { ref } from 'vue'
import { cloneDeep } from 'lodash-es'
import ConditionDialog from "@/web-admin/views/funMng/dev/Components/ConditionDialog.vue"
import ConditionScriptDialog from "@/web-admin/views/funMng/dev/Components/ConditionScriptDialog.vue"
import ButtonActionCfgDialog from "@/web-admin/views/funMng/dev/Components/ButtonActionCfgDialog.vue";
import {Delete} from "@element-plus/icons-vue";

defineOptions({name: 'ListPageActionButtonIndex'})

const formData:any=defineModel()
const emit = defineEmits(['close-click', 'chooseModel'])

const message = useMessage() // 消息弹窗

const operationTypeOptions = ref([
  {
    label: '新增',
    value: 'create',
  },
  {
    label: '编辑',
    value: 'edit',
  },
  {
    label: '详情',
    value: 'detail',
  },
  {
    label: '删除',
    value: 'delete'
  },
  {
    label: '批量删除',
    value: 'batchDelete'
  },
  {
    label: '导出',
    value: 'export'
  },
  {
    label: '自定义',
    value: 'custom',
  }
])
const buttonShapeOption = ref([
  {
    label: '默认',
    value: 'default'
  },
  {
    label: '主要按钮',
    value: 'primary'
  },
  {
    label: '链接按钮',
    value: 'link'
  },
  {
    label: '朴素按钮',
    value: 'plain'
  },
  {
    label: '圆角按钮',
    value: 'round'
  },
  {
    label: '圆形按钮',
    value: 'circle'
  }
])

const buttonTypeOption = ref([
  {
    label: '默认',
    value: 'default'
  },
  {
    label: '主要',
    value: 'primary'
  },
  {
    label: '成功',
    value: 'success'
  },
  {
    label: '信息',
    value: 'info'
  },
  {
    label: '警告',
    value: 'warning'
  },
  {
    label: '危险',
    value: 'danger'
  }
])
const btnType = ref('left')
const tableData = computed(() => {
  return formData.value.pageButtons && formData.value.pageButtons.filter((item) => item.buttonType === btnType.value) || []
})

const vxeTableRef=ref()
const handleBtnTypeChange=async ()=>{
}

const addRow = () => {
  if(!formData.value.pageButtons){
    formData.value.pageButtons=[]
  }
  formData.value.pageButtons.push({
    buttonType: btnType.value,
    buttonStyle:btnType.value==='row' ? 'primary':'default',
    openWay:'default'
  })
}
const handleDelete=async (row)=>{
  try {
    // 删除的二次确认
    await message.delConfirm()
    const rowIndex=formData.value.pageButtons.findIndex(item=>item._X_ROW_KEY==row._X_ROW_KEY)
    formData.value.pageButtons.splice(rowIndex,1)
  } catch (e){
    console.log(e)
  }
}

const handleTemplateApiChange=(val,row)=>{
  const curAPI=formData.value.templateApiList.find(item=>item.apiCode===val)
  row.moduleId=curAPI.moduleId
}

const curRow=ref()
const conditionDialogRef=ref()
const conditionScriptDialogRef=ref()
const buttonActionCfgDialogRef=ref()
const selectApi=ref({})
const openDialog=(type,row)=>{
  curRow.value=row
  if(type==='showCondition'){
    if(row.buttonType==='row'){
      if(!row.apiCode){
        message.warning("请选择模板API")
        return
      }
      conditionDialogRef.value.open(cloneDeep(row.conditionalTableRespVO))
      selectApi.value=formData.value.templateApiList.find(item=>item.apiCode===row.apiCode)
    }else{
      conditionScriptDialogRef.value.open(cloneDeep(row.conditionalTableRespVO))
    }
  }
  if(type==='showButtonActionCfg'){
    const curAPI=formData.value.templateApiList.find(item=>item.apiCode===row.apiCode)
    buttonActionCfgDialogRef.value.open(cloneDeep(row.showButtonActionCfg),curAPI?.moduleId)
    //selectApi.value=formData.value.templateApiList.find(item=>item.apiCode===row.apiCode)
  }
}
const configSuccess=(type,data)=>{
  if(type==='showCondition'){
    curRow.value.conditionalTableRespVO=data
  }
  if(type==='showButtonActionCfg'){
    curRow.value.showButtonActionCfg=data
  }
}

const clearCfg=(row,field)=>{
  row[field]=null
}
const selectOperationType=(val,row)=>{
  const operationItem=operationTypeOptions.value.find(item=>item.value===val)
  if(operationItem){
    row.buttonName=operationItem.label
    row.permissionSign=val!='custom'? val : ''
    if(operationItem.value==='create'){
      row.buttonStyle='primary'
    }
  }
}
</script>
<style lang="scss" scoped>
.action-button-container{
  height: calc(100vh - 150px);
  .table-content{
    height: calc(100% - 80px);
  }
}
</style>
