<template>
  <TreeListPage ref="treeListPageRef" :columns="columns" :row-height="48" :data-fun="getList">
    <template #left>
      <div>数据源</div>
      <el-collapse v-model="activeNames">
        <el-collapse-item :title="item.ip" :name="item.ip" v-for="(item,index) in dataSourceData" :key="'host-list'+index">
          <div v-for="(childItem,childIndex) in item.children" :key="'datasource-list'+childIndex" class="collapse-item" :class="{ 'selected': childItem.selected }" @click="()=>selectDataItem(childItem)">

            <el-tooltip
              placement="right-start"
              raw-content
            >
              <div class="item" @click="()=>clickDataItem(childItem.id)">
                <el-tag class="tag" type="primary">{{childItem.typeSource}}</el-tag>
                <span>{{childItem.name}}</span>
              </div>
              <template #content> 
                <div>
                  <div>ip:{{childItem.ip}}</div>
                  <div>数据库类型:{{childItem.typeSource}}</div>
                  <div>用户名:{{childItem.username}}</div>
                </div>
              </template>
            </el-tooltip>
<!--            <span>{{childItem.dataSourceType}}</span>-->
          </div>
        </el-collapse-item>
      </el-collapse>
    </template>
    <template #searchItems="{queryParams}">
      <el-row>
        <el-col :span="8">
          <el-form-item label="名称" prop="tableComment">
            <el-input
              v-model="queryParams.tableComment"
              placeholder="请输入名称"
              clearable
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="表名" prop="tableName">
            <el-input
              v-model="queryParams.tableName"
              placeholder="请输入表名"
              clearable
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="状态" prop="status">
            <el-select
              v-model="queryParams.status"
              placeholder="状态"
              clearable
              class="!w-100%"
            >
              <el-option
                label="已生效"
                value="true"
              />
              <el-option
                label="未生效"
                value="false"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="更新时间" prop="updateTime">
            <el-date-picker
              v-model="queryParams.updateTime"
              value-format="YYYY-MM-DD"
              type="daterange"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              class="!w-100%"
            />
          </el-form-item>
        </el-col>
      </el-row>


    </template>
    <template #buttonItems>
      <el-button type="primary" @click="openForm('create')"> <Icon icon="ep:plus" /> 新建表 </el-button>
      <el-button @click="openLoadDbTable"> <Icon icon="ep:coin" /> 从数据库加载 </el-button>
      <el-button @click="openGenCode"> 生成代码 </el-button>
    </template>
    <template #action_default="{ row }">
      <div class="table-action">
        <el-link type="primary" @click="reloadTable(row)" v-if="row.status === true">同步</el-link>
        <el-divider direction="vertical" v-if="row.status === true"/>
        <el-link type="primary" @click="handleEdit(row)">编辑</el-link>
        <el-divider direction="vertical" />
        <el-link type="primary" @click="handleDesign(row)">设计</el-link>
        <el-divider direction="vertical"/>
        <el-link type="primary" v-if="false" @click="handleDelete(row)">删除</el-link>
      </div>
    </template>
    <template #status_default="{ row }">
      {{row.status === true ? '已生效' : '未生效'}}
    </template>
    <template #tableType_default="{ row }">
      <el-tag type="primary" v-if="row.tableType == 'biz_table'">业务表</el-tag>
      <el-tag type="success" v-if="row.tableType === 'sys_table' || row.isSys">系统表</el-tag>
      <el-tag type="warning" v-if="row.tableType === 'virtual_table'">虚拟表</el-tag>
    </template>
  </TreeListPage>
  <GenCodeDialog ref="formGenCodeRef" />
  <EditDialog ref="formRef" @success="createSuccess" @closed="dialogClosed"/>
  <ImportTableDialog ref="importTableRef" @success="handleQuery" />
</template>
<script lang="ts" setup>
import { columns } from './data'
import type{ dataSourceItem } from './data'
import TreeListPage from "@/web-admin/components/PageTemplate/TreeListPage.vue"
import {getTablePage, deleteTable, dataSourceList, reloadTableApi} from './api'
import EditDialog from './Components/EditDialog.vue'
import GenCodeDialog from './Components/CreateCodeDialog.vue'
import ImportTableDialog from './Components/importTableDialog.vue'
import { cloneDeep } from 'lodash-es'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
defineOptions({ name: 'TableMng' })

const router = useRouter()
const message = useMessage() // 消息弹窗
const queryParams = ref({})
let datasourceId = ref('')
const clickDataItem = (id:string)=>{
  datasourceId.value = id
  treeListPageRef.value.search()
}
const selectDataItem = (childItem) => {
  // 清除之前选中的项
  dataSourceData.value.forEach(item => {
    item.children.forEach(child => {
      child.selected = false;
    });
  });
  // 设置当前项为选中
  childItem.selected = true;
}
/** 查询列表 */
const getList = (pageParam) => {
  if (datasourceId.value) {
    pageParam.datasourceId = datasourceId.value
  }
  console.log('pageParam',pageParam)
  return getTablePage(pageParam)
}
/**
 * 编辑
 * @param row
 */
const handleEdit = async (row) => {
  openForm('edit', cloneDeep(row))
}
/**
 * 设计
 * @param row
 */
const handleDesign = (row) => {
  toDesign(row.id)
}

const toDesign = (id) => {
  router.push({
    path: '/develop/tableMng/design',
    query: {
      id: id
    }
  })
}

/**
 * 删除
 * @param id
 */
const treeListPageRef=ref()
const handleDelete = async (row) => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    // 发起删除
    await deleteTable(row.id)
    message.success('删除成功')
    // 刷新列表
    treeListPageRef.value.search()
  } catch {}
}
const handleQuery=()=>{
  treeListPageRef.value.search()
}

//重新加载表结构
const reloadTable = async (row) => {
  console.log('row', row.id)
  if (row.id) {
    const res = await reloadTableApi(row.id)
    if (res) {
      message.success('重新加载成功')
    }
  }
}

/**
 * 新增、编辑表弹框
 */
const formRef = ref()
const openForm = (type: string, row) => {
  formRef.value.open(type, row)
}
/**
 * 新增编辑表完成操作
 * @param id
 */
const createSuccess =async (type,id) => {
  // 刷新列表
  treeListPageRef.value.search()
}
const dialogClosed=async (type,id)=>{
  if(type==='create'){
    await nextTick()
    toDesign(id)
  }
}
/**
 * 生成代码弹框
 */
const formGenCodeRef = ref()
const openGenCode = () => {
  formGenCodeRef.value.open()
}

const importTableRef = ref()
const openLoadDbTable = () => {
  importTableRef.value.open(datasourceId.value)
}
//加入数据源list
// let dataList = ref<any>([])
const activeNames=ref([])
const dataSourceData=ref<any>([])
const handleDataSourceList = (datasList: any[]) => {
  datasList.forEach(item=>{
    const isExits=dataSourceData.value.find(groupItem=>groupItem.ip === item.ip)
    if(isExits){
      isExits.children.push(item)
    }else{
      dataSourceData.value.push({ip:item.ip,children:[item]})
      activeNames.value.push(item.ip)
    }
  })
}
const requestDataSourceAction = async () => {
  const data = await dataSourceList()
  handleDataSourceList(data)
  // console.log(data,44444)
}
requestDataSourceAction()
/** 初始化 */
onMounted(() => {})
</script>
<style scoped lang="scss">
:deep(.el-collapse){
  border:none;
  .el-collapse-item__header{
    position: relative;
    font-size: 14px;
    font-weight: 600;
    padding-left: 10px;
    &::before{
      content:'';
      position: absolute;
      top: 16px;
      left:0;
      width: 4px;
      height: 16px;
      background: #40a9ff;
    }
  }
  .el-collapse-item__wrap{
    padding: 0 20px 0 10px;
  }
}
.collapse-item{
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  padding:2px 8px;
  border-radius: 4px;
  &:hover{
    background: #ecf5ff;
    cursor: pointer;
  }
  &.selected{
    background: #ecf5ff;
  }
}
.item{
  width: 100%;
  position: relative;
  display: flex;
  .tag{
    margin-right: 8px;
  }
}


</style>
