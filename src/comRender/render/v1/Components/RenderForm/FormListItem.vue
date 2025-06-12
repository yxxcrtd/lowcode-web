<template>
  <div class="form-list-item">
    <div>
      <el-collapse
        v-model="activeNames"
        class="form-list-item-col"
      >
        <transition-group
          name="animate__animated animate__bounce"
          enter-active-class="animate__bounceInLeft"
          leave-active-class="animate__bounceOutRight">
          <el-collapse-item
            class="form-list-item-col-item item"
            :name="'form-list-'+row.rowKey"
            v-for="(row,rowIndex) in formData['list_'+formItem.tableId]"
            :key="'form-list-item-data-'+row.rowKey"
          >
            <template #title>
              <div class="col-item-header">
                <div class="left">
                  <span class="col-index" v-if="formItem.tableConfig.isShowIndex==1">{{rowIndex+1}}</span>
                  <span>{{groupItem.groupName}}明细</span>
                </div>
                <div class="right">
                  <el-popconfirm
                    width="200"
                    placement="top"
                    title="确定删除该条记录?"
                    @confirm.stop="handleDelete(row,rowIndex)"
                    v-if="isShowDeleteBtn"
                  >
                    <template #reference>
                      <el-link type="danger" :icon="Delete" @click.stop="handleDel">删除</el-link>
                    </template>
                  </el-popconfirm>
                </div>
              </div>
            </template>
            <el-row :gutter="10">
              <template v-for="(col,index) in formItem.tableItems" :key="'form-list-item_' + index">
                <el-col
                  :span="col.columnSpan || 8"
                  :key="col.columnName + '_' + index"
                  v-if="!col.isHidden"
                >
                  <el-form-item :prop="`['list_${formItem.tableId}'][${rowIndex}].${col.field}`" :rules="col.rules">
                    <template #label>
                      <FormItemLabel :label="col.columnComment" :tips="col.columnHeadTips"></FormItemLabel>
                    </template>
                    <FormItemDetail
                      v-if="isDetail || col.isDisabled"
                      :value="row[col.labelField]"
                      :rowData="row"
                      :componentType="col.columnDisplayComponent"
                      :component-props="col.props"
                      :fieldConfig="col"
                    >
                    </FormItemDetail>
                    <component
                      v-else
                      :is="col.columnDisplayComponent"
                      v-model="row[col.field]"
                      v-bind="col.props"
                      @change="(val,option)=>handleEvent('change',col,{val,option})"
                      @keyup="(e)=>handleEvent('keyup',col,{e})"
                      @focus="(e)=>handleEvent('focus',col,{e})"
                      @blur="(e)=>handleEvent('blur',col,{e})"
                    >
                    </component>
                  </el-form-item>
                </el-col>
              </template>
            </el-row>
          </el-collapse-item>
        </transition-group>
      </el-collapse>
    </div>
    <el-button v-if="!isDetail && isShowAddBtn" type="primary" class="mb-10px mt-10px" @click="newAdd">新增</el-button>
  </div>
</template>
<script setup lang="ts">
import {ref} from 'vue'
import {propTypes} from "@/utils/propTypes";
import {Delete} from '@element-plus/icons-vue'
import {getDefValue} from './js/defaultValue'
import {handleEvent} from "@/comRender/render/v1/Core/event";
import {generateUUID} from "@/utils";
import FormItemDetail from './Components/FormItemDetail.vue'
import FormItemLabel from "./Components/FormItemLabel.vue";

const formData:any=defineModel()

const props=defineProps({
  bizType:propTypes.string.def('add'),
  instance:propTypes.object,
  formItem:propTypes.object,
  groupItem:propTypes.object,
  formTableProps:propTypes.object,
  isDetail:propTypes.bool
})

const activeNames=ref([])
watch(
  ()=>formData.value['list_'+props.formItem.tableId],
  (val,oldVal)=>{
    if(val && (!oldVal || oldVal.length==0)){
      console.log('val,old',val,oldVal)
      if(formData.value['list_'+props.formItem.tableId] && formData.value['list_'+props.formItem.tableId].length>0){
        formData.value['list_'+props.formItem.tableId].forEach((item,index)=>{
          item.rowKey=generateUUID()
          activeNames.value.push('form-list-'+item.rowKey)
        })
      }
    }
  }
)


const isShowAddBtn=computed(()=>{
  //判断子表是否所有字段都是只读
  const isAllDisabled = props.formItem.tableItems.filter(item=>!item.isHidden).every((item) => item.isDisabled)
  if (isAllDisabled) {
    return !isAllDisabled
  }
  if(props.formItem.tableConfig.isNotAllowAdd=='1'){
    return false
  }
  return props.formTableProps?.showBtnFun()
})
const isShowDeleteBtn=computed(()=>{
  if(props.formItem.tableConfig.isHiddenAction=='1'){
    return false
  }
  return !props.isDetail && props.formTableProps?.showBtnFun() && props.formItem.tableItems.some(item=>!item.isDisabled)
})
/**
 * 新增记录
 */
const newAdd=()=>{
  const rowKey=generateUUID()
  const newRowItem={
    rowKey:rowKey
  }
  props.formItem.tableItems.forEach(item=>{
    if(item.defValue){
      newRowItem[item.field]=getDefValue(props.instance,item,[],newRowItem,item.defValue)
    }
  })
  formData.value['list_'+props.formItem.tableId].push(newRowItem)
  
  activeNames.value.push('form-list-'+rowKey)
}
/**
 * 删除记录
 * @param row
 * @param rowIndex
 */
const handleDelete=(row,rowIndex)=>{
  formData.value['list_'+props.formItem.tableId].splice(rowIndex,1)
}
const handleDel=()=>{
  
}
</script>
<style scoped lang="scss">
.form-list-item{
  margin-bottom: 10px;
  .form-list-item-col{
    border: none;
    .form-list-item-col-item{
      border-radius: 8px;
      padding: 10px;
      background: #f3f9ff;
      :deep(.el-collapse-item__header){
        padding-left:4px;
        background: transparent;
        border-bottom: 1px solid #afcfff;
        .col-item-header{
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          padding-right: 14px;
        }
        &::before{
          content:'';
          display: none;
        }
        .el-link--danger{
          height: 22px;
        }
      }

      :deep(.el-collapse-item__wrap){
        background: transparent;
      }
      .left{
        display: flex;
        align-items: center;
        .col-index{
          display: inline-block;
          padding: 0 8px;
          height: 24px;
          line-height: 24px;
          background-color: #409eff;
          color: #fff;
          border-radius: 5px;
          margin-right: 6px;
        }
      }
    }
  }
}

/* 定义添加和删除动画 */
.list-enter-active, .list-leave-active {
  transition: all 0.5s;
}

.list-enter-from, .list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

/* 确保删除的元素在动画结束后被移除 */
.list-leave-active {
  position: absolute;
}

/* 确保列表项在删除时不会影响其他项的位置 */
.list-move {
  transition: transform 0.5s;
}
</style>
