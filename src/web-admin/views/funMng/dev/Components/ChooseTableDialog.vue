<template>
  <Dialog title="选择表" v-model="dialogVisible" width="80vw">
    <div class="dialog-wrap">
      <div class="action-content">
<!--        <el-button @click="addChildTable">添加子表</el-button>-->
      </div>
      <div class="table-content">
        <vxe-table
          ref="vxeTableRef"
          border="inner"
          :row-height="58"
          height="420px"
          align="center"
          :tree-config="{ transform: true, rowField: 'tableKey', parentField: 'parentKey', expandAll: true }"
          :data="selectTableList"
        >
          <vxe-column field="tableName" title="类型" width="70">
            <template #default="{ row }">
              <el-tag type="danger" v-if="row.isMain === 1 || row.isMain === true">主表</el-tag>
              <el-tag type="warning" v-if="row.relationType === 'LEFT JOIN'">左联</el-tag>
              <el-tag type="warning" v-if="row.relationType === 'RIGHT JOIN'">右联</el-tag>
              <el-tag type="success" v-if="row.isChild && !row.parentKey">子表</el-tag>
              <el-tag type="warning" v-if="row.isChild && row.parentKey">二级子表</el-tag>
            </template>
          </vxe-column>
          <vxe-column field="tableName" title="表名称" tree-node width="200">
            <template #default="{ row }">
              <!--              <el-tree-select-->
              <!--                v-model="row.tableId"-->
              <!--                :props="defaultProps"-->
              <!--                :data="tableList"-->
              <!--                :disabled="row.isMain===1"-->
              <!--                @visible-change="tableSelectVisible($event,row.tableId)"-->
              <!--                @node-click="(data,node)=>nodeClick(row,data,node)"-->
              <!--              />-->
              <SelectDbTable
                v-model="row.tableId"
                v-model:show-label="row.tableComment"
                :disabled="!!row.isMain"
                @change="(val, option) => handleTableChange(row, val, option)"
              ></SelectDbTable>
            </template>
          </vxe-column>
          <vxe-column field="relationType" title="关系" width="160">
            <template #default="{ row }">
              <el-select v-if="!row.isMain && !row.isChild" v-model="row.relationType" placeholder="选择关联类型">
                <el-option
                  v-for="(item, index) in tableTypeOptions"
                  :key="'joyinType_' + index"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </template>
          </vxe-column>
          <vxe-column field="type" title="外键关系" min-width="500px">
            <template #default="{ row }">
              <div class="relation-table-list" v-if="!row.isMain">
                <div
                  class="relation-table-item"
                  v-for="(relationItem, index) in row.relationFields"
                  :key="'relation-table-item' + index"
                >
                  <el-select v-model="relationItem.fieldId" placeholder="选择字段" style="width: 120px">
                    <el-option
                      v-for="(item, index) in row.tableFields"
                      :key="'relationfield' + index"
                      :label="item.columnName"
                      :value="item.fieldId"
                    />
                  </el-select>
                  <el-tree-select default-expand-all v-model="relationItem.relationTableKey" placeholder="请选择关联表" @visibleChange="(e) => e && getRelationDirectionTable(row)" style="width: 200px" :data="relationTableKeyList" :props="{
                    children:'children',label:'tableComment',value:'tableKey' 
                  }" :check-strictly="true"/>
                  <!-- <el-select v-model="relationItem.relationTableKey" placeholder="请选择关联类型" style="width: 160px">
                    <el-option
                      v-for="user in getRelationDirectionTable"
                      :key="user.tableKey"
                      :label="user.tableComment"
                      :value="user.tableKey"
                    />
                  </el-select> -->
                  <el-select v-model="relationItem.relationFieldId" placeholder="选择主表字段" style="width: 140px">
                    <el-option
                      v-for="tableField in (selectTableList.find(item => item.tableKey === relationItem.relationTableKey)?.tableFields || [])"
                      :key="tableField.fieldId"
                      :label="tableField.columnName"
                      :value="tableField.fieldId"
                    />
                  </el-select>
                  <div class="relation-table-action">
                    <el-icon @click="addRelationItem(row.relationFields, index)"><Plus /></el-icon>
                    <el-icon
                      style="margin-left: 8px"
                      @click="removeRelationItem(row.relationFields, index)"
                      v-if="index > 0"
                      ><Delete
                    /></el-icon>
                  </div>
                </div>
              </div>
            </template>
          </vxe-column>
          <vxe-column field="readonly" title="是否只读" width="70">
            <template #default="{ row }">
              <el-checkbox v-model="row.readOnly" />
            </template>
          </vxe-column>
          <vxe-column field="readonly" title="表配置" width="150">
            <template #default="{ row }">
              <el-button text type="primary" @click="openChooseTableSearch(row)"> 配置 </el-button>
            </template>
          </vxe-column>
          <vxe-column field="action" title="操作" width="200">
            <template #default="{ row, rowIndex }">
              <div class="table-action">
                <el-link type="primary" @click="addJoinTable(row, rowIndex)">添加关联表</el-link>
                <el-divider direction="vertical" v-if="row.isMain || (row.isChild && !row.parentKey)"/>
                <el-link type="primary" v-if="row.isMain || (row.isChild && !row.parentKey)" @click="addChildTable(row, rowIndex)">添加子表</el-link>
                <el-divider direction="vertical" v-if="!row.isMain" />
                <el-link type="primary" v-if="!row.isMain" @click="delRow(row,rowIndex)">删除</el-link>
              </div>
            </template>
          </vxe-column>
        </vxe-table>
      </div>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitForm">确 定</el-button>
      </span>
    </template>
  </Dialog>
  <ChooseTableSearch ref="chooseTableSearchRef" @success="chooseTableSearchSuccess"></ChooseTableSearch>
</template>
<script lang="ts" setup>
import { onMounted, ref, nextTick } from 'vue'
import { dataSourceList, getTablePage, getTableFields } from '../api'
import {generateAlias} from '@/utils'
import { OptionEx, param } from '../data'
import { cloneDeep, uniqueId } from 'lodash-es'
import { Delete, Plus, Wallet, Search } from '@element-plus/icons-vue'
import { propTypes } from '@/utils/propTypes'
import SelectTable from './SelectTable.vue'
import { SelectDbTable } from '@/components-yt'
import ChooseTableSearch from '@/web-admin/views/funMng/dev/Components/ChooseTableSearch.vue'
import {generateUUID} from "@/utils";

defineOptions({ name: 'EditDialog' })
const props = defineProps({
  mainTableInfo: propTypes.object,
  curSelectTableList: propTypes.array
})

const message = useMessage() // 消息弹窗
const dialogVisible = ref(false)

const tableTypeOptions = [
  {
    label: '左联',
    value: 'LEFT JOIN'
  },
  {
    label: '右联',
    value: 'RIGHT JOIN'
  }
]
const relationDirectionOptions = [
  {
    label: '主表字段关联子表',
    value: 1
  },
  {
    label: '子表字段关联主表',
    value: 2
  }
]
/**
 * 获取已选的关联表下拉框
 */
const relationTableKeyList = ref([])
const getRelationDirectionTable = (row) => {
  let isChildrenMain,isMainChildren,isChildChildren = false
  //判断是否是子表的第一条
  if(!row.parentKey && !row.isMain) {
    isChildrenMain = true
  }
  //判断是否是主表的数据
  if(getParentNode(selectTableList.value,row.parentKey)?.isMain){
    isMainChildren = true
  }else{
    //判断是否是子表的子表
    if(row.parentKey){
      isChildChildren = true
    }
  }
  console.log('selectTableList',selectTableList)
  const list = selectTableList.value.map(item => {
    let disabled = false
    //将没选择表的置灰
    if(!item.tableId){
      disabled = true
    }
    //将自身置灰
    if(item.tableKey === row.tableKey){
      disabled = true
    }
    //子表的主表可关联主表、主表的一级子表
    if(isChildrenMain){
      const parentNode = getParentNode(selectTableList.value,item.parentKey)
      const count = getNodeCount(selectTableList.value,item.tableKey,0)
      //放开一级子表，允许子表下再挂子表
      if(![1,2].includes(count) ){
        disabled = true
      }
    }
    //主表下的子表只能关联父表及兄弟表、一级子表 子表的子表只能选择父表和兄弟表
    if(isMainChildren || isChildChildren){
      if(item.parentKey !== row.parentKey && item.tableKey !== row.parentKey){
        disabled = true
      }
    }
    return {...item,disabled}
  })
  relationTableKeyList.value = arrayToTree(list,undefined)
}
/**
 * 获取根节点
 */
const getParentNode = (list,parentKey) => {
  let parentNode = list.find(item => item.tableKey === parentKey)
  if(parentNode?.parentKey){
    parentNode = getParentNode(list,parentNode.parentKey)
  }
  return parentNode
}
/**
 * 获取层级
 */
 const getNodeCount = (list,tableKey,count) => {
  let count1 = count + 1 
  let parentNode = list.find(item => item.tableKey === tableKey)
  if(parentNode?.parentKey){
    count1 = getNodeCount(list,parentNode.parentKey,count1)
  }
  return count1
}
/**
 * 将list转成树形结构
 */
const arrayToTree = (arr, parentKey) => {
  let result = []
  for (let i = 0; i < arr.length; i++) {
    if (arr[i].parentKey === parentKey) {
      let children = arrayToTree(arr, arr[i].tableKey)
      if (children.length) {
        arr[i].children = children;
      }
      result.push({
        ...arr[i],
        tableComment:arr[i].tableComment || '未选表',
      })
    }
  }
  return result
}
const selectTableList = ref([])
const vxeTableRef = ref()
/** 打开弹窗 */
const open = async (type: string, id?: number) => {
  dialogVisible.value = true
  selectTableList.value = cloneDeep(props.curSelectTableList)
  const mainTable=selectTableList.value.find(item=>item.isMain)
  selectTableList.value.forEach((item, index) => {
    if (!item.isMain) {
      const it = selectTableList.value.find(childItem => childItem.tableKey === item.mainTableKey)
      if (it) {
        if(item.relationFields) {
          item.relationFields.forEach(relationItem => {
            relationItem.relationTableFieldList = it.tableFields
          })
        }
      }
    }
    if(item.mainTableKey) {
      if(item.isChild && item.mainTableKey==mainTable.tableKey){
        
      }else{
        item.parentKey = item.mainTableKey
      }
    }
  })
  relationTableKeyList.value = arrayToTree(selectTableList.value,undefined)
  console.log('selectTableList', selectTableList.value)
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

onMounted(() => {})
const addChildTable = (row,rowIndex) => {
  if (row.tableFields && row.tableFields.length > 0){
    row.tableFields = row.tableFields.map((item) => {
      return {
        ...item,
        fieldId: item.fieldId ? item.fieldId:item.id
      }
    })
  }
  const childTableItem={
    tableKey: generateUUID(),
    isChild: true,
    mainTableKey: row.tableKey,
    parentKey:row.isMain ? undefined : row.tableKey,
    mainTableId: row.tableId,
    relationFields: [
      {
        relationDirection: 1,
        relationTableId: row.tableId,
        relationTableFieldList: row.tableFields
      }
    ]
  }
  selectTableList.value.push(childTableItem)
  nextTick(() => {
    vxeTableRef.value.setTreeExpand(row, true)
  })
}
const addJoinTable = (row, index) => {
  if (row.tableFields && row.tableFields.length > 0){
    row.tableFields = row.tableFields.map((item) => {
      return {
        ...item,
        fieldId: item.fieldId ? item.fieldId:item.id
      }
    })
  }
  const joinTableItem={
    tableKey: generateUUID(),
    mainTableKey: row.tableKey,
    parentKey: row.tableKey,
    mainTableId: row.tableId,
    relationFields: [
      {
        relationDirection: 1,
        relationTableId: row.tableId,
        relationTableFieldList: row.tableFields
      }
    ]
  }
  //获取关联表的最大索引
  let addIndex=index+1
  for(let i=selectTableList.value.length-1; i>=0; i--) {
    if(selectTableList.value[i].parentKey===row.tableKey){
      addIndex=i+1;
      break;
    }
  }
  selectTableList.value.splice(addIndex, 0, joinTableItem)
  nextTick(() => {
    vxeTableRef.value.setTreeExpand(row, true)
  })
}
const delRow = async (row,rowIndex) => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    // 发起删除
    if(row.children){
      delChildRen(row.children)
    }
    selectTableList.value.splice(selectTableList.value.findIndex(i => i.tableKey === row.tableKey), 1)
  } catch {}
}
const delChildRen = (list) => {
  list.forEach(item => {
    if(item.children){
      delChildRen(item.children)
    }
    selectTableList.value.splice(selectTableList.value.findIndex(i => i.tableKey === item.tableKey), 1)
  })
}
const tableList = ref([])
const defaultProps = {
  label: 'tableComment',
  value: 'tableId',
  children: 'children',
  isLeaf: 'isLeaf'
}
const getTableList = async (keyword) => {
  const params = {
    page: 1,
    pageSize: 1000,
    keyword: keyword
  }
  const datasourceRes = await dataSourceList()
  const tableRes: any[] = await getTablePage(params)
  tableList.value = datasourceRes.map((item) => {
    item.tableComment = item.name
    item.tableId = item.id
    item.children = tableRes.list.map((tableItem) => {
      return {
        tableId: tableItem.id,
        ...tableItem
      }
    })
    return item
  })
}
getTableList()

const loadTableOptions = (tableId) => {
  const choosedTableId = selectTableList.value
    .filter((item, index) => item.tableId && item.tableId != tableId)
    .map((item) => item.tableId)
  tableList.value.forEach((item) => {
    item.children.forEach((childItem) => {
      if (choosedTableId.includes(childItem.tableId)) {
        childItem.disabled = true
      } else {
        childItem.disabled = false
      }
    })
    return item
  })
}

const handleTableChange = async (row, val, data) => {
  //加载表格字段
  let param: param = { tableId: data.id, status: true, pageSize: 100, pageNo: 1 }
  const { list } = await getTableFields(param)
  row.tableName = data.tableName
  row.tableComment = data.tableComment
  row.tableId = data.id
  row.tableFields = list.map((item) => {
    return {
      ...item,
      fieldId: item.id,
      id:null,
      isChecked: true
    }
  })
}
const addRelationItem = (relationFields, index) => {
  const tmp = cloneDeep(relationFields[index])
  tmp.fieldId = null
  tmp.relationFieldId = null
  tmp.id = null
  relationFields.splice(index, 0, tmp)

}
const removeRelationItem = (relationFields, index) => {
  relationFields.splice(index, 1)
}

const emit = defineEmits(['selectOk']) // 定义 success 事件，用于操作成功后的回调
const submitForm = () => {
  const tempSelectTableList = cloneDeep(selectTableList.value)
  let curAlias:any=''
  tempSelectTableList.forEach((item) => {
    delete item.children
    delete item._X_ROW_CHILD
    delete item._X_ROW_KEY
    if (item.relationFields && item.relationFields.length) {
      item.relationFields.forEach((relationItem) => {
        delete relationItem.relationTableFieldList
      })
    }
    curAlias=generateAlias(curAlias)
    item.tableAlias=curAlias
  })
  emit('selectOk', tempSelectTableList)
  dialogVisible.value = false
}

const chooseTableSearchRef=ref()
const openChooseTableSearch=(row)=>{
  console.log(row)
  const searchParam={
    tableId:row.tableId,
    tableKey:row.tableKey,
    parameterType:row.parameterType,
    parameterName:row.parameterName,
    searchSql:row.searchSql,
    tableRemark:row.tableRemark,
  }
  chooseTableSearchRef.value.open(searchParam)
}
const chooseTableSearchSuccess=(data)=>{
  let editRow=selectTableList.value.find(item=>item.tableKey==data.tableKey)
  if(editRow){
    editRow=Object.assign(editRow,data)
  }
}
</script>
<style lang="scss" scoped>
.dialog-wrap {
  height: 500px;
  .action-content {
    margin-bottom: 10px;
  }
  .table-content {
    .relation-table-item {
      display: flex;
      align-items: center;
      > div {
        margin-right: 10px;
      }
      .relation-table-action > i {
        cursor: pointer;
      }
    }
  }
}
</style>
