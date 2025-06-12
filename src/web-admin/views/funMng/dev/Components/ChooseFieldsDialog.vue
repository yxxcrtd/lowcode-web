<template>
  <el-dialog title="选择字段" v-model="dialogVisible" width="1200px">
    <div class="dialog-wrap">
      <div class="left-wrap">
        <div class="tabs-model-type">
          <el-input v-model="tableSearch" style="width: 240px" placeholder="请输入表名" :suffix-icon="Search" @keydown.enter="handleSearch" @change="handleSearch" />
        </div>
        <el-tree
          ref="tableTreeRef"
          :data="tableList"
          :props="defaultProps"
          @node-click="handleNodeClick"
          @check-change="handleNodeSelectChange"
          :default-checked-keys="defaultCheckedKeys"
          show-checkbox
          node-key="value"
          :check-strictly="true"
          default-expand-all
        >
        </el-tree>
      </div>
      <div class="right-wrap" v-loading="isLoadTable">
        <div class="table-info">
          <div class="icon">
            <el-icon><Wallet /></el-icon>
          </div>
          <div class="table-content">
            <span class="table-title">
              {{ curTableItem.tableName }}
              <span class="table-code">{{ curTableItem.tableCode }}</span>
            </span>
            <span class="table-remark">{{ curTableItem.remark }}</span>
          </div>
        </div>
        <el-tabs v-model="activeName">
          <el-tab-pane label="配置表" name="base">
            <el-form ref="formRef" label-width="140">
              <el-form-item label="表类型" prop="tableType">
                <el-radio-group v-model="curTableItem.tableType">
                  <el-radio v-for="(item, index) in tableTypeOptions" :key="'tabletype' + index" :value="item.value">{{ item.label }}</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="表关联配置" prop="remark">
                <div class="relation-table-list">
                  <div class="relation-table-item" v-for="(relationItem, index) in curTableItem.relationFields" :key="'relation-table-item' + index">
                    <el-select v-model="relationItem.fieldId" placeholder="选择字段" style="width: 120px">
                      <el-option v-for="(item, index) in tableFields" :key="'relationfield' + index" :label="item.columnName" :value="item.id" />
                    </el-select>
                    <el-select v-model="relationItem.relationType" placeholder="请选择关联类型" style="width: 160px">
                      <el-option v-for="user in relationTypeOptions" :key="user.value" :label="user.label" :value="user.value" />
                    </el-select>
                    <el-select v-model="relationItem.relationTableId" placeholder="请选择关联表" style="width: 160px" @change="handleSelectRelationTable($event, relationItem)">
                      <el-option v-for="item in relationTableList" :key="item.tableId" :label="item.tableName" :value="item.tableId">
                        <span style="float: left">
                          <el-tag v-if="item.tableId==props.mainTableInfo.tableId" type="primary" effect="light" round>主表 </el-tag>
                          {{ item.tableName }}</span
                        >
                        <span style="float: right; color: var(--el-text-color-secondary); font-size: 13px">
                          {{ item.tableComment }}
                        </span>
                      </el-option>
                    </el-select>
                    <el-select v-model="relationItem.relationFieldId" placeholder="选择字段" style="width: 120px">
                      <el-option v-for="user in relationItem.relationTableFieldList" :key="user.id" :label="user.columnName" :value="user.id" />
                    </el-select>
                    <div class="relation-table-action">
                      <el-icon @click="addRelationItem(curTableItem.relationFields, index)"><Plus /></el-icon>
                      <el-icon style="margin-left: 8px" @click="removeRelationItem(curTableItem.relationFields, index)" v-if="index > 0"><Delete /></el-icon>
                    </div>
                  </div>
                </div>
              </el-form-item>
              <el-form-item label="配置筛选条件" prop="where">
                <el-input v-model="curTableItem.where" type="textarea" :rows="4" />
              </el-form-item>
            </el-form>
          </el-tab-pane>
          <el-tab-pane label="选择字段" name="fields">
            <div>
              <JVxeTable
                ref="jVxeTable"
                :columns="fieldColumns"
                :row-height="58"
                height="360px"
                :tablePageConfig="{ enabled: false }"
                :dataSource="curTableItem.fieldList"
                :row-config="{ keyField: 'id', isHover: true }"
                @checkbox-change="handleFieldCheckChange"
              ></JVxeTable>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitForm">确 定</el-button>
      </span>
    </template>
  </el-dialog>
</template>
<script lang="ts" setup>
import { onMounted, ref, nextTick } from 'vue'
import { fieldColumns } from '../../tableMng/data'
import { dataSourceList, getTablePage, getTableFields } from '../api'
import { OptionEx, param } from '../data'
import { cloneDeep } from 'lodash-es'
import { Delete, Plus, Wallet, Search } from '@element-plus/icons-vue'
import { propTypes } from '@/utils/propTypes'

defineOptions({ name: 'EditDialog' })
const props = defineProps({
  mainTableInfo: propTypes.object,
  curSelectTableList: propTypes.array
})

const message = useMessage() // 消息弹窗
const dialogVisible = ref(false)
const activeName = ref('base')

const modelType = ref('表')
const modelTypeOptions = ['表', '功能模型']
const tableTypeOptions = [
  {
    label: '左联',
    value: 2
  },
  {
    label: '右联',
    value: 3
  },
  {
    label: '子表',
    value: 4
  }
]
const relationTypeOptions = [
  {
    label: '主表字段关联子表',
    value: 1
  },
  {
    label: '子表字段关联主表',
    value: 2
  }
]

/** 打开弹窗 */
const open = async (type: string, id?: number) => {
  dialogVisible.value = true
  //加载表格
  getTableList()
  selectTableList.value=cloneDeep(props.curSelectTableList)
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

onMounted(() => {})
/**
 * 组装树形结构图
 */

const tableTreeRef = ref()
const tableList = ref([])
const defaultCheckedKeys=ref([])
const defaultProps = {
  label: 'label',
  value: 'value',
  children: 'children',
  isLeaf: 'isLeaf'
}
const getTableList = async (keyword) => {
  const params = {
    page: 1,
    pageSize: 100,
    keyword: keyword
  }
  const datasourceRes = await dataSourceList()
  const tableRes: any[] = await getTablePage(params)
  tableList.value = datasourceRes.map((item) => {
    item.label = item.name
    item.value = item.id
    item.children = tableRes.list
      .filter((tableItem) => tableItem.datasourceId === item.id && tableItem.id != props.mainTableInfo.tableId)
      .map((tableItem) => {
        return {
          label: tableItem.tableComment,
          value: tableItem.id,
          ...tableItem
        }
      })
    return item
  })
  defaultCheckedKeys.value=props.curSelectTableList.map((item) => item.tableId)
}
/**
 * 树节点点击事件 点击加载表字段
 * @param data
 * @param node
 */
const handleNodeClick = async (data: Tree, node) => {
  if (node.isLeaf) {
    selectTable(data)
  }
}
/**
 * 选中表格
 * @param data
 * @param isChecked
 */
const handleNodeSelectChange = async (data, isChecked) => {
  if (isChecked) {
    selectTable(data, true)
  } else {
    selectTableList.value = selectTableList.value.filter((item) => item.tableId != data.value)
  }
}
const selectTable = async (data, checked) => {
  isLoadTable.value = true
  //加载表格
  let param: param = { tableId: data.value,status: true ,pageSize: 100,pageNo: 1}
  const { list } = await getTableFields(param)
  tableFields.value = list
  //加载配置
  //判断是否已选，已选从已选中加载数据
  let selectItem = selectTableList.value.find((item) => item.tableId === data.value)
  if (selectItem) {
    curTableItem.value = selectItem
  } else {
    curTableItem.value = {
      tableId: data.id,
      tableName: data.tableComment,
      tableCode: data.tableName,
      tableType: 2,
      relationFields: [
        {
          relationType: 1,
          relationTableId: props.mainTableInfo.tableId
        }
      ],
      fieldList: tableFields.value
    }
    relationTableFieldList.value = props.mainTableInfo.fieldList
  }
  console.log('checked',checked)
  if (checked) {
    selectTableList.value.push(curTableItem.value)
    //加载字段选中项
    jVxeTable.value.setCheckboxRow(curTableItem.value.fieldList, true)
  }
  //加载关联表
  curTableItem.value.relationFields.forEach((item) => {
    handleSelectRelationTable(item.relationTableId, item)
  })
  console.log(selectTableList.value)
  isLoadTable.value = false
}
/**
 * 表格树搜索
 */
const tableSearch = ref('')
const handleSearch = (value) => {
  console.log(value)
  getTableList(value)
}
let tableFields = ref([])
const isLoadTable = ref(false)
const jVxeTable = ref()
const relationTableList = computed(() => {
  return [props.mainTableInfo, ...selectTableList.value.filter((item) => item.tableId != curTableItem.value.tableId)]
})
const addRelationItem = (relationFields, index) => {
  relationFields.splice(index, 0, {})
}
const removeRelationItem = (relationFields, index) => {
  relationFields.splice(index, 1)
}
const curTableItem = ref({})
const selectTableList = ref([])
/**
 * 选中字段
 * @param checked
 * @param row
 */
const handleFieldCheckChange = ({ checked, row }) => {
  if (checked) {
    if (!curTableItem.value.fieldList) {
      curTableItem.value.fieldList = []
    }
    curTableItem.value.fieldList.push(row)
  }
}
const relationTableFieldList = ref([])
const handleSelectRelationTable = (val, relationItem) => {
  if (val) {
    if (relationItem.relationTableId === props.mainTableInfo.tableId) {
      relationItem.relationTableFieldList = props.mainTableInfo.fieldList
    } else {
      const relationTableItem = relationTableList.value.find((item) => item.tableId == val)
      if (relationTableItem) {
        relationItem.relationTableFieldList = relationTableItem.fieldList
      }
    }
  }
}

const emit = defineEmits(['selectOk']) // 定义 success 事件，用于操作成功后的回调
const submitForm = () => {
  console.log(selectTableList.value)
  emit('selectOk', cloneDeep(selectTableList.value))
  dialogVisible.value = false
}
</script>
<style lang="scss" scoped>
.dialog-wrap {
  display: flex;
  height: 500px;
  .left-wrap {
    width: 250px;
    border-right: 1px solid #e9e4e4;
    .tabs-model-type {
      width: 100%;
      display: flex;
      justify-content: center;
      margin-bottom: 8px;
    }
  }
  .right-wrap {
    width: 900px;
    padding: 0 10px;
  }
  .title {
    font-size: 14px;
    margin: 4px;
  }
}
.custom-tree-node {
  color: #333;
  width: 100%;
  display: flex;
  justify-content: space-between;
  .men-title {
    display: flex;
    justify-content: center;
    align-items: center;
    img {
      height: 12px;
      margin-right: 4px;
    }
    .app_img {
      height: 18px;
    }
  }
  .action {
    display: none;
  }
  &:hover {
    .action {
      display: block;
    }
  }
}

.filter-header {
  display: flex;
  justify-content: space-between;
}
.filter-list {
  margin-top: 10px;
  .filter-item {
    display: flex;
    justify-content: space-evenly;
    align-items: center;
    margin-bottom: 8px;

    .item-remove {
      font-size: 14px;
      margin: 0 15px;
    }
    > div {
      margin: 0 2px;
    }
  }
}
:deep(.j-vxe-table) {
  height: 100%;
}
:deep(.el-tree-node) {
  .is-leaf + .el-checkbox .el-checkbox__inner {
    display: inline-block;
  }
  .el-checkbox .el-checkbox__inner {
    display: none;
  }
}
.table-info {
  display: flex;
  align-items: center;
  margin: 2px 0px 10px 0px;
  background: #f5f8ff;
  padding: 16px 18px;
  border-radius: 6px;
  .icon {
    i {
      font-size: 24px;
      color: #40a9ff;
    }
    margin-right: 10px;
  }
  .table-content {
    display: flex;
    flex-direction: column;
    .table-title {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 6px;
    }
    .table-code {
      margin: 0 10px 0 6px;
      font-size: 14px;
      color: #1e83e9;
    }
    .datasource-tag {
      font-size: 12px;
      font-weight: 500;
      margin-right: 8px;
    }
    .table-remark {
      font-size: 12px;
      color: #7d7d7d;
    }
  }
}
.relation-table-item {
  display: flex;
  margin-bottom: 10px;
  > div {
    margin-right: 10px;
  }
}
</style>
