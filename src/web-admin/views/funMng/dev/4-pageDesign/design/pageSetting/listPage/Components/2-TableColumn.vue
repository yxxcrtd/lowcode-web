<template>
  <el-form :model="tableData" ref="formRef" label-width="0">
    <div class="oprate-button-warp">
      <!--      <el-button type="primary" class="mb-10px" @click="openDialog('formSetting')"> 表格设置 </el-button>-->
      <el-checkbox class="show-only-checked" v-model="isOnlyShowChecked" @change="onlyShowChecked"
        >仅显示已选展示列</el-checkbox
      >
    </div>
    <div class="pane-wrap">
      <div class="datamodel-content">
        <div class="content-left listpage-choosemodel">
          <ChooseModelTable
            showType="model"
            pageType="list"
            :template-api-list="formData.templateApiList"
            @change-api="handleChangeApi"
            @choose-model="handleChooseModel"
          ></ChooseModelTable>
        </div>
        <div class="conent-right">
          <div class="table-content">
            <vxe-table border="inner" height="100%"
                       :row-config="{isCurrent: true, isHover: true}"
                       :data="tableData">
              <vxe-column type="seq" title="序号" width="60" align="center" fixed="left" />
              <vxe-column field="align" title="展示列" width="80" align="center" fixed="left">
                <template #default="{ row }">
                  <el-checkbox
                    v-model="row.isVisible"
                    :key="'isvisible_' + curApi.apiCode + row.fieldId"
                    :true-value="1"
                    :false-value="0"
                  />
                </template>
              </vxe-column>
              <vxe-column field="align" title="排序" width="80" align="center" fixed="left">
                <template #default="{ row }">
                  <el-input v-model="row.sort" type="number" />
                </template>
              </vxe-column>
              <vxe-column field="columnComment" title="列名称" min-width="180" fixed="left"></vxe-column>
              <vxe-column field="columnName" title="列字段" min-width="140"></vxe-column>
              <vxe-column field="isColumnSort" title="是否支持排序" width="100" align="center">
                <template #default="{ row }">
                  <el-checkbox
                    v-model="row.isColumnSort"
                    :key="'list-columnsort' + curApi.apiCode + +row.fieldId"
                    :true-value="1"
                    :false-value="0"
                  />
                </template>
              </vxe-column>
              <vxe-column field="columnHeadTips" title="表头Tips" width="180">
                <template #default="{ row }">
                  <el-input v-model="row.columnHeadTips" />
                </template>
              </vxe-column>
              <vxe-column field="conventType" title="数据转换规则" width="100" align="center">
                <template #default="{ row }">
                  <div class="table-row-cfg-wrap">
                    <el-button
                      text
                      type="primary"
                      @click="openDialog('convertData', row)"
                      :class="row.dataConversionRespVOS ? 'green-text' : ''"
                    >
                      配置
                    </el-button>

                    <el-popconfirm
                      title="确定清空配置?"
                      @confirm="clearCfg(row, 'dataConversionRespVOS')"
                      v-if="row.dataConversionRespVOS"
                    >
                      <template #reference>
                        <el-icon class="cfg-del-btn" title="清空配置">
                          <Delete />
                        </el-icon>
                      </template>
                    </el-popconfirm>
                  </div>
                </template>
              </vxe-column>
              <vxe-column field="showType" title="数据格式化" width="100" align="center">
                <template #default="{ row }">
                  <div class="table-row-cfg-wrap">
                    <el-button
                      text
                      type="primary"
                      @click="openDialog('formatData', row)"
                      :class="row.dataFormatRespVOS ? 'green-text' : ''"
                    >
                      配置
                    </el-button>
                    <el-popconfirm
                      title="确定清空配置?"
                      @confirm="clearCfg(row, 'dataFormatRespVOS')"
                      v-if="row.dataFormatRespVOS"
                    >
                      <template #reference>
                        <el-icon class="cfg-del-btn" title="清空配置">
                          <Delete />
                        </el-icon>
                      </template>
                    </el-popconfirm>
                  </div>
                </template>
              </vxe-column>
              <vxe-column field="isColumnFixed" title="固定列" width="180">
                <template #default="{ row }">
                  <el-select v-model="row.isColumnFixed">
                    <el-option
                      v-for="(item, index) in fixedOption"
                      :key="'isColumnFixed_' + index"
                      :label="item.label"
                      :value="item.value"
                    />
                  </el-select>
                </template>
              </vxe-column>
              <vxe-column field="columnAlignment" title="对齐方式" width="180">
                <template #default="{ row }">
                  <el-select v-model="row.columnAlignment">
                    <el-option
                      v-for="(item, index) in alignOption"
                      :key="'columnAlignment_' + index"
                      :label="item.label"
                      :value="item.value"
                    />
                  </el-select>
                </template>
              </vxe-column>
              <vxe-column field="columnFixedWidth" title="固定宽度" width="120">
                <template #default="{ row }">
                  <el-input v-model="row.columnFixedWidth" type="number" />
                </template>
              </vxe-column>
              <vxe-column field="columnMinWidth" title="最小宽度" width="120">
                <template #default="{ row }">
                  <el-input v-model="row.columnMinWidth" type="number" />
                </template>
              </vxe-column>
              <vxe-column field="columnSlot" title="插槽" width="180">
                <template #default="{ row }">
                  <el-input v-model="row.columnSlot" />
                </template>
              </vxe-column>
              <vxe-column field="columnNameAlias" title="字段别名" min-width="180">
                <template #default="{ row }">
                  <el-input v-model="row.columnNameAlias" />
                </template>
              </vxe-column>
              <!--        <vxe-column field="isImport" title="导入规则" width="180">-->
              <!--          <template #default="{ row }">-->
              <!--            <el-button text type="primary" @click="convertConfig(row)" class="mb-10px"> 配置 </el-button>-->
              <!--          </template>-->
              <!--        </vxe-column>-->
              <!--        <vxe-column field="isExport" title="导出规则" width="180">-->
              <!--          <template #default="{ row }">-->
              <!--            <el-button text type="primary" @click="convertConfig(row)" class="mb-10px"> 配置 </el-button>-->
              <!--          </template>-->
              <!--        </vxe-column>-->
              <vxe-column field="isTotalColumn" title="是否合计列" width="90" align="center">
                <template #default="{ row }">
                  <el-checkbox
                    v-model="row.isTotalColumn"
                    :key="'list-totalcolumn' + curApi.apiCode + +row.fieldId"
                    :true-value="1"
                    :false-value="0"
                  />
                </template>
              </vxe-column>
              <vxe-column field="columnHeadSlot" title="表头插槽" width="180">
                <template #default="{ row }">
                  <el-input v-model="row.columnHeadSlot" />
                </template>
              </vxe-column>
            </vxe-table>
          </div>
        </div>
      </div>
    </div>
  </el-form>
  <DataConvertDialog ref="dataConvertDialogRef" @success="convertDataSuccess"></DataConvertDialog>
  <FormatDataDialog ref="formatDataDialog" @success="formaterSuccess"></FormatDataDialog>
  <FormSettingDialog ref="formSettingDialog" @success="formSettingSuccess"></FormSettingDialog>
</template>
<script lang="ts" setup>
import { ref, watch } from 'vue'
import ChooseModelTable from '../../Component/ChooseModelTable.vue'
import DataConvertDialog from '../../../../../Components/DataConvertDialog.vue'
import FormatDataDialog from '../../../../../Components/FormatDataDialog.vue'
import FormSettingDialog from '../../../../../Components/FormSettingDialog.vue'
import { Delete } from '@element-plus/icons-vue'
import { propTypes } from '@/utils/propTypes'
import { cloneDeep } from 'lodash-es'

defineOptions({ name: 'ListPageDesignTableColumn' })

const formData = defineModel()

const emit = defineEmits(['close-click'])

const message = useMessage() // 消息弹窗

const alignOption = ref([
  {
    label: '居中',
    value: 'center'
  },
  {
    label: '左对齐',
    value: 'left'
  },
  {
    label: '右对齐',
    value: 'right'
  }
])
const fixedOption = ref([
  {
    label: '不固定',
    value: 'none'
  },
  {
    label: '固定居左',
    value: 'left'
  },
  {
    label: '固定居右',
    value: 'right'
  }
])

/**
 * 切换api
 */
const curApi = ref({})
const handleChangeApi = (apiItem) => {
  curApi.value = apiItem
}
/**
 * 选择模型
 * @param data
 */
const tableData = ref([])
let curModuleItem = ''
const handleChooseModel = (type, item) => {
  curModuleItem = item
  tableData.value = curApi.value.tableColumns.filter((fieldItem) => fieldItem.moduleTableId === item.id)
}
/**
 * 显示全部已选
 */
const isOnlyShowChecked = ref(false)
const onlyShowChecked = (e) => {
  if (e) {
    tableData.value = curApi.value.tableColumns.filter((fieldItem) => fieldItem.isVisible)
  } else {
    handleChooseModel('model', curModuleItem)
  }
}
/**
 * 转换配置和格式化配置 弹框
 */
const curRow = ref()
const dataConvertDialogRef = ref()
const formatDataDialog = ref()
const formSettingDialog = ref()
const openDialog = (type, row = {}) => {
  curRow.value = row
  if (type === 'convertData') {
    dataConvertDialogRef.value.open(type, row?.dataConversionRespVOS)
  }
  if (type === 'formatData') {
    formatDataDialog.value.open(type, row?.dataFormatRespVOS)
  }
  if (type === 'formSetting') {
    formSettingDialog.value.open(type, cloneDeep(formData))
  }
}
const convertDataSuccess = (data) => {
  curRow.value.dataConversionRespVOS = data
}
const formaterSuccess = (data) => {
  curRow.value.dataFormatRespVOS = data
}
const formSettingSuccess = (data) => {
  console.log(data)
}
const clearCfg = (row, field) => {
  row[field] = null
}
</script>
<style lang="scss" scoped>
.pane-wrap {
  height: calc(100vh - 145px);
}
:deep(.vxe-body--row) {
  height: 56px;
}
.datamodel-content {
  display: flex;
  height: calc(100vh - 150px);
}
.content-left {
  width: 260px;
  padding: 5px 10px 5px 0;
  margin: 0 16px 0 0;
  border-right: 1px solid #e9e4e4;
  .view-tabs {
    display: flex;
    justify-content: center;
    margin: 0px 0px 10px;
  }
  .model-cards {
    margin: 0 10px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    .model-cards-item {
      background: #f6f6f6;
      border-radius: 4px;
      padding: 5px 10px;
      display: flex;
      margin-bottom: 10px;
      .main {
        .title {
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 5px;
        }
        .subTitle {
          font-size: 12px;
          color: #929292;
        }
      }
    }
    .model-cards-item:hover {
      border: 1px solid #409eff;
      background: #ebf0fc;
      cursor: pointer;
      .main {
        .title {
          color: #409eff;
        }
        .subTitle {
          color: #a2abd7;
        }
      }
    }
  }
}
.active {
  border: 1px solid #1c85f1;
  background: #ebf0fc;
  .main {
    .title {
      color: #409eff;
    }
    .subTitle {
      color: #a2abd7;
    }
  }
}
.conent-right {
  width: calc(100% - 300px);
  .table-content {
    height: calc(100% - 50px);
  }
}
.show-only-checked {
  margin-left: 15px;
}
</style>
