<template>
  <el-dialog title="模型配置" v-model="dialogVisible" fullscreen>
    <div class="page-container">
      <el-tabs v-model="activeName" class="demo-tabs" @tab-click="handleClick">
        <el-tab-pane label="模型信息" name="base">
          <el-form :model="form" :rules="rules" ref="formRef" label-width="100">
            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item label="模型名称" prop="modelName">
                  <el-input v-model="form.modelName" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="模型编码" prop="modelName">
                  <el-input v-model="form.modelName" />
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="模型类型" prop="modelType">
                  <el-radio-group v-model="form.modelType">
                    <el-radio :value="1">普通模型</el-radio>
                    <el-radio :value="2">SQL </el-radio>
                    <el-radio :value="3">JavaBean </el-radio>
                    <el-radio :value="4">接口服务</el-radio>
                  </el-radio-group>
                  <span style="margin-left: 20px; font-size: 12px; color: #a6a4a4">注意：除普通模型，其他模型不支持自动生成服务</span>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row v-if="form.modelType == 2">
              <el-col :span="24">
                <el-form-item label="sql" prop="modelName">
                  <el-input v-model="form.modelName" type="textarea" :rows="4" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row v-if="form.modelType == 3">
              <el-col :span="24">
                <el-form-item label="接口类" prop="modelName">
                  <el-input v-model="form.modelName" />
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="方法名" prop="modelName">
                  <el-input v-model="form.modelName" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row v-if="form.modelType == 4">
              <el-col :span="24">
                <el-form-item label="接口地址" prop="modelName">
                  <el-input v-model="form.modelName" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="接口类型" prop="modelName">
                  <el-radio-group v-model="form.modelType">
                    <el-radio :value="1">GET</el-radio>
                    <el-radio :value="2">POST</el-radio>
                  </el-radio-group>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="24">
                <el-form-item label="模型描述" prop="modelName">
                  <el-input v-model="form.modelName" type="textarea" :rows="4" />
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </el-tab-pane>
        <el-tab-pane label="视图配置" name="model">
          <div class="datamodel-header">
            <el-button type="primary" @click="chooseFields()" class="mb-10px"> <Icon icon="ep:plus" /> 选择模型 </el-button>
            <el-button v-if="isHasGroup" @click="addGroup()" class="mb-10px"> <Icon icon="ep:plus" /> 新增分组 </el-button>
            <el-checkbox class="ml-20px" v-model="isHasGroup" label="启用分组" size="large" />
          </div>
          <div class="datamodel-content">
            <el-tree
              style="width: 260px"
              :data="modelTreeData"
              class="left-tree"
              default-expand-all
              :props="{
                children: 'children',
                label: 'label'
              }"
              @node-click="handleNodeClick"
            >
              <template #default="{ node, data }">
                <div class="custom-tree-node">
                  <span>
                  <span v-if="data.isMain" class="main-icon">主</span>
                    {{ node.label }}</span>
                  <span v-if="data.isModel">
                    <a @click="append(data)"> 关联条件 </a>
                  </span>
                </div>
              </template>
            </el-tree>
            <vxe-table
              border
              :edit-config="{ mode: 'row', trigger: 'click', showIcon: false }"
              :tree-config="{ rowField: 'id', childrenField: 'children' }"
              :span-method="spanMethod"
              :row-class-name="setRowCls"
              @current-change="currentChange"
              :data="tableData"
            >
              <vxe-column type="seq" title="序号" width="60" align="center">
                <template #default="{ rowIndex, row }">
                  <div class="sort">
                    <span class="sort-number">{{ rowIndex + 1 }}</span>
                    <span class="sort-action" v-if="!row.isGroup">
                      <el-icon><CirclePlusFilled /></el-icon>
                      <el-icon><RemoveFilled /></el-icon>
                    </span>
                  </div>
                </template>
              </vxe-column>
              <vxe-column field="subIndex" width="60" :edit-render="{}" tree-node>
                <template #default="{ rowIndex, row }">
                  <div class="sort" v-if="row.isGroup">
                    <span class="sort-number">{{ rowIndex + 1 }}</span>
                    <span class="sort-action">
                      <el-icon><CirclePlusFilled /></el-icon>
                      <el-icon><RemoveFilled /></el-icon>
                    </span>
                  </div>
                </template>
              </vxe-column>
              <vxe-column field="modelCode" title="模型编码" width="180" :edit-render="{}">
                <template #edit="{ row }">
                  <el-select v-model="row.modelCode" />
                </template>
                <template #default="{ row }">
                  {{ row.modelCode }}
                  <el-tag type="primary" effect="dark" size="small" v-if="row.modelType == 'main'">主表</el-tag>
                  <el-tag type="success" effect="dark" size="small" v-if="row.modelType == 'left-join'">左联</el-tag>
                  <el-tag type="warning" effect="dark" size="small" v-if="row.modelType == 'right-join'">右联</el-tag>
                </template>
              </vxe-column>
              <vxe-column field="fieldCode" title="字段名" width="180" :edit-render="{}">
                <template #edit="{ row }">
                  <el-input v-model="row.name" />
                </template>
              </vxe-column>
              <vxe-column field="fieldName" title="名称" width="180" :edit-render="{}">
                <template #edit="{ row }">
                  <el-input v-model="row.num" />
                </template>
              </vxe-column>
              <vxe-column field="fieldAlias" title="字段别名" width="180" :edit-render="{}">
                <template #edit="{ row }">
                  <el-input v-model="row.name" />
                </template>
              </vxe-column>
              <vxe-column field="relationFields" title="关联表字段" width="180" :edit-render="{}">
                <template #edit="{ row }">
                  <el-input v-model="row.relationFields" />
                </template>
              </vxe-column>
              <vxe-column field="component" title="组件类型" width="180" :edit-render="{}">
                <template #edit="{ row }">
                  <el-select v-model="row.integer" />
                </template>
              </vxe-column>
              <vxe-column field="defaultValue" title="默认值" width="180" :edit-render="{}">
                <template #edit="{ row }">
                  <el-input v-model="row.defaultValue" />
                </template>
              </vxe-column>
              <vxe-column field="remark" title="描述" min-width="180" :edit-render="{}">
                <template #edit="{ row }">
                  <el-input v-model="row.remark" />
                </template>
              </vxe-column>
            </vxe-table>
          </div>
        </el-tab-pane>
        <el-tab-pane label="关联子模型" name="tableIndex">
          <div class="datamodel-header">
            <el-button type="primary" @click="addRow()" class="mb-10px"> <Icon icon="ep:plus" /> 新增子模型 </el-button>
          </div>
          <vxe-table
            border
            :edit-config="{ mode: 'row', trigger: 'click', showIcon: false }"
            :tree-config="{ rowField: 'id', childrenField: 'children' }"
            :span-method="spanMethod"
            :row-class-name="setRowCls"
            @current-change="currentChange"
            :data="tableData"
          >
            <vxe-column type="seq" title="序号" width="60" align="center">
              <template #default="{ rowIndex, row }">
                <div class="sort">
                  <span class="sort-number">{{ rowIndex + 1 }}</span>
                  <span class="sort-action" v-if="!row.isGroup">
                    <el-icon><CirclePlusFilled /></el-icon>
                    <el-icon><RemoveFilled /></el-icon>
                  </span>
                </div>
              </template>
            </vxe-column>
            <vxe-column field="subIndex" width="60" :edit-render="{}" tree-node>
              <template #default="{ rowIndex, row }">
                <div class="sort" v-if="row.isGroup">
                  <span class="sort-number">{{ rowIndex + 1 }}</span>
                  <span class="sort-action">
                    <el-icon><CirclePlusFilled /></el-icon>
                    <el-icon><RemoveFilled /></el-icon>
                  </span>
                </div>
              </template>
            </vxe-column>
            <vxe-column field="modelCode" title="模型编码" width="180" :edit-render="{}">
              <template #edit="{ row }">
                <el-select v-model="row.modelCode" />
              </template>
            </vxe-column>
            <vxe-column field="fieldCode" title="模型名称" width="180" :edit-render="{}">
              <template #edit="{ row }">
                <el-input v-model="row.name" />
              </template>
            </vxe-column>
            <vxe-column field="fieldName" title="主子关联字段" :edit-render="{}">
              <template #edit="{ row }">
                <el-input v-model="row.num" />
              </template>
            </vxe-column>
          </vxe-table>
        </el-tab-pane>
        <el-tab-pane label="API管理" name="relationModel">
          <div class="btn-action">
            <el-button type="primary" @click="openForm('create')"> <Icon icon="ep:plus" /> 新建服务 </el-button>
          </div>
          <JVxeTable ref="jVxeTable" :columns="apiColumns" :row-height="58" :data-source="apiData">
            <template #action_default="{ row }">
              <div class="table-action">
                <el-link type="primary" @click="handleEdit(row)">编辑</el-link>
                <el-divider direction="vertical" />
                <el-link type="primary">删除</el-link>
              </div>
            </template>
          </JVxeTable>
        </el-tab-pane>
        <el-tab-pane label="参数管理" name="params">
          <div class="datamodel-header">
            <el-button type="primary" @click="addRow()" class="mb-10px"> <Icon icon="ep:plus" /> 新增参数 </el-button>
          </div>
          <vxe-table
            border
            :edit-config="{ mode: 'row', trigger: 'click', showIcon: false }"
            :row-class-name="setRowCls"
            @current-change="currentChange"
            :data="paramTableData"
          >
            <vxe-column type="seq" title="序号" width="60" align="center">
              <template #default="{ rowIndex, row }">
                <div class="sort">
                  <span class="sort-number">{{ rowIndex + 1 }}</span>
                  <span class="sort-action" v-if="!row.isGroup">
                    <el-icon><CirclePlusFilled /></el-icon>
                    <el-icon><RemoveFilled /></el-icon>
                  </span>
                </div>
              </template>
            </vxe-column>
            <vxe-column field="subIndex" width="60" :edit-render="{}" tree-node>
              <template #default="{ rowIndex, row }">
                <div class="sort" v-if="row.isGroup">
                  <span class="sort-number">{{ rowIndex + 1 }}</span>
                  <span class="sort-action">
                    <el-icon><CirclePlusFilled /></el-icon>
                    <el-icon><RemoveFilled /></el-icon>
                  </span>
                </div>
              </template>
            </vxe-column>
            <vxe-column field="modelCode" title="入参字段" width="180" :edit-render="{}">
              <template #edit="{ row }">
                <el-select v-model="row.modelCode" />
              </template>
            </vxe-column>
            <vxe-column field="fieldCode" title="字段名称" width="180" :edit-render="{}">
              <template #edit="{ row }">
                <el-input v-model="row.name" />
              </template>
            </vxe-column>
            <vxe-column field="fieldName" title="参数类型" width="180" :edit-render="{}">
              <template #edit="{ row }">
                <el-input v-model="row.num" />
              </template>
            </vxe-column>
            <vxe-column field="fieldAlias" title="是否必填" width="180" :edit-render="{}">
              <template #edit="{ row }">
                <el-input v-model="row.name" />
              </template>
            </vxe-column>
            <vxe-column field="relationFields" title="默认值" width="180" :edit-render="{}">
              <template #edit="{ row }">
                <el-input v-model="row.relationFields" />
              </template>
            </vxe-column>
          </vxe-table>
        </el-tab-pane>
      </el-tabs>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitForm">确 定</el-button>
      </span>
    </template>
  </el-dialog>
  <ChooseFieldsDialog ref="refChooseFields"/>
</template>
<script lang="ts" setup>
import { ref } from 'vue'
import { CirclePlusFilled, RemoveFilled } from '@element-plus/icons-vue'
import { cloneDeep } from 'lodash-es'
import { apiColumns } from '../data'
import ChooseFieldsDialog from '../../Components/ChooseFieldsDialog.vue'

defineOptions({ name: 'EditDialog' })

const message = useMessage() // 消息弹窗
const dialogVisible = ref(false)
const activeName = ref('base')
const isHasGroup = ref(false)
const formRef = ref()
const form = ref({
  modelName: '',
  modelCode: '',
  modelType: '',
  modelRemark: null
})
const btnType = ref('1')
const rules = reactive({
  modelName: [{ required: true, message: '请输入模型名称', trigger: 'blur' }],
  modelCode: [{ required: true, message: '请输入模型编码', trigger: 'blur' }],
  modelDataSource: [{ required: true, message: '请选择数据源', trigger: 'blur' }],
  modelType: [{ required: true, message: '请选择模型类型', trigger: 'blur' }]
})
const tableActiveName = ref('fields')
/** 打开弹窗 */
const open = async (type: string, id?: number) => {
  dialogVisible.value = true
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
const submitForm = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      message.success('提交成功！')
      dialogVisible.value = false
      emit('success', '123')
    } else {
      message.error('表单验证失败，请检查输入')
      return false
    }
  })
}
const modelTreeData = reactive([
  {
    label: '主模型',
    isMain: true,
    isModel:true,
    children: [{ label: '字段1' }, { label: '字段2' }, { label: '字段3' }]
  },
  {
    label: '左关联模型',
    isLeft: true,
    isModel:true,
    children: [{ label: '字段1' }, { label: '字段2' }, { label: '字段3' }]
  },
  {
    label: '右关联模型',
    isRight: true,
    isModel:true,
    children: [{ label: '字段1' }, { label: '字段2' }, { label: '字段3' }]
  }
])
const tableData = reactive([
  {
    id: 1,
    modelCode: '销售表',
    modelType: 'main',
    fieldCode: 'clientId',
    fieldName: '客户Id',
    fieldAlias: 'clientName',
    component: '下拉框',
    defaultValue: '',
    remark: ''
  },
  {
    id: 1,
    modelCode: '销售表',
    modelType: 'main',
    fieldCode: 'clientId',
    fieldName: '客户Id',
    fieldAlias: 'clientName',
    component: '下拉框',
    defaultValue: '',
    remark: ''
  },
  {
    id: 1,
    modelCode: '销售表',
    modelType: 'main',
    fieldCode: 'clientId',
    fieldName: '客户Id',
    fieldAlias: 'clientName',
    component: '下拉框',
    defaultValue: '',
    remark: ''
  },
  {
    id: 1,
    modelCode: '销售表',
    modelType: 'main',
    fieldCode: 'clientId',
    fieldName: '客户Id',
    fieldAlias: 'clientName',
    component: '下拉框',
    defaultValue: '',
    remark: ''
  },
  {
    id: 1,
    modelCode: '销售表',
    modelType: 'main',
    fieldCode: 'clientId',
    fieldName: '客户Id',
    fieldAlias: 'clientName',
    component: '下拉框',
    defaultValue: '',
    remark: ''
  },
  {
    id: 1,
    modelCode: '销售表',
    modelType: 'main',
    fieldCode: 'clientId',
    fieldName: '客户Id',
    fieldAlias: 'clientName',
    component: '下拉框',
    defaultValue: '',
    remark: ''
  },
  {
    id: 1,
    modelCode: '销售表',
    modelType: 'main',
    fieldCode: 'clientId',
    fieldName: '客户Id',
    fieldAlias: 'clientName',
    component: '下拉框',
    defaultValue: '',
    remark: ''
  }
])
const paramTableData=[
  {
    id: 1,
    modelCode: 'id',
    modelType: 'main',
    fieldCode: 'id',
    fieldName: '字符串',
    fieldAlias: '是',
    component: '下拉框',
    defaultValue: '',
    remark: ''
  },
  {
    id: 1,
    modelCode: 'name',
    modelType: 'main',
    fieldCode: '名称',
    fieldName: '字符串',
    fieldAlias: '是',
    component: '下拉框',
    defaultValue: '',
    remark: ''
  },
  {
    id: 1,
    modelCode: '销售表',
    modelType: 'main',
    fieldCode: 'clientId',
    fieldName: '客户Id',
    fieldAlias: 'clientName',
    component: '下拉框',
    defaultValue: '',
    remark: ''
  },
  {
    id: 1,
    modelCode: '销售表',
    modelType: 'main',
    fieldCode: 'clientId',
    fieldName: '客户Id',
    fieldAlias: 'clientName',
    component: '下拉框',
    defaultValue: '',
    remark: ''
  },
  {
    id: 1,
    modelCode: '销售表',
    modelType: 'right-join',
    fieldCode: 'clientId',
    fieldName: '客户Id',
    fieldAlias: 'clientName',
    component: '下拉框',
    defaultValue: '',
    remark: ''
  },
  {
    id: 1,
    modelCode: '销售表',
    modelType: 'left-join',
    fieldCode: 'clientId',
    fieldName: '客户Id',
    fieldAlias: 'clientName',
    component: '下拉框',
    defaultValue: '',
    remark: ''
  },
  {
    id: 1,
    modelCode: '客户表',
    modelType: 'left-join',
    fieldCode: 'clientName',
    fieldName: '客户名称',
    fieldAlias: 'clientName',
    relationFields: 'clientId',
    component: '下拉框',
    defaultValue: '',
    remark: ''
  }
]
const apiData = [
  {
    apiName: '新增',
    apiCode: 'joyin-table-add',
    remark: '对table表的新增'
  },{
    apiName: '修改',
    apiCode: 'joyin-table-add',
    remark: '对table表的新增'
  },{
    apiName: '删除',
    apiCode: 'joyin-table-add',
    remark: '对table表的新增'
  },{
    apiName: '分页列表',
    apiCode: 'joyin-table-add',
    remark: '对table表的新增'
  },{
    apiName: '详情',
    apiCode: 'joyin-table-add',
    remark: '对table表的新增'
  }
]
const currentRow = reactive(null)

const currentChange = ({ row, rowIndex }) => {
  currentRow.value = {
    row: row,
    rowIndex: rowIndex
  }
}
const addRow = () => {
  let newRow = {
    id: generateUUID(),
    parentId: '1'
  }
  if (currentRow && currentRow.value) {
    newRow.parentId = currentRow.value.id
    tableData.splice(currentRow.value.index, 0, newRow)
  } else {
    tableData.push(newRow)
  }
}
const addGroup = () => {
  //判断之前有没有分组
  let isHaveGroup = tableData.find((item) => item.children)
  if (!isHaveGroup) {
    const parentId = generateUUID()
    const allRow = cloneDeep(tableData)
    tableData.unshift({
      id: parentId,
      isGroup: true,
      children: allRow
    })
  }
  tableData.push({
    id: generateUUID(),
    isGroup: true,
    children: [{}]
  })
}
const refChooseFields=ref()
const chooseFields=(type)=>{
  refChooseFields.value.open(type)
}
const setRowCls = ({ row }) => {
  if (row.children) {
    return 'table-row'
  } else {
    return 'table-group-row'
  }
}
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}
const setIndex = () => {}
const spanMethod = ({ row, rowIndex, columnIndex }) => {
  if (!row.children) {
    return { rowspan: 1, colspan: 1 }
  } else {
    if (columnIndex === 0 || columnIndex === 1) {
      return { rowspan: 1, colspan: 1 }
    } else if (columnIndex === 2) {
      return { rowspan: 1, colspan: 9 }
    } else {
      return { rowspan: 1, colspan: 1 }
    }
  }
}
</script>
<style lang="scss" scoped>
.sort {
  .sort-number {
    //display: none;
  }
  .sort-action {
    display: none;
    i {
      font-size: 16px;
      cursor: pointer;
      &:nth-child(1) {
        margin-right: 5px;
      }
      &:hover {
        color: #f50909;
      }
    }
  }
}
:deep(.vxe-body--row) {
  height: 56px;
  &:hover {
    .sort-number {
      display: none;
    }
    .sort-action {
      display: block;
    }
  }
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
}
.main-icon {
  background: #1e83e9;
  color: #fff;
  font-size: 12px;
  padding: 2px;
  border-radius: 4px;
  margin-right: 6px;
}
.custom-tree-node{
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin-right:10px;
  a{
    font-size: 12px;
    color: #1e83e9;
    cursor: pointer;
  }
}
.left-tree{
  border-right: 1px solid #e9e4e4;
  margin: 0 10px;
}
</style>
