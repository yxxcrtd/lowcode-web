
<template>
  <div class="form-table-item">
    <vxe-table
      ref="vxeTableRef"
      :column-config="{resizable: true}"
      border="inner"
      stripe
      align="center"
      min-height="200"
      :data="renderFormData['list_' + curTable.tableId]"
    >
      <vxe-column title="序号" width="60" align="center" v-if="curTable.tableConfig.isShowIndex == 1">
        <template #default="{ rowIndex }">
          {{ rowIndex + 1 }}
        </template>
      </vxe-column>
      <template v-for="(col, index) in curTable.tableItems" :key="index">
        <vxe-column
          :align="col.align || 'center'"
          :footer-align="col.align || 'center'"
          :params="{ isTotalColumn: col.isTotalColumn, field: col.field }"
          :title="col.columnComment"
          :min-width="col.minWidth"
          v-if="!col.isHidden"
        >
          <template #header> <span class="requird-span" v-if="col.isRequire">*</span>{{ col.columnComment }} </template>
          <template #default="{ row }">
            <el-form-item
              label-width="0"
              :style="{ 'justify-content': alignValue(col.align) }"
              :prop="`['list_${formItem.tableId}'][${rowIndex}].${col.field}`"
              :rules="col.rules"
            >
              <FormItemDetail
                v-if="isDetail || col.isDisabled || !col.columnDisplayComponent"
                :value="row[col.labelField]"
                :componentType="col.columnDisplayComponent"
                :fieldConfig="col"
                :component-props="col.props"
                :align="col.align"
              >
              </FormItemDetail>
              <component
                v-else
                :is="col.columnDisplayComponent"
                v-model="row[col.field]"
                v-bind="col.props"
                @change="(val, option) => handleEvent('change', col, { val, option })"
                @keyup="(e) => handleEvent('keyup', col, { e })"
                @focus="(e) => handleEvent('focus', col, { e })"
                @blur="(e) => handleEvent('blur', col, { e })"
              >
              </component>
            </el-form-item>

          </template>
        </vxe-column>
      </template>
      <vxe-column field="action" title="操作" fixed="right" width="180">
        <template #default="{ row, rowIndex }">
          <div class="table-action">
            <el-link type="primary" @click="handleDelete(row, rowIndex)">删除</el-link>
          </div>
        </template>
      </vxe-column>
      <template #empty>
        <el-empty description="暂无数据"/>
      </template>
    </vxe-table>
  </div>
</template>
<script setup>
import { ref, watch } from 'vue'
import FormItemDetail from "@/comRender/render/v1/Components/RenderForm/Components/FormItemDetail.vue"
import {handleEvent} from "@/comRender/render/v1/Core/event";
import {propTypes} from "@/utils/propTypes";

const renderFormData=defineModel()
const props=defineProps({
  groupItem:{
    type:Object
  },
  formGroups:{
    type: Array,
  },
  isDetail: {
    type:Boolean
  }
})
const curTable=ref(null)
const initData=()=>{
  if(props.groupItem.formItems && props.groupItem.formItems.length){
    curTable.value=props.groupItem.formItems[0]
  }
}
initData()

/**
 * 获取变更事项原始数据-从业务系统接口获取
 * @param selectRows
 */
const getChangeItemOriData=(selectRows)=>{
  
}
</script>
<style lang="scss" scoped>
</style>
