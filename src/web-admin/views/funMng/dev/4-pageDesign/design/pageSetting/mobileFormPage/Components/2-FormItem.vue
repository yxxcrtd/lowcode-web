<template>
  <el-form :model="tableData" ref="formRef" label-width="0">
    <div class="oprate-button-warp">
      <el-button class="mb-10px" @click="openGroupDialog('create')"> 添加分组 </el-button>
      <el-button v-if="curTable.isChild" @click="openChildTableSetting" class="mb-10px ml-10px"> 子表设置 </el-button>
    </div>
    <div class="pane-wrap">
      <div class="content-left">
        <ChooseModelTable
          ref="chooseModelTableRef"
          :template-api-list="formData.templateApiList"
          @change-api="(api, index) => handleChangeApi(api, index)"
          @choose-model="handleChooseModel"
          @groups-action="groupsAction"
        ></ChooseModelTable>
      </div>
      <div class="conent-right">
        <div class="table-content" v-loading="tableLoading" element-loading-text="加载中">
          <vxe-table
            border="inner"
            height="100%"
            :data="tableData"
            v-if="isLoadTable"
            :scroll-y="{ enabled: true, gt: 0 }"
          >
            <vxe-column type="seq" title="序号" width="60" align="center" fixed="left" />
            <vxe-column field="isVisible" title="是否显示" width="80" align="center" fixed="left">
              <template #default="{ row }">
                <el-checkbox
                  v-model="row.isVisible"
                  :key="'isFormVislable_' + row.fieldId"
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
            <vxe-column field="columnComment" title="列名称" min-width="180" fixed="left"></vxe-column>
            <vxe-column field="columnName" title="列字段" min-width="140"></vxe-column>
            <vxe-column field="columnType" title="字段类型" min-width="140"></vxe-column>
            <vxe-column field="groupCode" title="所属分组" min-width="140">
              <template #header>
                <div class="batch-group-content">
                  <span>所属分组</span>
                  <el-popover placement="bottom" :width="200" trigger="hover">
                    <template #reference>
                      <el-link type="primary" class="batch-group-btn">批量</el-link>
                    </template>
                    <div>
                      <el-tree-select
                        :teleported="false"
                        check-strictly
                        v-model="batchGroupId"
                        :data="curApi.pageGroupsTree"
                        :props="{ children: 'children', label: 'groupName', value: 'groupCode' }"
                        @change="batchSelectGroup"
                      />
                    </div>
                  </el-popover>
                </div>
              </template>
              <template #default="{ row, rowIndex }">
                <el-form-item :prop="`[${rowIndex}].groupCode`" :rules="rules.groupCode">
                  <el-tree-select
                    check-strictly
                    v-model="row.groupCode"
                    :data="curApi.pageGroupsTree"
                    :props="{
                      children: 'children',
                      label: 'groupName',
                      value: 'groupCode'
                    }"
                  />
                </el-form-item>
              </template>
            </vxe-column>
            <vxe-column field="columnDisplayComponent12" title="显示组件" width="220">
              <template #default="{ row }">
                <SelectComponent
                  :key="'form-page-' + row.fieldId"
                  v-if="row.isVisible"
                  v-model="row.columnDisplayComponent"
                  :show-label="row.columnDisplayComponentName"
                  v-model:props-list="row.columnComponentAttributeDO"
                />
              </template>
            </vxe-column>
            <vxe-column field="dataDict" title="数据字典" width="180" align="center">
              <template #default="{ row }">
                <BizSelectDict
                  v-if="dictShowComponents.includes(row.columnDisplayComponent)"
                  v-model="row.columnDictType"
                  v-model:dict-name="row.columnDictTypeName"
                  :show-label="row.columnDisplayComponentName"
                  :key="'isFormDataDict_' + row.fieldId"
                />
              </template>
            </vxe-column>
            <vxe-column field="isRequire" title="是否必填" width="80" align="center">
              <template #default="{ row }">
                <el-checkbox
                  v-model="row.isRequire"
                  :disabled="row.isRequireDisabled"
                  :title="row.isRequireDisabled ? '数据库表字段必填，禁止修改' : ''"
                  :key="'isFormRequire_' + row.fieldId"
                  :true-value="1"
                  :false-value="0"
                />
              </template>
            </vxe-column>
            <vxe-column field="isDisabled" title="是否置灰" width="80" align="center">
              <template #default="{ row }">
                <el-checkbox
                  v-model="row.isDisabled"
                  :key="'isFormDisabled_' + row.fieldId"
                  :true-value="1"
                  :false-value="0"
                />
              </template>
            </vxe-column>
            <vxe-column field="isHidden" title="默认隐藏" width="80" align="center">
              <template #default="{ row }">
                <el-checkbox
                  v-model="row.isHidden"
                  :key="'isFormHidden_' + row.fieldId"
                  :true-value="1"
                  :false-value="0"
                />
              </template>
            </vxe-column>
            <vxe-column field="defValue" title="默认值" width="180" align="center">
              <template #default="{ row }">
                <SetDefValue v-model="row.defValue"></SetDefValue>
              </template>
            </vxe-column>
            <vxe-column field="isShow" title="校验规则" width="80">
              <template #default="{ row }">
                <div class="table-row-cfg-wrap">
                  <el-button
                    text
                    type="primary"
                    @click="openDialog('validate', row)"
                    :class="row.validateRulesRespVOS ? 'green-text' : ''"
                  >
                    配置
                  </el-button>
                  <el-popconfirm
                    title="确定清空配置?"
                    @confirm="clearCfg(row, 'validateRulesRespVOS')"
                    v-if="row.validateRulesRespVOS"
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
            <vxe-column field="pageLinkageRespVOS" title="联动配置" width="80">
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
                  <el-popconfirm
                    title="确定清空配置?"
                    @confirm="clearCfg(row, 'pageLinkageRespVOS')"
                    v-if="row.pageLinkageRespVOS"
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
            <vxe-column field="eventConfigRespVOS" title="事件配置" width="100">
              <template #default="{ row }">
                <div class="table-row-cfg-wrap">
                  <el-button
                    text
                    type="primary"
                    @click="openDialog('event', row)"
                    :class="row.eventConfigRespVOS ? 'green-text' : ''"
                  >
                    配置
                  </el-button>
                  <el-popconfirm
                    title="确定清空配置?"
                    @confirm="clearCfg(row, 'eventConfigRespVOS')"
                    v-if="row.eventConfigRespVOS"
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
            <vxe-column field="columnSpan" width="110">
              <template #header>
                <el-tooltip
                  popper-class="tooltips"
                  content="每行均分成24份，默认分类三列，可在基本信息中修改"
                  placement="top-start"
                >
                  占据列数<el-icon><WarningFilled /></el-icon>
                </el-tooltip>
              </template>
              <template #default="{ row }">
                <el-input v-model="row.columnSpan" type="number" />
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
            <vxe-column field="columnNameAlias" title="字段别名" min-width="180">
              <template #default="{ row }">
                <el-input v-model="row.columnNameAlias" />
              </template>
            </vxe-column>
            <vxe-column field="columnTag" title="字段标签" width="250" align="center">
              <template #default="{ row, rowIndex }">
                <div class="component-container">
                  <el-select
                    v-model="row.columnTag"
                    :ref="(el) => getColumnTagRef(el, rowIndex)"
                    multiple
                    collapse-tags
                    collapse-tags-tooltip
                  >
                    <el-option v-for="(item, index) in formItemTags" :key="index" :label="item.value" :value="item.key" />
                    <template #footer>
                      <el-link size="small" :icon="Setting" type="primary" @click="openDialog('fieldLabels', rowIndex)"
                        >标签管理</el-link
                      >
                    </template>
                  </el-select>
                  <el-button class="operate-btn" :icon="Setting" @click="openEditorDialog(row)" :class="row.columnTagConfig ? 'green-text' : ''" title="配置属性"/>
                </div>
              </template>
            </vxe-column>
            <vxe-column field="columnHeadTips" title="标签Tips" width="180">
              <template #default="{ row }">
                <el-input v-model="row.columnHeadTips" />
              </template>
            </vxe-column>
            <vxe-column field="columnHeadWidth" title="标签长度" width="180">
              <template #default="{ row }">
                <el-input :min="0" v-model="row.columnHeadWidth" type="number" />
              </template>
            </vxe-column>
            <vxe-column field="isTotalColumn" v-if="curTable.isChild" title="是否合计列" width="90" align="center">
              <template #default="{ row }">
                <el-checkbox
                  v-model="row.isTotalColumn"
                  :key="'list-totalcolumn' + curApi.apiCode + +row.fieldId"
                  :true-value="1"
                  :false-value="0"
                />
              </template>
            </vxe-column>
            <vxe-column field="columnSlot" title="组件插槽" width="180">
              <template #default="{ row }">
                <el-input v-model="row.columnSlot" type="number" />
              </template>
            </vxe-column>
          </vxe-table>
        </div>
      </div>
    </div>
  </el-form>
  <ValidateDialog
    ref="validateDialogRef"
    :moduleId="curApi.moduleId"
    @success="configSuccess($event, 'validateRulesRespVOS')"
  />
  <LinkageDialog
    ref="linkageDialogRef"
    :fieldList="curApi.tableColumns"
    @success="configSuccess($event, 'pageLinkageRespVOS')"
  />
  <ComponentPropDialog ref="componentPropDialogRef" @success="configSuccess($event, 'columnComponentAttributeDO')" />
  <EventDialog ref="eventDialogRef" @success="configSuccess($event, 'eventConfigRespVOS')" />
  <EditGroupDialog
    ref="editGroupDialogRef"
    :fieldList="curApi.tableColumns"
    :templateApiList="formData.templateApiList"
    @success="editGroupSuccess"
  />
  <ChildTableSettingDialog ref="childTableSettingDialogRef" @success="childTableSettingSuccess" />
  <FormatFormDataDialog
    ref="formatDataDialog"
    :fieldList="curApi.tableColumns"
    @success="formaterSuccess"
  ></FormatFormDataDialog>
  <FieldLabelsDialog ref="fieldLabelsDialogRef" @success="fieldLabelsSuccess"></FieldLabelsDialog>
  <EditorDialog mode="json" title="字段标签配置" ref="editorDialogRef" @success="editorSuccess"></EditorDialog>
</template>
<script lang="ts" setup>
import { ref, nextTick } from 'vue'
import { CirclePlusFilled, Delete, RemoveFilled, WarningFilled, Setting } from '@element-plus/icons-vue'
import { propTypes } from '@/utils/propTypes'
import ChooseModelTable from '../../Component/ChooseModelTable.vue'
import LinkageDialog from '@/web-admin/views/funMng/dev/Components/LinkageDialog.vue'
import ValidateDialog from '@/web-admin/views/funMng/dev/Components/ValidateDialog.vue'
import ComponentPropDialog from '@/web-admin/views/funMng/dev/Components/ComponentPropDialog.vue'
import EventDialog from '@/web-admin/views/funMng/dev/Components/EventDialog.vue'
import EditGroupDialog from '../../Component/EditGroupDialog.vue'
import { cloneDeep } from 'lodash-es'
import SelectComponent from '@/web-admin/views/funMng/dev/Components/SelectComponent.vue'
import { getComponentTablePage, getByCategory } from '@/web-admin/views/funMng/dev/api'
import BizSelectDict from '@/components-yt/biz/SelectDict/index.vue'
import SetDefValue from '@/web-admin/views/funMng/dev/Components/SetDefValue.vue'
import ChildTableSettingDialog from '../../Component/ChildTableSettingDialog.vue'
import FormatFormDataDialog from '@/web-admin/views/funMng/dev/Components/FormatFormDataDialog.vue'
import FieldLabelsDialog from '@/web-admin/views/funMng/dev/Components/FieldLabelsDialog.vue'
import EditorDialog from '../../../../../Components/EditorDialog.vue'

defineOptions({ name: 'DataModelDesignView' })
const chooseModelTableRef = ref()
const curApiCode = ref('')
const formData = defineModel()
const message = useMessage() // 消息弹窗
const dictShowComponents = ref(['ace-select', 'ace-check-box', 'ace-radio'])
const rules = reactive({
  groupCode: [{ required: true, message: '请选择分组', trigger: 'blur' }]
})
const curApiIndex = ref()
/**
 * 切换pai
 */
const curApi: any = ref({})
const handleChangeApi = (apiItem, index) => {
  curApi.value = apiItem
  curApiIndex.value = index // 保存当前 index
}
/**
 * 选择模型或分组
 * @param data
 */
const tableData = ref([])
const curTable: any = ref({})
const handleChooseModel = (type, item) => {
  //console.log(type,item,curApi.value.tableColumns.filter((fieldItem) => fieldItem.moduleTableId === item.id))
  console.log('item', item)
  curTable.value = item
  if (type === 'model') {
    tableData.value = curApi.value.tableColumns.filter((fieldItem) => {
      if (!fieldItem.columnTag) {
        fieldItem.columnTag = []
      }
      return fieldItem.moduleTableId === item.id
    })
  } else {
    tableData.value = curApi.value.tableColumns.filter((groupItem) => {
      if (!groupItem.columnTag) {
        groupItem.columnTag = []
      }
      return groupItem.groupCode === item.groupCode
    })
  }
}
/**
 * 分组操作  edit:编辑;delete:删除
 * @param type
 * @param groupItem
 * @param groupIndex
 */
const groupsAction = async (type, groupItem, groupIndex) => {
  if (type === 'edit') {
    openGroupDialog('update', groupItem)
  }
  if (type === 'delete') {
    await message.delConfirm()
    handleDeleteTree(curApi.value.pageGroupsTree,groupItem)
  }
}
/**
 * 递归删除
 */
const handleDeleteTree = (data,deleteNode) => {
  data.forEach((item,index) => {
    if(item === deleteNode){
      data.splice(index, 1)
      clearTableColumnsGroupCode(item,item.groupCode)
    }else if(item.children && item.children.length){
      handleDeleteTree(item.children,deleteNode)
    }
  })
}
const clearTableColumnsGroupCode = (data,groupCode) => {
  curApi.value.tableColumns.forEach((item) => {
    if (groupCode == item.groupCode) {
      item.groupCode = null
    }
  })
  if(data.children && data.children.length){
    data.children.forEach(item => {
      clearTableColumnsGroupCode(item,item.groupCode)
    })
  }
}
/**
 * 分组弹框操作
 */
const editGroupDialogRef = ref()
const openGroupDialog = (type, data) => {
  const curSort = Number(curApi.value.pageGroupsTree[curApi.value.pageGroupsTree.length - 1].groupSort) + 1
  editGroupDialogRef.value.open(type, data, curSort, curApiIndex.value)
}
const editGroupSuccess = (data, type) => {
  if (type === 'create') {
    // 如果是新增分组
    if (data.parentId) {
      // 有父节点ID,需要找到父节点并添加到其children中
      const parentNode = findParentNode(curApi.value.pageGroupsTree, data.parentId)
      if (parentNode) {
        if (!parentNode.children) {
          parentNode.children = []
        }
        parentNode.children.push(data)
      }
    } else {
      // 无父节点,直接添加到顶层
      curApi.value.pageGroupsTree.push(data)
    }
  } else {
    // 如果是编辑分组
    updateTreeNode(curApi.value.pageGroupsTree, data)
  }
}
// 递归查找父节点
const findParentNode = (tree, parentId) => {
  for (const node of tree) {
    if (node.id === parentId) {
      return node
    }
    if (node.children) {
      const found = findParentNode(node.children, parentId)
      if (found) return found
    }
  }
  return null
}

// 递归更新节点
const updateTreeNode = (tree, updateData) => {
  // 先从原位置移除节点
  const removeNode = (tree, groupCode) => {
    for (let i = 0; i < tree.length; i++) {
      if (tree[i].groupCode === groupCode) {
        tree.splice(i, 1)
        return true
      }
      if (tree[i].children) {
        if (removeNode(tree[i].children, groupCode)) {
          return true
        }
      }
    }
    return false
  }
  // 找到新的父节点并添加
  const addToNewParent = (tree, node) => {
    if (!node.parentId) {
      // 如果没有父节点ID,添加到顶层
      tree.push(node)
      return true
    }
    // 查找父节点
    for (let i = 0; i < tree.length; i++) {
      if (tree[i].id === node.parentId) {
        if (!tree[i].children) {
          tree[i].children = []
        }
        tree[i].children.push(node)
        return true
      }
      if (tree[i].children) {
        if (addToNewParent(tree[i].children, node)) {
          return true
        }
      }
    }
    return false
  }
  // 1. 从原位置移除节点
  removeNode(tree, updateData.groupCode)
  // 2. 添加到新位置
  addToNewParent(tree, updateData)
}
/**
 * 分组批量选择
 * @param val
 */
const batchGroupId = ref(null)
const batchSelectGroup = (val) => {
  tableData.value.forEach((item) => {
    item.groupCode = val
  })
  batchGroupId.value = null
}

/**
 * 获取字段标签
 */
const formItemTags = ref([])
const fieldLabelsSuccess = () => {
  getFormItemTags()
}
/** 获取数据 */
const getFormItemTags = async () => {
  const res = await getByCategory({ category: 'formItemTag' })
  formItemTags.value = res
}
getFormItemTags()
/**
 * 字段标签配置
 */
const editorDialogRef = ref()
const editorRow=ref()
const openEditorDialog = (row) => {
  editorRow.value=row
  editorDialogRef.value.open(row.columnTagConfig || '')
}
const editorSuccess = (data) => {
  editorRow.value.columnTagConfig = data
}
/**
 * 字段配置弹框
 */
const curRow = ref()
const validateDialogRef = ref()
const linkageDialogRef = ref()
const eventDialogRef = ref()
const formatDataDialog = ref()
const componentPropDialogRef = ref()
const fieldLabelsDialogRef = ref()
const openDialog = (type, row) => {
  curRow.value = row
  //校验
  if (type === 'validate') {
    validateDialogRef.value.open(row.validateRulesRespVOS)
  }
  //联动
  if (type === 'linkage') {
    linkageDialogRef.value.open(type, row.pageLinkageRespVOS)
  }
  //事件
  if (type === 'event') {
    eventDialogRef.value.open(row.eventConfigRespVOS)
  }
  //组件配置
  if (type === 'componentProp') {
    componentPropDialogRef.value.open(type, row.columnComponentAttributeDO)
  }

  if (type === 'formatData') {
    formatDataDialog.value.open(type, row?.dataFormatRespVOS)
  }

  if (type === 'fieldLabels') {
    columnTagRefList.value[row].focus()
    columnTagRefList.value[row].blur()
    fieldLabelsDialogRef.value.open(type, formItemTags)
  }
}

const columnTagRefList = ref<HTMLElement[]>([])
const getColumnTagRef = (el, index) => {
  if (el) {
    columnTagRefList.value[index] = el
  }
}
const configSuccess = (data, type) => {
  curRow.value[type] = data
}
const formaterSuccess = (data) => {
  curRow.value.dataFormatRespVOS = data
}
const clearCfg = (row, field) => {
  row[field] = null
}
/**
 * 子表设置
 */
const childTableSettingDialogRef = ref()
const openChildTableSetting = () => {
  const curTableLayoutCfg = curApi.value.tableLayoutConfig.find((item) => item.tableId === curTable.value.id)
  childTableSettingDialogRef.value.open(curTable.value.id, curTableLayoutCfg)
}

const childTableSettingSuccess = (data) => {
  let tableLayoutCfg = curApi.value.tableLayoutConfig.find((item) => item.tableId === data.tableId)
  if (tableLayoutCfg) {
    tableLayoutCfg = data
  } else {
    curApi.value.tableLayoutConfig.push(data)
  }
}

const formRef = ref()
const validateFormItem = () => {
  return formRef.value.validate()
}
defineExpose({ validateFormItem })

const tableLoading = ref(true)
const isLoadTable = ref(false)
onMounted(async () => {
  setTimeout(() => {
    tableLoading.value = false
    isLoadTable.value = true
  }, 10)
})
</script>
<style lang="scss" scoped>
.ml-10px {
  margin-left: 10px;
}
.select-api {
  width: 220px;
  margin-right: 6px;
  margin-bottom: 10px;
}
.batch-group-content {
  display: flex;
  justify-content: space-between;
  .batch-group-btn {
    font-size: 12px;
  }
}
.pane-wrap {
  height: calc(100vh - 185px);
}
.table-content {
  height: calc(100% - 20px);
  :deep(.el-form-item--default) {
    margin-bottom: 0;
  }
}
.component-container{
  display: flex;
  .operate-btn{
    margin-left: 4px;
  }
}
</style>
