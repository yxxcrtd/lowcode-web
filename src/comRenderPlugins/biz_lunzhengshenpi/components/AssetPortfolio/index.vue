
<template>
  <div class="form-table-item">
    <div class="form-table-header">
      <div class="form-table-title">{{ curGroup.tableConfig.tableTitle }}</div>
      <el-button v-if="!isDisabled" type="primary" class="mb-10px mt-10px" @click="handleSelectAssets">选择资产</el-button>
    </div>
    <vxe-table
      ref="vxeTableRef"
      :column-config="{resizable: true}"
      border="inner"
      stripe
      align="center"
      min-height="200"
      :data="renderFormData['list_' + curGroup.tableId]"
    >
      <vxe-column title="序号" width="60" align="center" v-if="curGroup.tableConfig.isShowIndex == 1">
        <template #default="{ rowIndex }">
          {{ rowIndex + 1 }}
        </template>
      </vxe-column>
      <template v-for="(col, index) in curGroup.tableItems" :key="index">
        <vxe-column
          :align="col.align || 'center'"
          :footer-align="col.align || 'center'"
          :params="{ isTotalColumn: col.isTotalColumn, field: col.field }"
          :title="col.columnComment"
          :min-width="col.minWidth"
          v-if="!col.isHidden"
        >
          <template #header> <span class="requird-span" v-if="col.isRequire">*</span>{{ col.columnComment }} </template>
          <template #default="{ row,rowIndex }">
            <el-form-item
              label-width="0"
              :style="{ 'justify-content': alignValue(col.align) }"
              :prop="`['list_${curGroup.tableId}'][${rowIndex}].${col.field}`"
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
                @change="(val, option) => handleChange(val, option,row,col)"
              >
              </component>
            </el-form-item>
            
          </template>
        </vxe-column>
      </template>
      <vxe-column v-if="!isDisabled" field="action" title="操作" fixed="right" width="180">
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
  <DrawerSelectAssets ref="drawerSelectAssets" @success="tableSelectSuccess"></DrawerSelectAssets>
</template>
<script setup>
import {computed, ref, watch} from 'vue'
import DrawerSelectAssets from "./DrawerSelectAssets.vue";
import FormItemDetail from "@/comRender/render/v1/Components/RenderForm/Components/FormItemDetail.vue"
import BigNumberUtils from '@/utils/bigNumberUtil';

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
const curGroup=ref(null)
if(props.groupItem.formItems && props.groupItem.formItems.length){
  curGroup.value=props.groupItem.formItems[0]
}
const isDisabled=computed(()=>{
  return curGroup.value.tableItems?.every(item=>item.isDisabled || item.isHidden)
})

const handleChange=(val, option,row,col)=>{
  computedInvestUp()
}

const drawerSelectAssets=ref()
const handleSelectAssets=()=>{
  const choosedAssetIds=renderFormData.value['list_' + curGroup.value.tableId].map(item=>item['ASSET_ID_1891433037852061697'])
  drawerSelectAssets.value.open('create',choosedAssetIds)
}
const tableSelectSuccess=(selectRows)=>{
  selectRows.forEach((item,index)=>{
    renderFormData.value['list_' + curGroup.value.tableId].push({
      'ASSET_NAME_1891433037852061697':item.bottomAssetName,
      'ASSET_ID_1891433037852061697':item.assetId,
      'ASSET_TYPE_1891433037852061697':item.assetTypeAsText,
    })
  })
  computedInvestUp()
}
/**
 * 删除记录
 * @param row
 * @param rowIndex
 */
const handleDelete = (row, rowIndex) => {
  renderFormData.value['list_' + curGroup.value.tableId].splice(rowIndex, 1)
  computedInvestUp()
}
/**
 * 计算占比
 */
const computedInvestUp=()=>{
  const totalAmt=renderFormData.value['list_' + curGroup.value.tableId].reduce((total,item)=>{
    return BigNumberUtils.add(total,item['CURR_SCALE_'+curGroup.value.tableId])
  },0)
  renderFormData.value['list_' + curGroup.value.tableId].forEach(row=>{
    const curAmt=Number(row['CURR_SCALE_'+curGroup.value.tableId])
    row['EXPECT_INVEST_UP_'+ curGroup.value.tableId]=BigNumberUtils.divide(curAmt,totalAmt,4)
  })
}

// 添加一个计算属性可以获得align
const alignValue = computed(() => {
  return (val) => {
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
</script>
<style lang="scss" scoped>
.batch-download{
  cursor:pointer;
}
.excel-analysis {
  background: #fff;
  padding: 2px 24px;
  padding-bottom: 24px;
  h4{
    color:#4f5565;
  }
}
::v-deep .el-card__header {
  padding: 10px 15px;
  font-size: 15px;
  font-weight: 600;
}
.excel-upload {
  padding: 20px;
  background: #fff;

  h3 {
    margin-bottom: 16px;
    font-size: 14px;
    color: #333;
  }
}

.file-list {
  // background: #f5f7fa;
  border-radius: 4px;
  // padding: 16px;
  .title{
    font-size: 16px;
  font-weight: bold;
  background: #cde2fc;
  color: #333;
  padding: 12px;
  border-radius:4px;
  }
}

.file-item {
  .file-type {
    color: #666;
    font-size: 14px;
    margin-bottom: 12px;
    display: block;
  }

  .file-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #fff;
    padding: 12px 16px;
    border-radius: 4px;

    .info-left {
      display: flex;
      align-items: center;
      gap: 24px;

      .file-name {
        color: #1890ff;
      }

      .file-size,
      .file-time {
        color: #999;
      }
    }

    .info-right {
      display: flex;
      gap: 16px;

      .action-btn {
        color: #1890ff;
        cursor: pointer;

        &:hover {
          opacity: 0.8;
        }
      }
    }
  }
}
.download-btn {
  color: #1890ff;
}
</style>
