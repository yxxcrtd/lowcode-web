<template>
  <div class="child-group">
    <template v-if="groupTabs && groupTabs.length">
      <el-tabs v-model="activeName" class="demo-tabs">
        <el-tab-pane v-for="(groupItem, groupItemIndex) in groupTabs" :label="groupItem.groupName" :name="groupItem.groupCode" :key="'child-group-tabs'+groupItemIndex">
          <template  v-if="groupItem.groupSlot">
            <RenderSlot
              v-if="groupItem.groupSlot"
              :slot-path="groupItem.groupSlot"
              v-model="renderFormData"
              :groupItem="groupItem"
              :isDetail="isDetail"
            ></RenderSlot>
          </template>
          <template v-else>
            <template v-for="(formItem, formItemIndex) in groupItem.formItems">
              <el-col
                :span="getColSpan(formItem)"
                :key="formItem.columnName + '_' + formItemIndex"
                v-if="!formItem.isHidden"
              >
                <template v-if="formItem.isTableItem">
                  <FormTableItem
                    v-if="formItem.tableConfig.editMode=='table'"
                    v-model="renderFormData"
                    :formItem="formItem"
                    :groupItem="groupItem"
                    :instance="instance"
                    :formTableProps="formTableProps"
                    :isDetail="isDetail"
                  />
                  <FormListItem
                    v-else
                    v-model="renderFormData"
                    :formItem="formItem"
                    :groupItem="groupItem"
                    :instance="instance"
                    :formTableProps="formTableProps"
                    :isDetail="isDetail"></FormListItem>
                </template>
                <template v-else>
                  <el-form-item
                    :prop="formItem.moduleTableId + '.' + formItem.field"
                    :rules="formItem.rules"
                    for="-"
                  >
                    <template #label>
                      <ace-ellipsis>{{formItem.columnComment}}</ace-ellipsis>：
                    </template>
                    <FormItemDetail
                      v-if="isDetail || formItem.isDisabled"
                      :value="renderFormData[formItem.moduleTableId][formItem.labelField]"
                      :fieldConfig="formItem"
                      :formData="renderFormData"
                      :componentType="formItem.columnDisplayComponent"
                      :component-props="formItem.props"
                    >
                    </FormItemDetail>
                    <component
                      v-else
                      :is="formItem.columnDisplayComponent"
                      v-bind="formItem.props"
                      v-model="renderFormData[formItem.moduleTableId][formItem.field]"
                      :pageListConfigs="instance.props.formLayouts.pageListConfigs"
                      :formData="renderFormData"
                      @change="(val, option) => handleComponentEvent('change', formItem,{ val, option })"
                      @keyup="(e) => handleComponentEvent('keyup', formItem, { e })"
                      @focus="(e) => handleComponentEvent('focus', formItem, { e })"
                      @blur="(e) => handleComponentEvent('blur', formItem, { e })"
                    >
                    </component>
                  </el-form-item>
                </template>
              </el-col>
            </template>
          </template>
        </el-tab-pane>
      </el-tabs>
    </template>
    <template v-for="(groupItem, groupItemIndex) in notTabsGroup" :key="'childGroupItem-' + groupItemIndex">
      <template v-if="groupItem.groupDisplay==='table'">
        <table class="group-table-content" :class="'child-group-item-'+groupItem.groupCode">
          <tr v-if="groupItem.groupTitle">
            <th class="table-td-header" v-for="(tableTitle,tableTitleIndex) in groupItem.groupTableTitles" :key="'table-td-title'+tableTitleIndex">{{tableTitle}}</th>
          </tr>
          <tr v-for="(formItem, formItemIndex) in groupItem.formItems.filter(item=>!item.isHidden)" :key="'childGroupItem-table-tr' + formItemIndex">
            <td class="td-title">
              <span class="requird-span" v-if="formItem.isRequire">*</span><span>{{getLabel(formItem.columnComment)}}</span>
            </td>
            <td class="td-form-item" v-if="formItem.moduleTableId">
              <el-form-item
                :prop="formItem.moduleTableId + '.' + formItem.field"
                :rules="formItem.rules"
                for="-"
              >
                <FormItemDetail
                  v-if="isDetail || formItem.isDisabled"
                  :value="renderFormData[formItem.moduleTableId][formItem.labelField]"
                  :fieldConfig="formItem"
                  :formData="renderFormData"
                  :componentType="formItem.columnDisplayComponent"
                  :component-props="formItem.props"
                >
                </FormItemDetail>
                <component
                  v-else
                  :is="formItem.columnDisplayComponent"
                  v-bind="formItem.props"
                  v-model="renderFormData[formItem.moduleTableId][formItem.field]"
                  :pageListConfigs="instance.props.formLayouts.pageListConfigs"
                  :formData="renderFormData"
                  @change="(val, option) => handleComponentEvent('change', formItem,{ val, option })"
                  @keyup="(e) => handleComponentEvent('keyup', formItem, { e })"
                  @focus="(e) => handleComponentEvent('focus', formItem, { e })"
                  @blur="(e) => handleComponentEvent('blur', formItem, { e })"
                >
                </component>
              </el-form-item>
            </td>
          </tr>
        </table>
      </template>
      <template v-else-if="groupItem.groupDisplay==='mergedTable'">
        <table class="group-table-content">
          <tr v-if="groupItem.groupTitle">
            <th></th>
            <th class="table-td-header" v-for="(tableTitle,tableTitleIndex) in groupItem.groupTableTitles" :key="'table-td-title'+tableTitleIndex">{{tableTitle}}</th>
          </tr>
          <tr v-for="(formItem, formItemIndex) in groupItem.formItems.filter(item=>!item.isHidden)" :key="'childGroupItem-table-tr' + formItemIndex">
            <td class="td-form-group" :rowspan="groupItem.formItems.length" v-if="formItemIndex==0">
              {{groupItem.groupName}}
            </td>
            <td class="td-title">
              <span class="requird-span" v-if="formItem.isRequire">*</span>
              <span>{{getLabel(formItem.columnComment)}}</span>
            </td>
            <td class="td-form-item">
              <el-form-item
                :label-width="0"
                :prop="formItem.moduleTableId + '.' + formItem.field"
                :rules="formItem.rules"
              >
                <FormItemDetail
                  v-if="false && (isDetail || formItem.isHidden)"
                  :value="renderFormData[formItem.moduleTableId][formItem.labelField]"
                  :fieldConfig="formItem"
                  :formData="renderFormData"
                  :componentType="formItem.columnDisplayComponent"
                  :component-props="formItem.props"
                >
                </FormItemDetail>
                <component
                  v-else
                  :is="formItem.columnDisplayComponent"
                  v-bind="formItem.props"
                  v-model="renderFormData[formItem.moduleTableId][formItem.field]"
                  :disabled="isDetail || formItem.isDisabled"
                  :pageListConfigs="instance.props.formLayouts.pageListConfigs"
                  :formData="renderFormData"
                  @change="(val, option) => handleComponentEvent('change', formItem,{ val, option })"
                  @keyup="(e) => handleComponentEvent('keyup', formItem, { e })"
                  @focus="(e) => handleComponentEvent('focus', formItem, { e })"
                  @blur="(e) => handleComponentEvent('blur', formItem, { e })"
                >
                </component>
              </el-form-item>
            </td>
          </tr>
        </table>
      </template>
      <template v-else-if="groupItem.groupDisplay==='tabs'">
        <template v-for="(formItem, formItemIndex) in groupItem.formItems">
          <el-col
            :span="getColSpan(formItem)"
            :key="formItem.columnName + '_' + formItemIndex"
            v-if="!formItem.isHidden"
          >
            <template v-if="formItem.isTableItem">
              <FormTableItem
                v-if="formItem.tableConfig.editMode=='table'"
                v-model="renderFormData"
                :formItem="formItem"
                :instance="instance"
                :groupItem="groupItem"
                :formTableProps="formTableProps"
                :isDetail="isDetail"
              />
              <FormListItem
                v-else
                v-model="renderFormData"
                :formItem="formItem"
                :instance="instance"
                :groupItem="groupItem"
                :formTableProps="formTableProps"
                :isDetail="isDetail"></FormListItem>
            </template>
            <template v-else>
              <el-form-item
                :prop="formItem.moduleTableId + '.' + formItem.field"
                :rules="formItem.rules"
                for="-"
              >
                <template #label>
                  <FormItemLabel :label="formItem.columnComment" :tips="formItem.columnHeadTips"></FormItemLabel>
                </template>
                <FormItemDetail
                  v-if="isDetail || formItem.isDisabled"
                  :value="renderFormData[formItem.moduleTableId][formItem.labelField]"
                  :fieldConfig="formItem"
                  :formData="renderFormData"
                  :componentType="formItem.columnDisplayComponent"
                  :component-props="formItem.props"
                >
                </FormItemDetail>
                <component
                  v-else
                  :is="formItem.columnDisplayComponent"
                  v-bind="formItem.props"
                  v-model="renderFormData[formItem.moduleTableId][formItem.field]"
                  :pageListConfigs="instance.props.formLayouts.pageListConfigs"
                  :formData="renderFormData"
                  @change="(val, option) => handleComponentEvent('change', formItem,{ val, option })"
                  @keyup="(e) => handleComponentEvent('keyup', formItem, { e })"
                  @focus="(e) => handleComponentEvent('focus', formItem, { e })"
                  @blur="(e) => handleComponentEvent('blur', formItem, { e })"
                >
                </component>
              </el-form-item>
            </template>
          </el-col>
        </template>
      </template>
      <template v-else>
<!--        <div class="group-title">{{groupItem.groupName}}</div>-->
        <el-row :gutter="10">
        <template v-for="(formItem, formItemIndex) in groupItem.formItems">
          <el-col
            :span="getColSpan(formItem)"
            :key="formItem.columnName + '_' + formItemIndex"
            v-if="!formItem.isHidden"
          >
            <template v-if="formItem.isTableItem">
              <FormListItem
                v-if="formItem.tableConfig.editMode=='form'"
                v-model="renderFormData"
                :formItem="formItem"
                :groupItem="groupItem"
                :instance="instance"
                :formTableProps="formTableProps"
                :isDetail="isDetail"></FormListItem>
              <FormTableItem
                v-else
                v-model="renderFormData"
                :formItem="formItem"
                :groupItem="groupItem"
                :instance="instance"
                :formTableProps="formTableProps"
                :isDetail="isDetail"
              />
            </template>
            <template v-else>
              <el-form-item
                :label-width="formItem.columnHeadWidth ? formItem.columnHeadWidth+'px' : (pageInfo.labelWidth==='auto' ? 'auto' : (pageInfo.labelWidth || 160)+'px')"
                :prop="formItem.moduleTableId + '.' + formItem.field"
                :rules="formItem.rules"
                for="-"
              >
                <template #label>
                  <FormItemLabel :label="formItem.columnComment" :tips="formItem.columnHeadTips"></FormItemLabel>
                </template>
                <FormItemDetail
                  v-if="isDetail || formItem.isDisabled"
                  :value="renderFormData[formItem.moduleTableId][formItem.labelField]"
                  :fieldConfig="formItem"
                  :formData="renderFormData"
                  :componentType="formItem.columnDisplayComponent"
                  :component-props="formItem.props"
                >
                </FormItemDetail>
                <component
                  v-else
                  :is="formItem.columnDisplayComponent"
                  v-bind="formItem.props"
                  v-model="renderFormData[formItem.moduleTableId][formItem.field]"
                  :pageListConfigs="instance.props.formLayouts.pageListConfigs"
                  :formData="renderFormData"
                  @change="(val, option) => handleComponentEvent('change', formItem,{ val, option })"
                  @keyup="(e) => handleComponentEvent('keyup', formItem, { e })"
                  @focus="(e) => handleComponentEvent('focus', formItem, { e })"
                  @blur="(e) => handleComponentEvent('blur', formItem, { e })"
                >
                </component>
              </el-form-item>
            </template>
          </el-col>
        </template>
        </el-row>
      </template>
    </template>
  </div>
</template>
<script setup lang="ts">
import {propTypes} from "@/utils/propTypes";
import {handleEvent} from "@/comRender/render/v1/Core/event";
import FormItemDetail from "./FormItemDetail.vue";
import FormTableItem from "../FormTableItem.vue";
import FormListItem from "../FormListItem.vue";
import FormItemLabel from "../Components/FormItemLabel.vue";
import RenderSlot from '@/comRender/Components/RenderSlot/index.vue'

const renderFormData:any=defineModel()

const props=defineProps({
  groupItems:propTypes.array,
  isTableItem: propTypes.bool.def(false),
  pageInfo:propTypes.object,
  instance:propTypes.object,
  formTableProps: propTypes.object,
  isDetail: propTypes.bool.def(false)
})
const groupTabs=computed(()=>{
  return props.groupItems.filter((item:any)=>item.groupDisplay==='tabs')
})
const notTabsGroup=computed(()=>{
  return props.groupItems.map((item:any)=>{
    return {
      ...item,
      groupTableTitles:item.groupTitle && item.groupTitle.split(/[，,]/)|| [],
    }
  }).filter(item=>!item.isHidden && item.groupDisplay!=='tabs')
})
const activeName=ref()
/**
 * 获取表单列span值
 * @param formItem
 */
const getColSpan=(formItem)=>{
  //表格或抽屉弹框，固定按12展示
  if(props.isTableItem){
    return 12
  }
  //如果是表单内部子表的表单，跨行显示
  if(formItem.isTableItem){
    return 24
  }
  //字段设置>页面设置>默认值
  return Number(formItem.columnSpan) || Number(props.pageInfo.columnSpan) || 8
}

const getLabel=(text)=>{
  return text+'：'
}
/**
 * 组件默认事件统一触发
 * @param eventType
 * @param formItem
 * @param data
 */
const handleComponentEvent=(eventType,formItem,data)=>{
  // console.log(eventType,formItem,data,renderFormData.value)
  handleEvent(eventType,formItem,props.instance,renderFormData.value,data)
}

onMounted(()=>{
  if(groupTabs.value && groupTabs.value.length){
    activeName.value=groupTabs.value[0].groupCode
  }
})
</script>
<style scoped lang="scss">
.group-table-content{
  table-layout: auto; /* 默认值，列宽根据内容调整 */
  width: 100%;
  padding: 0;
  margin: 10px 0;
  border-collapse: collapse; /* 合并表格边框 */
  border: 1px solid #ccc; /* 设置表格边框样式和颜色 */
  .table-td-header{
    background: rgb(247, 249, 250);
  }
  th,td{
    border: 1px solid #ddd;
  }
  .td-form-group{
    width: 100px;
    text-align: center;
  }
  .td-title{
    width: 200px;
    background: rgb(247, 249, 250);
    text-align: right;
    height: 38px;
  }
  .td-form-item{
    text-align: left;
    padding: 10px;
    :deep(.el-form-item--default){
      margin-bottom: 0;
    }
    :deep(.el-form-item__content){
      margin-left: 0!important;
    }
  }
}
.group-title{
  margin: 10px 0;
  font-size: 16px;
  font-weight: 600;
}
</style>
