<template>
   <div class="oprate-button-warp-noselect"> 
    <el-button type="primary" @click="openForm('create')"> 新建事件 </el-button>
   </div>
  <!-- <div class="btn-action">
  </div> -->
  <JVxeTable ref="jVxeTable" v-if="isLoadTable" :columns="eventColumns" :row-height="58" :data-source="formData.eventList" :tablePageConfig="{enabled:false}">
    <template #executableCode_default="{ row }">
      <el-button text type="primary" @click="openDialog('linkage', row)" size="small" > 查看代码 </el-button>
    </template>
    <template #action_default="{ row,rowIndex }">
      <div class="table-action">
        <el-link type="primary" @click="handleEdit(row,rowIndex)">编辑</el-link>
        <el-divider direction="vertical" />
        <el-link type="primary" @click="handleDelete(rowIndex)">删除</el-link>
      </div>
    </template>
  </JVxeTable>
  <ExpandEventDialog ref="expandEventDialogRef" :api-list="formData.templateApiList" @success="eventSuccess"/>
  <ExpandEventCodeDialog ref="expandEventCodeDialogRef" :api-list="formData.templateApiList" @success="eventSuccess"/>
</template>
<script lang="ts" setup>
import { ref } from 'vue'
import { cloneDeep } from 'lodash-es'
import { eventColumns } from '../../../../data'
import ExpandEventDialog from '../../../../../Components/ExpandEventDialog.vue'
import ExpandEventCodeDialog from '../../../../../Components/ExpandEventCodeDialog.vue'

defineOptions({ name: 'EditDialog' })

const formData=defineModel()

const message = useMessage() // 消息弹窗

const expandEventDialogRef=ref()

const expandEventCodeDialogRef=ref()
/**
 * 新增
 * @param type
 * @param eventInfo
 */
const openForm=(type,eventInfo)=>{
  expandEventDialogRef.value.open(type,cloneDeep(eventInfo))
}
/**
 * 查看代码
 * @param type
 * @param eventInfo
 */
const openDialog = (type,eventInfo) => {
  expandEventCodeDialogRef.value.open(type,cloneDeep(eventInfo))
}
/**
 * 编辑
 * @param row
 */
const curRowIndex=ref(-1)
const handleEdit=(row,rowIndex)=>{
  curRowIndex.value=rowIndex
  openForm('edit',cloneDeep(row))
}
/**
 * 删除
 * @param row
 */
const handleDelete=(rowIndex)=>{
  formData.value.eventList.splice(rowIndex,1)
}
const isLoadTable=ref(true)
const eventSuccess=async (type,eventInfo)=>{
  isLoadTable.value=false
  await nextTick()
  if(type==='create'){
    console.log(type,eventInfo,curRowIndex.value)
    formData.value.eventList.push(eventInfo)
  }else{
    console.log(type,eventInfo,curRowIndex.value)
    formData.value.eventList[curRowIndex.value]=cloneDeep(eventInfo)
  }
  isLoadTable.value=true
}
</script>
<style lang="scss" scoped>
:deep(.vxe-body--row) {
  height: 56px;
}
</style>
