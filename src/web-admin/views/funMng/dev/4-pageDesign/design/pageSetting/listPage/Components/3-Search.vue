<template>
  <div class="oprate-button-warp">
    <el-checkbox class="show-only-checked" v-model="isOnlyShowChecked" @change="onlyShowChecked"
      >仅显示已选查询列</el-checkbox
    >
  </div>
  <div class="datamodel-content">
    <div class="content-left">
      <ChooseModelTable
        showType="model"
        :isShowChild="false"
        :template-api-list="formData.templateApiList"
        @change-api="handleChangeApi"
        @choose-model="handleChooseModel"
      ></ChooseModelTable>
    </div>
    <div class="conent-right">
      <!-- <el-checkbox class="show-only-checked" v-model="isOnlyShowChecked" @change="onlyShowChecked"
        >仅显示已选查询列</el-checkbox
      > -->
      <vxe-table class="table-content" border="inner" height="95%"
                 :row-config="{isCurrent: true, isHover: true}"
                 :data="tableData">
        <vxe-column type="seq" title="序号" width="60" align="center" fixed="left" />
        <vxe-column field="isQueryColumn" title="是否查询列" width="80" align="center" fixed="left">
          <template #default="{ row }">
            <el-checkbox
              v-model="row.isQueryColumn"
              :key="'isQueryColumn_' + row.fieldId"
              :true-value="1"
              :false-value="0"
            />
          </template>
        </vxe-column>
        <vxe-column field="sort" title="排序" width="80" align="center" fixed="left">
          <template #default="{ row }">
            <el-input v-model="row.sort" type="number" />
          </template>
        </vxe-column>
        <vxe-column field="columnComment" title="列名称" min-width="180"></vxe-column>
        <vxe-column field="columnName" title="列字段" min-width="180" fixed="left"></vxe-column>
        <vxe-column field="columnType" title="字段类型" min-width="140"></vxe-column>
        <vxe-column field="columnQueryOperator" title="查询操作符" width="150">
          <template #default="{ row }">
            <el-select v-model="row.columnQueryOperator">
              <el-option
                v-for="(item, index) in operateOption"
                :key="'columnQueryOperator' + index"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </template>
        </vxe-column>
        <vxe-column field="columnDisplayComponent" title="显示组件" min-width="200">
          <template #default="{ row }">
            <SelectSysComponent
              v-if="row.isQueryColumn"
              v-model="row.columnDisplayComponent"
              v-model:show-label="row.columnDisplayComponentName"
              v-model:props-list="row.columnComponentAttributeDO"
              :com-option="comOption"
            />
          </template>
        </vxe-column>
        <vxe-column field="dataDict" title="数据字典" width="180" align="center">
          <template #default="{ row }">
            <BizSelectDict
              v-if="row.isQueryColumn && dictShowComponents.includes(row.columnDisplayComponent)"
              v-model="row.columnDictType"
              v-model:dict-name="row.columnDictTypeName"
              :key="'isFormDataDict_' + row.fieldId"
            />
          </template>
        </vxe-column>
        <vxe-column field="isShow" title="联动配置" width="100">
          <template #default="{ row }">
            <div class="table-row-cfg-wrap">
              <el-button
                text
                type="primary"
                @click="openDialog('linkage', row)"
                :class="row.pageLinkageRespVOS ? 'green-text' : ''"
              >
                配置
              </el-button>
              <el-popconfirm title="确定清空配置?" @confirm="clearCfg(row,'pageLinkageRespVOS')" v-if="row.pageLinkageRespVOS">
                <template #reference>
                  <el-icon class="cfg-del-btn" title="清空配置">
                    <Delete />
                  </el-icon>
                </template>
              </el-popconfirm>
            </div>
          </template>
        </vxe-column>
        <vxe-column field="expansion" title="拓展配置" width="100">
          <template #default="{ row }">
            <div class="table-row-cfg-wrap">
              <el-button text type="primary" @click="openDialog('expansion', row)" :class="row.expansionJsonRespVOS ? 'green-text' : ''"> 配置 </el-button>
              <el-popconfirm title="确定清空配置?" @confirm="clearCfg(row,'expansionJsonRespVOS')" v-if="row.expansionJsonRespVOS">
                <template #reference>
                  <el-icon class="cfg-del-btn" title="清空配置">
                    <Delete />
                  </el-icon>
                </template>
              </el-popconfirm>
            </div>
          </template>
        </vxe-column>
        <vxe-column field="columnDefault" title="默认值" width="180">
          <template #default="{ row }">
            <el-input v-model="row.columnDefault" />
          </template>
        </vxe-column>
        <vxe-column field="isColumnRequire" title="是否必填" width="80" align="center">
          <template #default="{ row }">
            <el-checkbox
              v-model="row.isColumnRequire"
              :key="'list-search-' + row.fieldId"
              :true-value="1"
              :false-value="0"
            />
          </template>
        </vxe-column>
        <vxe-column field="columnNameAlias" title="字段别名" min-width="180">
          <template #default="{ row }">
            <el-input v-model="row.columnNameAlias" />
          </template>
        </vxe-column>
        <vxe-column field="columnSlot" title="插槽" width="180">
          <template #default="{ row }">
            <el-input v-model="row.columnSlot" />
          </template>
        </vxe-column>
      </vxe-table>
    </div>
  </div>
  <LinkageDialog ref="linkageDialogRef" :field-list="allSearchItems" @success="linkageSuccess" />
  <ExpansionJsonDialog ref="expansionJsonDialogRef" @success="expansionJsonSuccess"></ExpansionJsonDialog>
</template>
<script lang="ts" setup>
import { ref, watch } from 'vue'
import ChooseModelTable from '../../Component/ChooseModelTable.vue'
import LinkageDialog from '../../../../..//Components/LinkageDialog.vue'
import ExpansionJsonDialog from '../../../../..//Components/ExpansionJsonDialog.vue'
import { PageModelVO } from '../../../../type'
import SelectSysComponent from '@/web-admin/views/funMng/dev/Components/SelectComponent.vue'
import { getComponentTablePage } from '@/web-admin/views/funMng/dev/api'
import BizSelectDict from '@/components-yt/biz/SelectDict/index.vue'
import {Delete} from "@element-plus/icons-vue";

defineOptions({ name: 'ListPageDesignIndex' })
const formData = defineModel()
const emit = defineEmits(['close-click', 'chooseModel'])

const message = useMessage() // 消息弹窗
const operateOption = ref([
  {
    label: '等于',
    value: 'eq'
  },
  {
    label: '等于忽略大小写',
    value: 'eq-ig-case'
  },
  {
    label: '大于',
    value: 'gt'
  },
  {
    label: '大于等于',
    value: 'gte'
  },
  {
    label: '小于',
    value: 'lt'
  },
  {
    label: '小于等于',
    value: 'lte'
  },
  {
    label: '不等于',
    value: 'neq'
  },
  {
    label: '相似',
    value: 'like'
  },
  {
    label: '左相似',
    value: 'left-like'
  },
  {
    label: '右相似',
    value: 'right-like'
  },
  {
    label: '在...中',
    value: 'in'
  },
  {
    label: '不在...中',
    value: 'not-in'
  },
  {
    label: '在...之间',
    value: 'between'
  }
])

const dictShowComponents=ref([
  'ace-select','ace-check-box','ace-radio'
])

/**
 * 切换pai
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
const allSearchItems = ref([])
let curModuleItem = {}
const handleChooseModel = (type, item) => {
  curModuleItem = item
  allSearchItems.value=curApi.value.searchItems
  tableData.value = curApi.value.searchItems.filter((fieldItem) => fieldItem.moduleTableId === item.id)
}
/**
 * 联动配置和拓展配置弹框
 */
const curRow = ref()
const linkageDialogRef = ref()
const expansionJsonDialogRef = ref()
const openDialog = (type, row) => {
  curRow.value = row
  if (type === 'linkage') {
    linkageDialogRef.value.open(type, row.pageLinkageRespVOS)
  }
  if (type === 'expansion') {
    expansionJsonDialogRef.value.open(type, row?.expansionJsonRespVOS)
  }
}
const linkageSuccess = (data) => {
  curRow.value.pageLinkageRespVOS = data
}
const expansionJsonSuccess = (data) => {
  curRow.value.expansionJsonRespVOS = data
}
const clearCfg=(row,field)=>{
  row[field]=null
}
/**
 * 加载组件组件下拉框，提前加载下拉框数据源，提高性能
 */
const comOption = ref<Option[]>([])
const loadComponentOption = async () => {
  const componentRes = await getComponentTablePage({ pageSize: 100, pageNo: 1 })
  const list = componentRes.list || []
  if (list.length > 0) {
    comOption.value = list.map((obj) => {
      return { label: obj.componentName, value: obj.componentCode, id: obj.id }
    })
  }
}
loadComponentOption()
/**
 * 仅显示已选
 */
const isOnlyShowChecked = ref(false)
const onlyShowChecked = (e) => {
  if (e) {
    tableData.value = curApi.value.searchItems.filter((fieldItem) => fieldItem.isQueryColumn)
  } else {
    handleChooseModel('model', curModuleItem)
  }
}
</script>
<style lang="scss" scoped>
:deep(.vxe-body--row) {
  height: 56px;
}
.table-group-row {
}
:deep(.table-row) {
  .vxe-cell--tree-node,
  .vxe-tree-cell {
    padding-left: 0px !important;
  }
}
.datamodel-content {
  display: flex;
  height: calc(100vh - 150px);
}
.main-icon {
  background: #1e83e9;
  color: #fff;
  font-size: 12px;
  padding: 2px;
  border-radius: 4px;
  margin-right: 6px;
}
.custom-tree-node {
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin-right: 10px;
  a {
    font-size: 12px;
    color: #1e83e9;
    cursor: pointer;
  }
}
.left-tree {
  border-right: 1px solid #e9e4e4;
  margin: 0 10px;
}

.content-left {
  width: 260px;
  padding: 5px 10px 5px 0;
  margin: 0 16px 0 0;
  border-right: 1px solid #e9e4e4;
  .select-api {
    margin-bottom: 15px;
  }
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
  width: calc(100vw - 260px);
}
</style>
