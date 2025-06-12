<template>
  <el-select v-model="curApiCode" @change="handleChangeApi" class="select-api">
    <el-option v-for="(item,index) in props.templateApiList" :key="'list_templateApiList_'+index" :label="item.apiName" :value="item.apiCode" />
  </el-select>
  <div class="view-tabs" v-if="!showType">
    <el-segmented v-model="curView" :options="viewOptions" block @change="changeCurView" />
  </div>
  <div class="model-cards" v-show="curView === '模型视图'">
    <div
      class="model-cards-item"
      :class="checkSelect(item) ? 'active' : ''"
      v-for="(item, index) in modelTableList"
      :key="'model_list_' + index"
      @click="handleChooseModel('model',item)"
    >
      <div class="main">
        <div class="title">
          <div class="title-left">
            <el-tag type="danger" v-if="item.isMain">主</el-tag>
            <el-tag type="warning" v-if="item.relationType==='LEFT JOIN'">左联</el-tag>
            <el-tag type="warning" v-if="item.relationType==='RIGHT JOIN'">右联</el-tag>
            <el-tag type="primary" v-if="item.isChild">子表</el-tag>
            {{item.tableComment}}
          </div>
          <div class="title-right">
            <el-tooltip
              v-if="pageType==='list' && (item.isMain || item.isChild)"
              content="表格设置"
              placement="top"
            >
              <el-icon class="group-item-edit" @click.stop="handleSettingTable(item)">
                <Menu />
              </el-icon>
            </el-tooltip>
          </div>
        </div>
        <div class="subTitle">
          <div>表名：{{item.tableName}}</div>
          <div>别名：{{item.tableAlias}}</div>
        </div>
      </div>
    </div>
  </div>
  <div class="model-group" v-show="curView === '分组视图'">
  <el-tree
    :data="curApi.pageGroupsTree"
    :props="{
      label: 'groupName',
      children: 'children'
    }"
    node-key="groupCode"
    :highlight-current="true"
    :current-node-key="curModel?.groupCode"
    @node-click="(data) => handleChooseModel('group', data)"
  >
    <template #default="{ node, data }">
      <div class="custom-tree-node">
        <div class="node-content">
           <el-tag type="primary" size="small">{{data.groupSort}}</el-tag> 
          <span class="node-label">{{ data.groupName }}</span>
        </div>
        <div class="node-actions">
          <el-icon class="group-item-edit" @click.stop="handleGroupAction('edit', data, node)">
            <Edit />
          </el-icon>
          <el-icon class="group-item-delete" @click.stop="handleGroupAction('delete', data, node)">
            <Delete />
          </el-icon>
        </div>
      </div>
    </template>
  </el-tree>
</div>
  <TableSettingDialog ref="tableSettingDialogRef" @success="tableSettingSuccess"></TableSettingDialog>
</template>
<script lang="ts" setup>
import {ref, watch,nextTick} from 'vue'
import { propTypes } from '@/utils/propTypes'
import {Edit,Delete,Menu} from "@element-plus/icons-vue"
import TableSettingDialog from './TableSettingDialog.vue'

defineOptions({ name: 'ListPageDesignView' })
const emit = defineEmits(['changeApi','chooseModel', 'changeCurView','editGroups'])
const message = useMessage() // 消息弹窗
const props = defineProps({
  pageType:propTypes.string,
  showType:propTypes.string,//判断是否显示分组
  templateApiList:propTypes.array,//api下字段信息
  isShowChild:{
    type:Boolean,
    default:true
  }
})
const getSort = (item) => {
  if(item.isMain){
    return 0
  }else if(item.relationType==='LEFT JOIN'){
    return 1
  }else if(item.relationType==='RIGHT JOIN'){
    return 2
  }else if(item.isChild){
    return 3
  }
}
const modelTableList=computed(()=>{
  if(curApi.value.tableList){
    const list = curApi.value.tableList.sort((a,b) => a.tableAlias.localeCompare(b.tableAlias))
    return props.isShowChild ? list : list.filter(item=>!item.isChild)
  }else{
    return []
  }
})
/**
 * api下拉框事件
 */
const curApi=ref<any>({})
const curApiCode=ref("")
const handleChangeApi=(apiCode)=>{
  const selectedIndex = props.templateApiList.findIndex(item => item.apiCode === apiCode)
  curApi.value=props.templateApiList.find(item=>item.apiCode===apiCode)
  console.log(curApi.value,'curApi.value');
  emit('changeApi', curApi.value, selectedIndex)
  nextTick(()=>{
    curModel.value=curApi.value.tableList[0]
    handleChooseModel('model',curModel.value)
  })
}
//监听api数据，数据更新时，选中第一个api，第一个的表模型
watch(
  () => props.templateApiList && props.templateApiList.filter(item=>item.serverId),
  (newVal,oldVal) => {
    console.log('ddddd',newVal,oldVal,props.templateApiList)
    if(newVal && newVal.length){
      curApiCode.value=props.templateApiList[0].apiCode
      handleChangeApi(curApiCode.value)
    }
  },
  { immediate: true }
)

/**
 * 带分组时 切换事件
 */
const curView = ref('模型视图')
const viewOptions = ref(['模型视图', '分组视图'])
const changeCurView = () => {
  emit('changeCurView', curView.value)
}
const checkSelect=(tableItem)=>{
  return curModel.value?.id===tableItem.id
}
/**
 * 模型视图相关
 */
const curModel = ref(null)

/**
 * 选择模型或分组
 * @param data
 */
const handleChooseModel = (type,item) => {
  curModel.value = item
  emit('chooseModel', type,item)
}
/**
 * 分组操作事件   edit:编辑;delete:删除
 * @param item
 */
const handleGroupAction=(type,item,index)=>{
  emit('groupsAction',type,item,index)
}
const tableSettingDialogRef=ref()
const handleSettingTable=(item)=>{
  console.log('ddddd',item)
  const curTableLayoutCfg = curApi.value.tableLayoutConfig.find((item) => item.tableId === item.id)
  tableSettingDialogRef.value.open(item.id, curTableLayoutCfg)
}
const tableSettingSuccess=(data)=>{
  let tableLayoutCfg = curApi.value.tableLayoutConfig.find((item) => item.tableId === data.tableId)
  if (tableLayoutCfg) {
    tableLayoutCfg = data
  } else {
    curApi.value.tableLayoutConfig.push(data)
  }
}
</script>
<style lang="scss" scoped>
.select-api {
  margin-bottom: 15px;
  position: absolute;
  top:0px;
  width:270px;
}
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
  height: calc(100vh - 215px);
}
.main-icon {
  background: var(--el-color-primary); 
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
    color: var(--el-color-primary);
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
  .view-tabs {
    display: flex;
    justify-content: center;
    margin: 0px 0px 10px;
  }
  .model-cards {
    margin: 0 10px;
    .model-cards-item {
      box-sizing: border-box;
      background: #f6f6f6;
      border-radius: 4px;
      padding: 5px 10px;
      margin-bottom: 10px;
      .main {
        .title {
          display: flex;
          justify-content: space-between;
          .title-left{
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 5px;
          }
          .title-right{
            
          }
        }
        .subTitle {
          font-size: 12px;
          color: #929292;
        }
      }
    }
    .model-cards-item:hover {
      border: 1px solid var(--el-color-primary);
      background: #ebf0fc;
      cursor: pointer;
      .main {
        .title {
          color: var(--el-color-primary);
        }
        .subTitle {
          color: #a2abd7;
        }
      }
    }

    .active {
      border: 1px solid var(--el-color-primary); 
      background: #ebf0fc;
      .main {
        .title {
          color: var(--el-color-primary);
        }
        .subTitle {
          color: #a2abd7;
        }
      }
    }
  }


  .model-group {
    overflow-y: auto;
    height: calc(100vh - 250px);
    padding: 4px 8px;
  margin: 0 10px;
    :deep(.el-tree-node){
      background: #f6f6f6;
      border-radius: 6px;
      margin-bottom: 5px;
    }
  :deep(.el-tree-node__content) {
    height: 40px;
    
    &:hover {
      background-color: #ebf0fc;
      border-radius: 6px;
      .node-actions {
        display: block;
      }
    }
  }
  :deep(.el-tree-node.is-current > .el-tree-node__content) {
    background-color: #ebf0fc;
    border-radius: 10px;
    color: var(--el-color-primary);
  }

  .custom-tree-node {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-right: 8px;
    
    .node-content {
      display: flex;
      align-items: center;
      gap: 8px;
      
      .node-label {
        font-size: 14px;
      }
    }
    
    .node-actions {
      display: none;
      
      .group-item-edit {
        font-size: 14px;
      color: var(--el-color-primary);
        cursor: pointer;
        margin-right: 8px;
      }
      
      .group-item-delete {
        font-size: 14px;
        color: #F56C6C;
        cursor: pointer;
      }
    }
  }
}
}
.conent-right {
  flex: 1;
}
</style>
