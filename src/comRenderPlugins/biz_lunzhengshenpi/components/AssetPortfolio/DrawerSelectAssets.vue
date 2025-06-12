<template>
  <el-drawer title="选择资产" v-model="dialogVisible" size="75%" class="drawer-select-asseta-wrap">
    <div class="dialog-wrap">
      <el-card shadow="never" class="left BBW">
        <template #header>
          <div class="clearfix">
            <div class="card_header">
              <span>非标资产</span>
              <div class="input_wrapper">
                <el-form-item label="资产" label-width="auto">
                  <ace-input
                    uiType="text"
                    labelWidth="80px"
                    placeholder="请输入资产名称或资产编号检索"
                    @change="getTableData('nonStandard')"
                    v-model="searchQuery.nonStandardAssetNoOrNameLike"
                    class="BBW head"
                    style="width: 350px"
                  >
                  </ace-input>
                </el-form-item>
              </div>
            </div>
          </div>
        </template>
        <div>
          <JVxeTable
            ref="nonStandardTableRef"
            :columns="nonStandardTableColumns"
            :show-check-box="true"
            :checkBoxConfig="{trigger: 'row',checkMethod:checkMethod}"
            :row-height="48"
            :height="300"
            :row-class-name="setRowClass"
            :data-fun="getNoStandardTableList"
          >
          </JVxeTable>
        </div>
      </el-card>
      <el-card shadow="never" class="left BBW">
        <template #header>
          <div class="clearfix">
            <div class="card_header">
              <span>标品资产</span>
              <div class="input_wrapper">
                <el-form-item label="资产类型" label-width="auto">
                  <ace-select
                    v-model="searchQuery.standardAssetType"
                    prop="investBreed"
                    dataSource="ASSET_TYPE"
                    showLabelTooltip="true"
                    showMore="tooltip"
                    showEllipsis
                    multiple
                    style="margin-right: 60px;width: 300px;"
                    @change="getTableData('standard')"
                  ></ace-select>
                </el-form-item>
                <el-form-item label="资产" label-width="auto">
                  <ace-input
                    uiType="text"
                    @change="getTableData('standard')"
                    labelWidth="80px"
                    placeholder="请输入资产名称或资产编号检索"
                    v-model="searchQuery.standardAssetNoOrNameLike"
                    class="BBW head"
                    style="width: 350px"
                  >
                  </ace-input>
                </el-form-item>
              </div>
            </div>
          </div>
        </template>
        <div>
          <JVxeTable
            ref="standardTableRef"
            :columns="standardTableColumns"
            :show-check-box="true"
            :checkBoxConfig="{trigger: 'row',checkMethod:checkMethod}"
            :row-height="48"
            :height="300"
            :row-class-name="setRowClass"
            :data-fun="getStandardTableList"
          >
          </JVxeTable>
        </div>
      </el-card>
      <el-card shadow="never" class="left BBW">
        <template #header>
          <div class="clearfix">
            <div class="card_header">
              <span>内部资产</span>
              <div class="input_wrapper">
                <el-form-item label="信托产品" label-width="auto">
                  <ace-input
                    uiType="text"
                    @change="getTableData('internal')"
                    labelWidth="80px"
                    placeholder="请输入信托产品代码或信托产品全称检索"
                    label="信托产品"
                    v-model="searchQuery.internalAssetNoOrNameLike"
                    class="BBW head"
                    style="width: 350px"
                  >
                  </ace-input>
                </el-form-item>
              </div>
            </div>
          </div>
        </template>
        <div>
          <JVxeTable
            ref="internalTableRef"
            :columns="internalTableColumns"
            :show-check-box="true"
            :checkBoxConfig="{trigger: 'row',checkMethod:checkMethod}"
            :row-height="48"
            :height="300"
            :row-class-name="setRowClass"
            :data-fun="getInternalTableList"
          >
          </JVxeTable>
        </div>
      </el-card>
    </div>
    <template #footer>
      <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="submitForm">确 定</el-button>
      </span>
    </template>
  </el-drawer>
</template>
<script lang="ts" setup>
import { ref } from 'vue'
import { cloneDeep } from 'lodash-es'
import { internalTableColumns, nonStandardTableColumns, standardTableColumns } from './data'
import {getInternalTableData, getNoStandardTableData, getStandardTableData} from "./api";

defineOptions({ name: 'DrawerRowForm' })

const message = useMessage() // 消息弹窗
const dialogVisible = ref(false)
const bizType = ref('create')
const formData = ref({})

const searchQuery=ref({
  nonStandardAssetNoOrNameLike:null,
  standardAssetType:[],
  standardAssetNoOrNameLike:null,
  internalAssetNoOrNameLike:null,
})

const choosedListIds=ref([])
/** 打开弹窗 */
/**
 * 打开抽屉
 * @param type 打开类型
 * @param data 已选数据
 */
const open = async (type: string,data) => {
  bizType.value = type
  dialogVisible.value = true
  choosedListIds.value=data
}
const checkMethod=({row})=>{
  return !choosedListIds.value.includes(row.id)
}
const setRowClass=({row})=>{
  return choosedListIds.value.includes(row.id) ? 'is-choosed' : ''
}

const nonStandardTableRef = ref()
const standardTableRef = ref()
const internalTableRef = ref()
const getTableData = (type) => {
  if (type == 'nonStandard') {
    nonStandardTableRef.value.refresh()
  } else if (type == 'standard') {
    standardTableRef.value.refresh()
  } else {
    internalTableRef.value.refresh()
  }
}
const getNoStandardTableList=async (paramer)=>{
  const param={
    assetNoOrNameLike:searchQuery.value.nonStandardAssetNoOrNameLike,
    ...paramer,
  }
  const res=await getNoStandardTableData(param)
  return res.records
}
const getStandardTableList=(paramer)=>{
  const param={
    standardAssetType:searchQuery.value.standardAssetType,
    assetNoOrNameLike:searchQuery.value.standardAssetNoOrNameLike,
    ...paramer,
  }
  return getStandardTableData(param)
}
const getInternalTableList=(paramer)=>{
  const param={
    keywordLike:searchQuery.value.internalAssetNoOrNameLike,
    ...paramer,
  }
  return getInternalTableData(param)
}


defineExpose({ open }) // 提供 open 方法，用于打开弹窗

const emits = defineEmits(['success'])
/**
 * 抽屉确定按钮
 */
const submitForm = async () => {
  const checkRows=[
    ...nonStandardTableRef.value.getCheckboxRecords().map(item=>({
      ...item,
      id:null,
      assetId:item.id,
      bottomAssetName:item.assetName,
      bottomAssetCode:item.assetNo,
      allScale:item.totalQuota,
      surplusScale:item.remainingQuota,
      assetType:'1',
      assetTypeAsText:'非标资产'
    })),
    ...standardTableRef.value.getCheckboxRecords().map(item=>({
      ...item,
      id:null,
      assetId:item.id,
      assetType:'0',
      assetTypeAsText:'标品资产'
    })),
    ...internalTableRef.value.getCheckboxRecords().map(item=>({
      ...item,
      id:null,
      assetId:item.id,
      bottomAssetCode:item.projectCode,
      bottomAssetName:item.projectName,
      assetType:'2',
      assetTypeAsText:'内部资产'
    }))
  ]
  console.log('checkRows',checkRows)
  emits('success', checkRows)
  nonStandardTableRef.value.clearCheckboxRow()
  standardTableRef.value.clearCheckboxRow()
  internalTableRef.value.clearCheckboxRow()
  dialogVisible.value = false
}
</script>

<style scoped lang="scss">
.drawer-select-asseta-wrap {
  .card_header{
    display: flex;
    justify-content: space-between;
    >span{

      color: #333;
      font-weight: 700;
      line-height: 26px;
      font-size: 16px;
      font-family: HanSans;
    }
    &::before{
      content: "";
      position: absolute;
      left: 10px;
      top: 23px;
      transform: translateY(-50%);
      width: 4px;
      height: 19px;
      background-color: #cfa479;
    }
    .input_wrapper{
      display: flex;
    }
  }
}
:deep(.el-card){
  margin-bottom:12px;
}
:deep(.el-card__header){
  padding:10px 20px;
  position: relative;
}
:deep(.el-form-item--default){
  margin-bottom: 0!important;
}
:deep(.is-choosed){
  color: #cccccc;
}
</style>
