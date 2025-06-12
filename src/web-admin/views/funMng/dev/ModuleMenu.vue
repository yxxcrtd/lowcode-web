<template>
  <div class="list-page-container" v-loading="isLoading">
    <div class="button-content">
      <div class="left">
        <el-button type="primary" @click="addMenu()">
          <Icon icon="ep:plus" color="white" /> 新增
        </el-button>
      </div>
      <div class="right">
        <el-input v-model.trim="modeName" placeholder="请输入模块名称" clearable class="!w-240px" @keyup="handleQuery" @clear="handleQuery">
          <template #append>
            <el-button :icon="Search" @click="handleQuery"/>
          </template>
        </el-input>
      </div>
    </div>
    <div class="content" v-if="!isLoading">
      <div class="left-menu-wrap">
        <el-tree
          ref="treeRef"
          :data="menuList"
          :expand-on-click-node="false"
          :filter-node-method="filterNode"
          :props="defaultProps"
          default-expand-all
          highlight-current
          node-key="id"
          style="height: 100%"
          @node-click="handleNodeClick"
        >
          <template #default="{ node, data }">
            <span class="custom-tree-node">
              <div class="men-title">
                <div> {{ node.label }}</div>
              </div>
              <span class="action" v-if="data.id!=0">
                <el-icon @click.prevent.stop="addMenu(data)"><Plus /></el-icon>
                <el-icon style="margin-left: 4px" @click.prevent.stop="updateModule(data)"><Edit /></el-icon>
                <el-icon style="margin-left: 4px" @click.prevent.stop="remove(data)"><Delete /></el-icon>
              </span>
            </span>
          </template>
        </el-tree>
      </div>
      <div style="width: 100%;" v-if="modeTableList && modeTableList.length">
        <div class="model-main">
          <el-card class="box-card" v-for="item in modeTableList" :key="item.id" @click.prevent.stop="modeViewClick(item)">
            <div class="card-content">
              <div class="card-icon" :class="getBgColorCls(item)">
                <Icon v-if="item.functionIcon" icon="ep:edit" color="white" :size="20"></Icon>
                <Icon v-else icon="ep:collection" color="white" :size="20"></Icon>
              </div>
              <div>
                <div class="card-title">
                  <span>{{ item.functionName }}</span>
                  <el-icon class="card-edit-icon" @click.prevent.stop="updateModule(item)"><Edit /></el-icon>
                </div>
                <div class="text">
                  {{ ((item.remark && item.remark.length > 42) ? item.remark.slice(0, 42) + '...' : item.remark) }}
                </div>
              </div>
            </div>
            <div class="card-footer">
              <div class="version">V1.0.0</div>
              <div class="action">
                <el-button type="primary" link :icon="Monitor" @click.prevent.stop="modeViewClick(item)">设计</el-button>
                <el-button type="danger" link :icon="Delete" @click.prevent.stop="remove(item)" @success="editSuccess">删除</el-button>
                <el-dropdown @command="handleCommand">
                  <el-button type="danger" link :icon="ArrowDown">更多</el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item command="import">导入</el-dropdown-item>
                      <el-dropdown-item command="export">导出</el-dropdown-item>
                      <el-dropdown-item command="lock">锁定</el-dropdown-item>
                      <el-dropdown-item command="unlock">解锁</el-dropdown-item>
                      <el-dropdown-item command="backup">备份</el-dropdown-item>
                      <el-dropdown-item command="log">修改记录</el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </div>
            <div class="lock-tag" v-if="item.isLock">
              <span class="lock-text">锁定</span>
            </div>
          </el-card>
        </div>
        <div style="width: 100%;display: flex;justify-content: end;">
          <el-pagination
            v-model:current-page="pagination.current"
            v-model:page-size="pagination.pageSize"
            :page-sizes="[8, 16, 32, 64]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="modeList?.length || 0"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
      <div v-else class="model-empty-main">
        <el-empty description="暂无应用">
          <el-button type="primary" @click="addMenu()">新建一个</el-button>
        </el-empty>
      </div>
    </div>
  </div>
  <EditAppDialog ref="editDialogRef" @success="editSuccess" />
  <LogDrawer ref="logDrawerRef" />
  <ImportModel ref="refImportRef"/>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import * as MenuApi from '@/api/system/menu'
import { handleTree } from '@/utils/tree'
import { Plus, Delete, Edit,Search,Monitor,ArrowDown } from '@element-plus/icons-vue'
import EditAppDialog from "./Components/EditAppDialog.vue";
import {ElMessageBox, ElTree} from "element-plus";
import {getPinyin} from '@/utils'
import LogDrawer from './Components/LogDrawer.vue'
import ImportModel from './Components/ImportModel.vue'
import {modelExport,modelLock, modelUnlock} from "@/web-admin/views/funMng/dev/api";

defineOptions({ name: 'ModuleMenu' })
const router = useRouter() // 路由
const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化
const modeName = ref()
const allList = ref<any[]>([]) // 初始数据
const menuList = ref<any[]>([]) // 菜单树形结构，不包含模块
const modeList = ref() // 模块列表-查询结果
const treeRef = ref()
const isLoading = ref(true) // 列表的加载中
const defaultProps = {
  children: 'children',
  label: 'functionName',
  value: 'id'
}
/** 分页信息 */
const pagination = ref({
  current:1,
  pageSize:20
})
/** 查询模块列表 */
const getModeList = async () => {
  isLoading.value = true
  try {
    let res = await MenuApi.getFunctionInfoList({})
    allList.value = res
    allList.value.forEach(item => {
      item.functionNamePinYin=getPinyin(item.functionName,'')
    })
    menuList.value = [
      {
        functionName:'全部',
        id:0,
        children:handleTree(res.filter(item=>item.functionType!=='2'))
      }
    ]
    modeList.value=allList.value.filter(item=>item.functionType==='2') || []
    getModeTableList()
  } finally {
    isLoading.value = false
  }
}

const modeTableList = ref([])
const getModeTableList = () => {
  if(pagination.value.current * pagination.value.pageSize < modeList.value.length){
    modeTableList.value = modeList.value.slice((pagination.value.current-1)*pagination.value.pageSize,pagination.value.current*pagination.value.pageSize)
  }else{
    modeTableList.value =  modeList.value.slice((pagination.value.current-1)*pagination.value.pageSize)
  }
}
const handleSizeChange = (val) => {
  pagination.value.current = 1
  pagination.value.pageSize = val
  getModeTableList()
}
const handleCurrentChange = (val) => {
  pagination.value.current = val
  getModeTableList()
}
/** 搜索按钮操作 */
const handleQuery = () => {
  serchMode()
}
const curChooseTreeNode=ref()
/** 处理菜单被点击 */
const handleNodeClick = (data: Tree,node) => {
  modeList.value = []
  curChooseTreeNode.value=data
  if(data.id===0){
    modeList.value=[...allList.value.filter(item=>item.functionType==='2')]
  }else{
    let parentIds=[data.id]
    for (let index = 0; index < allList.value.length; index++) {
      const item=allList.value[index]
      if(parentIds.includes(item.parentId)){
        if(item.functionType==='2'){
          modeList.value.push(item)
        }else{
          parentIds.push(item.id)
        }
      }
    }
  }
  pagination.value.current = 1
  getModeTableList()
}
/** 通过模块名模糊检索模块 */
const serchMode = () => {
  treeRef.value.setCurrentKey(0)
  modeList.value = allList.value.filter(item=>{
    return item.functionType === '2' && (item.functionName?.toLowerCase().includes(modeName.value.toLowerCase()) || item.functionNamePinYin?.toLowerCase().includes(modeName.value.toLowerCase()))
  })
  pagination.value.current = 1
  getModeTableList()
}
/** 跳转到模块详情页 */
const modeViewClick = (item) => {
  console.log(JSON.stringify(item))
  router.push({
    path: '/develop/appDev',
    meta:{
      title:item.functionName
    },
    query:{
      id:item.id
    }
  })
}
/** 基于模块名称过滤 */
const filterNode = (functionName: string, data: Tree) => {
  if (!functionName) return true
  return data.name.includes(functionName)
}
/** 新增模块菜单 */
const editDialogRef=ref()
const addMenu=(data?: Tree) =>{
  if(!data){
    data=curChooseTreeNode.value
  }
  editDialogRef.value.open('create',data)
}
/** 修改模块菜单 */
const updateModule=(data)=>{
  editDialogRef.value.open('update',data)
}
/** 删除模块菜单 */
const remove=async (data: Tree)=>{
  for (let index = 0; index < allList.value.length; index++) {
    if (allList.value[index].parentId === data.id) {
      message.warning("存在子模块，不允许删除目录")
      return;
    }
  }
  try {
    // 删除的二次确认
    await message.delConfirm()
    // 发起删除
    await MenuApi.deleteFunctionInfo(data.id)
    message.success(t('common.delSuccess'))
    // 刷新列表
    allList.value=allList.value.filter(item=>item.id!==data.id)
    modeList.value=modeList.value.filter(item=>item.id!==data.id)
  } catch {}
}
/** 操作成功刷新页面 */
const editSuccess=(_data)=>{
  getModeList()
  serchMode()
}

const getBgColorCls=(item)=>{
  const nameLen=item.functionName.length;
  // 生成一个随机索引
  const randomIndex = nameLen%5;
  // 返回随机索引对应的数组项
  return 'icon-t-'+[randomIndex+1];
}

const handleCommand=(cmd,model)=>{
  switch (cmd){
    case 'import':
      handleImport(model)
      break;
    case 'export':
      handleExport(model)
      break
    case 'lock':
      handleLock(model)
      break
    case 'unlock':
      handleUnlock(model)
      break
    case 'backup':
      handleBackUp(model)
      break
    case 'log':
      handleShowLog(model)
      break
    default:
      break
  }
}
/**
 * 单个导入
 */
const refImportRef=ref()
const handleImport=(model)=>{
  refImportRef.value.open(model)
}
/**
 * 单个导出
 */
const handleExport=(model)=>{
  modelExport(model)
}
/**
 * 锁定
 */
const handleLock=async (model)=>{
  await ElMessageBox.confirm('锁定后不允许编辑，确定要锁定吗', '温馨提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
  await modelLock({id:model.id})
  message.success("锁定成功")
}
/**
 * 解锁
 */
const handleUnlock=async (model)=>{
  await ElMessageBox.confirm('解锁就将允许编辑，确定要解锁吗', '温馨提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
  await modelUnlock({id:model.id})
  message.success("锁定成功")
}
/**
 * 备份
 */
const handleBackUp=async (model)=>{
  await modelUnlock({id:model.id})
  await ElMessageBox.alert('备份完成，备份后可在日志中进行还原', '温馨提示')
}
/**
 * 日志
 */
const logDrawerRef = ref()
const handleShowLog=(model)=>{
  logDrawerRef.value.open('model',model)
}

/** 初始化 */
onMounted(async () => {
  await getModeList()
})
</script>
<style lang="scss" scoped>
.list-page-container {
  .button-content {
    display: flex;
    justify-content: space-between;
  }
  .content {
    display: flex;
    height: calc(100% - 100px);
    .left-menu-wrap {
      width: 240Px;
      overflow-y: auto;
      height: 100%;
      .custom-tree-node {
        color: #333;
        width: 100%;
        display: flex;
        justify-content: space-between;
        position: relative;
        .men-title {
          display: flex;
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
          position: absolute;
          right: 0;
          top: 2px;
          display: none;
        }
        &:hover {
          .men-title {
            // width: 88px;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .action {
            display: block;
          }
        }
      }
    }
    .model-empty-main{
      width: 100%;
      padding: 0 10px;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .model-main {
      width: calc(100% - 22px);
      padding: 10px 10px;
      margin-bottom:12px;
      height: calc(100vh - 210px);
      display: flex;
      flex-wrap: wrap;
      align-content: flex-start;
      overflow-y: auto;
      .el-icon {
        cursor: pointer;
        color: #333;
        &:hover {
          color: #40a9ff;
        }
      }
      .text {
        font-size: 12px;
        color: #8b8b8b;
        overflow: hidden;
        margin-top: 2px;
        height: 20px;
        line-height: 20px;
        text-overflow: ellipsis;
        word-wrap: break-word;
      }

      .item {
        margin-bottom: 18px;
      }
      .box-card {
        position: relative;
        width: 265Px;
        height: 115Px;
        padding: 10px;
        margin: 0 20px 20px 0;
        border-radius: 10px;
        cursor: pointer;
        :deep(.el-card__body) {
          padding: 0;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          height: 100%;
        }
        .card-content {
          height: 68px;
          padding: 16px 15px 0;
          display: flex;
          .card-icon {
            display: flex;
            margin-right: 10px;
            margin-bottom: 10px;
            background-color: #f00;
            width: 34px;
            min-width: 34px;
            height: 34px;
            border-radius: 8px;
            justify-content: center;
            align-items: center;
          }
          .card-title {
            display: flex;
            align-items: center;
            .card-edit-icon {
              display: none;
              margin-left: 10px;
              cursor: pointer;
              color: #40a9ff;
              &:hover {
                color: #1e83e9;
              }
            }
          }
        }
        .card-footer {
          border-top: 1px solid #e8eaed;
          padding-top: 10px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          .version {
            font-size: 12px;
            color: #999;
            > span {
              color: #333;
            }
          }
        }
      }
    }
  }
}
:deep(.el-card:hover){
  background-color: #f0f5fadc;
  border: 1px solid #d3d3d3;
  .card-edit-icon{
    display: block !important;
  }
}
.action{
  display: flex;
  justify-content: end;
  align-items: center;
}
.icon-t-1{
  background: linear-gradient(to top, rgb(28, 94, 246) 0%, rgb(95, 141, 246) 100%);
}
.icon-t-2{
  background: linear-gradient(to top, rgb(54, 188, 77) 0%, rgb(81, 194, 100) 100%);
}
.icon-t-3{
  background: linear-gradient(to top, rgb(169, 109, 243) 0%, rgb(181, 129, 245) 100%);
}
.icon-t-4{
  background: linear-gradient(to top, rgb(53, 110, 232) 0%, rgb(92, 139, 239) 100%);
}
.icon-t-5{
  background: linear-gradient(to top, rgb(255, 121, 24) 0%, rgb(245, 150, 82) 100%);
}
.lock-tag{
  width: 0px;
  height: 0px;
  border-top: 40px solid #ff5c2c;
  border-right: 40px solid transparent;
  position: absolute;
  top: 0;
  left: 0;
  .lock-text{
    white-space: nowrap;
    transform: rotate(-45deg) scale(0.5);
    position: absolute;
    top: -41px;
    left: -10px;
    font-size: 22px;
    color: #fff;
  }
}
</style>
